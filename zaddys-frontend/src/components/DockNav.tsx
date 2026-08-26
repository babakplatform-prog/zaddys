"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Headphones, Home, Search, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { getAccessToken } from "@/services/authService";

export default function DockNav() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const profilePath = getAccessToken() ? "/profile" : "/auth";

  // Highlight the active tab
  const isActive = (path: string) => pathname === path;

  return (
    <nav aria-label="Primary navigation" className="fixed bottom-4 left-1/2 z-50 flex w-[calc(100%-1rem)] max-w-lg -translate-x-1/2 items-center justify-around rounded-2xl border border-zinc-700 bg-zaddys-black px-3 pb-[calc(0.65rem+env(safe-area-inset-bottom))] pt-2.5 text-white shadow-2xl">
      
      {/* Home */}
      <Link href="/" className={`flex flex-col items-center space-y-1 transition ${isActive("/") ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
        <Home size={22} className={isActive("/") ? "fill-white/20" : ""} />
        <span className="text-[11px] font-medium">Home</span>
      </Link>

      <Link href="/#menu" className={`flex flex-col items-center gap-1 transition ${isActive("/") ? "text-zaddys-red" : "text-zinc-400 hover:text-white"}`}>
        <Search size={21} />
        <span className="text-[11px] font-medium">Search</span>
      </Link>

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
        <span className="text-[11px] font-medium">Cart</span>
      </Link>

      <Link href="/support" className={`flex flex-col items-center gap-1 transition ${isActive("/support") ? "text-zaddys-red" : "text-zinc-400 hover:text-white"}`}>
        <Headphones size={21} />
        <span className="text-[11px] font-medium">Support</span>
      </Link>

      {/* Profile */}
      <Link href={profilePath} className={`flex flex-col items-center space-y-1 transition ${isActive("/profile") || isActive("/auth") || isActive("/login") ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
        <User size={22} className={isActive("/profile") || isActive("/auth") ? "fill-white/20" : ""} />
        <span className="text-[11px] font-medium">Profile</span>
      </Link>

    </nav>
  );
}