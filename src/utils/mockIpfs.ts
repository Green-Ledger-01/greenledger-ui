/**
 * Mock IPFS Service for Development
 * Provides fallback functionality when Pinata API keys are not configured
 */

import { CropMetadata, UploadCropBatchParams } from './ipfs';

// Simulate IPFS hash generation
const generateMockHash = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'Qm';
  for (let i = 0; i < 44; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Mock file upload
export const mockUploadFileToIPFS = async (file: File): Promise<string> => {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // Generate mock IPFS hash
  const mockHash = generateMockHash();
  
  // Store file data in localStorage for demo purposes
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = () => {
      try {
        const base64Data = reader.result as string;
        localStorage.setItem(`ipfs_${mockHash}`, base64Data);
        resolve(`ipfs://${mockHash}`);
      } catch (error) {
        reject(new Error('Failed to process file for mock IPFS storage'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// Mock metadata upload
export const mockUploadMetadataToIPFS = async (metadata: CropMetadata): Promise<string> => {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  
  // Generate mock IPFS hash
  const mockHash = generateMockHash();
  
  // Store metadata in localStorage for demo purposes
  localStorage.setItem(`ipfs_${mockHash}`, JSON.stringify(metadata));
  
  return `ipfs://${mockHash}`;
};

// Mock fetch metadata from IPFS
export const mockFetchMetadataFromIPFS = async (ipfsUri: string): Promise<CropMetadata> => {
  if (!ipfsUri.startsWith('ipfs://')) {
    throw new Error('Invalid IPFS URI format');
  }
  
  const hash = ipfsUri.replace('ipfs://', '');
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
  
  // Try to get from localStorage first
  const storedData = localStorage.getItem(`ipfs_${hash}`);
  if (storedData) {
    try {
      return JSON.parse(storedData) as CropMetadata;
    } catch (error) {
      // If it's not JSON, it might be a file
    }
  }
  
  // Return mock metadata if not found
  return {
    name: 'Mock Crop Batch',
    description: 'This is a mock crop batch for development purposes',
    image: 'ipfs://QmMockImageHash',
    attributes: [
      { trait_type: 'Crop Type', value: 'Mock Crop' },
      { trait_type: 'Quantity (kg)', value: 50 },
      { trait_type: 'Origin Farm', value: 'Mock Farm' },
      { trait_type: 'Harvest Date', value: new Date().toLocaleDateString() },
    ],
    cropType: 'Mock Crop',
    quantity: 50,
    originFarm: 'Mock Farm',
    harvestDate: Math.floor(Date.now() / 1000),
    notes: 'Mock data for development',
  };
};

// Mock convert IPFS to HTTP
export const mockIpfsToHttp = (ipfsUri: string): string => {
  if (!ipfsUri.startsWith('ipfs://')) {
    return ipfsUri;
  }
  
  const hash = ipfsUri.replace('ipfs://', '');
  
  // Check if we have the file in localStorage
  const storedData = localStorage.getItem(`ipfs_${hash}`);
  if (storedData && storedData.startsWith('data:')) {
    return storedData; // Return the base64 data URL
  }
  
  // Return a placeholder image for mock data
  const colors = ['B0D9B1', 'A8E6A3', '88D982', '6BCF7F', 'D4F1D4'];
  const color = colors[hash.length % colors.length];
  return `https://placehold.co/400x200/${color}/000000?text=Mock+Image`;
};

// Mock complete crop batch upload
export const mockUploadCropBatch = async (params: UploadCropBatchParams): Promise<{ metadataUri: string }> => {
  try {
    // Upload image
    const imageUri = await mockUploadFileToIPFS(params.imageFile);
    
    // Create metadata
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
    const metadataUri = await mockUploadMetadataToIPFS(metadata);
    
    return { metadataUri };
  } catch (error) {
    console.error('Error in mock crop batch upload:', error);
    throw error;
  }
};