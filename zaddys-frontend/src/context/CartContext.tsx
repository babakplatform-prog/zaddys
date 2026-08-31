"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

// Generate a unique cart item key from product ID + selected options
function generateCartItemId(productId: number, selectedOptionIds?: number[]): string {
  const optionKey = (selectedOptionIds || []).sort((a, b) => a - b).join(',');
  return `${productId}:${optionKey}`;
}

export interface CartItem {
  cartItemId: string;
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  is_custom_quote: boolean;
  selected_option_ids?: number[];
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'cartItemId'>) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const hydrateCart = window.setTimeout(() => {
    try {
      const savedCart = localStorage.getItem("zaddys_cart");
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch {
      localStorage.removeItem("zaddys_cart");
    }
    }, 0);
    return () => window.clearTimeout(hydrateCart);
  }, []);

  // Save cart to LocalStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("zaddys_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (newItem: Omit<CartItem, 'cartItemId'>) => {
    const cartItemId = generateCartItemId(newItem.id, newItem.selected_option_ids);
    setCart((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + newItem.quantity } : item
        );
      }
      return [...prev, { ...newItem, cartItemId }];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) => prev.map((item) => item.cartItemId === cartItemId ? { ...item, quantity } : item));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}