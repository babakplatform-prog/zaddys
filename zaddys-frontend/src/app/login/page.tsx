// src/app/login/page.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Apple, Eye, EyeOff, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";

// Custom Google SVG to perfectly match the requested design
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Login, Step 2: OTP
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
  
  const handleSocialAuth = (provider: "google" | "apple") => {
    signIn(provider, { callbackUrl: sessionStorage.getItem("zaddys_auth_return") || "/" });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Login failed");
      
      // Success! Move to OTP step
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${apiUrl}/auth/verify-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Invalid Code");

      localStorage.setItem("zaddys_access_token", data.access);
      localStorage.setItem("zaddys_refresh_token", data.refresh);
      const returnPath = sessionStorage.getItem("zaddys_auth_return") || "/profile";
      sessionStorage.removeItem("zaddys_auth_return");
      router.push(returnPath);
    } catch (err: any) {
      setError(err.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = "w-full bg-transparent border border-zinc-700 rounded-[1rem] px-4 py-3.5 text-white placeholder-zinc-500 focus:border-white focus:outline-none transition text-[15px]";
  const labelStyles = "text-[13px] text-zinc-300 font-medium block mb-1.5";

  return (
    <main className="min-h-[100dvh] bg-[#0D0D0D] px-5 py-6 font-sans flex flex-col mx-auto max-w-md w-full relative overflow-y-auto pb-safe">
      
      {/* Top Header & Close Button */}
      <div className="flex justify-end mb-4 pt-2">
        <button 
          onClick={() => router.back()} 
          className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1A1A1A] text-zinc-400 hover:text-white transition"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-[26px] font-bold text-white mb-1.5 tracking-tight">
          {step === 1 ? "Log in with your email" : "Verify your account"}
        </h1>
        <p className="text-zinc-400 text-[15px]">
          {step === 1 
            ? "Enter your email and password to log in to Zaddys" 
            : "Enter the verification code sent to your email"}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-900 bg-red-950/50 p-3 text-center text-[13px] text-red-200">
          {error}
        </div>
      )}

      {/* Forms */}
      <div className="flex-1 flex flex-col">
        {step === 1 ? (
          <form onSubmit={handleLogin} className="flex-1 flex flex-col space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className={labelStyles}>Email Address</label>
              <input
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className={inputStyles}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelStyles}>Password</label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className={inputStyles}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-zinc-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="mt-auto pt-6 flex flex-col gap-4">
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-[#D90429] text-white font-semibold py-4 rounded-[1rem] hover:bg-red-700 transition flex justify-center items-center text-[15px]"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "Log in securely"}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button" 
                  onClick={() => handleSocialAuth('google')} 
                  className="flex items-center justify-center gap-2 py-3.5 rounded-[1rem] border border-zinc-700 bg-transparent hover:bg-zinc-800 transition"
                >
                  <GoogleIcon />
                  <span className="font-semibold text-white text-[14px]">Google</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => handleSocialAuth('apple')} 
                  className="flex items-center justify-center gap-2 py-3.5 rounded-[1rem] border border-zinc-700 bg-transparent hover:bg-zinc-800 transition"
                >
                  <Apple size={20} className="fill-white text-white" />
                  <span className="font-semibold text-white text-[14px]">Apple</span>
                </button>
              </div>
            </div>
            
            <div className="mt-4 pb-4 text-center text-[13px] text-zinc-400">
              Don't have an account yet?{" "}
              <Link href="/signup" className="text-white font-bold hover:underline transition">
                sign up
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="flex-1 flex flex-col space-y-4">
            <div className="flex flex-col gap-1.5 mt-2">
              <label className={labelStyles}>6-Digit Code</label>
              <input
                type="text" 
                maxLength={6} 
                required 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                className="w-full bg-transparent border border-zinc-700 rounded-[1rem] px-4 py-4 text-white placeholder-zinc-700 focus:border-white focus:outline-none transition text-center text-2xl font-bold tracking-[0.5em]"
              />
            </div>

            <div className="mt-auto pt-6 flex flex-col gap-4 pb-4">
              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-[#D90429] text-white font-semibold py-4 rounded-[1rem] hover:bg-red-700 transition flex justify-center items-center gap-2 text-[15px]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Verify & Enter</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
              
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="w-full py-4 rounded-[1rem] border border-zinc-700 bg-transparent hover:bg-zinc-800 text-white font-semibold transition text-[15px]"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
