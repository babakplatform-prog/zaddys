"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 500); 
    }, 3500);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-zaddys-white"
          initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
        >
          {/* Animated Red Circle */}
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, duration: 1 }}
            className="w-24 h-24 bg-zaddys-red rounded-full flex items-center justify-center shadow-2xl shadow-red-900/30 mb-4"
          >
            <span className="text-5xl font-black text-white" style={{ fontFamily: 'serif' }}>Z</span>
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-3xl font-black text-zaddys-black tracking-tighter" style={{ fontFamily: 'serif' }}>
            Zaddys
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-4 text-xs font-bold tracking-[0.3em] text-zinc-500 uppercase font-sans">
            Made for moments.
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}