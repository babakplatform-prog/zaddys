"use client";
import React, { useId, useRef, useState } from "react";
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
  const [deliveryCoordinates, setDeliveryCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(""); // Needed for Paystack receipt
  const [landmark, setLandmark] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasToken] = useState(() => Boolean(getAccessToken()));
  const [profileLoading, setProfileLoading] = useState(() => hasToken);
  const [zonesError, setZonesError] = useState("");
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZoneType[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<number | null>(null);
  const paystackScriptPromise = useRef<Promise<void> | null>(null);
  const paymentSequence = useRef(0);
  const paymentId = useId().replace(/:/g, "");
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
    Promise.all([
      token ? fetch(`${apiUrl}/profile/`, { headers: { Authorization: `Bearer ${token}` } }).then((res) => res.ok ? res.json() as Promise<Profile> : null) : Promise.resolve(null),
      fetch(`${apiUrl}/delivery-zones/`).then((res) => res.ok ? res.json() : []),
    ])
      .then(([profile, zones]) => {
        if (profile) {
          setCustomerName(profile.name);
          setEmail(profile.email);
          setPhone(profile.phone || "");
        }
        if (Array.isArray(zones)) setDeliveryZones(zones);
      })
      .catch(() => {
        setZonesError("We could not load your account details.");
      })
      .finally(() => {
        setProfileLoading(false);
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
          delivery_notes: deliveryNotes,
          delivery_latitude: deliveryCoordinates?.lat,
          delivery_longitude: deliveryCoordinates?.lng,
          delivery_zone_id: selectedZoneId,
          coupon_code: couponCode,
          transaction_ref: reference.reference
        }),
      });

      if (!res.ok) throw new Error("Failed to save order in database");
      const data = await res.json();
      clearCart();
      alert("Payment Successful! Your Zaddys order is being prepared.");
      router.push(`/track/${data.order_number}`);
    } catch (error) {
      console.error("Order Save Error:", error);
      alert("Payment was successful, but we had a hiccup saving your order. Please contact support.");
    } finally {
      setIsProcessing(false);
    }
  };

  const initializePayment = async () => {
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!publicKey || !publicKey.startsWith("pk_test_") || payableTotal <= 0) {
      setIsProcessing(false);
      alert("Paystack test mode is not configured. Please contact support.");
      return;
    }

    try {
      if (!window.PaystackPop) {
        paystackScriptPromise.current ??= new Promise<void>((resolve, reject) => {
          const existingScript = document.querySelector<HTMLScriptElement>('script[data-paystack="inline"]');
          if (existingScript) {
            existingScript.addEventListener("load", () => resolve(), { once: true });
            existingScript.addEventListener("error", () => reject(new Error("Paystack failed to load")), { once: true });
            return;
          }
          const script = document.createElement("script");
          script.src = "https://js.paystack.co/v1/inline.js";
          script.dataset.paystack = "inline";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Paystack failed to load"));
          document.body.appendChild(script);
        });
        await paystackScriptPromise.current;
      }
      if (!window.PaystackPop) throw new Error("Paystack SDK unavailable");
      window.PaystackPop.setup({
        key: publicKey,
        email,
        amount: Math.round(payableTotal * 100),
        ref: `ZD-${paymentId}-${++paymentSequence.current}`,
        callback: onSuccess,
        onClose,
      }).openIframe();
    } catch (error) {
      paystackScriptPromise.current = null;
      setIsProcessing(false);
      console.error("Paystack initialization error:", error);
      alert("Payment is unavailable right now. Please try again.");
    }
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
    if (profileLoading) return alert("Your checkout details are still loading. Please wait a moment.");
    if (!customerName || !email || !phone || !deliveryAddress || !landmark) {
      return alert("Please fill all required delivery details.");
    }
    if (!deliveryCoordinates && !selectedZoneId) {
      return alert("Please select a delivery zone or use an address with location.");
    }
    
    setIsProcessing(true);
    // Fire Paystack Popup
    void initializePayment();
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-black text-zaddys-red mb-2">Your Cart is Empty</h2>
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
        <button onClick={() => router.back()} className="p-2 bg-zinc-100 rounded-full text-zaddys-red">
          <ArrowLeft size={20} />
        </button>
        <h1 className="page-title text-zaddys-ink">Checkout</h1>
      </div>

      <div className="p-4 max-w-md mx-auto">
        <h2 className="font-bold text-zaddys-red mb-3 text-sm uppercase tracking-wider">Order Summary</h2>
        <div className="overflow-hidden rounded-3xl border border-zaddys-border bg-white shadow-sm mb-6">
          {cart.map((item) => (
            <div key={item.cartItemId} className="flex items-center justify-between gap-3 border-b border-zaddys-border p-4 last:border-b-0">
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
                  <h3 className="font-bold text-sm leading-5 text-zaddys-red">{item.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                    <button type="button" onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} aria-label={`Decrease ${item.name} quantity`} className="p-1 rounded-full bg-zinc-100 text-zaddys-red transition-transform active:scale-90"><Minus size={12} /></button>
                    <span>{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} aria-label={`Increase ${item.name} quantity`} className="p-1 rounded-full bg-zinc-100 text-zaddys-red transition-transform active:scale-90"><Plus size={12} /></button>
                  </div>
                  <p className="text-sm font-black text-red-600">₦{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
              <button aria-label={`Remove ${item.name}`} onClick={() => removeFromCart(item.cartItemId)} className="rounded-xl p-2 text-zinc-400 transition hover:bg-red-50 hover:text-red-600">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        <h2 className="font-bold text-zaddys-red mb-3 text-sm uppercase tracking-wider">Delivery Info</h2>
        <form id="checkout-form" onSubmit={handleCheckout} className="space-y-3 mb-6">
          <div className="rounded-xl border border-zaddys-border bg-zaddys-surface px-4 py-3 text-[13px] text-zaddys-ink">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-zaddys-gray">Ordering as</p>
            <p className="font-semibold">{customerName}</p>
            <p className="text-zaddys-gray">{email}</p>
          </div>
          <input 
            type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number" 
            className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3 text-zaddys-red placeholder-zinc-400 focus:outline-none focus:border-red-600 shadow-sm"
          />
          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 text-zinc-400" size={18} />
            {mapsApiKey ? (
              <GoogleAutocomplete
                id="delivery-address"
                apiKey={mapsApiKey}
                options={{ types: ["address"], componentRestrictions: { country: "ng" } }}
                onPlaceSelected={(place) => {
                  setDeliveryAddress(place.formatted_address || "");
                  const location = place.geometry?.location;
                  if (!location) return;
                  const lat = typeof location.lat === "function" ? location.lat() : location.lat;
                  const lng = typeof location.lng === "function" ? location.lng() : location.lng;
                  setDeliveryCoordinates({ lat, lng });
                  void fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"}/delivery-quote/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ latitude: lat, longitude: lng }),
                  }).then((response) => response.json()).then((quote) => {
                    if (quote.fee) {
                      setDeliveryFee(Number(quote.fee));
                      setDistanceKm(Number(quote.distance_km));
                    }
                  });
                }}
                value={deliveryAddress}
                onChange={(e) => { setDeliveryAddress(e.target.value); setDeliveryCoordinates(null); setDeliveryFee(0); setDistanceKm(null); }}
                placeholder="Full Delivery Address"
                className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3 pl-10 text-zaddys-red placeholder-zinc-400 focus:outline-none focus:border-red-600 shadow-sm"
              />
            ) : (
              <input
                id="delivery-address"
                required
                type="text"
                value={deliveryAddress}
                onChange={(e) => { setDeliveryAddress(e.target.value); setDeliveryCoordinates(null); setDeliveryFee(0); setDistanceKm(null); }}
                placeholder="Full Delivery Address"
                className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3 pl-10 text-zaddys-red placeholder-zinc-400 focus:outline-none focus:border-red-600 shadow-sm"
              />
            )}
          </div>
          {deliveryZones.length > 0 && !deliveryCoordinates && (
            <div>
              <label className="text-xs font-semibold text-zaddys-gray uppercase tracking-wide">Delivery Zone</label>
              <select
                required={!deliveryCoordinates}
                value={selectedZoneId ?? ""}
                onChange={(e) => {
                  const zoneId = Number(e.target.value);
                  const zone = deliveryZones.find((z) => z.id === zoneId);
                  setSelectedZoneId(zoneId || null);
                  setDeliveryFee(zone ? Number(zone.fee) : 0);
                }}
                className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3 text-zaddys-red focus:outline-none focus:border-red-600 shadow-sm"
              >
                <option value="">Select your area</option>
                {deliveryZones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} — ₦{Number(zone.fee).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          )}
          <input type="text" required value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Nearest Landmark" className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3 text-zaddys-red placeholder-zinc-400 focus:outline-none focus:border-red-600 shadow-sm" />
          {deliveryFee > 0 && <p className="text-xs font-semibold text-zaddys-red">Delivery calculated from {distanceKm?.toFixed(1)} km away.</p>}
          {zonesError && <p className="text-xs font-semibold text-zaddys-red">{zonesError}</p>}
          <div className="flex gap-2">
            <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Coupon code" className="min-w-0 flex-1 bg-white border border-zinc-200 rounded-2xl px-4 py-3 text-zaddys-red placeholder-zinc-400 focus:outline-none focus:border-red-600 shadow-sm" />
            <button type="button" onClick={applyCoupon} className="rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white">Apply</button>
          </div>
          {couponMessage && <p className="text-xs font-semibold text-red-600">{couponMessage}</p>}
          <textarea value={deliveryNotes} onChange={(e) => setDeliveryNotes(e.target.value)} placeholder="Delivery Notes (Optional)" className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3 text-zaddys-red placeholder-zinc-400 focus:outline-none focus:border-red-600 shadow-sm" rows={3} />
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
type DeliveryZoneType = { id: number; name: string; fee: string };

