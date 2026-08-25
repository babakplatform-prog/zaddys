"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Apple, ArrowLeft, Globe2 } from "lucide-react";
import { signIn } from "next-auth/react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  const handleSocialAuth = (provider: "google" | "apple") => {
    signIn(provider, { callbackUrl: sessionStorage.getItem("zaddys_auth_return") || "/" });
  };

  return (
    <main className="min-h-screen bg-zaddys-white text-zaddys-black font-sans px-4 py-6 flex flex-col relative">
      <Link href="/" className="absolute top-6 left-4 text-zinc-500 hover:text-zaddys-red transition">
        <ArrowLeft size={24} />
      </Link>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full mt-10">
        <h1 className="text-4xl font-black mb-2 tracking-tight">
          {isLogin ? "Welcome Back." : "Join Zaddys."}
        </h1>
        <p className="text-zinc-500 text-sm mb-8">
          {isLogin ? "Log in to access your moments." : "Create an account to start ordering."}
        </p>

        <div className="space-y-3">
          <Link href={isLogin ? "/login" : "/signup"} className="block w-full rounded-xl bg-zaddys-red py-3.5 text-center font-bold text-white shadow-lg shadow-red-900/20 transition hover:bg-red-700">
            {isLogin ? "Log In" : "Sign Up"}
          </Link>
          <Link href="/get-started" className="block w-full rounded-xl border border-zaddys-border bg-white py-3.5 text-center font-semibold text-zaddys-black transition hover:border-zaddys-red">
            View the ZADDYS experience
          </Link>
        </div>

        <div className="mt-8 flex flex-col items-center">
          <span className="text-xs text-zinc-500 uppercase font-bold mb-4">Or continue with</span>
          
          <div className="grid grid-cols-2 gap-3 w-full">
            <button onClick={() => handleSocialAuth('google')} className="bg-zinc-100 text-zaddys-red font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition">
              <Globe2 size={17} /><span>Google</span>
            </button>
            <button onClick={() => handleSocialAuth('apple')} className="bg-black text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition">
              <Apple size={17} /><span>Apple</span>
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