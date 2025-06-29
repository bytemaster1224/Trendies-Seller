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

export const mockUser: User = {
  id: "1",
  name: "John Seller",
  email: "john@example.com",
  status: "Pro",
  totalSales: 148,
  totalRevenue: 72450,
  conversionRate: 2.8,
  orders: 134,
  referralCode: "JOHN2025",
}

export const mockProducts: Product[] = [
  {
    id: "1",
    title: "Luxury Watch",
    brand: "Rolex",
    price: 15000,
    condition: "Excellent",
    status: "Live",
    image: "/placeholder.svg?height=200&width=200",
    category: "Watches",
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
  },
]

export const mockPayouts: Payout[] = [
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
]

// Simulated Brevo email function
export async function sendBrevoEmail(to: string, subject: string, content: string) {
  console.log("Sending email via Brevo:", { to, subject, content })
  // In a real implementation, this would call the Brevo API
  return { success: true, messageId: "mock-message-id" }
}

// Simulate badge upgrade
export function checkBadgeUpgrade(currentSales: number, currentStatus: string) {
  if (currentSales >= 100000 && currentStatus !== "Elite") {
    return "Elite"
  } else if (currentSales >= 50000 && currentStatus === "Verified") {
    return "Pro"
  }
  return currentStatus
}
