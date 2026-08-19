"use client";
import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { ArrowLeft, Trash2, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePaystackPayment } from "react-paystack";

export default function CartPage() {
  const { cart, removeFromCart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(""); // Needed for Paystack receipt
  const [isProcessing, setIsProcessing] = useState(false);

  // Paystack Configuration
  const paystackConfig = {
    reference: new Date().getTime().toString(),
    email: email || "customer@zaddys.ng",
    amount: cartTotal * 100, // Paystack calculates in kobo (multiply by 100)
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_your_key_here",
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const onSuccess = async (reference: any) => {
    setIsProcessing(true);
    // Payment Successful! Send order to Django Backend
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
      const res = await fetch(`${apiUrl}/orders/create/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: cart,
          cartTotal: cartTotal,
          delivery_address: deliveryAddress,
          phone: phone,
          transaction_ref: reference.reference
        }),
      });

      if (!res.ok) throw new Error("Failed to save order in database");
      
      clearCart();
      alert("Payment Successful! Your Zaddys order is being prepared.");
      router.push("/"); // Or push to a success/dashboard page
    } catch (error) {
      console.error("Order Save Error:", error);
      alert("Payment was successful, but we had a hiccup saving your order. Please contact support.");
    } finally {
      setIsProcessing(false);
    }
  };

  const onClose = () => {
    alert("Payment cancelled. You can complete your order anytime.");
    setIsProcessing(false);
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Your cart is empty!");
    if (!email || !phone || !deliveryAddress) return alert("Please fill all details.");
    
    setIsProcessing(true);
    // Fire Paystack Popup
    initializePayment({ onSuccess, onClose });
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-black text-black mb-2">Your Cart is Empty</h2>
        <p className="text-zinc-500 mb-6">Looks like you haven't added any moments yet.</p>
        <Link href="/" className="bg-red-600 text-white font-bold py-3 px-8 rounded-full shadow-lg">
          Explore Menu
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 pb-32 font-sans">
      <div className="bg-white p-4 shadow-sm flex items-center space-x-4 sticky top-0 z-50">
        <button onClick={() => router.back()} className="p-2 bg-zinc-100 rounded-full text-black">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-black text-black tracking-tight">Checkout</h1>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <h2 className="font-bold text-black mb-3 text-sm uppercase tracking-wider">Order Summary</h2>
        <div className="bg-white rounded-3xl p-4 shadow-sm mb-6 space-y-4 border border-zinc-100">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-16 h-16 bg-zinc-100 rounded-xl overflow-hidden flex-shrink-0">
                  {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-black">{item.name}</h3>
                  <p className="text-xs text-zinc-500 font-medium">Qty: {item.quantity}</p>
                  <p className="text-sm font-black text-red-600">₦{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
              <button onClick={() => removeFromCart(item.id)} className="p-2 text-zinc-400 hover:text-red-600 transition">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <h2 className="font-bold text-black mb-3 text-sm uppercase tracking-wider">Delivery Info</h2>
        <form id="checkout-form" onSubmit={handleCheckout} className="space-y-3 mb-6">
          <input 
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address (for receipt)" 
            className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3 text-black placeholder-zinc-400 focus:outline-none focus:border-red-600 shadow-sm"
          />
          <input 
            type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number" 
            className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3 text-black placeholder-zinc-400 focus:outline-none focus:border-red-600 shadow-sm"
          />
          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 text-zinc-400" size={18} />
            <input 
              type="text" required value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Full Delivery Address" 
              className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3 pl-10 text-black placeholder-zinc-400 focus:outline-none focus:border-red-600 shadow-sm"
            />
          </div>
        </form>

        <div className="bg-black text-white rounded-3xl p-5 shadow-lg mb-4">
          <div className="flex justify-between items-center mb-2 text-sm text-zinc-400">
            <span>Subtotal</span><span>₦{cartTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-black">
            <span>Total</span><span className="text-red-500">₦{cartTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full p-4 bg-white/90 backdrop-blur border-t border-zinc-100 z-50">
        <button 
          form="checkout-form" type="submit" disabled={isProcessing}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl shadow-lg transition flex items-center justify-center uppercase tracking-wide text-sm"
        >
          {isProcessing ? "Processing..." : `Pay ₦${cartTotal.toLocaleString()}`}
        </button>
      </div>
    </main>
  );
}