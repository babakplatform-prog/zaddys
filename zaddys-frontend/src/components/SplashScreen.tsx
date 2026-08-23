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
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white text-zaddys-red"
          initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, duration: 1 }}
            className="mb-4 flex h-24 w-24 items-center justify-center rounded-full border-4 border-zaddys-red bg-white shadow-2xl shadow-red-900/10"
          >
            <span className="text-lg font-black tracking-[0.08em] text-zaddys-red">ZADDYS</span>
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-3xl font-black tracking-tighter text-zaddys-red" style={{ fontFamily: 'serif' }}>
            ZADDYS
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-4 font-sans text-xs font-bold uppercase tracking-[0.3em] text-zaddys-red">
            Made for moments.
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}