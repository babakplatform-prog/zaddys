import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased font-sans bg-zaddys-black text-zaddys-white">
        {children}
      </body>
    </html>
  );
}
