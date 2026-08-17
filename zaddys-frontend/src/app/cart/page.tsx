"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, ShoppingBag, MapPin, Phone, StickyNote, CreditCard } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartAndCheckout() {
  const router = useRouter();
  const { cart, removeFromCart, cartTotal } = useCart();
  const [step, setStep] = useState<"cart" | "checkout">("cart");
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("customer@zaddys.ng");
  const [customerPhone, setCustomerPhone] = useState("+234 801 234 5678");
  const [deliveryAddress, setDeliveryAddress] = useState("12 Admiralty Way, Lekki Phase 1");

  const subtotal = cartTotal;
  const deliveryFee = 1500;
  const total = subtotal + deliveryFee;

  // Load Paystack Inline Script dynamically on mount
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // ZERO-REDIRECTION IN-APP PAYSTACK MODAL
  const handleInAppPaystack = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    
    if (!publicKey || publicKey.includes("your_actual_public_key")) {
      alert("Please update your NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY in .env.local with your real Paystack test key!");
      setIsProcessing(false);
      return;
    }

    // @ts-ignore (Accessing PaystackPop loaded via script tag)
    if (typeof window !== "undefined" && window.PaystackPop) {
      // @ts-ignore
      const paystack = new window.PaystackPop();
      paystack.newTransaction({
        key: publicKey,
        email: customerEmail,
        amount: total * 100, // Paystack operates in Kobo
        currency: "NGN",
        ref: `ZD-${Math.floor(100000 + Math.random() * 900000)}`,
        callback: (response: { reference: string }) => {
          setIsProcessing(false);
          console.log("In-app payment successful! Reference:", response.reference);
          // Redirect to success page inside the app
          router.push("/success");
        },
        onClose: () => {
          setIsProcessing(false);
          // User closed the popup modal manually
        },
      });
    } else {
      alert("Paystack SDK is still loading. Please try again in a second.");
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-zaddys-white text-zaddys-black font-sans pb-32 relative overflow-hidden">
      
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-zinc-100">
        <div className="flex items-center px-4 h-16 max-w-md mx-auto">
          <button onClick={() => step === "checkout" ? setStep("cart") : router.back()} className="text-zinc-500 hover:text-black transition">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold ml-4">{step === "cart" ? "Your Cart" : "Checkout"}</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-6 relative">
        
        {/* STEP 1: CART */}
        <div className={`transition-all duration-500 ${step === "checkout" ? "-translate-x-full opacity-0 absolute w-full" : "translate-x-0 opacity-100"}`}>
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-20 text-zinc-400 space-y-4">
              <ShoppingBag size={64} />
              <p>Your cart is empty.</p>
              <Link href="/"><button className="px-6 py-3 bg-zinc-100 text-black font-bold rounded-xl mt-4">Browse Menu</button></Link>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 bg-white p-3 rounded-2xl border border-zinc-200 shadow-sm">
                    <div className="w-16 h-16 bg-zinc-100 rounded-xl flex items-center justify-center text-3xl">{item.image}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm text-black">{item.name}</h3>
                      {item.customization && <p className="text-xs text-zaddys-red font-semibold">{item.customization}</p>}
                      <p className="text-sm font-bold mt-1 text-zinc-500">₦{item.price.toLocaleString()} <span className="text-zinc-400 text-xs font-normal">x{item.qty}</span></p>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="p-2 text-zinc-400 hover:text-zaddys-red transition"><Trash2 size={20} /></button>
                  </div>
                ))}
              </div>
              
              <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 flex justify-between items-center shadow-sm">
                <span className="font-bold text-zinc-500">Subtotal</span>
                <span className="font-black text-lg text-black">₦{subtotal.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* STEP 2: SLIDE-IN CHECKOUT */}
        <div className={`transition-all duration-500 ${step === "cart" ? "translate-x-full opacity-0 absolute top-6 w-full" : "translate-x-0 opacity-100 relative"}`}>
           <form onSubmit={handleInAppPaystack} className="space-y-6">
              <section className="space-y-4">
                <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">Delivery Details</h2>
                
                <div className="relative">
                  <MapPin className="absolute top-3.5 left-4 text-zinc-400" size={20} />
                  <input 
                    required 
                    type="text" 
                    value={deliveryAddress} 
                    onChange={(e) => setDeliveryAddress(e.target.value)} 
                    placeholder="Delivery Address" 
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-12 pr-4 py-3.5 text-black focus:outline-none focus:border-zaddys-red" 
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute top-3.5 left-4 text-zinc-400" size={20} />
                  <input 
                    required 
                    type="tel" 
                    value={customerPhone} 
                    onChange={(e) => setCustomerPhone(e.target.value)} 
                    placeholder="Phone Number" 
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-12 pr-4 py-3.5 text-black focus:outline-none focus:border-zaddys-red" 
                  />
                </div>

                <div className="relative">
                  <StickyNote className="absolute top-3.5 left-4 text-zinc-400" size={20} />
                  <textarea placeholder="Delivery notes (optional)" className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-12 pr-4 py-3.5 text-black focus:outline-none focus:border-zaddys-red h-24 resize-none"></textarea>
                </div>
              </section>

              <section className="mt-8">
                <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Order Summary</h2>
                <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 space-y-3 shadow-sm">
                  <div className="flex justify-between text-sm text-zinc-500"><span>Subtotal</span><span className="font-semibold text-black">₦{subtotal.toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm text-zinc-500"><span>Delivery Fee</span><span className="font-semibold text-black">₦{deliveryFee.toLocaleString()}</span></div>
                  <div className="w-full h-px bg-zinc-200 my-2"></div>
                  <div className="flex justify-between text-lg font-black"><span>Total</span><span className="text-zaddys-red">₦{total.toLocaleString()}</span></div>
                </div>
              </section>

              <section className="mt-8">
                <div className="flex items-center justify-between bg-white border border-zaddys-red rounded-2xl p-4 shadow-sm bg-red-50/30">
                  <div className="flex items-center space-x-3"><CreditCard className="text-zaddys-red" size={24} /><span className="font-bold text-sm text-black">Paystack In-App Secure Checkout</span></div>
                  <div className="w-5 h-5 rounded-full border-2 border-zaddys-red flex items-center justify-center"><div className="w-2.5 h-2.5 bg-zaddys-red rounded-full"></div></div>
                </div>
              </section>
           </form>
        </div>
      </div>

      {/* Sticky Bottom Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-zinc-200 p-5 pb-safe z-50">
          <div className="max-w-md mx-auto">
            {step === "cart" ? (
              <button onClick={() => setStep("checkout")} className="w-full bg-zaddys-red text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-red-700 transition">Proceed to Checkout</button>
            ) : (
              <button onClick={handleInAppPaystack} disabled={isProcessing} className="w-full bg-zaddys-red text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-red-700 transition flex justify-center items-center">
                {isProcessing ? "Launching Secure Gateway..." : `Pay ₦${total.toLocaleString()}`}
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}