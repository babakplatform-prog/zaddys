"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Apple, ArrowLeft, Globe2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

// High-resolution Zaddys meal images for the automated background crossfade
const CAROUSEL_IMAGES = [
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80",
  "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=1200&q=80",
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=80", 
];

export default function AuthPage() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 4500); // Cycles every 4.5 seconds
    return () => clearInterval(timer);
  }, []);

  const handleSocialAuth = (provider: "google" | "apple") => {
    signIn(provider, { callbackUrl: sessionStorage.getItem("zaddys_auth_return") || "/" });
  };

  return (
    <main className="relative flex min-h-[100dvh] w-full flex-col justify-end bg-[#0D0D0D] font-sans">
      
      {/* 1. Dynamic Background Carousel (z-0) */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#0D0D0D]">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentIndex}
            src={CAROUSEL_IMAGES[currentIndex]}
            alt="Zaddys Moments"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.5, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
        
        {/* 2. Heavy Bottom Gradient for Text Legibility (z-10) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/90 to-transparent" />
      </div>

      {/* 3. Top Layer Interface (z-20) */}
      <div className="relative z-20 mx-auto flex h-full w-full max-w-md flex-col justify-end px-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
        
        {/* Safe Area Back Button */}
        <div className="absolute left-6 top-12">
          <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20">
            <ArrowLeft size={20} />
          </Link>
        </div>

        {/* Typography & Copy */}
        <div className="mb-8 mt-auto">
          <h1 className="mb-3 text-[42px] font-black leading-[1.05] tracking-tight text-white">
            Welcome to<br />Zaddys.
          </h1>
          <p className="text-[15px] leading-relaxed text-zinc-300">
            Explore gourmet flavors, order meals in seconds, and create your moments.
          </p>
        </div>

        {/* Vertical CTA Stack */}
        <div className="flex flex-col gap-3">
          <Link 
            href="/login" 
            className="flex w-full items-center justify-center rounded-[1rem] bg-[#D90429] py-4 text-[15px] font-bold text-white shadow-lg shadow-red-900/20 transition hover:bg-red-700"
          >
            Continue with email
          </Link>
          
          <button 
            onClick={() => handleSocialAuth('google')} 
            className="flex w-full items-center justify-center gap-2 rounded-[1rem] bg-white py-4 text-[15px] font-bold text-black transition hover:bg-zinc-100"
          >
            <Globe2 size={18} className="text-black" /> 
            Continue with Google
          </button>
          
          <button 
            onClick={() => handleSocialAuth('apple')} 
            className="flex w-full items-center justify-center gap-2 rounded-[1rem] bg-white py-4 text-[15px] font-bold text-black transition hover:bg-zinc-100"
          >
            <Apple size={18} className="fill-current text-black" /> 
            Continue with Apple
          </button>
        </div>

        {/* Navigation Footer */}
        <div className="mt-8 text-center text-sm text-zinc-400">
          Don't have an account yet?{" "}
          <Link href="/signup" className="font-bold text-white transition hover:text-[#D90429]">
            sign up
          </Link>
        </div>
      </div>
    </main>
  );
}
