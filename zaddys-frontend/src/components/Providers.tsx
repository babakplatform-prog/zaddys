"use client";
import { SessionProvider, useSession } from "next-auth/react";
import { CartProvider } from "@/context/CartContext";
import { useEffect } from "react";

function SessionSync() {
  const { data: session } = useSession();
  
  useEffect(() => {
    const sessionData = session as any;
    const token = sessionData?.djangoAccessToken;
    if (token) {
      localStorage.setItem("zaddys_access_token", token);
      if (sessionData?.djangoRefreshToken) {
        localStorage.setItem("zaddys_refresh_token", sessionData.djangoRefreshToken);
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
