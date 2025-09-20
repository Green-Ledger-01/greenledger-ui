import React, { useState } from 'react';
import { ChevronRight, Calendar, MapPin, Scale, Sprout, User, Truck, ShoppingCart, Clock, Plus, Check, DollarSign, X, Info } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useCart } from '../contexts/CartContext';
import { ipfsToHttp, CropMetadata } from '../utils/ipfs';
import CurrencyDisplay from './CurrencyDisplay';
import { useCropBatchToken } from '../hooks/useCropBatchToken';

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
  const { refreshTrigger, getBatchDetails } = useCropBatchToken();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentOwner, setCurrentOwner] = useState(batch.owner || '');

  const isAlreadyInCart = isInCart(batch.tokenId);

  // Update owner when transfer events are detected
  React.useEffect(() => {
    if (refreshTrigger > 0) {
      const updateOwnership = async () => {
        try {
          const updatedBatch = await getBatchDetails(batch.tokenId);
          if (updatedBatch && updatedBatch.owner !== currentOwner) {
            setCurrentOwner(updatedBatch.owner);
          }
        } catch (error) {
          console.warn('Failed to update ownership:', error);
        }
      };
      updateOwnership();
    }
  }, [refreshTrigger, batch.tokenId, getBatchDetails, currentOwner]);

  const handleMoreInfoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowDetailModal(true);
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

  const formatLastUpdated = (timestamp: number) => {
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

  const getPlaceholderImage = () => {
    const colors = ['B0D9B1', 'A8E6A3', '88D982', '6BCF7F'];
    const color = colors[batch.tokenId % colors.length];
    return `https://placehold.co/400x200/${color}/000000?text=${encodeURIComponent(batch.cropType || 'Crop')}`;
  };

  return (
    <>
      {/* Compact Card */}
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group border border-gray-100">
        {/* Image Section */}
        <div className="relative overflow-hidden">
          <img
            src={ipfsToHttp(batch.image) || getPlaceholderImage()}
            alt={batch.name || 'Crop Batch Image'}
            className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = getPlaceholderImage();
              e.currentTarget.onerror = null; // Prevent infinite loop
            }}
          />

          {/* Token ID Badge */}
          <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            #{batch.tokenId}
          </div>

          {/* Certifications Badge */}
          {batch.certifications && batch.certifications.length > 0 && (
            <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              ✓
            </div>
          )}
        </div>

        {/* Compact Content Section */}
        <div className="p-4">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
            {batch.name || `Batch #${batch.tokenId}`}
          </h3>

          {/* Essential Info */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-gray-600">
                <Sprout className="h-3 w-3" />
                <span>{batch.cropType}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-600">
                <Scale className="h-3 w-3" />
                <span>{batch.quantity} kg</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-gray-600 text-sm">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{batch.originFarm}</span>
            </div>
          </div>

          {/* Price Display */}
          {batch.pricePerKg && (
            <div className="mb-3 p-2 bg-green-50 rounded-lg border border-green-200">
              <div className="text-center">
                <div className="text-lg font-bold text-green-800">
                  {(batch.pricePerKg * batch.quantity).toFixed(3)} ETH
                </div>
                <div className="text-xs text-green-600">
                  {batch.pricePerKg} ETH/kg
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={isAlreadyInCart}
              className={`flex-1 py-2 px-3 rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-1 text-sm ${
                isAlreadyInCart
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isAlreadyInCart ? (
                <>
                  <Check className="h-3 w-3" />
                  <span>In Cart</span>
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3" />
                  <span>Add</span>
                </>
              )}
            </button>

            {/* View Details Button */}
            <button
              onClick={handleMoreInfoClick}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium flex items-center justify-center gap-1 border border-gray-200 text-sm"
            >
              <Info className="h-3 w-3" />
              <span>Details</span>
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-900">
                {batch.name || `Batch #${batch.tokenId}`}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Image */}
              <div className="mb-6">
                <img
                  src={ipfsToHttp(batch.image) || getPlaceholderImage()}
                  alt={batch.name || 'Crop Batch Image'}
                  className="w-full h-64 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = getPlaceholderImage();
                    e.currentTarget.onerror = null;
                  }}
                />
              </div>

              {/* Description */}
              {batch.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{batch.description}</p>
                </div>
              )}

              {/* Detailed Attributes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Sprout className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{batch.cropType}</div>
                      <div className="text-sm text-gray-500">Crop Type</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Scale className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{batch.quantity} kg</div>
                      <div className="text-sm text-gray-500">Quantity</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{batch.originFarm}</div>
                      <div className="text-sm text-gray-500">Origin Farm</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{formatDate(batch.harvestDate)}</div>
                      <div className="text-sm text-gray-500">Harvest Date</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {batch.pricePerKg && (
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{batch.pricePerKg} ETH/kg</div>
                        <div className="text-sm text-gray-500">Price per kg</div>
                      </div>
                    </div>
                  )}

                  {currentOwner && (
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <User className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 font-mono text-sm">
                          {currentOwner.slice(0, 6)}...{currentOwner.slice(-4)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Owner {currentOwner !== batch.owner ? '(Updated)' : ''}
                        </div>
                      </div>
                    </div>
                  )}

                  {batch.lastUpdated && (
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Clock className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{formatLastUpdated(batch.lastUpdated)}</div>
                        <div className="text-sm text-gray-500">Last Updated</div>
                      </div>
                    </div>
                  )}

                  {batch.supplyChainStatus && (
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Truck className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 capitalize">{batch.supplyChainStatus}</div>
                        <div className="text-sm text-gray-500">Supply Chain Status</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Price Section */}
              {batch.pricePerKg && (
                <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="text-lg font-semibold text-green-800">Total Price</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-800">
                        {(batch.pricePerKg * batch.quantity).toFixed(3)} ETH
                      </div>
                      <div className="text-sm text-green-600">
                        {batch.pricePerKg} ETH/kg × {batch.quantity} kg
                      </div>
                    </div>
                  </div>

                  {/* Multi-Currency Display */}
                  <CurrencyDisplay
                    amount={batch.pricePerKg * batch.quantity}
                    currency="ETH"
                    showAllCurrencies={true}
                    className="mt-2"
                  />
                </div>
              )}

              {/* Notes */}
              {batch.notes && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-700 italic">"{batch.notes}"</p>
                  </div>
                </div>
              )}

              {/* Certifications */}
              {batch.certifications && batch.certifications.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {batch.certifications.map((cert, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full border border-blue-200"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleAddToCart}
                  disabled={isAlreadyInCart}
                  className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 font-semibold flex items-center justify-center gap-2 ${
                    isAlreadyInCart
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {isAlreadyInCart ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Already in Cart</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-semibold border border-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CropBatchCard;