"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ZaddysLoader from "@/components/ZaddysLoader";

export default function SocialAuthCompletePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    const sessionData = session as any;
    if (status === "loading") return;
    if (!sessionData?.djangoAccessToken) {
      router.replace("/auth?error=social-login");
      return;
    }

    localStorage.setItem("zaddys_access_token", sessionData.djangoAccessToken);
    const returnPath = sessionStorage.getItem("zaddys_auth_return") || "/profile";
    sessionStorage.removeItem("zaddys_auth_return");
    router.replace(returnPath);
  }, [router, session, status]);

  return <ZaddysLoader />;
}
