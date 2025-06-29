import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MainLayout } from "@/components/layout/main-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trendies Seller Pro Dashboard",
  description: "Manage your seller profile, listings, payouts and performance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </head>
      <body
        className={
          `${inter.className} bg-background text-foreground antialiased min-h-screen` +
          " selection:bg-primary/20"
        }
        style={{
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          minHeight: "100vh",
        }}
      >
        <div className="min-h-screen flex flex-col">
          <MainLayout>
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              {children}
            </main>
          </MainLayout>
        </div>
      </body>
    </html>
  );
}
