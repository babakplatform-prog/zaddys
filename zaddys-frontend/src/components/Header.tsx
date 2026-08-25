import React from "react";
import { ShoppingCart, Menu } from "lucide-react";
import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full bg-zaddys-black/80 backdrop-blur-md border-b border-zinc-800">
      <div className="flex items-center justify-between px-4 h-16 max-w-md mx-auto">
        
        {/* Hamburger Menu */}
        <button className="p-2 text-zaddys-white hover:text-zaddys-red transition-colors">
          <Menu size={24} />
        </button>

        {/* Center Brand */}
        <Image src="/zaddys-logo.PNG" alt="Zaddy's Creamy and Grills" width={130} height={60} className="h-11 w-auto object-contain" />

        {/* Cart Icon with Notification Dot */}
        <button className="p-2 relative text-zaddys-white hover:text-zaddys-red transition-colors">
          <ShoppingCart size={24} />
          {/* Red Notification Dot (Hardcoded to 2 for testing) */}
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-zaddys-red text-[10px] font-bold text-white">
            2
          </span>
        </button>
        
      </div>
    </header>
  );
}
