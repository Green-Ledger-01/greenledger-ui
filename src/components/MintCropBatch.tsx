import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useCropBatchToken } from '../hooks/useCropBatchToken';
import { useRequireRole } from '../contexts/Web3Context';
import { uploadCropBatch } from '../utils/ipfs';
import { getErrorMessage, formatTxHash, getBlockExplorerUrl } from '../utils/errors';

interface MintCropBatchProps {
  onSuccess?: (tokenId: number) => void;
  onError?: (error: string) => void;
}

export const MintCropBatch: React.FC<MintCropBatchProps> = ({ onSuccess, onError }) => {
  const { address } = useAccount();
  const { mintNewBatch, isMinting, isConfirming, isConfirmed, error, hash } = useCropBatchToken();
  const { canPerformAction, needsRole } = useRequireRole('farmer');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cropType: '',
    quantity: '',
    originFarm: '',
    harvestDate: '',
    notes: '',
    certifications: '',
    location: '',
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('Image file must be less than 10MB');
        return;
      }
      
      setImageFile(file);
      setUploadError(null);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canPerformAction) {
      onError?.('You need farmer role to mint crop batches');
      return;
    }
    
    if (!address) {
      onError?.('Please connect your wallet');
      return;
    }
    
    if (!imageFile) {
      setUploadError('Please select an image for the crop batch');
      return;
    }
    
    // Validate form data
    if (!formData.name || !formData.cropType || !formData.quantity || !formData.originFarm || !formData.harvestDate) {
      setUploadError('Please fill in all required fields');
      return;
    }
    
    const quantity = parseInt(formData.quantity);
    if (isNaN(quantity) || quantity <= 0 || quantity > 100) {
      setUploadError('Quantity must be between 1 and 100 kg');
      return;
    }
    
    const harvestDate = new Date(formData.harvestDate);
    if (isNaN(harvestDate.getTime()) || harvestDate > new Date()) {
      setUploadError('Please enter a valid harvest date (not in the future)');
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadError(null);
      
      // Upload to IPFS
      const { metadataUri } = await uploadCropBatch({
        name: formData.name,
        description: formData.description,
        imageFile,
        cropType: formData.cropType,
        quantity,
        originFarm: formData.originFarm,
        harvestDate: Math.floor(harvestDate.getTime() / 1000),
        notes: formData.notes,
        certifications: formData.certifications ? formData.certifications.split(',').map(c => c.trim()) : undefined,
        location: formData.location ? { address: formData.location } : undefined,
      });
      
      // Mint the token
      await mintNewBatch({
        to: address,
        cropType: formData.cropType,
        quantity,
        originFarm: formData.originFarm,
        harvestDate: Math.floor(harvestDate.getTime() / 1000),
        notes: formData.notes,
        metadataUri,
      });
      
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setUploadError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle successful minting
  React.useEffect(() => {
    if (isConfirmed && hash) {
      // Reset form
      setFormData({
        name: '',
        description: '',
        cropType: '',
        quantity: '',
        originFarm: '',
        harvestDate: '',
        notes: '',
        certifications: '',
        location: '',
      });
      setImageFile(null);
      
      // Call success callback
      onSuccess?.(1); // TODO: Get actual token ID from event logs
    }
  }, [isConfirmed, hash, onSuccess]);
  
  // Handle errors
  React.useEffect(() => {
    if (error) {
      const errorMessage = getErrorMessage(error);
      setUploadError(errorMessage);
      onError?.(errorMessage);
    }
  }, [error, onError]);
  
  if (needsRole) {
    return (
      <div className=\"bg-yellow-50 border border-yellow-200 rounded-lg p-4\">
        <div className=\"flex items-center\">
          <div className=\"flex-shrink-0\">
            <svg className=\"h-5 w-5 text-yellow-400\" viewBox=\"0 0 20 20\" fill=\"currentColor\">
              <path fillRule=\"evenodd\" d=\"M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z\" clipRule=\"evenodd\" />
            </svg>
          </div>
          <div className=\"ml-3\">
            <h3 className=\"text-sm font-medium text-yellow-800\">Farmer Role Required</h3>
            <p className=\"mt-1 text-sm text-yellow-700\">
              You need to have the farmer role to mint crop batch tokens. Please contact an administrator to get the farmer role assigned.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  const isLoading = isUploading || isMinting || isConfirming;
  
  return (
    <div className=\"max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6\">
      <h2 className=\"text-2xl font-bold text-gray-900 mb-6\">Mint New Crop Batch</h2>
      
      {/* Success Message */}
      {isConfirmed && hash && (
        <div className=\"mb-6 bg-green-50 border border-green-200 rounded-lg p-4\">
          <div className=\"flex items-center\">
            <div className=\"flex-shrink-0\">
              <svg className=\"h-5 w-5 text-green-400\" viewBox=\"0 0 20 20\" fill=\"currentColor\">
                <path fillRule=\"evenodd\" d=\"M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z\" clipRule=\"evenodd\" />
              </svg>
            </div>
            <div className=\"ml-3\">
              <h3 className=\"text-sm font-medium text-green-800\">Crop Batch Minted Successfully!</h3>
              <p className=\"mt-1 text-sm text-green-700\">
                Transaction: <a 
                  href={getBlockExplorerUrl(hash)} 
                  target=\"_blank\" 
                  rel=\"noopener noreferrer\"
                  className=\"underline hover:text-green-900\"
                >
                  {formatTxHash(hash)}
                </a>
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Message */}
      {uploadError && (
        <div className=\"mb-6 bg-red-50 border border-red-200 rounded-lg p-4\">
          <div className=\"flex items-center\">
            <div className=\"flex-shrink-0\">
              <svg className=\"h-5 w-5 text-red-400\" viewBox=\"0 0 20 20\" fill=\"currentColor\">
                <path fillRule=\"evenodd\" d=\"M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z\" clipRule=\"evenodd\" />
              </svg>
            </div>
            <div className=\"ml-3\">
              <h3 className=\"text-sm font-medium text-red-800\">Error</h3>
              <p className=\"mt-1 text-sm text-red-700\">{uploadError}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className=\"space-y-6\">
        {/* Basic Information */}
        <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
          <div>
            <label htmlFor=\"name\" className=\"block text-sm font-medium text-gray-700 mb-2\">
              Batch Name *
            </label>
            <input
              type=\"text\"
              id=\"name\"
              name=\"name\"
              value={formData.name}
              onChange={handleInputChange}
              required
              className=\"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500\"
              placeholder=\"e.g., Organic Wheat Batch #001\"
            />
          </div>
          
          <div>
            <label htmlFor=\"cropType\" className=\"block text-sm font-medium text-gray-700 mb-2\">
              Crop Type *
            </label>
            <select
              id=\"cropType\"
              name=\"cropType\"
              value={formData.cropType}
              onChange={handleInputChange}
              required
              className=\"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500\"
            >
              <option value=\"\">Select crop type</option>
              <option value=\"Wheat\">Wheat</option>
              <option value=\"Rice\">Rice</option>
              <option value=\"Corn\">Corn</option>
              <option value=\"Soybeans\">Soybeans</option>
              <option value=\"Tomatoes\">Tomatoes</option>
              <option value=\"Potatoes\">Potatoes</option>
              <option value=\"Coffee\">Coffee</option>
              <option value=\"Other\">Other</option>
            </select>
          </div>
        </div>
        
        <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
          <div>
            <label htmlFor=\"quantity\" className=\"block text-sm font-medium text-gray-700 mb-2\">
              Quantity (kg) *
            </label>
            <input
              type=\"number\"
              id=\"quantity\"
              name=\"quantity\"
              value={formData.quantity}
              onChange={handleInputChange}
              required
              min=\"1\"
              max=\"100\"
              className=\"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500\"
              placeholder=\"e.g., 50\"
            />
            <p className=\"mt-1 text-xs text-gray-500\">Maximum 100 kg per batch</p>
          </div>
          
          <div>
            <label htmlFor=\"harvestDate\" className=\"block text-sm font-medium text-gray-700 mb-2\">
              Harvest Date *
            </label>
            <input
              type=\"date\"
              id=\"harvestDate\"
              name=\"harvestDate\"
              value={formData.harvestDate}
              onChange={handleInputChange}
              required
              max={new Date().toISOString().split('T')[0]}
              className=\"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500\"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor=\"originFarm\" className=\"block text-sm font-medium text-gray-700 mb-2\">
            Origin Farm *
          </label>
          <input
            type=\"text\"
            id=\"originFarm\"
            name=\"originFarm\"
            value={formData.originFarm}
            onChange={handleInputChange}
            required
            className=\"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500\"
            placeholder=\"e.g., Green Valley Farm\"
          />
        </div>
        
        <div>
          <label htmlFor=\"description\" className=\"block text-sm font-medium text-gray-700 mb-2\">
            Description
          </label>
          <textarea
            id=\"description\"
            name=\"description\"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className=\"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500\"
            placeholder=\"Describe the crop batch, growing conditions, etc.\"
          />
        </div>
        
        <div>
          <label htmlFor=\"notes\" className=\"block text-sm font-medium text-gray-700 mb-2\">
            Additional Notes
          </label>
          <textarea
            id=\"notes\"
            name=\"notes\"
            value={formData.notes}
            onChange={handleInputChange}
            rows={2}
            className=\"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500\"
            placeholder=\"Any additional information about this batch\"
          />
        </div>
        
        {/* Optional Fields */}
        <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
          <div>
            <label htmlFor=\"certifications\" className=\"block text-sm font-medium text-gray-700 mb-2\">
              Certifications
            </label>
            <input
              type=\"text\"
              id=\"certifications\"
              name=\"certifications\"
              value={formData.certifications}
              onChange={handleInputChange}
              className=\"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500\"
              placeholder=\"e.g., Organic, Fair Trade (comma-separated)\"
            />
          </div>
          
          <div>
            <label htmlFor=\"location\" className=\"block text-sm font-medium text-gray-700 mb-2\">
              Location
            </label>
            <input
              type=\"text\"
              id=\"location\"
              name=\"location\"
              value={formData.location}
              onChange={handleInputChange}
              className=\"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500\"
              placeholder=\"e.g., California, USA\"
            />
          </div>
        </div>
        
        {/* Image Upload */}
        <div>
          <label htmlFor=\"image\" className=\"block text-sm font-medium text-gray-700 mb-2\">
            Crop Image *
          </label>
          <input
            type=\"file\"
            id=\"image\"
            accept=\"image/*\"
            onChange={handleImageChange}
            required
            className=\"w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500\"
          />
          <p className=\"mt-1 text-xs text-gray-500\">Upload an image of the crop batch (max 10MB)</p>
        </div>
        
        {/* Submit Button */}
        <div className=\"flex justify-end\">
          <button
            type=\"submit\"
            disabled={isLoading}
            className=\"px-6 py-3 bg-green-600 text-white font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed\"
          >
            {isLoading ? (
              <div className=\"flex items-center\">
                <svg className=\"animate-spin -ml-1 mr-3 h-5 w-5 text-white\" xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 24 24\">
                  <circle className=\"opacity-25\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" strokeWidth=\"4\"></circle>
                  <path className=\"opacity-75\" fill=\"currentColor\" d=\"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z\"></path>
                </svg>
                {isUploading ? 'Uploading to IPFS...' : isMinting ? 'Minting...' : 'Confirming...'}
              </div>
            ) : (
              'Mint Crop Batch'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};