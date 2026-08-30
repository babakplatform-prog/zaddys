// src/app/signup/page.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Apple, Eye, EyeOff, X } from "lucide-react";
import Link from "next/link";
import { registerUser } from "@/services/authService";
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

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSocialAuth = (provider: "google" | "apple") => {
    signIn(provider, { callbackUrl: sessionStorage.getItem("zaddys_auth_return") || "/" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const data = await registerUser({
        username: formData.username || formData.fullName, // Fallback mapped to your backend
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        referralCode: formData.referralCode,
      });
      sessionStorage.setItem("zaddys_pending_email", data.email || formData.email);
      window.location.assign("/auth/verify");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = "w-full bg-transparent border border-zinc-600 rounded-[0.65rem] px-3 py-2.5 text-white placeholder-zinc-500 focus:border-white focus:outline-none transition text-[11px]";
  const labelStyles = "text-[10px] text-zinc-300 font-medium";
  const asterisk = <span className="text-yellow-500 ml-1">*</span>;

  return (
    <main className="min-h-[100dvh] bg-[#111111] px-2 py-5 font-sans flex flex-col mx-auto max-w-md w-full relative overflow-y-auto pb-safe">
      
      {/* Top Header & Close Button */}
      <div className="relative flex items-center justify-center mb-5 pt-1 min-h-10">
        <button 
          onClick={() => router.back()} 
          className="absolute right-0 flex items-center justify-center w-7 h-7 rounded-full bg-[#263138] text-zinc-300 hover:text-white transition"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mb-5">
        <h1 className="text-[17px] font-bold text-white mb-1 tracking-tight">Sign up with your email</h1>
        <p className="text-zinc-400 text-[11px]">Enter your details to join Zaddys</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-900 bg-red-950/50 p-3 text-center text-[11px] text-red-200">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
        
        {/* Row 1: Full name & Username Split */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className={labelStyles}>Full name {asterisk}</label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter full name"
              className={inputStyles}
            />
          </div>
          <div className="flex flex-col gap-1.5">
             <label className={labelStyles}>Username {asterisk}</label>
             <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              className={inputStyles}
            />
          </div>
        </div>

        {/* Row 2: Email */}
        <div className="flex flex-col gap-1.5">
          <label className={labelStyles}>Email {asterisk}</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address"
            className={inputStyles}
          />
        </div>

        {/* Row 3: Compound Phone Input */}
        <div className="flex flex-col gap-1.5">
          <label className={labelStyles}>Phone number {asterisk}</label>
          <div className="flex border border-zinc-700 rounded-[1rem] overflow-hidden focus-within:border-white transition">
            <div className="flex items-center gap-2 px-3 py-3.5 border-r border-zinc-700 bg-[#141414]">
              <span className="text-base leading-none">🇳🇬</span>
              <span className="text-white text-[15px] font-medium">+234</span>
            </div>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="801 234 5678"
              className="flex-1 bg-transparent px-4 py-3.5 text-white placeholder-zinc-500 focus:outline-none text-[15px]"
            />
          </div>
        </div>

        {/* Row 4: Password */}
        <div className="flex flex-col gap-1.5">
          <label className={labelStyles}>Password {asterisk}</label>
          <div className="relative flex items-center">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
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

        {/* Row 5: Confirm Password & Referral Split (Maintains visual density) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className={labelStyles}>Confirm {asterisk}</label>
            <div className="relative flex items-center">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm"
                className={inputStyles}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
             <label className={labelStyles}>Referral Code</label>
             <input
              type="text"
              name="referralCode"
              value={formData.referralCode}
              onChange={handleChange}
              placeholder="Optional"
              className={`${inputStyles} uppercase`}
            />
          </div>
        </div>

        {/* Bottom CTAs */}
        <div className="mt-auto pt-5 flex flex-col gap-2">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#ff3b12] text-white font-semibold py-3 rounded-[0.65rem] hover:bg-red-700 transition flex justify-center items-center text-[12px]"
          >
            {loading ? "Creating account..." : (
              "Sign up with email"
            )}
          </button>

          <div className="grid grid-cols-2 gap-2">
             <button 
               type="button" 
               onClick={() => handleSocialAuth('google')} 
               className="flex items-center justify-center gap-2 py-2.5 rounded-[0.65rem] border border-zinc-600 bg-transparent hover:bg-zinc-800 transition"
             >
                <GoogleIcon />
                <span className="font-semibold text-white text-[11px]">Google</span>
             </button>
             <button 
               type="button" 
               onClick={() => handleSocialAuth('apple')} 
               className="flex items-center justify-center gap-2 py-2.5 rounded-[0.65rem] border border-zinc-600 bg-transparent hover:bg-zinc-800 transition"
             >
                <Apple size={20} className="fill-white text-white" />
                <span className="font-semibold text-white text-[11px]">Apple</span>
             </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 pb-4 text-center text-[10px] text-zinc-400">
          You already have an account?{" "}
          <Link href="/login" className="text-white font-bold hover:underline transition">
            sign in
          </Link>
        </div>
      </form>
    </main>
  );
}
