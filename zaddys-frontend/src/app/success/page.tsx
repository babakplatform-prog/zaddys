"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronRight, Clock } from "lucide-react";

export default function OrderSuccess() {
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => {
    // Generate a random mock order number for the client demo
    setOrderNumber(`ZD-${Math.floor(10000 + Math.random() * 90000)}`);
  }, []);

  return (
    <main className="min-h-screen bg-zaddys-white text-zaddys-black font-sans flex flex-col justify-center items-center px-4 relative">
      
      {/* Success Animation Area */}
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-900/10 animate-in zoom-in duration-500">
        <CheckCircle2 size={48} className="text-green-600" />
      </div>

      <h1 className="text-3xl font-black mb-2 text-center tracking-tight">Order Confirmed!</h1>
      <p className="text-zinc-500 text-center text-sm max-w-[80%] mb-8">
        Your order <span className="font-bold text-black">#{orderNumber}</span> has been received and is currently being prepared by our kitchen.
      </p>

      {/* Estimated Time Card */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 w-full max-w-sm flex items-center space-x-4 mb-8">
        <div className="w-12 h-12 bg-zinc-200 rounded-full flex items-center justify-center text-zinc-500">
          <Clock size={24} />
        </div>
        <div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Estimated Delivery</p>
          <p className="text-lg font-black text-black">35 - 45 Mins</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-sm space-y-3">
        <Link href="/profile">
          <button className="w-full bg-zaddys-black text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 hover:bg-zinc-800 transition">
            <span>Track Order Status</span>
            <ChevronRight size={18} />
          </button>
        </Link>
        <Link href="/">
          <button className="w-full bg-zinc-100 text-black font-bold py-4 rounded-xl hover:bg-zinc-200 transition">
            Back to Menu
          </button>
        </Link>
      </div>

    </main>
  );
}