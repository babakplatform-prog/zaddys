"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Apple, ArrowRight, Eye, EyeOff, Gift, Globe2, Lock, Mail, Phone, User } from "lucide-react";
import { registerUser } from "@/services/authService";
import Image from "next/image";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
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
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        referralCode: formData.referralCode,
      });
      sessionStorage.setItem("zaddys_pending_email", data.email || formData.email);
      router.push("/auth/verify");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-frame flex min-h-screen flex-col justify-center px-5 py-10 pb-40">
      <div className="mb-8 text-center">
        <Image src="/zaddys-logo.jpg" alt="Zaddys" width={72} height={72} className="mx-auto mb-2 h-12 w-12 rounded-full object-cover" priority />
        <h1 className="text-[24px] font-bold tracking-[0.08em] text-zaddys-ink">ZADDYS</h1>
        <p className="mt-1 text-[13px] text-zaddys-gray">Made for moments. Join the club.</p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-[13px] text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-3.5 text-zinc-500" size={18} />
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className="field pl-10"
            />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-zinc-500" size={18} />
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              className="field pl-10"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-3.5 text-zinc-500" size={18} />
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="08012345678"
              className="field pl-10"
            />
          </div>
        </div>

        {/* Password Field with Eye Toggle */}
        <div>
          <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-zinc-500" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="field pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-zinc-400 hover:text-zaddys-ink"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm Password Field with Eye Toggle */}
        <div>
          <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-zinc-500" size={18} />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="field pl-10 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3.5 text-zinc-400 hover:text-zaddys-ink"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Referral Code (Optional) */}
        <div>
          <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Referral Code (Optional)</label>
          <div className="relative">
            <Gift className="absolute left-3 top-3.5 text-zinc-500" size={18} />
            <input
              type="text"
              name="referralCode"
              value={formData.referralCode}
              onChange={handleChange}
              placeholder="Got a code from a friend?"
              className="field pl-10 uppercase"
            />
          </div>
        </div>

        {/* Submit CTA */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-red-900/30 transition flex items-center justify-center space-x-2 mt-4"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
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
    </div>
  );
}
