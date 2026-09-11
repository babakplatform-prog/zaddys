"use client";
import { SessionProvider, useSession } from "next-auth/react";
import { CartProvider } from "@/context/CartContext";
import { useEffect } from "react";

function SessionSync() {
  const { data: session } = useSession();
  
  useEffect(() => {
    const token = session?.djangoAccessToken;
    if (token) {
      localStorage.setItem("zaddys_access_token", token);
      if (session?.djangoRefreshToken) {
        localStorage.setItem("zaddys_refresh_token", session.djangoRefreshToken);
      }
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
