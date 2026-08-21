"use client";
import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronRight, Clock } from "lucide-react";

export default function OrderSuccess() {
  const [orderNumber] = useState(() => {
    if (typeof window === "undefined") return "Unavailable";
    return new URLSearchParams(window.location.search).get("order") || "Unavailable";
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zaddys-black px-4 py-10 text-zaddys-ink">
      
      {/* Success Animation Area */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 shadow-xl shadow-green-900/10">
        <CheckCircle2 size={48} className="text-green-600" />
      </div>

      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
      <h1 className="mb-2 text-center text-[20px] font-semibold tracking-tight">Order Confirmed!</h1>
      <p className="mb-8 max-w-[80%] text-center text-[13px] text-zaddys-gray">
        Your order <span className="font-bold text-black">#{orderNumber}</span> has been received and is currently being prepared by our kitchen.
      </p>

      {/* Estimated Time Card */}
      <div className="mb-8 flex w-full items-center gap-4 rounded-xl border border-zaddys-border bg-zaddys-surface p-4">
        <div className="w-12 h-12 bg-zinc-200 rounded-full flex items-center justify-center text-zinc-500">
          <Clock size={24} />
        </div>
        <div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Estimated Delivery</p>
          <p className="text-lg font-black text-black">35 - 45 Mins</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Link href="/profile">
          <span className="flex w-full items-center justify-center gap-2 rounded-xl bg-zaddys-black py-4 font-semibold text-white transition hover:bg-zinc-800"><span>Track Order Status</span><ChevronRight size={18} /></span>
        </Link>
        <Link href="/">
          <span className="block w-full rounded-xl bg-zinc-100 py-4 text-center font-semibold text-black transition hover:bg-zinc-200">Back to Menu</span>
        </Link>
      </div>
      </div>

    </main>
  );
}