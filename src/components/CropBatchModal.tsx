import React from 'react';
import { X, Calendar, MapPin, Scale, Sprout, User, Truck, ShoppingCart, Clock, Plus, Check, DollarSign } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useCart } from '../contexts/CartContext';
import { ipfsToHttp, CropMetadata } from '../utils/ipfs';
import CurrencyDisplay from './CurrencyDisplay';

interface CropBatchModalProps {
  batch: CropMetadata & {
    tokenId: number;
    owner?: string;
    supplyChainStatus?: 'farmer' | 'transporter' | 'buyer';
    lastUpdated?: number;
  };
  isOpen: boolean;
  onClose: () => void;
  selectedCurrency?: 'ETH' | 'USD' | 'KES' | 'NGN';
}

const CropBatchModal: React.FC<CropBatchModalProps> = ({ batch, isOpen, onClose, selectedCurrency = 'ETH' }) => {
  const { addToast } = useToast();
  const { addToCart, isInCart } = useCart();

  const isAlreadyInCart = isInCart(batch.tokenId);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAlreadyInCart) {
      addToast(`${batch.name || `Batch #${batch.tokenId}`} is already in your cart`, 'warning');
      return;
    }

    addToCart({
      tokenId: batch.tokenId,
      name: batch.name || `Batch #${batch.tokenId}`,
      cropType: batch.cropType || 'Unknown',
      quantity: batch.quantity || 0,
      originFarm: batch.originFarm || 'Unknown Farm',
      harvestDate: batch.harvestDate || 0,
      image: batch.image,
      price: batch.pricePerKg,
      owner: batch.owner || '',
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPlaceholderImage = () => {
    const colors = ['B0D9B1', 'A8E6A3', '88D982', '6BCF7F'];
    const color = colors[batch.tokenId % colors.length];
    return `https://placehold.co/400x200/${color}/000000?text=${encodeURIComponent(batch.cropType || 'Crop')}`;
  };

  const getSupplyChainIcon = (status?: 'farmer' | 'transporter' | 'buyer') => {
    switch (status) {
      case 'farmer':
        return <Sprout className="h-4 w-4 text-green-600" />;
      case 'transporter':
        return <Truck className="h-4 w-4 text-blue-600" />;
      case 'buyer':
        return <ShoppingCart className="h-4 w-4 text-purple-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSupplyChainColor = (status?: 'farmer' | 'transporter' | 'buyer') => {
    switch (status) {
      case 'farmer':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'transporter':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'buyer':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatLastUpdated = (timestamp?: number) => {
    if (!timestamp) return '';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">
            {batch.name || `Batch #${batch.tokenId}`}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Image Section */}
          <div className="relative overflow-hidden rounded-xl mb-6">
            <img
              src={ipfsToHttp(batch.image) || getPlaceholderImage()}
              alt={batch.name || 'Crop Batch Image'}
              className="w-full h-64 object-cover"
              onError={(e) => {
                e.currentTarget.src = getPlaceholderImage();
                e.currentTarget.onerror = null;
              }}
            />

            {/* Token ID Badge */}
            <div className="absolute top-3 left-3 bg-gradient-to-br from-green-500 to-green-600 text-white text-sm font-bold px-3 py-2 rounded-full shadow-lg">
              ID: {batch.tokenId}
            </div>
            
            {/* Supply Chain Status Badge */}
            {batch.supplyChainStatus && (
              <div className={`absolute top-3 right-3 text-sm font-bold px-3 py-2 rounded-full shadow-md border ${getSupplyChainColor(batch.supplyChainStatus)}`}>
                <div className="flex items-center gap-2">
                  {getSupplyChainIcon(batch.supplyChainStatus)}
                  <span className="capitalize">{batch.supplyChainStatus}</span>
                </div>
              </div>
            )}
            
            {/* Certifications Badge */}
            {batch.certifications && batch.certifications.length > 0 && (
              <div className="absolute bottom-3 right-3 bg-gradient-to-br from-green-500 to-green-600 text-white text-sm font-bold px-3 py-2 rounded-full shadow-lg">
                Certified
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            {batch.description || 'No description available.'}
          </p>
          
          {/* Attributes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <Sprout className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{batch.cropType}</div>
                <div className="text-sm text-gray-500">Crop Type</div>
              </div>
            </div>

            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <Scale className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{batch.quantity} kg</div>
                <div className="text-sm text-gray-500">Quantity</div>
              </div>
            </div>

            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{batch.originFarm}</div>
                <div className="text-sm text-gray-500">Origin Farm</div>
              </div>
            </div>

            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{formatDate(batch.harvestDate)}</div>
                <div className="text-sm text-gray-500">Harvest Date</div>
              </div>
            </div>

            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CurrencyDisplay
                  amount={batch.pricePerKg || 0}
                  currency={selectedCurrency}
                  compact={true}
                />
                <div className="text-sm text-gray-500">Price per kg</div>
              </div>
            </div>
          </div>

          {/* Price Highlight */}
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-green-600" />
                <span className="text-lg font-medium text-green-800">Total Price</span>
              </div>
              <div className="text-right">
                <CurrencyDisplay
                  amount={batch.pricePerKg ? batch.pricePerKg * batch.quantity : 0}
                  currency={selectedCurrency}
                  compact={true}
                />
                {batch.pricePerKg && (
                  <div className="text-sm text-green-600">
                    <CurrencyDisplay
                      amount={batch.pricePerKg}
                      currency={selectedCurrency}
                      compact={true}
                    /> × {batch.quantity} kg
                  </div>
                )}
              </div>
            </div>

            {/* Multi-Currency Display */}
            {batch.pricePerKg && (
              <CurrencyDisplay
                amount={batch.pricePerKg * batch.quantity}
                currency={selectedCurrency}
                showAllCurrencies={true}
                className="mt-3"
              />
            )}
          </div>
          
          {/* Supply Chain & Owner Info */}
          {(batch.owner || batch.lastUpdated) && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Supply Chain Information</h4>
              {batch.owner && (
                <div className="flex items-center gap-3 mb-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Owner: {batch.owner.slice(0, 6)}...{batch.owner.slice(-4)}
                  </span>
                </div>
              )}
              {batch.lastUpdated && (
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Last Updated: {formatLastUpdated(batch.lastUpdated)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {batch.notes && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
              <p className="text-sm text-gray-600 italic">"{batch.notes}"</p>
            </div>
          )}
          
          {/* Action Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAlreadyInCart}
            className={`w-full py-4 px-6 rounded-xl transition-all duration-200 font-semibold flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 ${
              isAlreadyInCart
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isAlreadyInCart ? (
              <>
                <Check className="h-5 w-5" />
                <span>Already in Cart</span>
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CropBatchModal;
