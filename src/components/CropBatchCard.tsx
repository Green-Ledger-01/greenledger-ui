import React from 'react';
import { ChevronRight, Calendar, MapPin, Scale, Sprout, User, Truck, ShoppingCart, Clock, Plus, Check, DollarSign } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useCart } from '../contexts/CartContext';
import { ipfsToHttp, CropMetadata } from '../utils/ipfs';
import CurrencyDisplay from './CurrencyDisplay';
import SimpleCurrencyDisplay from './SimpleCurrencyDisplay';

interface CropBatchCardProps {
  batch: CropMetadata & { 
    tokenId: number;
    owner?: string;
    supplyChainStatus?: 'farmer' | 'transporter' | 'buyer';
    lastUpdated?: number;
  };
}

const CropBatchCard: React.FC<CropBatchCardProps> = ({ batch }) => {
  const { addToast } = useToast();
  const { addToCart, isInCart } = useCart();

  const isAlreadyInCart = isInCart(batch.tokenId);

  const handleMoreInfoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    addToast(`Displaying more info for Batch ID: ${batch.tokenId}. Crop Type: ${batch.cropType}`, 'info');
    // In a real app, this would open a modal or navigate to a detail page
  };

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

  return (
    <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group border border-gray-100">
      {/* Image Section */}
      <div className="relative overflow-hidden">
        <img
          src={ipfsToHttp(batch.image) || getPlaceholderImage()}
          alt={batch.name || 'Crop Batch Image'}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = getPlaceholderImage();
            e.currentTarget.onerror = null; // Prevent infinite loop
          }}
        />

        {/* Token ID Badge */}
        <div className="absolute top-3 left-3 bg-gradient-to-br from-green-500 to-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          ID: {batch.tokenId}
        </div>
        
        {/* Supply Chain Status Badge */}
        {batch.supplyChainStatus && (
          <div className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full shadow-md border ${getSupplyChainColor(batch.supplyChainStatus)}`}>
            <div className="flex items-center gap-1">
              {getSupplyChainIcon(batch.supplyChainStatus)}
              <span className="capitalize">{batch.supplyChainStatus}</span>
            </div>
          </div>
        )}
        
        {/* Certifications Badge */}
        {batch.certifications && batch.certifications.length > 0 && (
          <div className="absolute bottom-3 right-3 bg-gradient-to-br from-green-500 to-green-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            Certified
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
          {batch.name || `Batch #${batch.tokenId}`}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {batch.description || 'No description available.'}
        </p>
        
        {/* Attributes Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="flex items-center text-gray-700">
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center mr-2">
              <Sprout className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="font-medium">{batch.cropType}</div>
              <div className="text-xs text-gray-500">Crop Type</div>
            </div>
          </div>

          <div className="flex items-center text-gray-700">
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center mr-2">
              <Scale className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="font-medium">{batch.quantity} kg</div>
              <div className="text-xs text-gray-500">Quantity</div>
            </div>
          </div>

          {batch.pricePerKg && (
            <div className="flex items-center text-gray-700">
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center mr-2">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="font-medium">{batch.pricePerKg} ETH/kg</div>
                <div className="text-xs text-gray-500">Price per kg</div>
              </div>
            </div>
          )}

          <div className="flex items-center text-gray-700">
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center mr-2">
              <MapPin className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="font-medium truncate">{batch.originFarm}</div>
              <div className="text-xs text-gray-500">Origin Farm</div>
            </div>
          </div>

          <div className="flex items-center text-gray-700">
            <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center mr-2">
              <Calendar className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="font-medium">{formatDate(batch.harvestDate)}</div>
              <div className="text-xs text-gray-500">Harvest Date</div>
            </div>
          </div>
        </div>

        {/* Price Highlight for Marketplace */}
        {batch.pricePerKg && (
          <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Total Price</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-800">
                  {(batch.pricePerKg * batch.quantity).toFixed(3)} ETH
                </div>
                <div className="text-xs text-green-600">
                  {batch.pricePerKg} ETH/kg × {batch.quantity} kg
                </div>
              </div>
            </div>

            {/* Multi-Currency Display */}
            <SimpleCurrencyDisplay
              ethAmount={batch.pricePerKg * batch.quantity}
              showAllCurrencies={true}
              className="mt-2"
            />
          </div>
        )}
        
        {/* Supply Chain & Owner Info */}
        {(batch.owner || batch.lastUpdated) && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            {batch.owner && (
              <div className="flex items-center gap-2 mb-2">
                <User className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-600">
                  Owner: {batch.owner.slice(0, 6)}...{batch.owner.slice(-4)}
                </span>
              </div>
            )}
            {batch.lastUpdated && (
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-600">
                  Updated: {formatLastUpdated(batch.lastUpdated)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {batch.notes && (
          <div className="mb-4 p-2 bg-gray-50 rounded-md">
            <p className="text-xs text-gray-600 italic">"{batch.notes}"</p>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAlreadyInCart}
            className={`w-full py-3 px-4 rounded-xl transition-all duration-200 font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 ${
              isAlreadyInCart
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isAlreadyInCart ? (
              <>
                <Check className="h-4 w-4" />
                <span>In Cart</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Add to Cart</span>
              </>
            )}
          </button>

          {/* View Details Button */}
          <button
            onClick={handleMoreInfoClick}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium flex items-center justify-center space-x-2 border border-gray-200"
          >
            <span>View Details</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CropBatchCard;