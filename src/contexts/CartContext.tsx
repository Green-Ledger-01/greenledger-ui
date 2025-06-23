import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';

// Types
export interface CartItem {
  tokenId: number;
  name: string;
  cropType: string;
  quantity: number;
  originFarm: string;
  harvestDate: number;
  image?: string;
  price?: number; // Future implementation
  owner: string;
  addedAt: number;
}

export interface CartContextType {
  // Cart state
  items: CartItem[];
  totalItems: number;
  isOpen: boolean;
  
  // Cart actions
  addToCart: (item: Omit<CartItem, 'addedAt'>) => void;
  removeFromCart: (tokenId: number) => void;
  updateQuantity: (tokenId: number, quantity: number) => void;
  clearCart: () => void;
  
  // Cart UI
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  
  // Utilities
  isInCart: (tokenId: number) => boolean;
  getCartItem: (tokenId: number) => CartItem | undefined;
}

// Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Storage key
const CART_STORAGE_KEY = 'greenledger_cart';

// Provider Component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [items]);

  // Add item to cart
  const addToCart = useCallback((item: Omit<CartItem, 'addedAt'>) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(cartItem => cartItem.tokenId === item.tokenId);
      
      if (existingItem) {
        addToast(`${item.name} is already in your cart`, 'warning');
        return currentItems;
      }

      const newItem: CartItem = {
        ...item,
        addedAt: Date.now(),
      };

      addToast(`Added ${item.name} to cart`, 'success');
      return [...currentItems, newItem];
    });
  }, [addToast]);

  // Remove item from cart
  const removeFromCart = useCallback((tokenId: number) => {
    setItems(currentItems => {
      const item = currentItems.find(cartItem => cartItem.tokenId === tokenId);
      if (item) {
        addToast(`Removed ${item.name} from cart`, 'info');
      }
      return currentItems.filter(cartItem => cartItem.tokenId !== tokenId);
    });
  }, [addToast]);

  // Update item quantity (for future use when quantities can be modified)
  const updateQuantity = useCallback((tokenId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(tokenId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.tokenId === tokenId
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeFromCart]);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setItems([]);
    addToast('Cart cleared', 'info');
  }, [addToast]);

  // Cart UI controls
  const toggleCart = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const openCart = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Utility functions
  const isInCart = useCallback((tokenId: number) => {
    return items.some(item => item.tokenId === tokenId);
  }, [items]);

  const getCartItem = useCallback((tokenId: number) => {
    return items.find(item => item.tokenId === tokenId);
  }, [items]);

  // Calculate total items
  const totalItems = items.length;

  // Context value
  const contextValue: CartContextType = {
    // Cart state
    items,
    totalItems,
    isOpen,
    
    // Cart actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    
    // Cart UI
    toggleCart,
    openCart,
    closeCart,
    
    // Utilities
    isInCart,
    getCartItem,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Hook
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
