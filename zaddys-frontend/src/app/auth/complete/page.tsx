"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ZaddysLoader from "@/components/ZaddysLoader";

export default function SocialAuthCompletePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.djangoAccessToken) {
      router.replace("/auth?error=social-login");
      return;
    }

    localStorage.setItem("zaddys_access_token", session.djangoAccessToken);
    const returnPath = sessionStorage.getItem("zaddys_auth_return") || "/profile";
    sessionStorage.removeItem("zaddys_auth_return");
    router.replace(returnPath);
  }, [router, session, status]);

  return <ZaddysLoader />;
}
