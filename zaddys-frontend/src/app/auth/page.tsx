"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Apple, ArrowLeft, AtSign, Globe2, UsersRound } from "lucide-react";
import { signIn } from "next-auth/react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const handleSocialAuth = (provider: "google" | "apple" | "facebook" | "twitter") => {
    signIn(provider, { callbackUrl: sessionStorage.getItem("zaddys_auth_return") || "/" });
  };

  return (
    <main className="min-h-screen bg-zaddys-white text-zaddys-black font-sans px-4 py-6 flex flex-col relative">
      <Link href="/" className="absolute top-6 left-4 text-zinc-500 hover:text-black transition">
        <ArrowLeft size={24} />
      </Link>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full mt-10">
        <h1 className="text-4xl font-black mb-2 tracking-tight">
          {isLogin ? "Welcome Back." : "Join Zaddys."}
        </h1>
        <p className="text-zinc-500 text-sm mb-8">
          {isLogin ? "Log in to access your moments." : "Create an account to start ordering."}
        </p>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-3 text-black focus:outline-none focus:border-zaddys-red transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Email Address</label>
            <input 
              type="email" 
              placeholder="you@example.com" 
              className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-3 text-black focus:outline-none focus:border-zaddys-red transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-3 text-black focus:outline-none focus:border-zaddys-red transition"
            />
          </div>

          {/* NEW: Confirm Password Field */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Confirm Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-4 py-3 text-black focus:outline-none focus:border-zaddys-red transition"
              />
            </div>
          )}

          {isLogin && (
            <div className="flex justify-end">
              <span className="text-xs text-zaddys-red font-semibold cursor-pointer hover:underline">Forgot Password?</span>
            </div>
          )}

          <button className="w-full bg-zaddys-red text-white font-bold rounded-xl py-3.5 mt-4 hover:bg-red-700 transition shadow-lg shadow-red-900/20">
            {isLogin ? "Log In" : "Sign Up"}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center">
          <span className="text-xs text-zinc-500 uppercase font-bold mb-4">Or continue with</span>
          
          <div className="grid grid-cols-2 gap-3 w-full">
            <button onClick={() => handleSocialAuth('google')} className="bg-zinc-100 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition">
              <Globe2 size={17} /><span>Google</span>
            </button>
            <button onClick={() => handleSocialAuth('apple')} className="bg-black text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition">
              <Apple size={17} /><span>Apple</span>
            </button>
            <button onClick={() => handleSocialAuth('facebook')} className="bg-[#1877F2] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#166FE5] transition">
              <UsersRound size={17} /><span>Facebook</span>
            </button>
            <button onClick={() => handleSocialAuth('twitter')} className="bg-white border border-zinc-300 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-50 transition">
              <AtSign size={17} /><span>X</span>
            </button>
          </div>
        </div>

        <div className="mt-auto pt-8 text-center text-sm text-zinc-500">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-zaddys-red font-bold hover:underline">
            {isLogin ? "Sign Up" : "Log In"}
          </button>
          <Link href="/get-started" className="mt-4 block text-xs font-semibold text-zinc-400 transition hover:text-zaddys-red">
            See the ZADDYS experience
          </Link>
        </div>
      </div>
    </main>
  );
}