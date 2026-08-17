"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
// Make sure you have your existing components imported correctly:
// import SplashScreen from "@/components/SplashScreen";
// import Header from "@/components/Header";
// import DockNav from "@/components/DockNav";

// Helper Interface for TypeScript
interface Product {
  id: number;
  category: string;
  name: string;
  price: string;
  image: string;
  is_custom_quote: boolean;
}

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  
  // State for live Django data
  const [menuData, setMenuData] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [isLoading, setIsLoading] = useState(true);

  // FETCH LIVE DATA FROM DJANGO
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/products/")
      .then((res) => res.json())
      .then((data) => {
        setMenuData(data);
        
        // Dynamically extract unique categories from the live products
        const uniqueCategories = Array.from(new Set(data.map((item: Product) => item.category)));
        setCategories(["All", ...uniqueCategories as string[]]);
        
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch from Django:", error);
        setIsLoading(false);
      });
  }, []);

  const filteredMenu = activeCategory === "All" 
    ? menuData 
    : menuData.filter(item => item.category === activeCategory);

  return (
    <main className="min-h-screen bg-zaddys-white text-zaddys-black font-sans overflow-x-hidden">
      {/* If you have the SplashScreen component, uncomment it */}
      {/* {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />} */}

      {!showSplash && (
        <div className="pb-28 animate-in fade-in duration-700">
          {/* <Header /> */}

          <div className="max-w-md mx-auto px-4 mt-6">
              <h2 className="text-3xl font-black mb-1 tracking-tight">Experience <br/><span className="text-zaddys-red">Gourmet Flavors</span></h2>

              {/* Dynamic Category Scroller */}
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

              {/* Live Loading State vs Data */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                  <div className="w-8 h-8 border-4 border-zinc-200 border-t-zaddys-red rounded-full animate-spin mb-4"></div>
                  <p className="font-semibold text-sm">Warming up the ovens...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 mt-2">
                   {filteredMenu.map((product) => (
                     <Link key={product.id} href={`/product/${product.id}`}>
                       <div className="bg-white rounded-3xl p-3 flex flex-col group cursor-pointer border border-zinc-100 shadow-sm hover:shadow-md transition h-full relative">
                         <div className="w-full h-36 bg-zinc-100 rounded-2xl mb-3 overflow-hidden relative">
                           {/* Load image from Django directly */}
                           {product.image ? (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                           ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-300">No Image</div>
                           )}
                         </div>
                         <h3 className="font-bold text-sm leading-tight mb-2 pr-6 text-black">{product.name}</h3>
                         <div className="mt-auto">
                             <span className="font-black text-sm text-zaddys-red">
                               {product.is_custom_quote ? "Quote" : `₦${Number(product.price).toLocaleString()}`}
                             </span>
                         </div>
                         <button className="absolute bottom-3 right-3 bg-zaddys-red text-white p-1.5 rounded-full shadow-md hover:bg-red-700">
                           <Plus size={16} strokeWidth={3} />
                         </button>
                       </div>
                     </Link>
                   ))}
                </div>
              )}
          </div>
          {/* <DockNav /> */}
        </div>
      )}
    </main>
  );
}