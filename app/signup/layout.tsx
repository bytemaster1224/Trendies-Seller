import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trendies Seller Pro Dashboard",
  description: "Manage your seller profile, listings, payouts and performance",
};

export default function SignupLayout({ children }: { children: ReactNode }) {
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
          <main className="flex-1 w-full mx-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
