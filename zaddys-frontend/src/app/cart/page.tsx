"use client";
import React, { useState } from "react";
import { useCart } from "@/context/CartContext";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/services/authService";
import GoogleAutocomplete from "react-google-autocomplete";
import Image from "next/image";
import { useEffect } from "react";

declare global {
  interface Window {
    PaystackPop?: { setup: (config: Record<string, unknown>) => { openIframe: () => void } };
  }
}

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const router = useRouter();
  
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(""); // Needed for Paystack receipt
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [preferredDeliveryTime, setPreferredDeliveryTime] = useState("");
  const [deliveryZones, setDeliveryZones] = useState<{ id: number; name: string; fee: number }[]>([]);
  const [deliveryZoneId, setDeliveryZoneId] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasToken] = useState(() => Boolean(getAccessToken()));
  const [profileLoading, setProfileLoading] = useState(() => hasToken);
  const [zonesLoading, setZonesLoading] = useState(() => hasToken);
  const [zonesError, setZonesError] = useState("");
  const deliveryFee = Number(deliveryZones.find((zone) => String(zone.id) === deliveryZoneId)?.fee || 0);
  const payableTotal = Math.max(0, cartTotal + deliveryFee - discount);
  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
    const res = await fetch(`${apiUrl}/coupons/validate/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode, subtotal: cartTotal + deliveryFee }),
    });
    const data = await res.json();
    if (!res.ok) {
      setDiscount(0);
      setCouponMessage(data.error || "Coupon unavailable.");
      return;
    }
    setDiscount(Number(data.discount));
    setCouponCode(data.code);
    setCouponMessage(`Coupon applied: ₦${Number(data.discount).toLocaleString()} off`);
  };

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
    const token = getAccessToken();
    if (!token) return;
    Promise.all([
      fetch(`${apiUrl}/profile/`, { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.ok ? res.json() as Promise<Profile> : null),
      fetch(`${apiUrl}/delivery-zones/`).then((res) => res.ok ? res.json() : Promise.reject(new Error("Delivery zones unavailable"))),
    ])
      .then(([profile, zones]) => {
        if (profile) {
          setCustomerName(profile.name);
          setEmail(profile.email);
          setPhone(profile.phone || "");
        }
        setDeliveryZones(Array.isArray(zones) ? zones : zones.results || []);
      })
      .catch(() => setZonesError("Delivery areas are unavailable. Please try again."))
      .finally(() => {
        setProfileLoading(false);
        setZonesLoading(false);
      });
  }, []);

  const onSuccess = async (reference: PaystackReference) => {
    setIsProcessing(true);
    // Payment Successful! Send order to Django Backend
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
      const res = await fetch(`${apiUrl}/orders/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify({
          cart: cart,
          cartTotal: payableTotal,
          delivery_address: deliveryAddress,
          customer_name: customerName,
          email,
          phone: phone,
          landmark,
          city,
          delivery_notes: deliveryNotes,
          preferred_delivery_time: preferredDeliveryTime,
          delivery_zone_id: deliveryZoneId,
          coupon_code: couponCode,
          transaction_ref: reference.reference
        }),
      });

      if (!res.ok) throw new Error("Failed to save order in database");
      const data = await res.json();
      clearCart();
      alert("Payment Successful! Your Zaddys order is being prepared.");
      router.push(`/success?order=${data.order_number}`);
    } catch (error) {
      console.error("Order Save Error:", error);
      alert("Payment was successful, but we had a hiccup saving your order. Please contact support.");
    } finally {
      setIsProcessing(false);
    }
  };

  const initializePayment = () => {
    const open = () => {
      if (!window.PaystackPop) {
        setIsProcessing(false);
        alert("Payment is unavailable right now. Please try again.");
        return;
      }
      window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_your_key_here",
        email,
        amount: payableTotal * 100,
        ref: new Date().getTime().toString(),
        callback: onSuccess,
        onClose,
      }).openIframe();
    };

    if (window.PaystackPop) {
      open();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = open;
    script.onerror = () => {
      setIsProcessing(false);
      alert("Payment is unavailable right now. Please try again.");
    };
    document.body.appendChild(script);
  };

  const onClose = () => {
    alert("Payment cancelled. You can complete your order anytime.");
    setIsProcessing(false);
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return alert("Your cart is empty!");
    if (!getAccessToken()) {
      sessionStorage.setItem("zaddys_auth_return", "/cart");
      router.push("/login");
      return;
    }
    if (profileLoading || zonesLoading) return alert("Loading your checkout details. Please wait a moment.");
    if (!customerName || !email || !phone || !deliveryAddress || !landmark || !city || !preferredDeliveryTime || !deliveryZoneId || deliveryZones.length === 0) {
      return alert("Please fill all required delivery details.");
    }
    
    setIsProcessing(true);
    // Fire Paystack Popup
    initializePayment();
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-black text-black mb-2">Your Cart is Empty</h2>
        <p className="text-zinc-500 mb-6">Looks like you haven&apos;t added any moments yet.</p>
        <Link href="/" className="bg-red-600 text-white font-bold py-3 px-8 rounded-full shadow-lg">
          Explore Menu
        </Link>
      </div>
    );
  }

  return (
    <main className="app-frame pb-32">
      <div className="sticky top-0 z-40 flex items-center gap-4 border-b border-zaddys-border bg-white p-4">
        <button onClick={() => router.back()} className="p-2 bg-zinc-100 rounded-full text-black">
          <ArrowLeft size={20} />
        </button>
        <h1 className="page-title text-zaddys-ink">Checkout</h1>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <h2 className="font-bold text-black mb-3 text-sm uppercase tracking-wider">Order Summary</h2>
        <div className="overflow-hidden rounded-3xl border border-zaddys-border bg-white shadow-sm mb-6">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 border-b border-zaddys-border p-4 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl bg-zinc-100">
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      unoptimized
                      sizes="64px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-5 text-black">{item.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={`Decrease ${item.name} quantity`} className="p-1 rounded-full bg-zinc-100 text-black"><Minus size={12} /></button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={`Increase ${item.name} quantity`} className="p-1 rounded-full bg-zinc-100 text-black"><Plus size={12} /></button>
                  </div>
                  <p className="text-sm font-black text-red-600">₦{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
              <button aria-label={`Remove ${item.name}`} onClick={() => removeFromCart(item.id)} className="rounded-xl p-2 text-zinc-400 transition hover:bg-red-50 hover:text-red-600">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <h2 className="font-bold text-black mb-3 text-sm uppercase tracking-wider">Delivery Info</h2>
        <form id="checkout-form" onSubmit={handleCheckout} className="space-y-3 mb-6">
          <div className="rounded-xl border border-zaddys-border bg-zaddys-surface px-4 py-3 text-[13px] text-zaddys-ink">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zaddys-gray">Ordering as</p>
            <p className="font-semibold">{profileLoading ? "Loading account..." : customerName}</p>
            <p className="text-zaddys-gray">{email}</p>
          </div>
          <input 
            type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number" 
            className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3 text-black placeholder-zinc-400 focus:outline-none focus:border-red-600 shadow-sm"
          />
          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 text-zinc-400" size={18} />
            {mapsApiKey ? (
              <GoogleAutocomplete
                apiKey={mapsApiKey}
                options={{ types: ["address"], componentRestrictions: { country: "ng" } }}
                onPlaceSelected={(place) => setDeliveryAddress(place.formatted_address || "")}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Full Delivery Address"
                className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3 pl-10 text-black placeholder-zinc-400 focus:outline-none focus:border-red-600 shadow-sm"
              />
            ) : (
              <input
                required
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Full Delivery Address"
                className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3 pl-10 text-black placeholder-zinc-400 focus:outline-none focus:border-red-600 shadow-sm"
              />
            )}
          </div>
          <input type="text" required value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Nearest Landmark" className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3 text-black placeholder-zinc-400 focus:outline-none focus:border-red-600 shadow-sm" />
          <input type="text" required value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3 text-black placeholder-zinc-400 focus:outline-none focus:border-red-600 shadow-sm" />
          <select required value={deliveryZoneId} onChange={(e) => setDeliveryZoneId(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3 text-black focus:outline-none focus:border-red-600 shadow-sm">
            <option value="">{zonesLoading ? "Loading delivery areas..." : "Select delivery area"}</option>
            {deliveryZones.map((zone) => <option key={zone.id} value={zone.id}>{zone.name} - ₦{Number(zone.fee).toLocaleString()}</option>)}
          </select>
          {zonesError && <p className="text-xs font-semibold text-zaddys-red">{zonesError}</p>}
          <div className="flex gap-2">
            <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Coupon code" className="min-w-0 flex-1 bg-white border border-zinc-200 rounded-2xl px-4 py-3 text-black placeholder-zinc-400 focus:outline-none focus:border-red-600 shadow-sm" />
            <button type="button" onClick={applyCoupon} className="rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white">Apply</button>
          </div>
          {couponMessage && <p className="text-xs font-semibold text-red-600">{couponMessage}</p>}
          <input type="text" required value={preferredDeliveryTime} onChange={(e) => setPreferredDeliveryTime(e.target.value)} placeholder="Preferred Delivery Time" className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3 text-black placeholder-zinc-400 focus:outline-none focus:border-red-600 shadow-sm" />
          <textarea value={deliveryNotes} onChange={(e) => setDeliveryNotes(e.target.value)} placeholder="Delivery Notes (Optional)" className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3 text-black placeholder-zinc-400 focus:outline-none focus:border-red-600 shadow-sm" rows={3} />
        </form>

        <div className="rounded-3xl bg-zaddys-black p-5 text-white shadow-lg shadow-black/15 mb-4">
          <div className="flex justify-between items-center mb-2 text-sm text-zinc-400">
            <span>Subtotal</span><span>₦{cartTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center mb-2 text-sm text-zinc-400">
            <span>Delivery</span><span>₦{deliveryFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center mb-2 text-sm text-zinc-400">
            <span>Discount</span><span>-₦{discount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-black">
            <span>Total</span><span className="text-red-500">₦{payableTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-[4.7rem] left-1/2 z-40 w-full max-w-lg -translate-x-1/2 border-t border-zaddys-border bg-white/95 p-4 backdrop-blur">
        <button 
          form="checkout-form" type="submit" disabled={isProcessing}
          className="w-full rounded-2xl bg-zaddys-red py-4 text-sm font-black uppercase tracking-wide text-white shadow-lg shadow-red-900/20 transition hover:bg-red-700 flex items-center justify-center gap-2"
        >
          <ShoppingBag size={18} />
          {isProcessing ? "Processing..." : `Pay ₦${payableTotal.toLocaleString()}`}
        </button>
      </div>
    </main>
  );
}

type PaystackReference = { reference: string };
type Profile = { name: string; email: string; phone?: string };