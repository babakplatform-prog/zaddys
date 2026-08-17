"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

// THE FULL MOCK DATABASE (Matches Home Page IDs)
const mockDatabase: Record<string, any> = {
  "mini-cake": { name: "Mini Ice Cream Cake", basePrice: 4000, description: "Artisanal ice cream cake made for you.", image: "🍰", isCustomQuote: false, optionGroups: [] },
  "custom-cake": { name: "Custom Celebration Cake", basePrice: 0, description: "Perfect for celebrations. Available in different sizes and custom designs.", image: "🎂", isCustomQuote: true, optionGroups: [] },
  "suya-noodles": {
    name: "Spicy Suya Noodles", basePrice: 6500, description: "Signature noodles infused with rich peppersoup spices and tender suya beef.", image: "🥡", isCustomQuote: false,
    optionGroups: [
      { id: "noodle-type", name: "Noodle Type", isRequired: true, isMultiple: false, items: [{ id: "egg", name: "Egg Noodles", price: 0 }, { id: "classic", name: "Classic Noodles", price: 0 }] },
      { id: "addons", name: "Optional Add-ons", isRequired: false, isMultiple: true, items: [{ id: "beef", name: "Extra Beef", price: 1500 }, { id: "egg", name: "Soft-Boiled Egg", price: 800 }, { id: "pepper", name: "Extra Hot Pepper", price: 500 }] }
    ]
  },
  "beef-fries": {
    name: "Beef Loaded Fries", basePrice: 8000, description: "Crispy fries loaded with seasoned beef, melted cheese, and our signature sauce.", image: "🍟", isCustomQuote: false,
    optionGroups: [
      { id: "addons", name: "Optional Add-ons", isRequired: false, isMultiple: true, items: [{ id: "cheese", name: "Extra Cheese", price: 1000 }, { id: "sausage", name: "Sliced Sausage", price: 1200 }] }
    ]
  },
  "chicken-shrimp-fries": {
    name: "Chicken & Shrimp Fries", basePrice: 12000, description: "A premium mix of loaded fries, tender chicken chunks, and grilled shrimp.", image: "🍤", isCustomQuote: false,
    optionGroups: [
      { id: "addons", name: "Optional Add-ons", isRequired: false, isMultiple: true, items: [{ id: "cheese", name: "Extra Cheese", price: 1000 }, { id: "shrimp", name: "Extra Shrimp", price: 3000 }] }
    ]
  },
  "wings": {
    name: "Signature Chicken Wings", basePrice: 6000, description: "Crispy, juicy wings tossed in your favorite Zaddys sauce.", image: "🍗", isCustomQuote: false,
    optionGroups: [
      { id: "qty", name: "Portion Size", isRequired: true, isMultiple: false, items: [{ id: "6pc", name: "6 Pieces", price: 0 }, { id: "10pc", name: "10 Pieces", price: 3500 }, { id: "15pc", name: "15 Pieces", price: 7500 }] },
      { id: "sauce", name: "Choose Sauce", isRequired: true, isMultiple: false, items: [{ id: "bbq", name: "BBQ Sauce", price: 0 }, { id: "honey", name: "Honey Garlic", price: 0 }, { id: "chilli", name: "Sweet Chilli", price: 0 }] }
    ]
  },
  "beef-wrap": {
    name: "Signature Beef Wrap", basePrice: 3500, description: "Tender beef, fresh veggies, and our secret sauce wrapped in a warm tortilla.", image: "🌯", isCustomQuote: false,
    optionGroups: [
      { id: "addons", name: "Add-ons", isRequired: false, isMultiple: true, items: [{ id: "fries", name: "Add Fries inside", price: 1000 }, { id: "cheese", name: "Add Cheese", price: 800 }] }
    ]
  },
  "chicken-salad": {
    name: "Fresh Chicken Salad", basePrice: 3500, description: "Crisp greens topped with perfectly grilled chicken breast and signature dressing.", image: "🥗", isCustomQuote: false,
    optionGroups: [
      { id: "addons", name: "Optional Add-ons", isRequired: false, isMultiple: true, items: [{ id: "chicken", name: "Extra Chicken", price: 1500 }, { id: "cheese", name: "Cheese", price: 1000 }, { id: "egg", name: "Boiled Egg", price: 800 }] }
    ]
  },
  "croissant-butter": {
    name: "Butter Croissant", basePrice: 3000, description: "Flaky, buttery, and baked to perfection.", image: "🥐", isCustomQuote: false, optionGroups: []
  },
  "moment-box": {
    name: "The Moment Box", basePrice: 13750, description: "Build your own premium Moment Box. 4% discount applied.", image: "🍱", isCustomQuote: false,
    optionGroups: [
      { id: "main", name: "Step 1: Choose Main", isRequired: true, isMultiple: false, items: [{ id: "wrap", name: "Chicken Wrap", price: 0 }, { id: "wings", name: "6pc Wings", price: 0 }] },
      { id: "side", name: "Step 2: Choose Side", isRequired: true, isMultiple: false, items: [{ id: "fries", name: "Loaded Fries", price: 0 }, { id: "salad", name: "Side Salad", price: 0 }] }
    ]
  }
};

const fallbackProduct = { name: "Zaddys Special Item", basePrice: 5000, description: "A delicious treat from our menu.", image: "🍽️", isCustomQuote: false, optionGroups: [] };

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  
  const productId = typeof params?.id === 'string' ? params.id : "";
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});

  useEffect(() => {
    if (productId) setProduct(mockDatabase[productId] || fallbackProduct);
  }, [productId]);

  if (!product) return <div className="min-h-screen bg-zaddys-white flex items-center justify-center font-bold">Loading...</div>;

  const addonsTotal = Object.values(selectedOptions).reduce((sum, price) => sum + price, 0);
  const unitPrice = product.basePrice + addonsTotal;
  const finalPrice = unitPrice * quantity;

  const handleOptionToggle = (groupId: string, itemId: string, price: number, isMultiple: boolean) => {
    setSelectedOptions(prev => {
      const newState = { ...prev };
      const uniqueKey = `${groupId}-${itemId}`;

      if (!isMultiple) {
        Object.keys(newState).forEach(key => {
          if (key.startsWith(`${groupId}-`)) delete newState[key];
        });
        newState[uniqueKey] = price;
      } else {
        if (newState[uniqueKey] !== undefined) delete newState[uniqueKey];
        else newState[uniqueKey] = price;
      }
      return newState;
    });
  };

  const handleAddToCart = () => {
    const customizations = product.optionGroups.flatMap((group: any) => 
      group.items.filter((item: any) => selectedOptions[`${group.id}-${item.id}`] !== undefined).map((item: any) => item.name)
    ).join(", ");

    addToCart({
      id: `${productId}-${JSON.stringify(selectedOptions)}`,
      productId,
      name: product.name,
      price: unitPrice,
      qty: quantity,
      image: product.image,
      customization: customizations
    });

    router.push("/cart");
  };

  return (
    <main className="min-h-screen bg-zaddys-white text-zaddys-black font-sans pb-32 relative">
      <div className="relative w-full h-72 bg-zinc-100 flex items-center justify-center rounded-b-[2.5rem] shadow-sm overflow-hidden">
        <span className="text-9xl">{product.image}</span>
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10">
          <button onClick={() => router.back()} className="bg-white/80 backdrop-blur-md p-2 rounded-full text-black hover:bg-white transition shadow-sm">
            <ArrowLeft size={24} />
          </button>
        </div>
      </div>

      <div className="px-5 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-3xl font-black leading-tight max-w-[70%]">{product.name}</h1>
          {!product.isCustomQuote && <span className="text-2xl font-bold text-zaddys-red">₦{product.basePrice.toLocaleString()}</span>}
        </div>
        <p className="text-zinc-500 text-sm leading-relaxed mt-3">{product.description}</p>

        {product.optionGroups.map((group: any) => (
          <div key={group.id} className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{group.name}</h3>
              {group.isRequired && <span className="bg-zinc-200 text-zinc-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Required</span>}
            </div>
            
            <div className="space-y-3">
              {group.items.map((item: any) => {
                const isSelected = selectedOptions[`${group.id}-${item.id}`] !== undefined;
                return (
                  <label key={item.id} className={`flex items-center justify-between p-4 bg-zinc-50 border rounded-2xl cursor-pointer transition ${isSelected ? 'border-zaddys-red bg-red-50/30' : 'border-zinc-200 hover:border-zinc-300'}`}>
                    <div className="flex items-center space-x-3">
                      <input 
                        type={group.isMultiple ? "checkbox" : "radio"} 
                        checked={isSelected}
                        onChange={() => handleOptionToggle(group.id, item.id, item.price, group.isMultiple)}
                        className={`w-5 h-5 accent-zaddys-red ${group.isMultiple ? 'rounded' : 'rounded-full'}`} 
                      />
                      <span className="font-semibold text-sm">{item.name}</span>
                    </div>
                    {item.price > 0 && <span className="text-sm font-bold text-zinc-500">+ ₦{item.price.toLocaleString()}</span>}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-zinc-200 p-5 pb-safe z-50">
        <div className="max-w-md mx-auto flex items-center justify-between space-x-4">
          {product.isCustomQuote ? (
            <button className="w-full bg-[#25D366] text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-900/20 hover:bg-green-600 transition flex items-center justify-center space-x-2">
              <span>Request Quote on WhatsApp</span>
            </button>
          ) : (
            <>
              <div className="flex items-center space-x-4 bg-zinc-100 px-4 py-3.5 rounded-2xl border border-zinc-200">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-zinc-500 hover:text-black">
                  <Minus size={20} />
                </button>
                <span className="font-bold text-lg w-4 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="text-zaddys-red hover:text-red-700">
                  <Plus size={20} />
                </button>
              </div>

              <button onClick={handleAddToCart} className="flex-1 w-full bg-zaddys-red text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-900/20 hover:bg-red-700 transition flex items-center justify-center space-x-2">
                <span>Add to Cart</span>
                <span className="text-red-200 text-sm">•</span>
                <span>₦{finalPrice.toLocaleString()}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}