"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface User {
  id: string
  name: string
  email: string
  status: "Verified" | "Pro" | "Elite"
  totalSales: number
  totalRevenue: number
  conversionRate: number
  orders: number
  referralCode: string
  currentMonthSales: number
}

export interface Product {
  id: string
  title: string
  brand: string
  price: number
  condition: string
  status: "Live" | "Pending" | "Rejected"
  image: string
  category: string
  dateAdded: string
  tags: string[]
}

export interface Payout {
  id: string
  orderId: string
  date: string
  item: string
  buyer: string
  amount: number
  status: "Paid" | "Pending" | "Processing" | "Failed"
}

export interface Referral {
  id: string
  email: string
  status: "Pending" | "Converted"
  dateInvited: string
  dateConverted?: string
  earnings: number
}

export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  uploadDate: string
  status: "Processing" | "Completed" | "Failed"
}

interface AppState {
  user: User
  products: Product[]
  payouts: Payout[]
  referrals: Referral[]
  uploadedFiles: UploadedFile[]

  // Actions
  updateUserSales: (amount: number) => void
  addProduct: (product: Omit<Product, "id">) => void
  updateProductStatus: (id: string, status: Product["status"]) => void
  filterProducts: (filters: Partial<Product>) => Product[]
  addPayout: (payout: Omit<Payout, "id">) => void
  addReferral: (email: string) => void
  convertReferral: (id: string) => void
  addUploadedFile: (file: Omit<UploadedFile, "id">) => void
  removeUploadedFile: (id: string) => void
  checkBadgeUpgrade: () => string | null
  generateReferralCode: () => string
}

const initialUser: User = {
  id: "1",
  name: "John Seller",
  email: "john@example.com",
  status: "Pro",
  totalSales: 148,
  totalRevenue: 342330, // Progress toward Elite (500,000)
  conversionRate: 2.8,
  orders: 134,
  referralCode: "JOHN2025",
  currentMonthSales: 43700,
}

const initialProducts: Product[] = [
  {
    id: "1",
    title: "Luxury Watch",
    brand: "Rolex",
    price: 15000,
    condition: "Excellent",
    status: "Live",
    image: "/placeholder.svg?height=200&width=200",
    category: "Watches",
    dateAdded: "2025-01-15",
    tags: ["Top Pick", "Premium"],
  },
  {
    id: "2",
    title: "Designer Handbag",
    brand: "Chanel",
    price: 8500,
    condition: "Very Good",
    status: "Pending",
    image: "/placeholder.svg?height=200&width=200",
    category: "Bags",
    dateAdded: "2025-01-14",
    tags: ["Needs Update"],
  },
  {
    id: "3",
    title: "Classic Sunglasses",
    brand: "Gucci",
    price: 3200,
    condition: "Good",
    status: "Live",
    image: "/placeholder.svg?height=200&width=200",
    category: "Accessories",
    dateAdded: "2025-01-13",
    tags: [],
  },
  {
    id: "4",
    title: "Evening Dress",
    brand: "Prada",
    price: 5500,
    condition: "Excellent",
    status: "Rejected",
    image: "/placeholder.svg?height=200&width=200",
    category: "Clothing",
    dateAdded: "2025-01-12",
    tags: ["Needs Update"],
  },
]

const initialPayouts: Payout[] = [
  {
    id: "1",
    orderId: "#123456",
    date: "June 6, 2025",
    item: "Gucci Handbag",
    buyer: "@ChicCloset",
    amount: 5200,
    status: "Paid",
  },
  {
    id: "2",
    orderId: "#123455",
    date: "June 5, 2025",
    item: "Chanel Wallet",
    buyer: "@JaneDoe123",
    amount: 2750,
    status: "Pending",
  },
  {
    id: "3",
    orderId: "#123454",
    date: "June 4, 2025",
    item: "Prada Sandals",
    buyer: "@Laila8788",
    amount: 2980,
    status: "Failed",
  },
  {
    id: "4",
    orderId: "#123453",
    date: "May 28, 2025",
    item: "Dior Sunglasses",
    buyer: "@Rachid_Vee",
    amount: 1620,
    status: "Processing",
  },
]

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: initialUser,
      products: initialProducts,
      payouts: initialPayouts,
      referrals: [],
      uploadedFiles: [],

      updateUserSales: (amount: number) => {
        set((state) => {
          const newSales = state.user.currentMonthSales + amount
          const newUser = {
            ...state.user,
            currentMonthSales: newSales,
            totalRevenue: state.user.totalRevenue + amount,
            totalSales: state.user.totalSales + 1,
          }
          return { user: newUser }
        })
      },

      addProduct: (product) => {
        set((state) => ({
          products: [...state.products, { ...product, id: Date.now().toString() }],
        }))
      },

      updateProductStatus: (id: string, status: Product["status"]) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, status } : p)),
        }))
      },

      filterProducts: (filters) => {
        const { products } = get()
        return products.filter((product) => {
          return Object.entries(filters).every(([key, value]) => {
            if (!value) return true
            return product[key as keyof Product] === value
          })
        })
      },

      addPayout: (payout) => {
        set((state) => ({
          payouts: [...state.payouts, { ...payout, id: Date.now().toString() }],
        }))
      },

      addReferral: (email: string) => {
        set((state) => ({
          referrals: [
            ...state.referrals,
            {
              id: Date.now().toString(),
              email,
              status: "Pending",
              dateInvited: new Date().toISOString(),
              earnings: 0,
            },
          ],
        }))
      },

      convertReferral: (id: string) => {
        set((state) => ({
          referrals: state.referrals.map((r) =>
            r.id === id
              ? {
                  ...r,
                  status: "Converted" as const,
                  dateConverted: new Date().toISOString(),
                  earnings: 200,
                }
              : r,
          ),
        }))
      },

      addUploadedFile: (file) => {
        set((state) => ({
          uploadedFiles: [...state.uploadedFiles, { ...file, id: Date.now().toString() }],
        }))
      },

      removeUploadedFile: (id: string) => {
        set((state) => ({
          uploadedFiles: state.uploadedFiles.filter((f) => f.id !== id),
        }))
      },

      checkBadgeUpgrade: () => {
        const { user } = get()
        const badgeThresholds = {
          Verified: 0,
          Pro: 150000,
          Elite: 500000,
        }

        const currentRevenue = user.totalRevenue

        if (currentRevenue >= badgeThresholds.Elite && user.status !== "Elite") {
          set((state) => ({
            user: { ...state.user, status: "Elite" },
          }))
          return "Elite"
        } else if (currentRevenue >= badgeThresholds.Pro && user.status === "Verified") {
          set((state) => ({
            user: { ...state.user, status: "Pro" },
          }))
          return "Pro"
        }
        return null
      },

      generateReferralCode: () => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase()
        set((state) => ({
          user: { ...state.user, referralCode: code },
        }))
        return code
      },
    }),
    {
      name: "trendies-seller-storage",
    },
  ),
)
