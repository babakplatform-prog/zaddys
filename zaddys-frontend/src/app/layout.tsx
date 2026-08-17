import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "Zaddys Creamery & Grills",
  description: "Made for moments.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-zaddys-white text-zaddys-black">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}