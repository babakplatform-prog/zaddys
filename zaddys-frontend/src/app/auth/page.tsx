"use client";
import React from "react";
import Link from "next/link";
import { Apple, ArrowRight, ArrowLeft, CircleHelp, Globe2 } from "lucide-react";
import { signIn } from "next-auth/react";

export default function AuthPage() {
  const handleSocialAuth = (provider: "google" | "apple") => {
    signIn(provider, { callbackUrl: sessionStorage.getItem("zaddys_auth_return") || "/" });
  };

  return (
    <main className="app-frame min-h-screen bg-white px-6 py-7 pb-36 font-sans text-zaddys-black">
      <Link href="/" className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-zaddys-gray transition hover:text-zaddys-red">
        <ArrowLeft size={24} />
        <span>ZADDYS</span>
      </Link>

      <div className="mx-auto flex min-h-[calc(100vh-7rem)] w-full max-w-md flex-col justify-center py-10">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-zaddys-red">Made for moments</p>
        <h1 className="max-w-sm text-[42px] font-black leading-[0.98]">
          Affordability,
          <br />
          quality,
          <br />
          and now <span className="text-zaddys-red">ease.</span>
        </h1>
        <p className="mt-5 max-w-sm text-[15px] leading-7 text-zaddys-gray">
          Good food, simple ordering, and little treats made for the people you love.
        </p>

        <div className="mt-8 overflow-hidden rounded-[1.5rem] border-2 border-zaddys-red bg-zaddys-red p-2 shadow-xl shadow-red-900/15">
          <div className="grid grid-cols-2 gap-2 rounded-[1rem] bg-white p-2">
            <div className="h-28 rounded-xl bg-[url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800')] bg-cover bg-center" />
            <div className="h-28 rounded-xl bg-[url('https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800')] bg-cover bg-center" />
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <Link href="/login" className="flex w-full items-center justify-center gap-2 rounded-full bg-zaddys-red py-4 text-center text-sm font-black text-white shadow-lg shadow-red-900/20 transition hover:bg-red-700">
            Log In <ArrowRight size={17} />
          </Link>
          <Link href="/signup" className="flex w-full items-center justify-center gap-2 rounded-full bg-zaddys-black py-4 text-center text-sm font-black text-white transition hover:bg-zinc-800">
            Get Started <ArrowRight size={17} />
          </Link>
        </div>

        <div className="mt-8 flex flex-col items-center">
          <span className="mb-4 text-xs font-bold uppercase text-zaddys-gray">Or continue with</span>
          
          <div className="grid grid-cols-2 gap-3 w-full">
            <button onClick={() => handleSocialAuth('google')} className="bg-zinc-100 text-zaddys-red font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition">
              <Globe2 size={17} /><span>Google</span>
            </button>
            <button onClick={() => handleSocialAuth('apple')} className="bg-black text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition">
              <Apple size={17} /><span>Apple</span>
            </button>
          </div>
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-zaddys-gray">
          <CircleHelp size={14} /> Need help? <Link href="/support" className="font-bold text-zaddys-red">Support</Link>
        </p>
        <div className="mt-5 flex justify-center gap-5 text-[11px] text-zaddys-gray">
          <Link href="/privacy" className="transition hover:text-zaddys-red">Privacy</Link>
          <span aria-hidden="true">|</span>
          <Link href="/terms" className="transition hover:text-zaddys-red">Terms</Link>
        </div>
      </div>
    </main>
  );
}