"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Heart,
  Bell,
  Calendar,
  User,
  LogOut,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  Instagram,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigation = [
  { name: "All", href: "#" },
  { name: "Watches", href: "#" },
  { name: "Jewellery", href: "#" },
  { name: "Bags", href: "#" },
  { name: "Shoes", href: "#" },
  { name: "Accessories", href: "#" },
];

const sidebarNavigation = [
  { name: "Dashboard", href: "/" },
  { name: "My listings", href: "/listings" },
  { name: "Payouts", href: "/payouts" },
  { name: "Catalog Import", href: "/catalog" },
  { name: "Bonuses", href: "/bonuses" },
  { name: "Referrals", href: "/referrals" },
  { name: "Loyalty Rewards", href: "/loyalty" },
  { name: "Admin Referrals", href: "/admin/referrals" },
  { name: "Admin Loyalty", href: "/admin/loyalty" },
];

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const [language, setLanguage] = useState("EN");

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-2xl font-bold text-black tracking-tight">
                trendies
              </span>
              <div className="ml-3 bg-black text-white px-2 py-1 text-xs font-medium tracking-wide">
                SELLER PRO
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-6">
              <Button
                variant="outline"
                size="sm"
                className="bg-black text-white border-black hover:bg-gray-800 text-xs font-medium px-4 py-2"
              >
                SELL WITH US
              </Button>

              {/* Language Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-1 text-sm text-gray-600 hover:text-black">
                  <span>{language}</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setLanguage("EN")}>
                    EN
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("FR")}>
                    FR
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center space-x-4">
                <Heart className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                <Bell className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                <Calendar className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                <User className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                <LogOut className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation and Search bar */}
        <div className="px-6 pb-4 flex items-center justify-between">
          {/* Navigation moved to left */}
          <nav className="flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-black text-sm font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search bar moved to right */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-10 w-full border-gray-200 text-sm h-9"
            />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-100 min-h-screen">
          <nav className="p-6 space-y-1">
            {sidebarNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 text-sm font-medium rounded-none ${
                    isActive
                      ? "text-black bg-gray-50"
                      : "text-gray-600 hover:text-black hover:bg-gray-50"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 bg-gray-50">
          <div className="p-6">{children}</div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-1">
              <div className="flex items-center mb-6">
                <span className="text-2xl font-bold tracking-tight">
                  trendies
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-gray-300">
                Customer Care
              </h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Support Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Authenticity
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Shipping Information
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Returns
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Consignment
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Sustainability
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    My Privacy Choices
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Refer a Friend
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-gray-300">
                Company
              </h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    About us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Team
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Press
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Investor
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Partners
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Social Impact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Business Sellers
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-gray-300">
                Legal & Policies
              </h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Consignor Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Accessibility
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-gray-300">
                Follow Us
              </h3>
              <div className="flex space-x-4">
                <Facebook className="w-6 h-6 text-gray-400 hover:text-blue-500 cursor-pointer transition-colors" />
                <Twitter className="w-6 h-6 text-gray-400 hover:text-blue-400 cursor-pointer transition-colors" />
                <Youtube className="w-6 h-6 text-gray-400 hover:text-red-500 cursor-pointer transition-colors" />
                <Instagram className="w-6 h-6 text-gray-400 hover:text-pink-500 cursor-pointer transition-colors" />
                <Linkedin className="w-6 h-6 text-gray-400 hover:text-blue-600 cursor-pointer transition-colors" />
                {/* TikTok placeholder */}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
            © 2025 Trendies Maroc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
