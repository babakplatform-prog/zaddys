"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

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
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-white px-6 text-zaddys-red"
          initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
        >
          <div className="absolute left-0 top-0 h-2 w-full bg-zaddys-red" />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <div className="rounded-[2rem] border-2 border-zaddys-red bg-white p-5 shadow-[0_18px_50px_rgba(201,20,20,0.16)]">
              <Image src="/zaddys-logo.png" alt="Zaddy's Creamery and Grills" width={260} height={140} className="h-auto w-60 object-contain" priority />
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-7 text-center">
            <p className="text-sm font-black uppercase tracking-[0.28em]">Creamery &amp; Grills</p>
            <p className="mt-2 text-xs font-semibold tracking-[0.12em] text-zaddys-gray">Made for moments</p>
          </motion.div>
          <div className="absolute bottom-10 flex items-center gap-2" aria-hidden="true"><span className="h-2 w-2 rounded-full bg-zaddys-red" /><span className="h-2 w-2 rounded-full bg-zaddys-black" /><span className="h-2 w-2 rounded-full bg-zaddys-red" /></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}