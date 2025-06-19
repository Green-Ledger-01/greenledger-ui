import React from 'react';
import { ChevronRight, Calendar, MapPin, Scale, Sprout, User, Truck, ShoppingCart, Clock } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { ipfsToHttp, CropMetadata } from '../utils/ipfs';

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

  const handleMoreInfoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    addToast(`Displaying more info for Batch ID: ${batch.tokenId}. Crop Type: ${batch.cropType}`, 'info');
    // In a real app, this would open a modal or navigate to a detail page
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
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group border border-gray-200">
      {/* Image Section */}
      <div className="relative overflow-hidden">
        <img
          src={ipfsToHttp(batch.image)}
          alt={batch.name || 'Crop Batch Image'}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = getPlaceholderImage();
            e.currentTarget.onerror = null; // Prevent infinite loop
          }}
        />
        
        {/* Token ID Badge */}
        <div className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
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
          <div className="absolute bottom-3 right-3 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
            Certified
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5">
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
            <Sprout className="h-4 w-4 mr-2 text-green-600" />
            <div>
              <div className="font-medium">{batch.cropType}</div>
              <div className="text-xs text-gray-500">Crop Type</div>
            </div>
          </div>
          
          <div className="flex items-center text-gray-700">
            <Scale className="h-4 w-4 mr-2 text-blue-600" />
            <div>
              <div className="font-medium">{batch.quantity} kg</div>
              <div className="text-xs text-gray-500">Quantity</div>
            </div>
          </div>
          
          <div className="flex items-center text-gray-700">
            <MapPin className="h-4 w-4 mr-2 text-red-600" />
            <div>
              <div className="font-medium truncate">{batch.originFarm}</div>
              <div className="text-xs text-gray-500">Origin Farm</div>
            </div>
          </div>
          
          <div className="flex items-center text-gray-700">
            <Calendar className="h-4 w-4 mr-2 text-purple-600" />
            <div>
              <div className="font-medium">{formatDate(batch.harvestDate)}</div>
              <div className="text-xs text-gray-500">Harvest Date</div>
            </div>
          </div>
        </div>
        
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
        
        {/* Action Button */}
        <button
          onClick={handleMoreInfoClick}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 px-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
        >
          <span>View Details</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default CropBatchCard;