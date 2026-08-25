"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CircleHelp } from "lucide-react";
import { useEffect, useState } from "react";

type ShowcaseProduct = { id: number; name: string; image?: string | null };

export default function GetStartedPage() {
  const [showcase, setShowcase] = useState<ShowcaseProduct[]>([]);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
    fetch(`${apiUrl}/products/`)
      .then((response) => response.json())
      .then((data) => setShowcase((Array.isArray(data) ? data : data.results || []).filter((product: ShowcaseProduct) => product.image).slice(0, 4)))
      .catch(() => setShowcase([]));
  }, []);

  return (
    <main className="app-frame flex min-h-screen flex-col bg-white text-zaddys-ink">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 pb-8 pt-7">
        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-zaddys-gray">
          <Link href="/" className="transition hover:text-zaddys-red">ZADDYS</Link>
          <span>Made for moments</span>
        </div>

        <div className="flex flex-1 flex-col justify-center py-10">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-zaddys-red">Creamery &amp; Grills</p>
          <h1 className="max-w-sm text-[42px] font-black leading-[0.98] tracking-[-0.04em] sm:text-5xl">
            Affordable food.
            <br />
            <span className="text-zaddys-red">Better moments.</span>
          </h1>
          <p className="mt-5 max-w-sm text-[15px] leading-7 text-zaddys-gray">
            Fresh comfort food, thoughtful bundles, and little treats made for the people you love.
          </p>

          <div className="relative mt-9 overflow-hidden rounded-[2rem] border border-zinc-700 bg-zaddys-red p-5 shadow-2xl shadow-black/40">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full border-[18px] border-white/10" />
            <div className="absolute -bottom-24 -left-12 h-48 w-48 rounded-full border-[24px] border-black/10" />
            <div className="relative flex min-h-[245px] flex-col justify-between">
              <div className="flex items-start justify-between">
                <div className="rounded-2xl bg-black p-2 shadow-lg">
                  <Image src="/zaddys-logo.jpg" alt="ZADDYS logo" width={58} height={58} className="h-14 w-14 rounded-xl object-cover" priority />
                </div>
                <ArrowUpRight size={25} aria-hidden="true" />
              </div>
              {showcase.length > 0 && <div className="grid grid-cols-4 gap-2 py-4">
                {showcase.map((product) => <div key={product.id} className="relative aspect-square overflow-hidden rounded-xl border-2 border-white/70 bg-white/20"><Image src={product.image || ""} alt={product.name} fill unoptimized sizes="100px" className="object-cover" /></div>)}
              </div>}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/75">Your next favourite</p>
                <p className="mt-2 max-w-[230px] text-3xl font-black leading-none">Start with something delicious.</p>
              </div>
            </div>
          </div>
        </div>

        <Link href="/signup" className="flex w-full items-center justify-center gap-3 rounded-2xl bg-zaddys-red px-5 py-4 text-sm font-black text-white shadow-xl shadow-red-900/20 transition hover:bg-red-700">
          Get Started <ArrowRight size={18} />
        </Link>
        <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-zinc-400">
          <CircleHelp size={14} /> Already have an account? <Link href="/login" className="font-bold text-zaddys-red">Log in</Link>
        </p>
        <div className="mt-6 flex justify-center gap-5 text-xs text-zinc-500">
          <Link href="/support" className="transition hover:text-zaddys-red">Help</Link>
          <span aria-hidden="true">|</span>
          <Link href="/" className="transition hover:text-zaddys-red">Browse menu</Link>
        </div>
        <div className="mt-4 flex justify-center gap-5 text-[11px] text-zinc-600">
          <Link href="/privacy" className="transition hover:text-zaddys-red">Privacy</Link>
          <Link href="/terms" className="transition hover:text-zaddys-red">Terms</Link>
        </div>
      </div>
    </main>
  );
}