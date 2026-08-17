"use client";
import React, { useState } from "react";
import Link from "next/link";
import SplashScreen from "@/components/SplashScreen";
import Header from "@/components/Header";
import DockNav from "@/components/DockNav";
import { Plus } from "lucide-react";

// Cleaned, De-duplicated Menu Data
const menuData = [
  { id: "mini-cake", name: "Mini Ice Cream Cake", price: 4000, category: "Creamery", emoji: "🍰" },
  { id: "custom-cake", name: "Custom Celebration Cake", price: 0, category: "Creamery", emoji: "🎂", isQuote: true },
  { id: "suya-noodles", name: "Spicy Suya Noodles", price: 6500, category: "Noodles", emoji: "🥡" },
  { id: "beef-fries", name: "Beef Loaded Fries", price: 8000, category: "Loaded Fries", emoji: "🍟" },
  { id: "chicken-shrimp-fries", name: "Chicken & Shrimp Fries", price: 12000, category: "Loaded Fries", emoji: "🍤" },
  { id: "wings", name: "Signature Chicken Wings", price: 6000, category: "Wings", emoji: "🍗" },
  { id: "beef-wrap", name: "Signature Beef Wrap", price: 3500, category: "Wraps", emoji: "🌯" },
  { id: "chicken-salad", name: "Fresh Chicken Salad", price: 3500, category: "Salads", emoji: "🥗" },
  { id: "croissant-butter", name: "Butter Croissant", price: 3000, category: "Pastries", emoji: "🥐" },
  { id: "moment-box", name: "The Moment Box", price: 13750, category: "Moment Box", emoji: "🍱" },
];

const categories = ["All", "Creamery", "Noodles", "Loaded Fries", "Wings", "Wraps", "Salads", "Pastries", "Moment Box"];

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredMenu = activeCategory === "All" 
    ? menuData 
    : menuData.filter(item => item.category === activeCategory);

  return (
    <main className="min-h-screen bg-zaddys-white text-zaddys-black font-sans overflow-x-hidden">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {!showSplash && (
        <div className="pb-28 animate-in fade-in duration-700">
          <Header />
          
          <div className="max-w-md mx-auto px-4 mt-6">
             <h2 className="text-3xl font-black mb-1 tracking-tight">Experience <br/><span className="text-zaddys-red">Gourmet Flavors</span></h2>
             
             <div className="flex space-x-3 overflow-x-auto py-5 scrollbar-hide">
               {categories.map((cat, idx) => (
                 <button 
                   key={idx} 
                   onClick={() => setActiveCategory(cat)}
                   className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                     activeCategory === cat ? "bg-zaddys-red text-white shadow-md shadow-red-900/20" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                   }`}
                 >
                   {cat}
                 </button>
               ))}
             </div>

             <div className="grid grid-cols-2 gap-4 mt-2">
                {filteredMenu.map((product) => (
                  <Link key={product.id} href={`/product/${product.id}`}>
                    <div className="bg-white rounded-3xl p-3 flex flex-col group cursor-pointer border border-zinc-100 shadow-sm hover:shadow-md transition h-full relative">
                      <div className="w-full h-36 bg-zinc-100 rounded-2xl mb-3 overflow-hidden flex items-center justify-center text-4xl">
                        {product.emoji}
                      </div>
                      <h3 className="font-bold text-sm leading-tight mb-2 pr-6 text-black">{product.name}</h3>
                      <div className="mt-auto">
                          <span className="font-black text-sm text-zaddys-red">
                            {product.isQuote ? "Quote" : `₦${product.price.toLocaleString()}`}
                          </span>
                      </div>
                      <button className="absolute bottom-3 right-3 bg-zaddys-red text-white p-1.5 rounded-full shadow-md hover:bg-red-700">
                        <Plus size={16} strokeWidth={3} />
                      </button>
                    </div>
                  </Link>
                ))}
             </div>
          </div>
          <DockNav />
        </div>
      )}
    </main>
  );
}