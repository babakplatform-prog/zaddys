"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUp, ChevronRight, Download, Search, SlidersHorizontal, ShoppingBag, X } from "lucide-react";
import Image from "next/image";
import { getAccessToken } from "@/services/authService";
import ZaddysLoader from "@/components/ZaddysLoader";

type Product = {
  id: number;
  name: string;
  category_name: string;
  price: number | string;
  image?: string | null;
  is_custom_quote: boolean;
};

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [userName, setUserName] = useState("there");
  const [promoIndex, setPromoIndex] = useState(0);
    const [installPrompt, setInstallPrompt] = useState<Event & { prompt?: () => Promise<void> } | null>(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [menuError, setMenuError] = useState("");
  const secondRowMarker = React.useRef<HTMLDivElement | null>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  
  useEffect(() => {
    // Splash screen timer (1.8 - 2 seconds as per brand design brief)
    const splashTimer = setTimeout(() => setShowSplash(false), 2000); 

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://zaddys.onrender.com/api";
    
    const token = getAccessToken();
    const profileRequest = token
      ? fetch(`${apiUrl}/profile/`, { headers: { Authorization: `Bearer ${token}` } })
          .then((res) => res.ok ? res.json() : null)
          .then((profile) => profile?.name && setUserName(profile.name.split(" ")[0]))
      : Promise.resolve();

    fetch(`${apiUrl}/products/`)
      .then((res) => {
        if (!res.ok) throw new Error(`Menu request failed with ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setProducts(Array.isArray(data) ? data : data.results || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load live menu:", err);
        setMenuError("The menu is taking a moment to load. Please refresh shortly.");
        setLoading(false);
      });

    return () => {
      clearTimeout(splashTimer);
      void profileRequest;
    };
  }, []);

  const categories = ["All", ...Array.from(new Set(products.map((product) => product.category_name).filter(Boolean)))];
  const visibleProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "All" || product.category_name === activeCategory;
    const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });
  const promoProducts = products.slice(0, 3);
  const promoProduct = promoProducts[promoIndex % Math.max(promoProducts.length, 1)];
  const promoLabels = [
    { badge: "Featured today", description: "A delicious favourite, freshly prepared for your next moment." },
    { badge: "Made to share", description: "Bring something special to the table with ZADDYS." },
    { badge: "Sweet moments", description: "Treat yourself to a little extra joy today." },
  ];
  const promoCopy = promoLabels[promoIndex % promoLabels.length];

  useEffect(() => {
    if (promoProducts.length < 2) return;
    const promoTimer = window.setInterval(() => setPromoIndex((index) => index + 1), 5000);
    return () => window.clearInterval(promoTimer);
  }, [promoProducts.length]);

  useEffect(() => {
    if ("serviceWorker" in navigator) void navigator.serviceWorker.register("/sw.js");
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as Event & { prompt?: () => Promise<void> });
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    const timer = window.setTimeout(() => setShowInstallPrompt(true), 60000);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.clearTimeout(timer);
    };
  }, []);

  const installApp = async () => {
    if (installPrompt?.prompt) await installPrompt.prompt();
    setShowInstallPrompt(false);
  };

  useEffect(() => {
    const marker = secondRowMarker.current;
    if (!marker) return;
    const observer = new IntersectionObserver(([entry]) => setShowBackToTop(entry.isIntersecting), { threshold: 0.1 });
    observer.observe(marker);
    return () => observer.disconnect();
  }, [visibleProducts.length]);

  if (showSplash) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white">
        <ZaddysLoader label="Made for moments" />
      </div>
    );
  }

  // ==========================================
  // MAIN HOME VIEW (Strict Red, White & Black)
  // ==========================================
  return (
    <main className="app-frame pb-32">
      {/* Header Section */}
      <div className="relative z-10 border-b border-zinc-100 bg-white px-5 pb-6 pt-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <div className="mb-8 flex items-center justify-between">
          <Image src="/zaddys-logo.PNG" alt="Zaddy's Creamery and Grills" width={150} height={70} className="h-12 w-auto object-contain" />
          <Link href="/cart" aria-label="Open cart" className="relative rounded-full bg-zaddys-surface p-2 text-zaddys-ink">
            <ShoppingBag size={19} />
          </Link>
        </div>
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-zaddys-gray">{getGreeting()}</h2>
        <h1 className="mt-1 text-[24px] font-bold leading-7 text-zaddys-ink">{userName}!</h1>
        <p className="text-sm text-zinc-500 mt-1">What are you craving today?</p>

        {promoProduct && (
          <Link href={`/product/${promoProduct.id}`} className="relative mt-6 block min-h-40 overflow-hidden rounded-2xl border-2 border-zaddys-red bg-white p-5 text-zaddys-black shadow-lg shadow-red-900/10">
            {promoProduct.image && <Image src={promoProduct.image} alt="Zaddys featured offer" fill unoptimized sizes="(max-width: 512px) 90vw, 440px" className="object-cover opacity-15 mix-blend-multiply" />}
            <div className="relative z-10 max-w-[75%]">
              <span className="mb-2 inline-flex rounded-full bg-zaddys-red px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">{promoCopy.badge}</span>
              <h2 className="text-[20px] font-bold leading-6">{promoProduct.name}</h2>
              <p className="mt-1 text-[12px] text-zaddys-gray">{promoCopy.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-[12px] font-semibold text-zaddys-red">Explore offer <ChevronRight size={15} /></span>
            </div>
            <div className="absolute bottom-4 right-4 flex gap-1.5">
              {promoProducts.map((item, index) => <span key={item.id} className={`h-1.5 rounded-full transition-all ${index === promoIndex % promoProducts.length ? "w-5 bg-zaddys-red" : "w-1.5 bg-zaddys-black/25"}`} />)}
            </div>
          </Link>
        )}

        {/* Search Bar */}
        <div className="mt-6 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 text-zinc-400" size={20} />
            <input 
              type="text" 
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search the menu..."
              className="w-full bg-zinc-100 border-none rounded-2xl px-4 py-3.5 pl-12 text-zaddys-red placeholder-zinc-400 focus:ring-2 focus:ring-red-600 transition"
            />
          </div>
          <button type="button" aria-label="Filter menu" className="flex-shrink-0 rounded-2xl bg-zaddys-red p-3.5 text-white shadow-lg shadow-red-900/20 transition hover:bg-red-700">
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Menu Section */}
      <div className="px-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black tracking-tight text-zaddys-black uppercase">Our Menu</h2>
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-zaddys-red">Fresh today</span>
        </div>

        <div id="menu" className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((category) => (
            <button key={category} type="button" onClick={() => setActiveCategory(category)} className={`shrink-0 rounded-full border px-4 py-2 text-[12px] font-semibold transition ${activeCategory === category ? "border-zaddys-red bg-zaddys-red text-white" : "border-zaddys-border bg-white text-zaddys-gray"}`}>
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <ZaddysLoader label="Loading the menu" />
        ) : (
          menuError ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-center">
              <p className="text-sm font-semibold text-zaddys-ink">{menuError}</p>
              <button type="button" onClick={() => window.location.reload()} className="mt-3 rounded-xl bg-zaddys-red px-4 py-2 text-xs font-bold text-white">Refresh menu</button>
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="rounded-2xl border border-zaddys-border bg-zaddys-surface p-5 text-center text-sm text-zaddys-gray">
              Menu items are being prepared. Please check back shortly.
            </div>
          ) : (
          <div className="grid grid-cols-2 gap-4">
            {visibleProducts.map((product, index) => (
              <React.Fragment key={product.id}>
              <Link href={`/product/${product.id}`} className="group flex min-w-0 flex-col rounded-2xl border border-zaddys-border bg-white p-3 shadow-sm transition hover:border-zaddys-red hover:shadow-md">
                <div className="relative mb-3 aspect-[1.08] w-full overflow-hidden rounded-xl bg-zaddys-surface">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      unoptimized
                      sizes="(max-width: 512px) 42vw, 220px"
                      className="object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300 text-xs font-black uppercase tracking-widest bg-zinc-100">
                      ZADDYS
                    </div>
                  )}
                </div>
                <span className="mb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-zaddys-gray">{product.category_name}</span>
                <h3 className="mb-2 line-clamp-2 text-[15px] font-semibold leading-5 text-zaddys-ink">{product.name}</h3>
                <div className="mt-auto flex items-end justify-between gap-2">
                <p className="text-[14px] font-bold text-zaddys-red">
                  {product.is_custom_quote ? "Custom Quote" : `₦${Number(product.price).toLocaleString()}`}
                </p>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zaddys-black text-sm font-bold text-white transition group-hover:bg-zaddys-red">+</span>
                </div>
              </Link>
              {index === 3 && <div ref={secondRowMarker} className="pointer-events-none col-span-2 h-px" aria-hidden="true" />}
              </React.Fragment>
            ))}
          </div>
          )
        )}
      </div>
      {showInstallPrompt && installPrompt && (
                <div className="fixed bottom-24 left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl bg-zaddys-black p-4 text-white shadow-2xl">
                  <button type="button" aria-label="Close install prompt" onClick={() => setShowInstallPrompt(false)} className="absolute right-3 top-3 text-zinc-400"><X size={17} /></button>
                  <div className="flex items-center gap-3"><Download className="text-red-400" size={22} /><div><p className="text-[13px] font-semibold">Install ZADDYS</p><p className="text-[11px] text-zinc-300">Keep your favourite moments one tap away.</p></div></div>
                  <button type="button" onClick={installApp} className="mt-3 w-full rounded-xl bg-zaddys-red py-2.5 text-[12px] font-semibold">Install app</button>
                </div>
      )}
      {showBackToTop && (
        <button type="button" aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-24 right-4 z-40 rounded-full bg-zaddys-red p-3 text-white shadow-lg transition hover:bg-red-700">
          <ArrowUp size={19} />
        </button>
      )}
    </main>
  );
}
