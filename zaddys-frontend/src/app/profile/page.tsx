"use client";
import React, { useState, useEffect } from "react";
import { ArrowLeft, Package, Star, Gift, LogOut, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAccessToken } from "@/services/authService";

type Order = { id: number; order_number?: string; total_price: number | string; status: string };
type Profile = { name: string; email: string; phone?: string; referral_code?: string; points: number; orders: Order[] };

export default function ProfileDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
    const token = getAccessToken();
    if (!token) {
      router.push("/login");
      return;
    }
    fetch(`${apiUrl}/profile/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setUserData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load profile:", err);
        setLoading(false);
      });
  }, [router]);

  const signOut = () => {
    localStorage.removeItem("zaddys_access_token");
    localStorage.removeItem("zaddys_refresh_token");
    router.push("/");
  };

  const copyReferral = () => {
    if (userData?.referral_code) {
      navigator.clipboard.writeText(userData.referral_code);
      alert("Referral code copied! Share it to earn free moments.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="w-8 h-8 border-4 border-zinc-800 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 pb-28 font-sans">
      {/* Header */}
      <div className="bg-black text-white p-6 pt-10 rounded-b-[40px] shadow-lg relative">
        <button onClick={() => router.push("/")} className="absolute top-8 left-6 p-2 bg-zinc-900 rounded-full text-white">
          <ArrowLeft size={20} />
        </button>
        <div className="mt-12">
          <h1 className="text-3xl font-black tracking-tight">{userData?.name || "Foodie"}</h1>
          <p className="text-zinc-400 text-sm mt-1">{userData?.email}</p>
        </div>
        
        {/* Loyalty Points Card */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-3xl p-5 mt-6 shadow-xl flex items-center justify-between border border-red-500">
          <div>
            <p className="text-red-100 text-xs font-bold uppercase tracking-wider mb-1">Zaddys Points</p>
            <p className="text-3xl font-black">{userData?.points || 0}</p>
          </div>
          <Star size={40} className="text-red-300 opacity-50" />
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 mt-6 space-y-6">
        
        {/* Referral Section */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-zinc-100 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-red-50 p-3 rounded-2xl text-red-600">
              <Gift size={24} />
            </div>
            <div>
              <p className="text-xs text-zinc-500 font-bold uppercase">Refer & Earn</p>
              <p className="text-black font-black">{userData?.referral_code || "ZADDYS-VIP"}</p>
            </div>
          </div>
          <button onClick={copyReferral} className="p-3 bg-zinc-100 rounded-xl text-black hover:bg-zinc-200 transition">
            <Copy size={18} />
          </button>
        </div>

        {/* Order History */}
        <div>
          <h2 className="text-lg font-black text-black mb-3">Recent Orders</h2>
          {userData?.orders && userData.orders.length > 0 ? (
            <div className="space-y-3">
              {userData.orders.map((order, idx) => (
                <div key={idx} className="bg-white p-4 rounded-3xl shadow-sm border border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-zinc-100 p-3 rounded-2xl text-black">
                      <Package size={20} />
                    </div>
                    <Link href={`/track/${order.order_number || order.id}`} className="block">
                      <p className="font-bold text-sm text-black">Order #{order.order_number || order.id}</p>
                      <p className="text-xs font-semibold text-zinc-500 mt-0.5">
                        <span className={order.status === "Pending" ? "text-orange-500" : "text-green-500"}>
                          {order.status}
                        </span>
                      </p>
                    </Link>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-red-600 text-sm">₦{Number(order.total_price).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 text-center">
              <p className="text-zinc-500 text-sm font-medium">No orders yet. Time to treat yourself!</p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button onClick={signOut} className="w-full bg-zinc-200 hover:bg-zinc-300 text-black font-bold py-4 rounded-2xl transition flex items-center justify-center space-x-2 mt-8">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </main>
  );
}