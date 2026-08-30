import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // THIS LINE FIXES THE PLAIN TEXT!
import { CartProvider } from "@/context/CartContext";
import DockNav from "@/components/DockNav"; // BRINGS BACK THE DOCK
import ThemeToggle from "@/components/ThemeToggle";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zaddys Creamery & Grills",
  description: "Made for moments.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <div className="app-content min-h-screen">
            <div className="pointer-events-none fixed left-1/2 top-2 z-[60] -translate-x-1/2">
              <Image src="/zaddys-logo.PNG" alt="Zaddy's Creamery and Grills" width={120} height={54} className="h-10 w-auto object-contain" priority />
            </div>
            <ThemeToggle />
            {children}
            <DockNav />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}