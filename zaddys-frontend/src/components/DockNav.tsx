"use client";
import React from "react";
import { Home, Search, ShoppingBag, User } from "lucide-react";

export default function DockNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0D0D0D] border-t border-zinc-800 pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        <button className="flex flex-col items-center justify-center text-zaddys-red w-16">
          <Home size={22} />
          <span className="text-[10px] mt-1 font-semibold">Home</span>
        </button>
        <button className="flex flex-col items-center justify-center text-zinc-500 hover:text-zaddys-white w-16 transition-colors">
          <Search size={22} />
          <span className="text-[10px] mt-1 font-medium">Search</span>
        </button>
        <button className="flex flex-col items-center justify-center text-zinc-500 hover:text-zaddys-white w-16 transition-colors relative">
          <ShoppingBag size={22} />
          <span className="text-[10px] mt-1 font-medium">Cart</span>
          {/* Notification Dot */}
          <span className="absolute top-0 right-3 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-zaddys-red text-[8px] font-bold text-white border border-[#0D0D0D]">
            2
          </span>
        </button>
        <button className="flex flex-col items-center justify-center text-zinc-500 hover:text-zaddys-white w-16 transition-colors">
          <User size={22} />
          <span className="text-[10px] mt-1 font-medium">Profile</span>
        </button>
      </div>
    </nav>
  );
}
