/**
 * IPFS Utilities
 * Handles file and metadata uploads to IPFS via Pinata
 */

import { IPFS_CONFIG } from '../config/constants';

// Simple in-memory cache for IPFS metadata
const metadataCache = new Map<string, { data: CropMetadata; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Types
export interface CropMetadataAttribute {
  trait_type: string;
  value: string | number;
}

export interface CropMetadata {
  name: string;
  description: string;
  image: string; // IPFS URI for the image
  attributes: CropMetadataAttribute[];
  cropType: string;
  quantity: number;
  originFarm: string;
  harvestDate: number; // Unix timestamp
  notes: string;
  certifications?: string[];
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
}

export interface UploadCropBatchParams {
  name: string;
  description: string;
  imageFile: File;
  cropType: string;
  quantity: number;
  originFarm: string;
  harvestDate: number;
  notes: string;
  certifications?: string[];
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
}

/**
 * Upload a file to IPFS via Pinata
 */
export const uploadFileToIPFS = async (file: File): Promise<string> => {
  // Check if API keys are configured
  if (IPFS_CONFIG.PINATA_API_KEY === 'YOUR_PINATA_API_KEY' || 
      IPFS_CONFIG.PINATA_SECRET_API_KEY === 'YOUR_PINATA_SECRET_API_KEY') {
    throw new Error('Pinata API keys not configured. Please set VITE_PINATA_API_KEY and VITE_PINATA_SECRET_API_KEY in your .env file.');
  }

  try {
    const formData = new FormData();
    formData.append('file', file);

    // Add metadata for better organization
    const metadata = JSON.stringify({
      name: `greenledger-${file.name}`,
      keyvalues: {
        app: 'greenledger',
        type: 'crop-batch-image',
        timestamp: new Date().toISOString()
      }
    });
    formData.append('pinataMetadata', metadata);

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': IPFS_CONFIG.PINATA_API_KEY,
        'pinata_secret_api_key': IPFS_CONFIG.PINATA_SECRET_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.details || errorData.error || errorMessage;
      } catch (e) {
        // If we can't parse the error response, use the status text
      }
      
      if (response.status === 401) {
        throw new Error('Invalid Pinata API credentials. Please check your API keys.');
      } else if (response.status === 403) {
        throw new Error('Pinata API access forbidden. Check your account limits and permissions.');
      } else if (response.status === 413) {
        throw new Error('File too large for Pinata upload. Please reduce file size.');
      }
      
      throw new Error(`IPFS file upload failed: ${errorMessage}`);
    }

    const data = await response.json();
    return `ipfs://${data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    throw error;
  }
};

/**
 * Upload metadata to IPFS via Pinata
 */
export const uploadMetadataToIPFS = async (metadata: CropMetadata): Promise<string> => {
  // Check if API keys are configured
  if (IPFS_CONFIG.PINATA_API_KEY === 'YOUR_PINATA_API_KEY' || 
      IPFS_CONFIG.PINATA_SECRET_API_KEY === 'YOUR_PINATA_SECRET_API_KEY') {
    throw new Error('Pinata API keys not configured. Please set VITE_PINATA_API_KEY and VITE_PINATA_SECRET_API_KEY in your .env file.');
  }

  try {
    const requestBody = {
      pinataContent: metadata,
      pinataMetadata: {
        name: `greenledger-metadata-${metadata.name}`,
        keyvalues: {
          app: 'greenledger',
          type: 'crop-batch-metadata',
          cropType: metadata.cropType,
          originFarm: metadata.originFarm,
          timestamp: new Date().toISOString()
        }
      }
    };

    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': IPFS_CONFIG.PINATA_API_KEY,
        'pinata_secret_api_key': IPFS_CONFIG.PINATA_SECRET_API_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.details || errorData.error || errorMessage;
      } catch (e) {
        // If we can't parse the error response, use the status text
      }
      
      if (response.status === 401) {
        throw new Error('Invalid Pinata API credentials. Please check your API keys.');
      } else if (response.status === 403) {
        throw new Error('Pinata API access forbidden. Check your account limits and permissions.');
      }
      
      throw new Error(`IPFS metadata upload failed: ${errorMessage}`);
    }

    const data = await response.json();
    return `ipfs://${data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    throw error;
  }
};

/**
 * Fetch metadata from IPFS with fallback gateways and caching
 */
export const fetchMetadataFromIPFS = async (ipfsUri: string): Promise<CropMetadata> => {
  if (!ipfsUri.startsWith('ipfs://')) {
    throw new Error('Invalid IPFS URI format');
  }

  const hash = ipfsUri.replace('ipfs://', '');

  // Check cache first
  const cached = metadataCache.get(hash);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log(`Using cached metadata for ${hash}`);
    return cached.data;
  }

  const gateways = [IPFS_CONFIG.GATEWAY, ...IPFS_CONFIG.FALLBACK_GATEWAYS];

  let lastError: Error | null = null;

  // Try each gateway in sequence
  for (const gateway of gateways) {
    try {
      const gatewayUrl = `${gateway}/${hash}`;

      const response = await fetch(gatewayUrl, {
        headers: {
          'Accept': 'application/json',
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(8000), // 8 second timeout per gateway
        mode: 'cors', // Explicitly set CORS mode
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const metadata = await response.json();

      // Validate that we got valid metadata
      if (!metadata || typeof metadata !== 'object') {
        throw new Error('Invalid metadata format received from IPFS');
      }

      const cropMetadata = metadata as CropMetadata;

      // Cache the successful result
      metadataCache.set(hash, {
        data: cropMetadata,
        timestamp: Date.now()
      });

      console.log(`Successfully fetched metadata from ${gateway}`);
      return cropMetadata;

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.warn(`Failed to fetch from ${gateway}:`, lastError.message);
      // Continue to next gateway
    }
  }

  // If all gateways failed, throw the last error
  console.error('All IPFS gateways failed for hash:', hash);
  throw lastError || new Error('Failed to fetch metadata from all IPFS gateways');
};

/**
 * Clear the metadata cache
 */
export const clearMetadataCache = (): void => {
  metadataCache.clear();
  console.log('IPFS metadata cache cleared');
};

/**
 * Convert IPFS URI to HTTP URL using the primary gateway
 */
export const ipfsToHttp = (
  ipfsUri: string | undefined,
  gateway: string = IPFS_CONFIG.GATEWAY
): string => {
  if (!ipfsUri || typeof ipfsUri !== 'string') {
    return ''; // Return empty string if undefined or not a string
  }

  if (!ipfsUri.startsWith('ipfs://')) {
    return ipfsUri; // Return as-is if not IPFS URI
  }

  const hash = ipfsUri.replace('ipfs://', '');
  return `${gateway}/${hash}`;
};

/**
 * Check if we should use mock IPFS (only when API keys are not configured)
 */
const shouldUseMockIPFS = (): boolean => {
  return IPFS_CONFIG.PINATA_API_KEY === 'YOUR_PINATA_API_KEY' ||
         IPFS_CONFIG.PINATA_SECRET_API_KEY === 'YOUR_PINATA_SECRET_API_KEY';
};

/**
 * Upload complete crop batch (image + metadata) to IPFS
 */
export const uploadCropBatch = async (params: UploadCropBatchParams): Promise<{ metadataUri: string }> => {
  // Use mock IPFS if API keys are not configured or in development mode
  if (shouldUseMockIPFS()) {
    console.warn('Using mock IPFS service. Configure Pinata API keys for production use.');
    const { mockUploadCropBatch } = await import('./mockIpfs');
    return mockUploadCropBatch(params);
  }

  try {
    // First upload the image
    const imageUri = await uploadFileToIPFS(params.imageFile);
    
    // Create metadata object
    const metadata: CropMetadata = {
      name: params.name,
      description: params.description,
      image: imageUri,
      attributes: [
        { trait_type: 'Crop Type', value: params.cropType },
        { trait_type: 'Quantity (kg)', value: params.quantity },
        { trait_type: 'Origin Farm', value: params.originFarm },
        { trait_type: 'Harvest Date', value: new Date(params.harvestDate * 1000).toLocaleDateString() },
        ...(params.notes ? [{ trait_type: 'Notes', value: params.notes }] : []),
        ...(params.certifications?.length ? [{ trait_type: 'Certifications', value: params.certifications.join(', ') }] : []),
        ...(params.location?.address ? [{ trait_type: 'Location', value: params.location.address }] : []),
      ],
      cropType: params.cropType,
      quantity: params.quantity,
      originFarm: params.originFarm,
      harvestDate: params.harvestDate,
      notes: params.notes,
      certifications: params.certifications,
      location: params.location,
    };
    
    // Upload metadata
    const metadataUri = await uploadMetadataToIPFS(metadata);
    
    return { metadataUri };
  } catch (error) {
    console.error('Error uploading crop batch to IPFS:', error);
    throw error; // Don't fallback to mock, throw the error instead
  }
};