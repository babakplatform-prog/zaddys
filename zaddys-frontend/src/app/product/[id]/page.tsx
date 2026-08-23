"use client";
import React, { useState, useEffect } from "react";
import { ArrowLeft, Bot, MessageCircle, Minus, Plus, Share2, ShoppingBag, Wine, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import { getAccessToken } from "@/services/authService";

type ProductOption = { id: number; name: string; price_extra: number | string };
type ProductOptionGroup = { id: number; name: string; is_required: boolean; is_multiple: boolean; options: ProductOption[] };
type Product = { id: number; name: string; price: number | string; image?: string | null; description?: string | null; category_name: string; is_custom_quote: boolean; option_groups?: ProductOptionGroup[] };
type Selection = ProductOption | ProductOption[];

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, Selection>>({});
  const [loading, setLoading] = useState(true);
  const [quoteAssistantOpen, setQuoteAssistantOpen] = useState(false);
  const [customerName, setCustomerName] = useState("there");

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
    fetch(`${apiUrl}/products/${id}/`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch product:", err);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
    fetch(`${apiUrl}/profile/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.ok ? res.json() : null)
      .then((profile) => profile?.name && setCustomerName(profile.name.split(" ")[0]))
      .catch(() => undefined);
  }, []);

  const talkToZaddy = () => {
    if (!product) return;
    const message = encodeURIComponent(`Hello ZADDYS! My name is ${customerName}. I would like to request a custom quote for the *${product.name}*.`);
    window.open(`https://wa.me/2349120220480?text=${message}`, "_blank", "noopener,noreferrer");
    setQuoteAssistantOpen(false);
  };

  const shareProduct = async () => {
    if (!product) return;
    const shareData = { title: product.name, text: product.description || `Check out ${product.name} at ZADDYS.`, url: window.location.href };
    if (navigator.share) {
      await navigator.share(shareData).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(window.location.href);
    alert("Product link copied. Send it to someone special.");
  };

  // Calculate dynamic price based on selected add-ons/variants
  let calculatedPrice = product ? Number(product.price) : 0;
  Object.values(selectedOptions).forEach((opt) => {
    if (Array.isArray(opt)) {
      opt.forEach((option) => calculatedPrice += Number(option.price_extra || 0));
    } else if (opt && opt.price_extra) {
      calculatedPrice += Number(opt.price_extra);
    }
  });

  const handleOptionChange = (group: ProductOptionGroup, option: ProductOption) => {
    if (group.is_multiple) {
      // Checkbox logic
      const selection = selectedOptions[group.id];
      const currentSelection: ProductOption[] = Array.isArray(selection) ? selection : [];
      const exists = currentSelection.some((selected) => selected.id === option.id);
      let updated;
      if (exists) {
        updated = currentSelection.filter((selected) => selected.id !== option.id);
      } else {
        updated = [...currentSelection, option];
      }
      setSelectedOptions({ ...selectedOptions, [group.id]: updated });
    } else {
      // Radio logic
      setSelectedOptions({ ...selectedOptions, [group.id]: option });
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    const missingRequired = (product.option_groups || []).some((group) => group.is_required && !selectedOptions[group.id]);
    if (missingRequired) {
      alert("Please select an option for every required group.");
      return;
    }
    // Compile option summary for the cart
    const optionsSummary = Object.values(selectedOptions)
      .flat()
      .map((option: ProductOption) => option.name)
      .join(", ");

    addToCart({
      id: product.id,
      name: `${product.name} ${optionsSummary ? `(${optionsSummary})` : ""}`,
      price: calculatedPrice,
      quantity: quantity,
      image: product.image || "",
      is_custom_quote: product.is_custom_quote,
      selected_option_ids: Object.values(selectedOptions).flat().map((option) => option.id),
    });
    
    router.push("/cart");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-zinc-200 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) return <div className="min-h-screen bg-white text-black p-6">Product not found.</div>;

  return (
    <main className="min-h-screen bg-white pb-44 font-sans text-black">
      {/* Header Image Section */}
      <div className="relative w-full h-80 bg-zinc-100">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            unoptimized
            sizes="(max-width: 512px) 100vw, 512px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-300 font-black uppercase">Zaddys Moment</div>
        )}
        
        <Link href="/" className="absolute top-6 left-4 bg-white/90 backdrop-blur p-2 rounded-full shadow-md text-black">
          <ArrowLeft size={22} />
        </Link>
        <div className="absolute right-4 top-6 flex flex-col gap-2">
          <button type="button" onClick={shareProduct} aria-label="Share this product" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-black shadow-md transition hover:bg-zaddys-red hover:text-white">
            <Share2 size={19} />
          </button>
          <button type="button" onClick={() => router.push("/#menu")} aria-label="Browse drinks" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-black shadow-md transition hover:bg-zaddys-red hover:text-white">
            <Wine size={19} />
          </button>
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white rounded-t-[32px] -mt-6 relative z-10 p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-black text-black leading-tight">{product.name}</h1>
          <span className="text-xl font-bold text-red-600 ml-4">
            {product.is_custom_quote ? "Quote" : `₦${calculatedPrice.toLocaleString()}`}
          </span>
        </div>
        
        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-4">{product.category_name}</p>
        <div className="mb-5 flex gap-2">
          <button type="button" onClick={shareProduct} className="flex items-center gap-2 rounded-xl border border-zaddys-border bg-zaddys-surface px-3 py-2 text-xs font-bold text-zaddys-ink transition hover:border-zaddys-red"><Share2 size={15} /> Share</button>
          <button type="button" onClick={() => router.push("/#menu")} className="flex items-center gap-2 rounded-xl border border-zaddys-border bg-zaddys-surface px-3 py-2 text-xs font-bold text-zaddys-ink transition hover:border-zaddys-red"><Wine size={15} /> Drinks</button>
        </div>
        
        <div className="mb-6">
          <h3 className="font-bold text-black mb-1 text-sm">Description</h3>
          <p className="text-zinc-600 text-sm leading-relaxed">
            {product.description || "Freshly prepared with premium ingredients for your moments."}
          </p>
        </div>

        {/* Dynamic Option Groups (Radio & Checkboxes) */}
        {product.option_groups && product.option_groups.map((group) => (
          <div key={group.id} className="mb-6 border-t border-zinc-100 pt-4">
            <h3 className="font-black text-sm text-black mb-3 uppercase tracking-wider">
              {group.name} {group.is_required && <span className="text-red-600">*</span>}
            </h3>
            <div className="space-y-2">
              {group.options.map((option) => {
                const selection = selectedOptions[group.id];
                const isSelected = group.is_multiple
                  ? (Array.isArray(selection) ? selection : []).some((selected: ProductOption) => selected.id === option.id)
                  : !Array.isArray(selection) && selection?.id === option.id;

                return (
                  <label 
                    key={option.id} 
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition ${
                      isSelected ? "border-red-600 bg-red-50/40 text-black font-bold" : "border-zinc-200 bg-zinc-50 text-zinc-700"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input 
                        type={group.is_multiple ? "checkbox" : "radio"}
                        name={`group-${group.id}`}
                        checked={isSelected}
                        onChange={() => handleOptionChange(group, option)}
                        className="accent-red-600 w-4 h-4"
                      />
                      <span className="text-sm">{option.name}</span>
                    </div>
                    {Number(option.price_extra) > 0 && (
                      <span className="text-xs font-bold text-red-600">+₦{Number(option.price_extra).toLocaleString()}</span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        {/* Quantity Selector */}
        {!product.is_custom_quote && (
          <div className="mb-6 flex w-36 items-center justify-between rounded-2xl bg-zinc-100 p-2">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 bg-white rounded-xl shadow-sm text-black"
            >
              <Minus size={16} />
            </button>
            <span className="font-bold text-black text-base">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 bg-white rounded-xl shadow-sm text-black"
            >
              <Plus size={16} />
            </button>
          </div>
        )}

        {!product.is_custom_quote && (
          <button type="button" onClick={handleAddToCart} className="mb-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-zaddys-red py-4 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-red-900/20 transition hover:bg-red-700 active:scale-[0.99]">
            <ShoppingBag size={19} />
            <span>Add to Cart - ₦{(calculatedPrice * quantity).toLocaleString()}</span>
          </button>
        )}
      </div>

      {/* Floating Action CTA */}
      <div className="fixed bottom-[5.4rem] left-1/2 z-[55] w-full max-w-lg -translate-x-1/2 border-t border-zinc-100 bg-white/95 p-4 pb-3 backdrop-blur">
        {product.is_custom_quote ? (
          <button 
            onClick={() => setQuoteAssistantOpen(true)}
            className="flex w-full items-center justify-center space-x-2 rounded-2xl bg-[#25D366] py-4 font-bold text-white shadow-xl transition hover:bg-[#1ebe5d]"
          >
            <span>Request Custom Quote on WhatsApp</span>
          </button>
        ) : (
          <button 
            onClick={handleAddToCart}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-900/20 transition flex items-center justify-center space-x-2 uppercase tracking-wider text-sm"
          >
            <ShoppingBag size={20} />
            <span>Add to Cart - ₦{(calculatedPrice * quantity).toLocaleString()}</span>
          </button>
        )}
      </div>
      {quoteAssistantOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-4 sm:items-center">
          <section role="dialog" aria-modal="true" aria-labelledby="quote-assistant-title" className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-red-50 p-3 text-zaddys-red"><Bot size={22} /></div>
                <div>
                  <h2 id="quote-assistant-title" className="text-[17px] font-bold text-zaddys-ink">Hi {customerName}, let&apos;s make it special.</h2>
                  <p className="text-[12px] text-zaddys-gray">How would you like to continue with your custom quote?</p>
                </div>
              </div>
              <button type="button" onClick={() => setQuoteAssistantOpen(false)} aria-label="Close quote assistant" className="rounded-full bg-zaddys-surface p-2 text-zaddys-gray"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <button type="button" onClick={() => { sessionStorage.setItem("zaddys_support_prefill", `I need help with a custom quote for ${product.name}.`); router.push("/support"); }} className="flex w-full items-center gap-3 rounded-xl border border-zaddys-border p-4 text-left transition hover:border-zaddys-red">
                <MessageCircle className="text-zaddys-red" size={21} /><span><strong className="block text-[13px] text-zaddys-ink">Chat with an agent</strong><small className="text-[12px] text-zaddys-gray">Talk to the ZADDYS team inside the app.</small></span>
              </button>
              <button type="button" onClick={talkToZaddy} className="flex w-full items-center gap-3 rounded-xl bg-[#25D366] p-4 text-left text-white transition hover:bg-[#1ebe5d]">
                <MessageCircle size={21} /><span><strong className="block text-[13px]">Talk to ZADDY!</strong><small className="text-[12px] text-white/85">Continue with WhatsApp for a fast quote.</small></span>
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}