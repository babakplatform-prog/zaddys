"use client";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Check, Clock, Package } from "lucide-react";
import { getAccessToken } from "@/services/authService";
import ZaddysLoader from "@/components/ZaddysLoader";

type Tracking = { order_number: string; status: string; total_price: number | string; delivery_fee: number | string; is_paid: boolean };
const statuses = ["Pending Confirmation", "Preparing", "Ready for Dispatch", "Dispatched", "Delivered"];

export default function TrackOrderPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Tracking | null>(null);
  const [error, setError] = useState("");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
  const loadOrder = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    const response = await fetch(`${apiUrl}/orders/${orderNumber}/`, { headers: { Authorization: `Bearer ${token}` } });
    if (response.ok) setOrder(await response.json());
    else setError("We could not find this order.");
  }, [apiUrl, orderNumber]);

  useEffect(() => {
    const initial = window.setTimeout(() => void loadOrder(), 0);
    const timer = window.setInterval(() => void loadOrder(), 10000);
    return () => { window.clearTimeout(initial); window.clearInterval(timer); };
  }, [loadOrder]);

  const currentIndex = order ? statuses.indexOf(order.status) : -1;
  return (
    <main className="app-frame min-h-screen px-5 pb-32 pt-8">
      <div className="mx-auto max-w-md">
        <p className="section-label">Live order tracking</p>
        <h1 className="page-title mt-2">Order #{orderNumber}</h1>
        {error && <p className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        {!order && !error && <ZaddysLoader />}
        {order && (
          <>
            <div className="mt-6 rounded-2xl bg-zaddys-black p-5 text-white"><p className="text-xs text-zinc-400">Current status</p><p className="mt-1 text-xl font-bold">{order.status}</p><p className="mt-2 text-sm text-zinc-300">Total: ₦{Number(order.total_price).toLocaleString()}</p></div>
            <div className="mt-6 space-y-3">
              {statuses.map((status, index) => <div key={status} className={`flex items-center gap-3 rounded-xl border p-4 ${index <= currentIndex ? "border-green-200 bg-green-50" : "border-zaddys-border bg-white"}`}><span className={`flex h-8 w-8 items-center justify-center rounded-full ${index <= currentIndex ? "bg-green-600 text-white" : "bg-zaddys-surface text-zaddys-gray"}`}>{index <= currentIndex ? <Check size={16} /> : index === 0 ? <Clock size={16} /> : <Package size={16} />}</span><span className="text-sm font-semibold">{status}</span></div>)}
            </div>
          </>
        )}
      </div>
    </main>
  );
}