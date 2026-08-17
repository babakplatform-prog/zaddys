"use client";
import React, { createContext, useContext, useState } from "react";

type CartItem = {
  id: string; 
  productId: string;
  name: string;
  price: number;
  qty: number;
  image: string;
  customization: string;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  cartTotal: number;
  cartCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (newItem: CartItem) => {
    setCart((prev) => {
      // If the exact same item with the same add-ons exists, just increase quantity
      const existing = prev.find((item) => item.id === newItem.id);
      if (existing) {
        return prev.map((item) => 
          item.id === newItem.id ? { ...item, qty: item.qty + newItem.qty } : item
        );
      }
      return [...prev, newItem];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};