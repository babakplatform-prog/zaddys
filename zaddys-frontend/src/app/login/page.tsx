"use client";
import React, { useState } from "react";
import { useRouter } from "navigation"; // or next/navigation
import { Mail, Lock, KeyRound, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Login, Step 2: OTP
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

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
      setError(err.message);
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
      
      // Success! Route to dashboard
      router.push("/profile");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center px-6 py-12 max-w-md mx-auto font-sans">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black tracking-tight text-white">ZADDYS</h1>
        <p className="text-zinc-400 text-sm mt-1">
          {step === 1 ? "Welcome back. Log in to continue." : "Enter the verification code sent to your email."}
        </p>
      </div>

      {error && (
        <div className="bg-red-950/80 border border-red-600 text-red-200 text-sm p-3 rounded-xl mb-6 text-center">
          {error}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-zinc-500" size={18} />
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 pl-10 text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 transition"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-zinc-500" size={18} />
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 pl-10 text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 transition"
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center space-x-2 mt-4">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <span>Login Securely</span>}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">6-Digit Code</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3.5 text-zinc-500" size={18} />
              <input
                type="text" maxLength={6} required value={otp} onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 pl-10 text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 transition text-center tracking-[1em] text-lg font-black"
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-white text-black hover:bg-zinc-200 font-black py-3.5 rounded-2xl flex items-center justify-center space-x-2 mt-4">
            {loading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <><span>Verify & Enter</span><ArrowRight size={18} /></>}
          </button>
          <button type="button" onClick={() => setStep(1)} className="w-full text-zinc-500 text-sm mt-4 hover:text-white transition">
            Back to Login
          </button>
        </form>
      )}
    </div>
  );
}