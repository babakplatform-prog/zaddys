"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Apple, ArrowRight, Globe2, KeyRound, Lock, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Login, Step 2: OTP
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-frame flex min-h-screen flex-col justify-center px-5 py-12 pb-36 font-sans">
      <div className="mb-8 text-center">
        <Image src="/zaddys-logo.PNG" alt="Zaddys" width={72} height={72} className="mx-auto mb-2 h-12 w-12 rounded-full object-cover" priority />
        <h1 className="text-[24px] font-bold tracking-[0.08em] text-zaddys-ink">ZADDYS</h1>
        <p className="mt-1 text-[13px] text-zaddys-gray">
          {step === 1 ? "Welcome back. Log in to continue." : "Enter the verification code sent to your email."}
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-[13px] text-red-700">
          {error}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="section-label mb-1 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-zinc-500" size={18} />
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="field pl-10"
              />
            </div>
          </div>
          <div>
            <label className="section-label mb-1 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-zinc-500" size={18} />
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="field pl-10"
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-zaddys-red py-3.5 font-semibold text-white transition hover:bg-red-700">
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
                className="field pl-10 text-center text-lg font-bold tracking-[1em]"
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-zaddys-black py-3.5 font-semibold text-white transition hover:bg-zinc-800">
            {loading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : <><span>Verify & Enter</span><ArrowRight size={18} /></>}
          </button>
          <button type="button" onClick={() => setStep(1)} className="mt-4 w-full text-[13px] text-zaddys-gray transition hover:text-zaddys-ink">
            Back to Login
          </button>
        </form>
      )}
      {step === 1 && (
        <>
          <div className="mt-7 border-t border-zaddys-border pt-5">
            <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-zaddys-gray">Or continue with</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                ["google", "Google", Globe2],
                ["apple", "Apple", Apple],
              ] as const).map(([provider, label, Icon]) => (
                <button key={provider} type="button" onClick={() => handleSocialAuth(provider)} className="flex items-center justify-center gap-2 rounded-xl border border-zaddys-border bg-zaddys-surface px-2 py-3 text-[12px] font-semibold text-zaddys-ink transition hover:border-zaddys-red"><Icon size={16} aria-hidden="true" /><span>{label}</span></button>
              ))}
            </div>
          </div>
          <p className="mt-6 text-center text-[13px] text-zaddys-gray">
            New to ZADDYS? <Link href="/signup" className="font-semibold text-zaddys-red hover:underline">Create an account</Link>
          </p>
        </>
      )}
    </div>
  );
}