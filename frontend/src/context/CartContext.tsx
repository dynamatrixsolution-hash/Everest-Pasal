// ==============================================================================
// EVEREST PASAL - CUSTOMER CART CONTEXT
// Database-backed reactive shopping cart state
// ==============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiClient } from '../api/client.js';
import { useAuth } from './AuthContext.js';

export interface CartItem {
  id: string;
  offerId: string;
  quantity: number;
  unitPrice: number | string;
  offer: {
    id: string;
    title: string;
    sku: string;
    price: number | string;
    stockQuantity: number;
    product: {
      id: string;
      name: string;
      brand?: string;
      media?: Array<{ url: string; altText?: string }>;
    };
    organization: {
      id: string;
      legalName: string;
      tradeName?: string;
    };
    inventoryPositions?: Array<{
      quantityAvailable: number;
    }>;
  };
}

export interface CartState {
  id?: string;
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  currency: string;
}

interface CartContextType {
  cart: CartState | null;
  isLoading: boolean;
  addToCart: (offerId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshCart = async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }

    try {
      setIsLoading(true);
      const res = await ApiClient.get<{ cart: CartState }>('/api/cart');
      setCart(res.cart);
    } catch (err: any) {
      console.error('Failed to load cart:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [isAuthenticated]);

  const addToCart = async (offerId: string, quantity: number = 1) => {
    try {
      setIsLoading(true);
      const res = await ApiClient.post<{ status: string; cart: CartState }>('/api/cart/items', {
        offerId,
        quantity,
      });
      setCart(res.cart);
    } catch (err: any) {
      alert(`Could not add to cart: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      setIsLoading(true);
      const res = await ApiClient.patch<{ status: string; cart: CartState }>(`/api/cart/items/${itemId}`, {
        quantity,
      });
      setCart(res.cart);
    } catch (err: any) {
      alert(`Could not update quantity: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      setIsLoading(true);
      const res = await ApiClient.delete<{ status: string; cart: CartState }>(`/api/cart/items/${itemId}`);
      setCart(res.cart);
    } catch (err: any) {
      alert(`Could not remove item: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setIsLoading(true);
      const res = await ApiClient.delete<{ status: string; cart: CartState }>('/api/cart');
      setCart(res.cart);
    } catch (err: any) {
      alert(`Could not clear cart: ${err.message}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

const defaultCartContext: CartContextType = {
  cart: null,
  isLoading: false,
  addToCart: async () => {},
  updateQuantity: async () => {},
  removeItem: async () => {},
  clearCart: async () => {},
  refreshCart: async () => {},
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    return defaultCartContext;
  }
  return context;
}
