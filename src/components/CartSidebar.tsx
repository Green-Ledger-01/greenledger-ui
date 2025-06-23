import React from 'react';
import { X, ShoppingCart, Trash2, Calendar, MapPin, Scale, Package, CreditCard } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { ipfsToHttp } from '../utils/ipfs';

const CartSidebar: React.FC = () => {
  const { items, totalItems, isOpen, closeCart, removeFromCart, clearCart } = useCart();
  const { addToast } = useToast();

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
    return `https://placehold.co/80x80/${color}/000000?text=${encodeURIComponent(cropType || 'Crop')}`;
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      addToast('Your cart is empty', 'warning');
      return;
    }
    
    // For now, just show a success message
    addToast(`Checkout initiated for ${totalItems} item${totalItems !== 1 ? 's' : ''}`, 'success');
    // In a real app, this would integrate with payment processing
  };

  const handleRemoveItem = (tokenId: number) => {
    removeFromCart(tokenId);
  };

  const handleClearCart = () => {
    if (items.length === 0) return;
    clearCart();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={closeCart}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
                <p className="text-sm text-gray-600">
                  {totalItems} item{totalItems !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-4">
                Browse the marketplace to add crop batches to your cart.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.tokenId} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={ipfsToHttp(item.image) || getPlaceholderImage(item.tokenId, item.cropType)}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.src = getPlaceholderImage(item.tokenId, item.cropType);
                          e.currentTarget.onerror = null;
                        }}
                      />
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{item.name}</h4>
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Package className="h-3 w-3" />
                          <span>{item.cropType}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Scale className="h-3 w-3" />
                          <span>{item.quantity} kg</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{item.originFarm}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(item.harvestDate)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.tokenId)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors group"
                    >
                      <Trash2 className="h-4 w-4 text-gray-400 group-hover:text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gray-200 space-y-4">
            {/* Clear Cart Button */}
            <button
              onClick={handleClearCart}
              className="w-full text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              Clear all items
            </button>
            
            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-xl hover:bg-green-700 transition-all duration-200 font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              <CreditCard className="h-5 w-5" />
              <span>Proceed to Checkout</span>
            </button>
            
            <p className="text-xs text-gray-500 text-center">
              Secure checkout powered by blockchain technology
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
