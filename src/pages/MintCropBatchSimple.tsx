import React, { useState } from 'react';
import { AlertTriangle, Info, Upload, Calendar, MapPin, Scale, FileText, Loader2 } from 'lucide-react';
import { useSimpleWeb3 } from '../contexts/SimpleWeb3Context';
import { useToast } from '../contexts/ToastContext';

interface MintCropBatchSimpleProps {
  onSuccess?: (tokenId: number) => void;
}

/**
 * Simple Mint Crop Batch Component
 * 
 * A simplified version of the crop batch minting component that works
 * without complex Web3 dependencies. This provides the core functionality
 * for farmers to create crop batch records.
 * 
 * Features:
 * - Form validation
 * - Image upload simulation
 * - Local storage for batch records
 * - Role-based access control
 * - Responsive design
 * - Clear user feedback
 */
const MintCropBatchSimple: React.FC<MintCropBatchSimpleProps> = ({ onSuccess }) => {
  const { account, isConnected } = useSimpleWeb3();
  const { addToast } = useToast();

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Check if user has farmer role
  const hasRole = (role: string): boolean => {
    if (!account) return false;
    
    const stored = localStorage.getItem(`greenledger_user_roles_${account}`);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        return data.roles && data.roles.includes(role);
      } catch (error) {
        console.error('Failed to parse stored roles:', error);
      }
    }
    return false;
  };

  const canMint = hasRole('farmer');

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        addToast('Please select a valid image file', 'error');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        addToast('Image file must be less than 10MB', 'error');
        return;
      }
      
      setImageFile(file);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Crop name is required';
    if (!formData.cropType) errors.cropType = 'Crop type is required';
    if (!formData.quantity) errors.quantity = 'Quantity is required';
    if (!formData.originFarm.trim()) errors.originFarm = 'Origin farm is required';
    if (!formData.harvestDate) errors.harvestDate = 'Harvest date is required';
    if (!imageFile) errors.image = 'Crop image is required';

    // Validate quantity
    const quantity = parseInt(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      errors.quantity = 'Quantity must be a positive number';
    } else if (quantity > 10000) {
      errors.quantity = 'Quantity cannot exceed 10,000 kg';
    }

    // Validate harvest date
    if (formData.harvestDate) {
      const harvestDate = new Date(formData.harvestDate);
      if (harvestDate > new Date()) {
        errors.harvestDate = 'Harvest date cannot be in the future';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      addToast('Please connect your wallet first', 'warning');
      return;
    }

    if (!canMint) {
      addToast('You need farmer role to mint crop batches', 'error');
      return;
    }

    if (!validateForm()) {
      addToast('Please fix the form errors', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate minting process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate a mock token ID
      const tokenId = Date.now();

      // Create batch record
      const batchRecord = {
        tokenId,
        ...formData,
        quantity: parseInt(formData.quantity),
        harvestDate: new Date(formData.harvestDate).getTime(),
        imageFile: imageFile?.name,
        minter: account,
        timestamp: Date.now(),
        status: 'minted'
      };

      // Store batch record locally
      const existingBatches = JSON.parse(localStorage.getItem('greenledger_crop_batches') || '[]');
      existingBatches.push(batchRecord);
      localStorage.setItem('greenledger_crop_batches', JSON.stringify(existingBatches));

      addToast(`Crop batch minted successfully! Token ID: ${tokenId}`, 'success');

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
      onSuccess?.(tokenId);

    } catch (error) {
      console.error('Minting failed:', error);
      addToast('Failed to mint crop batch. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show access denied if user doesn't have farmer role
  if (isConnected && !canMint) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-yellow-800 text-center">
          <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-yellow-600" />
          <h2 className="text-2xl font-bold mb-2">Farmer Role Required</h2>
          <p className="text-lg mb-4">You need to be registered as a <strong>Farmer</strong> to mint new crop batches.</p>
          <p className="text-sm">
            Please register your role from the profile menu or contact support for assistance.
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
            Create a new crop batch record with detailed metadata. This will be stored locally and can be synced to blockchain later.
          </p>
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
              <select
                id="cropType"
                name="cropType"
                value={formData.cropType}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                  formErrors.cropType ? 'border-red-400 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Select crop type</option>
                <option value="Wheat">Wheat</option>
                <option value="Rice">Rice</option>
                <option value="Corn">Corn</option>
                <option value="Soybeans">Soybeans</option>
                <option value="Tomatoes">Tomatoes</option>
                <option value="Potatoes">Potatoes</option>
                <option value="Coffee">Coffee</option>
                <option value="Other">Other</option>
              </select>
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
                min="1"
                max="10000"
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
                max={new Date().toISOString().split('T')[0]}
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
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="e.g., Organic, Pesticide-free, Lot-A"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="certifications" className="block text-sm font-medium text-gray-700 mb-2">
                Certifications (comma-separated)
              </label>
              <textarea
                id="certifications"
                name="certifications"
                value={formData.certifications}
                onChange={handleInputChange}
                rows={3}
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
            <input
              type="file"
              id="imageFile"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            />
            <p className="mt-1 text-xs text-gray-500">Upload an image of the crop batch (max 10MB)</p>
            {formErrors.image && <p className="mt-1 text-xs text-red-600">{formErrors.image}</p>}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting || !isConnected}
              className="px-8 py-3 bg-green-600 text-white font-medium rounded-lg shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Minting Crop Batch...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Mint Crop Batch</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info Section */}
        <div className="p-6 bg-blue-50 border-t border-blue-200 rounded-b-xl">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Local Storage Notice</p>
              <p>
                Your crop batch data is currently stored locally in your browser. 
                When blockchain features are fully available, this data can be synced to the blockchain for permanent, immutable storage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MintCropBatchSimple;