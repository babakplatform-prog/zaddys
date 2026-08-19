"use client";
import React, { useState, useEffect } from "react";
import { ArrowLeft, Minus, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the specific single product from your live Django API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
    fetch(`${apiUrl}/products/${id}/`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch product:", err);
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      quantity: quantity,
      image: product.image,
      is_custom_quote: product.is_custom_quote,
    });
    alert(`Added ${quantity}x ${product.name} to cart!`);
    router.push("/cart"); // Redirects them to the checkout page!
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="w-8 h-8 border-4 border-zinc-800 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) return <div className="min-h-screen bg-black text-white p-6">Product not found.</div>;

  return (
    <main className="min-h-screen bg-zinc-50 pb-28 font-sans">
      {/* Header Image Section */}
      <div className="relative w-full h-80 bg-zinc-200">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400">No Image</div>
        )}
        
        {/* Back Button */}
        <Link href="/" className="absolute top-6 left-4 bg-white/80 backdrop-blur p-2 rounded-full shadow-md text-black">
          <ArrowLeft size={24} />
        </Link>
      </div>

      {/* Product Details Section */}
      <div className="bg-white rounded-t-3xl -mt-6 relative z-10 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-black text-black leading-tight">{product.name}</h1>
          <span className="text-xl font-bold text-red-600 ml-4">
            {product.is_custom_quote ? "Quote" : `₦${Number(product.price).toLocaleString()}`}
          </span>
        </div>
        
        <p className="text-sm text-zinc-500 font-semibold uppercase tracking-wider mb-4">{product.category}</p>
        
        <div className="mb-6">
          <h3 className="font-bold text-black mb-2 text-sm">Description</h3>
          <p className="text-zinc-600 text-sm leading-relaxed">
            {product.description || "A delicious signature meal made perfectly for your moments. Carefully prepared with premium ingredients."}
          </p>
        </div>

        {/* Quantity Selector */}
        {!product.is_custom_quote && (
          <div className="flex items-center justify-between bg-zinc-100 rounded-2xl p-2 w-32 mb-8">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 bg-white rounded-xl shadow-sm text-black"
            >
              <Minus size={16} />
            </button>
            <span className="font-bold text-black">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 bg-white rounded-xl shadow-sm text-black"
            >
              <Plus size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Button for Adding to Cart */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-white border-t border-zinc-100 z-50">
        {product.is_custom_quote ? (
          <button 
            className="w-full bg-black hover:bg-zinc-800 text-white font-bold py-4 rounded-2xl shadow-xl transition flex items-center justify-center space-x-2"
          >
            <span>Request Custom Quote</span>
          </button>
        ) : (
          <button 
            onClick={handleAddToCart}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-900/20 transition flex items-center justify-center space-x-2"
          >
            <ShoppingBag size={20} />
            <span>Add {quantity} to Cart - ₦{(product.price * quantity).toLocaleString()}</span>
          </button>
        )}
      </div>
    </main>
  );
}