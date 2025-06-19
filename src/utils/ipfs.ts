/**
 * IPFS Utilities
 * Handles file and metadata uploads to IPFS via Pinata
 */

import { IPFS_CONFIG } from '../config/constants';

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
 * Fetch metadata from IPFS
 */
export const fetchMetadataFromIPFS = async (ipfsUri: string): Promise<CropMetadata> => {
  if (!ipfsUri.startsWith('ipfs://')) {
    throw new Error('Invalid IPFS URI format');
  }
  
  const hash = ipfsUri.replace('ipfs://', '');
  const gatewayUrl = `${IPFS_CONFIG.GATEWAY}/${hash}`;
  
  try {
    const response = await fetch(gatewayUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.status} ${response.statusText}`);
    }
    
    const metadata = await response.json();
    return metadata as CropMetadata;
  } catch (error) {
    console.error('Error fetching metadata from IPFS:', error);
    throw error;
  }
};

/**
 * Convert IPFS URI to HTTP URL
 */
export const ipfsToHttp = (
  ipfsUri: string, 
  gateway: string = IPFS_CONFIG.GATEWAY
): string => {
  if (!ipfsUri.startsWith('ipfs://')) {
    return ipfsUri; // Return as-is if not IPFS URI
  }
  
  const hash = ipfsUri.replace('ipfs://', '');
  return `${gateway}/${hash}`;
};

/**
 * Check if we should use mock IPFS (for development)
 */
const shouldUseMockIPFS = (): boolean => {
  return IPFS_CONFIG.PINATA_API_KEY === 'YOUR_PINATA_API_KEY' || 
         IPFS_CONFIG.PINATA_SECRET_API_KEY === 'YOUR_PINATA_SECRET_API_KEY' ||
         import.meta.env.MODE === 'development';
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
    
    // Fallback to mock IPFS if real IPFS fails
    console.warn('IPFS upload failed, falling back to mock service...');
    const { mockUploadCropBatch } = await import('./mockIpfs');
    return mockUploadCropBatch(params);
  }
};