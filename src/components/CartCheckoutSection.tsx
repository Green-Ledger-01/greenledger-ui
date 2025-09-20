import React, { useState } from 'react';
import { ShoppingCart, CreditCard, Package, Calendar, MapPin, Scale, Trash2, ChevronDown, ChevronUp, CheckCircle, AlertCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { useWeb3Enhanced } from '../contexts/Web3ContextEnhanced';
import { ipfsToHttp } from '../utils/ipfs';

const CartCheckoutSection: React.FC = () => {
  const { items, totalItems, removeFromCart, clearCart } = useCart();
  const { addToast } = useToast();
  const { address, isConnected } = useWeb3Enhanced();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPlaceholderImage = (tokenId: number, cropType: string) => {
    const colors = ['B0D9B1', 'A8E6A3', '88D982', '6BCF7F'];
    const color = colors[tokenId % colors.length];
    return `https://placehold.co/60x60/${color}/000000?text=${encodeURIComponent(cropType || 'Crop')}`;
  };

  const handleCheckout = async () => {
    if (!isConnected || !address) {
      addToast('Please connect your wallet to proceed with checkout', 'warning');
      return;
    }

    if (items.length === 0) {
      addToast('Your cart is empty', 'warning');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate checkout process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      addToast(`Successfully initiated purchase for ${totalItems} crop batch${totalItems !== 1 ? 'es' : ''}!`, 'success');
      clearCart();
    } catch (error) {
      addToast('Checkout failed. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveItem = (tokenId: number) => {
    removeFromCart(tokenId);
  };

  if (totalItems === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="h-16 w-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-600">
            Browse the marketplace to add crop batches to your cart for checkout.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Cart Checkout</h2>
              <p className="text-sm text-gray-600">
                {totalItems} item{totalItems !== 1 ? 's' : ''} ready for purchase
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Cart Items (Collapsible) */}
      {isExpanded && (
        <div className="p-6 border-b border-gray-200">
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {items.map((item) => (
              <div key={item.tokenId} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                {/* Image */}
                <div className="flex-shrink-0">
                  <img
                    src={ipfsToHttp(item.image) || getPlaceholderImage(item.tokenId, item.cropType)}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.src = getPlaceholderImage(item.tokenId, item.cropType);
                      e.currentTarget.onerror = null;
                    }}
                  />
                </div>
                
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">{item.name}</h4>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      <span>{item.cropType}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Scale className="h-3 w-3" />
                      <span>{item.quantity} kg</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{item.originFarm}</span>
                    </div>
                  </div>
                </div>
                
                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveItem(item.tokenId)}
                  className="p-1 hover:bg-red-100 rounded transition-colors group"
                >
                  <Trash2 className="h-4 w-4 text-gray-400 group-hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checkout Section */}
      <div className="p-6">
        {/* Connection Status */}
        {!isConnected ? (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Please connect your wallet to proceed with checkout
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-800">
                Wallet connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleCheckout}
            disabled={!isConnected || isProcessing || totalItems === 0}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                <span>Proceed to Checkout ({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
              </>
            )}
          </button>
          
          {totalItems > 0 && (
            <button
              onClick={clearCart}
              disabled={isProcessing}
              className="w-full text-sm text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              Clear all items
            </button>
          )}
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          Secure checkout powered by blockchain technology
        </p>
      </div>
    </div>
  );
};

export default CartCheckoutSection;
