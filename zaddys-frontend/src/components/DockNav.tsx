"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, User, MessageCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function DockNav() {
  const pathname = usePathname();
  const { cartCount } = useCart();

  // Highlight the active tab
  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-sm bg-black/90 backdrop-blur-lg border border-zinc-800 rounded-full py-3 px-6 shadow-2xl z-50 flex items-center justify-between">
      
      {/* Home */}
      <Link href="/" className={`flex flex-col items-center space-y-1 transition ${isActive("/") ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
        <Home size={22} className={isActive("/") ? "fill-white/20" : ""} />
        <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
      </Link>

      {/* WhatsApp Support / Quote */}
      <a href="https://wa.me/2348000000000" target="_blank" rel="noreferrer" className="flex flex-col items-center space-y-1 text-zinc-500 hover:text-green-500 transition">
        <MessageCircle size={22} />
        <span className="text-[10px] font-bold uppercase tracking-wider">Chat</span>
      </a>

      {/* Cart with Live Badge */}
      <Link href="/cart" className={`relative flex flex-col items-center space-y-1 transition ${isActive("/cart") ? "text-red-500" : "text-zinc-500 hover:text-zinc-300"}`}>
        <div className="relative">
          <ShoppingBag size={22} className={isActive("/cart") ? "fill-red-500/20" : ""} />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-md">
              {cartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider">Cart</span>
      </Link>

      {/* Profile */}
      <Link href="/profile" className={`flex flex-col items-center space-y-1 transition ${isActive("/profile") || isActive("/login") ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
        <User size={22} className={isActive("/profile") ? "fill-white/20" : ""} />
        <span className="text-[10px] font-bold uppercase tracking-wider">Profile</span>
      </Link>

    </div>
  );
}