import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext"; // IMPORT THE CART

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zaddys Creamery & Grills",
  description: "Made for moments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* WRAP THE CHILDREN IN THE CART PROVIDER */}
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}