import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Info,
  Upload,
  Calendar,
  MapPin,
  Scale,
  FileText,
  Coins,
  CheckCircle,
  Leaf,
  Zap,
  Shield,
  Database,
  Globe
} from 'lucide-react';
import { useWeb3Enhanced } from '../contexts/Web3ContextEnhanced';
import { useToast } from '../contexts/ToastContext';
import { useCropBatchToken } from '../hooks/useCropBatchToken';
import { useInitializeProvenance } from '../hooks/useSupplyChainManager';
import { uploadCropBatch } from '../utils/ipfs';
import { getErrorMessage, formatTxHash, getBlockExplorerUrl } from '../utils';
import { VALIDATION_LIMITS } from '../config/constants';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

interface TokenizationPageProps {
  onSuccess?: (tokenId: number) => void;
}

const TokenizationPage: React.FC<TokenizationPageProps> = ({ onSuccess }) => {
  const { account, hasRole, isConnected } = useWeb3Enhanced();
  const { addToast } = useToast();
  const {
    mintNewBatch,
    isWritePending,
    isConfirming,
    isConfirmed,
    hash,
    error: contractError,
    nextTokenId,
    isLoadingNextTokenId,
    clearError,
  } = useCropBatchToken();

  const {
    writeAsync: initializeProvenance,
    isLoading: isInitializingProvenance,
    error: provenanceError,
  } = useInitializeProvenance();

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
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [mintedTokenId, setMintedTokenId] = useState<number | null>(null);
  const [provenanceInitialized, setProvenanceInitialized] = useState(false);
  const [mode, setMode] = useState<'development' | 'production'>('development');

  const canMint = hasRole('farmer');
  const isProcessing = isWritePending || isConfirming || isUploading || isInitializingProvenance;

  // Check if we have real blockchain setup
  const hasRealBlockchain = Boolean(nextTokenId && !isLoadingNextTokenId);
  const hasRealIPFS = Boolean(import.meta.env.VITE_PINATA_API_KEY &&
                             import.meta.env.VITE_PINATA_API_KEY !== 'YOUR_ACTUAL_PINATA_API_KEY_HERE');

  // Auto-detect mode based on available services
  useEffect(() => {
    if (hasRealBlockchain && hasRealIPFS) {
      setMode('production');
    } else {
      setMode('development');
    }
  }, [hasRealBlockchain, hasRealIPFS]);

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

  // Development mode submission (local storage)
  const handleDevelopmentSubmit = async () => {
    setIsUploading(true);
    setUploadProgress('Simulating blockchain transaction...');

    try {
      // Simulate processing time
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
        status: 'minted',
        mode: 'development'
      };

      // Store batch record locally
      const existingBatches = JSON.parse(localStorage.getItem('greenledger_crop_batches') || '[]');
      existingBatches.push(batchRecord);
      localStorage.setItem('greenledger_crop_batches', JSON.stringify(existingBatches));

      addToast(`Crop batch minted successfully! Token ID: ${tokenId}`, 'success');
      setMintedTokenId(tokenId);

      // Reset form
      resetForm();
      onSuccess?.(tokenId);

    } catch (error) {
      console.error('Development minting failed:', error);
      addToast('Failed to mint crop batch. Please try again.', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  // Production mode submission (blockchain + IPFS)
  const handleProductionSubmit = async () => {
    try {
      clearError();
      setIsUploading(true);
      setUploadProgress('Preparing metadata...');

      if (!hasRealIPFS) {
        addToast('Using mock IPFS service. Configure Pinata API keys for production.', 'warning');
      }

      setUploadProgress('Uploading image to IPFS...');
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

      setUploadProgress('IPFS upload complete. Initiating blockchain transaction...');
      addToast('IPFS upload complete. Initiating blockchain transaction...', 'info');

      await mintNewBatch({
        to: account,
        cropType: formData.cropType,
        quantity,
        originFarm: formData.originFarm,
        harvestDate: Math.floor(harvestDate.getTime() / 1000),
        notes: formData.notes,
        metadataUri,
      });

    } catch (err) {
      console.error('Tokenization error:', err);
      const errorMessage = getErrorMessage(err);

      // Provide specific guidance for different error types
      if (errorMessage.includes('Pinata API')) {
        addToast('IPFS upload failed. Please check your Pinata API configuration.', 'error');
      } else if (errorMessage.includes('401')) {
        addToast('Authentication failed. Please verify your Pinata API keys.', 'error');
      } else if (errorMessage.includes('User rejected')) {
        addToast('Transaction was rejected by user.', 'warning');
      } else if (errorMessage.includes('insufficient funds')) {
        addToast('Insufficient funds for transaction. Please add more ETH to your wallet.', 'error');
      } else {
        addToast(`Error during tokenization: ${errorMessage}`, 'error');
      }
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      addToast('Please correct the form errors.', 'error');
      return;
    }

    if (!canMint) {
      addToast('You need farmer role to mint crop batches.', 'warning');
      return;
    }

    if (!isConnected || !account) {
      addToast('Please connect your wallet.', 'warning');
      return;
    }

    if (mode === 'development') {
      await handleDevelopmentSubmit();
    } else {
      await handleProductionSubmit();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', description: '', cropType: '', quantity: '', originFarm: '',
      harvestDate: '', notes: '', certifications: '', location: '',
    });
    setImageFile(null);
    setFormErrors({});
    setMintedTokenId(null);
    setProvenanceInitialized(false);
  };

  // Handle successful minting - initialize provenance
  useEffect(() => {
    if (isConfirmed && hash && nextTokenId && !provenanceInitialized) {
      setMintedTokenId(nextTokenId);
      initializeProvenanceForToken(nextTokenId);
    }
  }, [isConfirmed, hash, nextTokenId, provenanceInitialized]);

  const initializeProvenanceForToken = async (tokenId: number) => {
    try {
      addToast('Initializing supply chain provenance...', 'info');

      await initializeProvenance({
        args: [
          BigInt(tokenId),
          account!,
          formData.location || formData.originFarm,
          `Initial production at ${formData.originFarm}. ${formData.notes || 'No additional notes.'}`
        ]
      });

      setProvenanceInitialized(true);
      addToast(
        `Crop batch tokenized successfully! Token ID: ${tokenId}. Provenance initialized. Transaction: ${formatTxHash(hash!)}`,
        'success',
        10000
      );

      // Reset form on complete success
      resetForm();
      onSuccess?.(tokenId);
    } catch (error) {
      console.error('Provenance initialization failed:', error);
      addToast(
        `Token minted successfully (ID: ${tokenId}) but provenance initialization failed. You can initialize it manually later.`,
        'warning',
        8000
      );
    }
  };

  // Handle contract errors
  useEffect(() => {
    if (contractError) {
      addToast(`Contract error: ${contractError}`, 'error');
    }
  }, [contractError, addToast]);

  // Handle provenance errors
  useEffect(() => {
    if (provenanceError) {
      addToast(`Provenance initialization error: ${provenanceError}`, 'error');
    }
  }, [provenanceError, addToast]);

  // Display access denied message
  if (isConnected && !canMint) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-yellow-200 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 text-white text-center">
              <AlertTriangle className="h-16 w-16 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Farmer Role Required</h2>
            </div>
            <div className="p-8 text-center">
              <p className="text-lg text-gray-700 mb-6">
                You need to be registered as a <strong>Farmer</strong> to create crop batch tokens.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">How to get Farmer access:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Visit the User Registration page</li>
                  <li>• Contact an administrator</li>
                  <li>• Join our farmer verification program</li>
                </ul>
              </div>
              <button
                onClick={() => window.location.href = '/register'}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Register as Farmer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      <div className="p-6 max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8 animate-fade-in-down">
          <div className="flex items-center justify-center mb-6">
            <div className="h-16 w-16 rounded-full gradient-bg-primary flex items-center justify-center shadow-lg mr-4">
              <Coins className="h-8 w-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl lg:text-5xl font-bold gradient-text">Crop Tokenization</h1>
              <p className="text-gray-500 text-lg">Create NFTs for your agricultural produce</p>
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your crop batches into blockchain-verified NFTs with complete traceability and provenance tracking.
          </p>
        </div>

        {/* Mode Selector */}
        <div className="mb-8 animate-fade-in-up">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-blue-600" />
              Tokenization Mode
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                mode === 'development'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`} onClick={() => setMode('development')}>
                <div className="flex items-center mb-2">
                  <Database className="h-5 w-5 mr-2 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Development Mode</h3>
                  {mode === 'development' && <CheckCircle className="h-4 w-4 ml-auto text-blue-600" />}
                </div>
                <p className="text-sm text-gray-600 mb-2">Local storage simulation for testing</p>
                <div className="flex items-center text-xs text-gray-500">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Fast & Free • No blockchain fees • Local testing
                </div>
              </div>

              <div className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                mode === 'production'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`} onClick={() => setMode('production')}>
                <div className="flex items-center mb-2">
                  <Globe className="h-5 w-5 mr-2 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Production Mode</h3>
                  {mode === 'production' && <CheckCircle className="h-4 w-4 ml-auto text-green-600" />}
                </div>
                <p className="text-sm text-gray-600 mb-2">Real blockchain & IPFS integration</p>
                <div className="flex items-center text-xs text-gray-500">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Permanent • Immutable • Global network
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 animate-fade-in-up">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                mode === 'development' ? 'bg-blue-100' : 'bg-green-100'
              }`}>
                {mode === 'development' ?
                  <Database className="h-6 w-6 text-blue-600" /> :
                  <Globe className="h-6 w-6 text-green-600" />
                }
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {mode === 'development' ? 'Development Tokenization' : 'Production Tokenization'}
                </h2>
                <p className="text-gray-600">
                  {mode === 'development'
                    ? 'Create a crop batch record with local storage for testing'
                    : 'Create a new crop batch NFT with IPFS metadata and blockchain minting'
                  }
                </p>
              </div>
            </div>

            {/* Status indicators */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={isConnected ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                  {isConnected ? 'Wallet Connected' : 'Wallet Disconnected'}
                </span>
              </div>

              {mode === 'production' && !isLoadingNextTokenId && nextTokenId && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <Coins className="h-4 w-4 text-green-600" />
                  <span className="text-green-700 font-medium">Next Token ID: #{nextTokenId}</span>
                </div>
              )}

              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700 font-medium">
                  {mode === 'development' ? 'Local Storage' : 'Blockchain + IPFS'}
                </span>
              </div>
            </div>

            {isProcessing && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <LoadingSpinner variant="minimal" size="sm" />
                  <span className="text-blue-800 font-medium">
                    {isUploading ? 'Uploading to IPFS...' :
                     isWritePending ? 'Waiting for wallet...' :
                     isConfirming ? 'Confirming transaction...' :
                     isInitializingProvenance ? 'Initializing provenance...' : 'Processing...'}
                  </span>
                </div>
                {uploadProgress && (
                  <p className="text-sm text-blue-700 mt-2">{uploadProgress}</p>
                )}
              </div>
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
                disabled={isProcessing}
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
                disabled={isProcessing}
              >
                <option value="">Select crop type</option>
                <option value="Wheat">Wheat</option>
                <option value="Rice">Rice</option>
                <option value="Corn">Corn</option>
                <option value="Soybeans">Soybeans</option>
                <option value="Tomatoes">Tomatoes</option>
                <option value="Potatoes">Potatoes</option>
                <option value="Coffee">Coffee</option>
                <option value="Cotton">Cotton</option>
                <option value="Sugarcane">Sugarcane</option>
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
              placeholder="Detailed description of the crop batch..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              disabled={isProcessing}
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
                disabled={isProcessing}
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
                disabled={isProcessing}
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
                disabled={isProcessing}
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
                disabled={isProcessing}
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
                disabled={isProcessing}
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
                disabled={isProcessing}
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
                      disabled={isProcessing}
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
          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isProcessing || !isConnected}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 ${
                mode === 'development'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                  : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
              }`}
            >
              {isProcessing ? (
                <>
                  <LoadingSpinner variant="minimal" size="sm" className="mr-3" />
                  {isUploading ? (mode === 'development' ? 'Simulating...' : 'Uploading to IPFS...') :
                   isWritePending ? 'Waiting for Wallet...' :
                   isConfirming ? 'Confirming Transaction...' :
                   isInitializingProvenance ? 'Initializing Provenance...' :
                   'Processing...'}
                </>
              ) : (
                <>
                  {mode === 'development' ? (
                    <>
                      <Database className="h-5 w-5 mr-2" />
                      Create Development Batch
                    </>
                  ) : (
                    <>
                      <Coins className="h-5 w-5 mr-2" />
                      Mint Crop Batch Token
                    </>
                  )}
                </>
              )}
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

            {isConfirmed && provenanceInitialized && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Tokenization & Provenance Successful!</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Your crop batch has been successfully tokenized and supply chain provenance has been initialized.
                </p>
              </div>
            )}

            {isConfirmed && !provenanceInitialized && !isInitializingProvenance && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Info className="h-5 w-5" />
                  <span className="font-medium">Token Minted - Initializing Provenance...</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Token created successfully. Setting up supply chain tracking...
                </p>
              </div>
            )}
          </div>
        </form>

        {/* Info Section */}
        <div className={`p-6 border-t border-gray-200 rounded-b-xl ${
          mode === 'development' ? 'bg-blue-50' : 'bg-green-50'
        }`}>
          <div className="flex items-start space-x-3">
            <Info className={`w-5 h-5 mt-0.5 ${
              mode === 'development' ? 'text-blue-600' : 'text-green-600'
            }`} />
            <div className={`text-sm ${
              mode === 'development' ? 'text-blue-800' : 'text-green-800'
            }`}>
              <p className="font-medium mb-1">
                {mode === 'development' ? 'Development Mode Notice' : 'Production Mode Notice'}
              </p>
              <p>
                {mode === 'development'
                  ? 'Your crop batch data is stored locally in your browser for testing. Switch to Production Mode for permanent blockchain storage.'
                  : 'Your crop batch will be permanently stored on IPFS and minted as an NFT on the blockchain with complete provenance tracking.'
                }
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default TokenizationPage;
