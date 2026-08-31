"use client";
import { SessionProvider, useSession } from "next-auth/react";
import { CartProvider } from "@/context/CartContext";
import { useEffect } from "react";

function SessionSync() {
  const { data: session } = useSession();
  
  useEffect(() => {
    const token = (session as any)?.djangoAccessToken;
    if (token) {
      localStorage.setItem("zaddys_access_token", token);
    }
  }, [session]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionSync />
      <CartProvider>
        {children}
      </CartProvider>
    </SessionProvider>
  );
}
