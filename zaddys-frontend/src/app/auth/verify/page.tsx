"use client";
import React, { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function VerifyOTP() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <main className="min-h-screen bg-zaddys-black text-zaddys-white font-sans px-4 py-6 flex flex-col relative">
      <Link href="/auth" className="absolute top-6 left-4 text-zinc-400 hover:text-white transition">
        <ArrowLeft size={24} />
      </Link>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full mt-10 text-center">
        <h1 className="text-3xl font-black mb-2 tracking-tight">Verify Account</h1>
        <p className="text-zinc-400 text-sm mb-8 px-4">
          We've sent a 6-digit code to your email. Enter it below to verify your account.
        </p>

        <div className="flex justify-center space-x-2 mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="number"
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 bg-[#1A1A1A] border border-zinc-800 rounded-xl text-center text-xl font-bold text-white focus:outline-none focus:border-zaddys-red transition text-center no-spinners"
              maxLength={1}
            />
          ))}
        </div>

        <button className="w-full bg-zaddys-red text-white font-bold rounded-xl py-3.5 hover:bg-red-700 transition">
          Verify & Continue
        </button>

        <div className="mt-8 text-sm text-zinc-400">
          Didn't receive the code? <span className="text-zaddys-red font-bold cursor-pointer">Resend (00:59)</span>
        </div>
      </div>
    </main>
  );
}