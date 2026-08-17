"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProductIndexPage() {
  const router = useRouter();

  useEffect(() => {
    // If someone accidentally visits /product, bounce them back to the menu!
    router.replace("/");
  }, [router]);

  // Next.js wants a React component, so we give it an empty one while it redirects
  return (
    <div className="min-h-screen bg-zaddys-white flex items-center justify-center">
      <p className="font-bold text-zinc-400">Redirecting to menu...</p>
    </div>
  );
}