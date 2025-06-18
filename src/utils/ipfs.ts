import { IPFS_CONFIG } from '../config/contracts';

export interface CropMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
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
 * Upload file to IPFS via Pinata
 */
export const uploadFileToIPFS = async (file: File): Promise<string> => {
  if (!IPFS_CONFIG.apiKey || !IPFS_CONFIG.secretKey) {
    throw new Error('IPFS configuration is missing. Please check your environment variables.');
  }

  const formData = new FormData();
  formData.append('file', file);

  const metadata = JSON.stringify({
    name: file.name,
    keyvalues: {
      uploadedBy: 'GreenLedger',
      timestamp: new Date().toISOString(),
    },
  });
  formData.append('pinataMetadata', metadata);

  const options = JSON.stringify({
    cidVersion: 0,
  });
  formData.append('pinataOptions', options);

  try {
    const response = await fetch(IPFS_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'pinata_api_key': IPFS_CONFIG.apiKey,
        'pinata_secret_api_key': IPFS_CONFIG.secretKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`IPFS upload failed: ${response.status} ${response.statusText}. ${errorData.error || ''}`);
    }

    const data = await response.json();
    return `ipfs://${data.IpfsHash}`;
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    throw error;
  }
};

/**
 * Upload JSON metadata to IPFS via Pinata
 */
export const uploadMetadataToIPFS = async (metadata: CropMetadata): Promise<string> => {
  if (!IPFS_CONFIG.apiKey || !IPFS_CONFIG.secretKey) {
    throw new Error('IPFS configuration is missing. Please check your environment variables.');
  }

  const pinataMetadata = {
    name: `${metadata.name}_metadata.json`,
    keyvalues: {
      uploadedBy: 'GreenLedger',
      cropType: metadata.cropType,
      originFarm: metadata.originFarm,
      timestamp: new Date().toISOString(),
    },
  };

  const requestBody = {
    pinataContent: metadata,
    pinataMetadata,
    pinataOptions: {
      cidVersion: 0,
    },
  };

  try {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': IPFS_CONFIG.apiKey,
        'pinata_secret_api_key': IPFS_CONFIG.secretKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`IPFS metadata upload failed: ${response.status} ${response.statusText}. ${errorData.error || ''}`);
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
  const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${hash}`;

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
 * Create crop metadata object
 */
export const createCropMetadata = (params: {
  name: string;
  description: string;
  imageUri: string;
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
}): CropMetadata => {
  return {
    name: params.name,
    description: params.description,
    image: params.imageUri,
    attributes: [
      {
        trait_type: 'Crop Type',
        value: params.cropType,
      },
      {
        trait_type: 'Quantity (kg)',
        value: params.quantity,
      },
      {
        trait_type: 'Origin Farm',
        value: params.originFarm,
      },
      {
        trait_type: 'Harvest Date',
        value: new Date(params.harvestDate * 1000).toISOString().split('T')[0],
      },
      {
        trait_type: 'Notes',
        value: params.notes,
      },
      ...(params.certifications?.map(cert => ({
        trait_type: 'Certification',
        value: cert,
      })) || []),
      ...(params.location?.address ? [{
        trait_type: 'Location',
        value: params.location.address,
      }] : []),
    ],
    cropType: params.cropType,
    quantity: params.quantity,
    originFarm: params.originFarm,
    harvestDate: params.harvestDate,
    notes: params.notes,
    certifications: params.certifications,
    location: params.location,
  };
};

/**
 * Validate IPFS URI format
 */
export const validateIPFSUri = (uri: string): boolean => {
  return uri.startsWith('ipfs://') && uri.length > 7;
};

/**
 * Convert IPFS URI to HTTP gateway URL
 */
export const ipfsToHttp = (ipfsUri: string, gateway: string = 'https://gateway.pinata.cloud/ipfs'): string => {
  if (!ipfsUri.startsWith('ipfs://')) {
    return ipfsUri; // Return as-is if not IPFS URI
  }
  
  const hash = ipfsUri.replace('ipfs://', '');
  return `${gateway}/${hash}`;
};

/**
 * Get IPFS hash from URI
 */
export const getIPFSHash = (ipfsUri: string): string => {
  if (!ipfsUri.startsWith('ipfs://')) {
    throw new Error('Invalid IPFS URI format');
  }
  
  return ipfsUri.replace('ipfs://', '');
};

/**
 * Upload crop batch with image and metadata
 */
export const uploadCropBatch = async (params: {
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
}): Promise<{ imageUri: string; metadataUri: string }> => {
  try {
    // Upload image first
    const imageUri = await uploadFileToIPFS(params.imageFile);
    
    // Create metadata with image URI
    const metadata = createCropMetadata({
      ...params,
      imageUri,
    });
    
    // Upload metadata
    const metadataUri = await uploadMetadataToIPFS(metadata);
    
    return {
      imageUri,
      metadataUri,
    };
  } catch (error) {
    console.error('Error uploading crop batch:', error);
    throw error;
  }
};