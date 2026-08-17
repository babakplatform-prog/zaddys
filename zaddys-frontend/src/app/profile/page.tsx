"use client";
import React from "react";
import Link from "next/link";
import { ArrowLeft, Package, Settings, LogOut, ChevronRight } from "lucide-react";
import DockNav from "@/components/DockNav";

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-zaddys-white text-zaddys-black font-sans pb-28 relative">
      
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="flex items-center px-4 h-16 max-w-md mx-auto">
          <Link href="/" className="text-zinc-500 hover:text-black transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-lg font-bold ml-4">My Profile</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 pt-6">
        
        {/* User Info Card */}
        <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-2xl flex items-center space-x-4 mb-8 shadow-sm">
          <div className="w-16 h-16 bg-zaddys-red rounded-full flex items-center justify-center text-white text-xl font-black">
            JD
          </div>
          <div>
            <h2 className="text-lg font-black text-black">John Doe</h2>
            <p className="text-sm text-zinc-500">john.doe@example.com</p>
            <p className="text-xs font-bold text-zaddys-red mt-1 cursor-pointer">Edit Profile</p>
          </div>
        </div>

        {/* Active Orders */}
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Active Orders</h3>
        <div className="bg-white border border-zinc-200 p-4 rounded-2xl flex items-center justify-between mb-8 shadow-sm cursor-pointer hover:border-zaddys-red transition">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
              <Package size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-black">Order #ZD-84729</p>
              <p className="text-xs font-semibold text-orange-500">Preparing...</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-zinc-400" />
        </div>

        {/* Menu Links */}
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">Account</h3>
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm divide-y divide-zinc-100 overflow-hidden">
          
          <button className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 transition">
            <div className="flex items-center space-x-3 text-black">
              <Package size={20} className="text-zinc-400" />
              <span className="font-semibold text-sm">Order History</span>
            </div>
            <ChevronRight size={18} className="text-zinc-400" />
          </button>

          <button className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 transition">
            <div className="flex items-center space-x-3 text-black">
              <Settings size={20} className="text-zinc-400" />
              <span className="font-semibold text-sm">Settings & Addresses</span>
            </div>
            <ChevronRight size={18} className="text-zinc-400" />
          </button>

          <button className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition group">
            <div className="flex items-center space-x-3 text-zaddys-red">
              <LogOut size={20} />
              <span className="font-semibold text-sm">Log Out</span>
            </div>
          </button>
          
        </div>
      </div>

      <DockNav />
    </main>
  );
}