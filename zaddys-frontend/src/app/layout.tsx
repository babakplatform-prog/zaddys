import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // THIS LINE FIXES THE PLAIN TEXT!
import { CartProvider } from "@/context/CartContext";
import DockNav from "@/components/DockNav"; // BRINGS BACK THE DOCK

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
          <div className="app-content">
            {children}
            <DockNav />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}