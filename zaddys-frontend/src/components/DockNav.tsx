"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function DockNav() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const isActive = (path: string) => pathname === path;

  return (
    // The Floating Container
    <div className="fixed bottom-6 left-4 right-4 z-50 pointer-events-none max-w-md mx-auto">
      <nav className="bg-white/95 backdrop-blur-xl shadow-2xl shadow-black/10 rounded-3xl border border-zinc-200 pointer-events-auto overflow-hidden">
        <div className="flex justify-around items-center h-[72px] px-2">
          <Link href="/" className={`flex flex-col items-center justify-center w-16 transition-colors ${isActive('/') ? 'text-zaddys-red' : 'text-zinc-400 hover:text-black'}`}>
            <Home size={24} />
            <span className={`text-[10px] mt-1 ${isActive('/') ? 'font-bold' : 'font-medium'}`}>Home</span>
          </Link>
          <button className="flex flex-col items-center justify-center w-16 transition-colors text-zinc-400 hover:text-black">
            <Search size={24} />
            <span className="text-[10px] mt-1 font-medium">Search</span>
          </button>
          <Link href="/cart" className={`flex flex-col items-center justify-center w-16 transition-colors relative ${isActive('/cart') ? 'text-zaddys-red' : 'text-zinc-400 hover:text-black'}`}>
            <ShoppingBag size={24} />
            <span className={`text-[10px] mt-1 ${isActive('/cart') ? 'font-bold' : 'font-medium'}`}>Cart</span>
            {cartCount > 0 && (
              <span className="absolute top-1 right-3 flex h-4 w-4 items-center justify-center rounded-full bg-zaddys-red text-[9px] font-bold text-white border-2 border-white shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>
          <Link href="/profile" className={`flex flex-col items-center justify-center w-16 transition-colors ${isActive('/profile') ? 'text-zaddys-red' : 'text-zinc-400 hover:text-black'}`}>
            <User size={24} />
            <span className={`text-[10px] mt-1 ${isActive('/profile') ? 'font-bold' : 'font-medium'}`}>Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}