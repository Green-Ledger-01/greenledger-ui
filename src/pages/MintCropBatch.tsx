import React, { useState, useEffect } from 'react';
// import { useAccount } from 'wagmi';
import { AlertTriangle, Info, Upload, Calendar, MapPin, Scale, FileText } from 'lucide-react';
// import { useCropBatchToken } from '../hooks/useCropBatchToken';
import { useSimpleWeb3 } from '../contexts/SimpleWeb3Context';
import { useToast } from '../contexts/ToastContext';
import { uploadCropBatch } from '../utils/ipfs';
import { getErrorMessage, formatTxHash, getBlockExplorerUrl } from '../utils/errorHandling';
import { VALIDATION_LIMITS } from '../config/constants';

interface MintCropBatchProps {
  onSuccess?: (tokenId: number) => void;
}

const MintCropBatch: React.FC<MintCropBatchProps> = ({ onSuccess }) => {
  const { account: address, canPerformAction } = useSimpleWeb3();

  // Simplified implementation for SimpleAppRoutes
  const isMinting = false;
  const isConfirming = false;
  const isConfirmed = false;
  const error = null;
  const hash = null;
  const nextTokenId = 13;
  const isLoadingNextTokenId = false;
  const canPerformActionFarmer = canPerformAction('farmer');
  const needsRole = !canPerformActionFarmer;
  const isLoadingRoles = false;
  const { addToast } = useToast();

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
  const [formErrors, setFormErrors] = useState<Record<string, string | null>>({});

  const validateField = (name: string, value: string): string | null => {
    if (!value && ['name', 'cropType', 'quantity', 'originFarm', 'harvestDate'].includes(name)) {
      return 'This field is required.';
    }
    
    if (name === 'quantity') {
      const q = parseInt(value);
      if (isNaN(q) || q < VALIDATION_LIMITS.MIN_QUANTITY_KG || q > VALIDATION_LIMITS.MAX_QUANTITY_KG) {
        return `Quantity must be between ${VALIDATION_LIMITS.MIN_QUANTITY_KG} and ${VALIDATION_LIMITS.MAX_QUANTITY_KG} kg.`;
      }
    }
    
    if (name === 'harvestDate') {
      const date = new Date(value);
      if (isNaN(date.getTime()) || date > new Date()) {
        return 'Please enter a valid harvest date (not in the future).';
      }
    }
    
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setFormErrors(prev => ({ ...prev, imageFile: 'Please select a valid image file.' }));
        setImageFile(null);
        return;
      }
      if (file.size > VALIDATION_LIMITS.MAX_IMAGE_SIZE_BYTES) {
        setFormErrors(prev => ({ ...prev, imageFile: `Image file must be less than ${VALIDATION_LIMITS.MAX_IMAGE_SIZE_MB}MB.` }));
        setImageFile(null);
        return;
      }
      setImageFile(file);
      setFormErrors(prev => ({ ...prev, imageFile: null }));
    } else {
      setImageFile(null);
      setFormErrors(prev => ({ ...prev, imageFile: 'Image file is required.' }));
    }
  };

  const validateForm = () => {
    let errors: Record<string, string | null> = {};
    Object.keys(formData).forEach(key => {
      errors[key] = validateField(key, formData[key as keyof typeof formData]);
    });
    if (!imageFile) {
      errors.imageFile = 'Image file is required.';
    }
    setFormErrors(errors);
    return !Object.values(errors).some(error => error !== null);
  };

  const mintNewBatch = async (params: any) => {
    addToast('Crop batch minting is available in the full version', 'info');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      addToast('Please correct the form errors.', 'error');
      return;
    }
    if (!canPerformAction) {
      addToast('You need farmer role to mint crop batches.', 'warning');
      return;
    }
    if (!address) {
      addToast('Please connect your wallet.', 'warning');
      return;
    }

    try {
      setIsUploading(true);
      
      // Check if using mock IPFS
      const usingMockIPFS = import.meta.env.VITE_PINATA_API_KEY === 'YOUR_ACTUAL_PINATA_API_KEY_HERE' ||
                           !import.meta.env.VITE_PINATA_API_KEY;
      
      if (usingMockIPFS) {
        addToast('Using mock IPFS service for development. Configure Pinata API keys for production.', 'warning');
      }
      
      addToast('Uploading image and metadata to IPFS...', 'info');

      const quantity = parseInt(formData.quantity);
      const harvestDate = new Date(formData.harvestDate);

      const { metadataUri } = await uploadCropBatch({
        name: formData.name,
        description: formData.description,
        imageFile: imageFile!,
        cropType: formData.cropType,
        quantity,
        originFarm: formData.originFarm,
        harvestDate: Math.floor(harvestDate.getTime() / 1000),
        notes: formData.notes,
        certifications: formData.certifications ? formData.certifications.split(',').map(c => c.trim()) : undefined,
        location: formData.location ? { address: formData.location } : undefined,
      });

      addToast('IPFS upload complete. Initiating blockchain transaction...', 'info');
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
      console.error('Minting error:', err);
      const errorMessage = getErrorMessage(err);
      
      // Provide specific guidance for IPFS errors
      if (errorMessage.includes('Pinata API')) {
        addToast('IPFS upload failed. Please check your Pinata API configuration in the .env file.', 'error');
      } else if (errorMessage.includes('401')) {
        addToast('Authentication failed. Please verify your Pinata API keys.', 'error');
      } else {
        addToast(`Error minting batch: ${errorMessage}`, 'error');
      }
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (isConfirmed && hash) {
      addToast(`Transaction confirmed! Token ID: ${nextTokenId}. Hash: ${formatTxHash(hash)}`, 'success', 10000);
      // Reset form on success
      setFormData({
        name: '', description: '', cropType: '', quantity: '', originFarm: '',
        harvestDate: '', notes: '', certifications: '', location: '',
      });
      setImageFile(null);
      setFormErrors({});
      onSuccess?.(nextTokenId);
    }
  }, [isConfirmed, hash, nextTokenId, onSuccess, addToast]);

  // Display role-based messages
  if (isLoadingRoles) {
    return (
      <div className="p-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-blue-800 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="font-medium">Loading user permissions...</p>
        </div>
      </div>
    );
  }

  if (needsRole) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-yellow-800 text-center">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-yellow-600" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-lg mb-4">You need to be registered as a <strong>Farmer</strong> to mint new crop batches.</p>
          <p className="text-sm">
            Please contact an administrator to register your role.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Mint New Crop Batch (NFT)</h1>
          <p className="text-gray-600">
            Create a new crop batch NFT with detailed metadata and IPFS storage.
          </p>
          {!isLoadingNextTokenId && (
            <p className="text-sm text-green-600 mt-2">
              Next Token ID: <span className="font-semibold">#{nextTokenId}</span>
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="h-4 w-4 inline mr-1" />
                Crop Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Organic Heirloom Tomatoes"
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  formErrors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              />
              {formErrors.name && <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>}
            </div>

            <div>
              <label htmlFor="cropType" className="block text-sm font-medium text-gray-700 mb-2">
                <Scale className="h-4 w-4 inline mr-1" />
                Crop Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="cropType"
                name="cropType"
                value={formData.cropType}
                onChange={handleInputChange}
                placeholder="e.g., Tomato, Wheat, Coffee"
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  formErrors.cropType ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              />
              {formErrors.cropType && <p className="mt-1 text-xs text-red-600">{formErrors.cropType}</p>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Detailed description of the crop batch, e.g., 'Harvested from fertile volcanic soil, rich in antioxidants.'"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            />
          </div>

          {/* Quantity and Farm */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                <Scale className="h-4 w-4 inline mr-1" />
                Quantity (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min={VALIDATION_LIMITS.MIN_QUANTITY_KG}
                max={VALIDATION_LIMITS.MAX_QUANTITY_KG}
                placeholder="e.g., 50"
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  formErrors.quantity ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              />
              {formErrors.quantity && <p className="mt-1 text-xs text-red-600">{formErrors.quantity}</p>}
            </div>

            <div>
              <label htmlFor="originFarm" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Origin Farm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="originFarm"
                name="originFarm"
                value={formData.originFarm}
                onChange={handleInputChange}
                placeholder="e.g., Green Valley Farm"
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  formErrors.originFarm ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              />
              {formErrors.originFarm && <p className="mt-1 text-xs text-red-600">{formErrors.originFarm}</p>}
            </div>
          </div>

          {/* Harvest Date and Location */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label htmlFor="harvestDate" className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Harvest Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="harvestDate"
                name="harvestDate"
                value={formData.harvestDate}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  formErrors.harvestDate ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              />
              {formErrors.harvestDate && <p className="mt-1 text-xs text-red-600">{formErrors.harvestDate}</p>}
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location (Address/Description)
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., 123 Farm Rd, Rural Town, Country"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>
          </div>

          {/* Notes and Certifications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <input
                type="text"
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="e.g., Organic, Pesticide-free, Lot-A"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="certifications" className="block text-sm font-medium text-gray-700 mb-2">
                Certifications (comma-separated)
              </label>
              <input
                type="text"
                id="certifications"
                name="certifications"
                value={formData.certifications}
                onChange={handleInputChange}
                placeholder="e.g., USDA Organic, Fair Trade"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-2">
              <Upload className="h-4 w-4 inline mr-1" />
              Batch Image <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="imageFile"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="imageFile"
                      name="imageFile"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to {VALIDATION_LIMITS.MAX_IMAGE_SIZE_MB}MB</p>
              </div>
            </div>
            {imageFile && (
              <div className="mt-2 text-sm text-gray-600">
                <p>Selected: <span className="font-medium">{imageFile.name}</span></p>
              </div>
            )}
            {formErrors.imageFile && <p className="mt-1 text-xs text-red-600">{formErrors.imageFile}</p>}
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isMinting || isConfirming || isUploading || !address}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isUploading && (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-3"></div>
              )}
              {isMinting ? 'Waiting for Wallet...' : 
               isConfirming ? 'Confirming Transaction...' : 
               isUploading ? 'Uploading to IPFS...' : 
               'Mint Crop Batch NFT'}
            </button>

            {hash && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Transaction sent! View on{' '}
                  <a 
                    href={getBlockExplorerUrl(hash)} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-green-600 hover:underline font-medium"
                  >
                    Block Explorer
                  </a>
                </p>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default MintCropBatch;