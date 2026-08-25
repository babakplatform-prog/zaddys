"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

type ShowcaseProduct = { id: number; name: string; image?: string | null };

const fallbackShowcase: ShowcaseProduct[] = [
  { id: 1, name: "Signature grill", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800" },
  { id: 2, name: "Fresh drink", image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800" },
  { id: 3, name: "Creamy treat", image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800" },
  { id: 4, name: "Comfort food", image: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=800" },
];

export default function GetStartedPage() {
  const [showcase, setShowcase] = useState<ShowcaseProduct[]>(fallbackShowcase);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
    fetch(`${apiUrl}/products/`)
      .then((response) => response.json())
      .then((data) => {
        const liveProducts = (Array.isArray(data) ? data : data.results || []).filter((product: ShowcaseProduct) => product.image).slice(0, 4);
        if (liveProducts.length >= 4) setShowcase(liveProducts);
      })
      .catch(() => undefined);
  }, []);

  return (
    <main className="brand-entry app-frame flex min-h-screen flex-col bg-zaddys-black text-white">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 pb-7 pt-6">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
          <Link href="/" className="transition hover:text-white">ZADDYS</Link>
          <span>Made for moments</span>
        </div>

        <div className="flex flex-1 flex-col justify-center py-8">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-white/60">Creamery &amp; Grills</p>
          <h1 className="max-w-sm text-[42px] font-black leading-[0.98] sm:text-5xl">
            Affordability,
            <br />
            quality,
            <br />
            and now <span className="text-zaddys-red">ease.</span>
          </h1>

          <div className="relative mt-8 overflow-hidden rounded-[1.1rem] border border-white/10 bg-zaddys-red p-2 shadow-2xl shadow-black/30">
            <div className="relative grid grid-cols-2 gap-2 overflow-hidden rounded-[0.8rem] bg-white p-2">
              {showcase.map((product) => <div key={product.id} className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100"><Image src={product.image || ""} alt={product.name} fill unoptimized sizes="180px" className="object-cover" /></div>)}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,transparent_45%,rgba(201,20,20,0.15))]" />
            </div>
          </div>
          <p className="mt-5 max-w-sm text-[15px] leading-7 text-white/65">Good food, simple ordering, and little treats made for the people you love.</p>
        </div>

        <Link href="/signup" className="flex w-full items-center justify-center gap-3 rounded-full bg-zaddys-red px-5 py-4 text-sm font-black text-white shadow-xl shadow-red-900/20 transition hover:bg-red-700">
          Let&apos;s get started <ArrowRight size={18} />
        </Link>
        <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-white/55">
          Already have an account? <Link href="/login" className="font-bold text-zaddys-red">Log in</Link>
        </p>
        <div className="mt-7 flex justify-center gap-5 text-xs text-white/55">
          <Link href="/support" className="transition hover:text-white">Help</Link>
          <span aria-hidden="true">|</span>
          <Link href="/" className="transition hover:text-white">Browse menu</Link>
        </div>
      </div>
    </main>
  );
}