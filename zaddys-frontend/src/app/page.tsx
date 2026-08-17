"use client";
import React, { useState } from "react";
import SplashScreen from "@/components/SplashScreen";
import Header from "@/components/Header";
import DockNav from "@/components/DockNav";
import { motion } from "framer-motion";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const categories = ["All", "Burgers", "Creamery", "Noodles", "Wraps"];

  return (
    <main className="min-h-screen bg-zaddys-black text-zaddys-white font-sans overflow-x-hidden">
      
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      {!showSplash && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.5 }}
          className="pb-28" 
        >
          <Header />
          
          <div className="max-w-md mx-auto px-4 mt-6">
             <h2 className="text-3xl font-black mb-1 tracking-tight">Experience <br/><span className="text-zaddys-red">Gourmet Flavors</span></h2>
             
             {/* Scrollable Category Pills */}
             <div className="flex space-x-3 overflow-x-auto py-5 scrollbar-hide">
               {categories.map((cat, idx) => (
                 <button 
                   key={idx} 
                   className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                     idx === 0 ? "bg-zaddys-red text-white" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
                   }`}
                 >
                   {cat}
                 </button>
               ))}
             </div>

             {/* Product Grid - Fixed Layout */}
             <div className="grid grid-cols-2 gap-4 mt-2">
                
                {/* Product Card 1 */}
                <div className="bg-[#1A1A1A] rounded-2xl p-3 flex flex-col group cursor-pointer border border-zinc-800/80">
                   <div className="w-full h-36 bg-zinc-800 rounded-xl mb-3 overflow-hidden relative flex items-center justify-center text-zinc-600 text-xs">
                      Burger Image
                   </div>
                   <h3 className="font-bold text-sm leading-tight mb-2">Signature Burger</h3>
                   <div className="mt-auto flex items-center justify-between">
                      <span className="font-bold text-sm">₦6,500</span>
                      <button className="bg-zaddys-red text-white text-xs font-bold px-4 py-2 rounded-full">Add</button>
                   </div>
                </div>

                {/* Product Card 2 */}
                <div className="bg-[#1A1A1A] rounded-2xl p-3 flex flex-col group cursor-pointer border border-zinc-800/80">
                   <div className="w-full h-36 bg-zinc-800 rounded-xl mb-3 overflow-hidden relative flex items-center justify-center text-zinc-600 text-xs">
                      Ice Cream Image
                   </div>
                   <h3 className="font-bold text-sm leading-tight mb-2">Mini Ice Cream Cake</h3>
                   <div className="mt-auto flex items-center justify-between">
                      <span className="font-bold text-sm">₦4,000</span>
                      <button className="bg-zaddys-red text-white text-xs font-bold px-4 py-2 rounded-full">Add</button>
                   </div>
                </div>

             </div>
          </div>

          <DockNav />
        </motion.div>
      )}
    </main>
  );
}
