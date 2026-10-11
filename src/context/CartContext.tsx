import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, DiscountCode } from '../types';
import { useStore } from './StoreContext';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, size: string, color: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  subtotal: number;
  totalItems: number;
  discount: { code: string; percentage: number; amount: number } | null;
  applyDiscount: (code: string) => Promise<{ success: boolean; message: string }>;
  removeDiscount: () => void;
  estimatedShipping: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings } = useStore();
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('kd_cart_items');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [discount, setDiscount] = useState<{ code: string; percentage: number; amount: number } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('kd_cart_items', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed saving cart:', e);
    }
  }, [cart]);

  const addToCart = (product: Product, size: string, color: string, quantity = 1) => {
    const unitPrice = product.salePrice ?? product.price;
    setCart(prev => {
      const existingIdx = prev.findIndex(
        item => item.productId === product.id && item.size === size && item.color === color
      );
      if (existingIdx !== -1) {
        const next = [...prev];
        next[existingIdx].quantity += quantity;
        return next;
      }
      return [
        ...prev,
        {
          productId: product.id,
          productName: product.name,
          image: product.images[0] || '',
          size,
          color,
          quantity,
          price: unitPrice
        }
      ];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
    setCart(prev =>
      prev.filter(
        item => !(item.productId === productId && item.size === size && item.color === color)
      )
    );
  };

  const updateQuantity = (productId: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.productId === productId && item.size === size && item.color === color
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(null);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const applyDiscount = async (code: string) => {
    try {
      const res = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Invalid code.' };
      }
      setDiscount({
        code: data.code,
        percentage: data.percentage,
        amount: data.discountAmount
      });
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error validating code.' };
    }
  };

  const removeDiscount = () => {
    setDiscount(null);
  };

  const estimatedShipping =
    subtotal >= (settings?.shippingRates?.freeShippingThreshold || 2500)
      ? 0
      : (settings?.shippingRates?.cairoGiza || 60);

  const discountAmount = discount ? discount.amount : 0;
  const totalAmount = Math.max(0, subtotal - discountAmount + (subtotal > 0 ? estimatedShipping : 0));

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        subtotal,
        totalItems,
        discount,
        applyDiscount,
        removeDiscount,
        estimatedShipping,
        totalAmount
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
