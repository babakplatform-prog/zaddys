"use client";
import React, { useState } from "react";
import { useRouter } from "navigation"; // or next/navigation depending on your setup
import { Eye, EyeOff, Lock, Mail, User, Phone, Gift, ArrowRight } from "lucide-react";
import { registerUser } from "@/services/authService";

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
      await registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });
      // Redirect or show success (Welcome email is automatically sent via Resend!)
      alert("Account created successfully! Check your email for a welcome message.");
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center px-6 py-12 max-w-md mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black tracking-tight text-white">ZADDYS</h1>
        <p className="text-zinc-400 text-sm mt-1">Made for moments. Join the club.</p>
      </div>

      {error && (
        <div className="bg-red-950/80 border border-red-600 text-red-200 text-sm p-3 rounded-xl mb-4 text-center">
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
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 pl-10 text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 transition"
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
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 pl-10 text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 transition"
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
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 pl-10 text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 transition"
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
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 pl-10 pr-10 text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-zinc-500 hover:text-white"
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
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 pl-10 pr-10 text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 transition"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3.5 text-zinc-500 hover:text-white"
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
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-3 pl-10 text-white placeholder-zinc-600 focus:outline-none focus:border-red-600 transition uppercase"
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
    </div>
  );
}
