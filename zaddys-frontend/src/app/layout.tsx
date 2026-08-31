import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // THIS LINE FIXES THE PLAIN TEXT!
import Providers from "@/components/Providers";
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
        <Providers>
          <div className="app-content min-h-screen">
            <ThemeToggle />
            {children}
            <DockNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}