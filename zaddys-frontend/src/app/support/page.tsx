"use client";
import React, { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Bot, MessageCircle, Mail, Send, AlertTriangle, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/services/authService";

export default function SupportPage() {
  const router = useRouter();
  const whatsappNumber = "2349120220480"; // Replace with Zaddys Number
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ id: number; body: string; is_staff_reply: boolean }[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

  const loadChat = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    const response = await fetch(`${apiUrl}/support/conversation/`, { headers: { Authorization: `Bearer ${token}` } });
    if (response.ok) {
      const data = await response.json();
      setMessages(data.messages || []);
    }
  }, [apiUrl]);

  useEffect(() => {
    const prefill = sessionStorage.getItem("zaddys_support_prefill");
    if (prefill) {
      const prefillTimer = window.setTimeout(() => {
        setMessage(prefill);
        setChatOpen(true);
        sessionStorage.removeItem("zaddys_support_prefill");
      }, 0);
      return () => window.clearTimeout(prefillTimer);
    }
  }, []);

  useEffect(() => {
    if (!chatOpen) return;
    const initialLoad = window.setTimeout(() => void loadChat(), 0);
    const timer = window.setInterval(() => void loadChat(), 5000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(timer);
    };
  }, [chatOpen, loadChat]);

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = getAccessToken();
    if (!token) {
      sessionStorage.setItem("zaddys_auth_return", "/support");
      router.push("/login");
      return;
    }
    if (!message.trim()) return;
    setSending(true);
    const response = await fetch(`${apiUrl}/support/conversation/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ body: message }),
    });
    if (response.ok) {
      setMessage("");
      await loadChat();
    }
    setSending(false);
  };

  return (
    <main className="app-frame pb-32 font-sans text-zaddys-ink">
      <div className="bg-white p-4 shadow-sm flex items-center space-x-4 sticky top-0 z-50">
        <button onClick={() => router.back()} className="p-2 bg-zinc-100 rounded-full">
          <ArrowLeft size={20} />
        </button>
        <h1 className="page-title">Talk to ZADDY</h1>
      </div>

      <div className="mx-auto max-w-md space-y-4 p-5">
        <p className="mb-6 text-[13px] text-zaddys-gray">Talk to ZADDY! Choose a quick answer or connect directly with our team.</p>

        <div className="rounded-xl border border-zaddys-border bg-zaddys-surface p-4">
          <div className="mb-3 flex items-center gap-3"><Bot className="text-zaddys-red" size={20} /><p className="text-[13px] font-semibold">Quick help</p></div>
          <div className="flex flex-wrap gap-2">
            {["Where is my order?", "What are your opening hours?", "I need help with payment"].map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => { setMessage(suggestion); setChatOpen(true); }} className="rounded-full border border-zaddys-border bg-white px-3 py-2 text-left text-[12px] text-zaddys-gray">{suggestion}</button>
            ))}
          </div>
        </div>

        {chatOpen && (
          <section className="rounded-xl border border-zaddys-border bg-white p-4 shadow-sm">
            <div className="mb-3 max-h-56 space-y-2 overflow-y-auto">
              {messages.length === 0 && <p className="text-[12px] text-zaddys-gray">Send a message and a ZADDY team member will reply here.</p>}
              {messages.map((item) => <p key={item.id} className={`rounded-xl p-3 text-[13px] ${item.is_staff_reply ? "bg-zaddys-surface text-zaddys-ink" : "ml-6 bg-zaddys-red text-white"}`}>{item.body}</p>)}
            </div>
            <form onSubmit={sendMessage} className="flex gap-2">
              <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Message ZADDY..." className="field min-w-0 flex-1" />
              <button type="submit" disabled={sending} aria-label="Send message" className="rounded-xl bg-zaddys-red p-3 text-white"><Send size={18} /></button>
            </form>
          </section>
        )}

        {!chatOpen && <button type="button" onClick={() => setChatOpen(true)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-zaddys-black py-4 text-[13px] font-semibold text-white"><MessageCircle size={18} /> Chat with Zaddy&apos;s agent</button>}

        {/* General Inquiry */}
        <a href={`https://wa.me/${whatsappNumber}?text=Hello Zaddys, I have a general inquiry.`} target="_blank" rel="noreferrer" className="flex items-center space-x-4 bg-white p-4 rounded-3xl shadow-sm border border-zinc-100 hover:border-red-500 transition">
          <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><Info size={24} /></div>
          <div>
            <h2 className="font-bold text-sm">General Information</h2>
            <p className="text-xs text-zinc-500">Menu details, opening hours, etc.</p>
          </div>
        </a>

        {/* Live Chat (WhatsApp) */}
        <a href={`https://wa.me/${whatsappNumber}?text=Hello Zaddys, I need help with my order.`} target="_blank" rel="noreferrer" className="flex items-center space-x-4 bg-white p-4 rounded-3xl shadow-sm border border-zinc-100 hover:border-red-500 transition">
          <div className="bg-green-50 p-3 rounded-2xl text-green-600"><MessageCircle size={24} /></div>
          <div>
            <h2 className="font-bold text-sm">Live Chat</h2>
            <p className="text-xs text-zinc-500">Track an order or chat with support.</p>
          </div>
        </a>

        {/* Complaints */}
        <a href={`https://wa.me/${whatsappNumber}?text=Hello Zaddys, I want to report an issue.`} target="_blank" rel="noreferrer" className="flex items-center space-x-4 bg-white p-4 rounded-3xl shadow-sm border border-zinc-100 hover:border-red-500 transition">
          <div className="bg-red-50 p-3 rounded-2xl text-red-600"><AlertTriangle size={24} /></div>
          <div>
            <h2 className="font-bold text-sm">Report an Issue</h2>
            <p className="text-xs text-zinc-500">Missing items, late delivery, complaints.</p>
          </div>
        </a>

        {/* Email Support */}
        <a href="mailto:Talk.to.zaddy@zaddys.ng" className="flex items-center space-x-4 bg-white p-4 rounded-3xl shadow-sm border border-zinc-100 hover:border-red-500 transition">
          <div className="bg-zinc-100 p-3 rounded-2xl text-zaddys-red"><Mail size={24} /></div>
          <div>
            <h2 className="font-bold text-sm">Email Us</h2>
            <p className="text-xs text-zinc-500">Talk.to.zaddy@zaddys.ng</p>
          </div>
        </a>
      </div>
    </main>
  );
}