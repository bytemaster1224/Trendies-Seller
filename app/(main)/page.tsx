"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Award } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { BrevoEmailService } from "@/lib/email-service"

const badgeThresholds = {
  Verified: 0,
  Pro: 150000,
  Elite: 500000,
}

const topSellers = [
  { rank: 1, username: "@CasablancaChic", revenue: 58300 },
  { rank: 2, username: "@LuxeLoop", revenue: 52700 },
  { rank: 3, username: "@VintageVibe", revenue: 47500 },
  { rank: 4, username: "@UrbanElegance", revenue: 43800 },
  { rank: 5, username: "@GoldenThread", revenue: 39200 },
]

export default function Dashboard() {
  const { user, products, payouts, updateUserSales, checkBadgeUpgrade } = useAppStore()
  const [showBadgeUpgrade, setShowBadgeUpgrade] = useState(false)
  const emailService = BrevoEmailService.getInstance()

  // Calculate real-time stats
  const activeListings = products.filter((p) => p.status === "Live").length
  const pendingListings = products.filter((p) => p.status === "Pending").length
  const returns = payouts.filter((p) => p.status === "Failed").length
  const bidsOnHold = products.filter((p) => p.tags.includes("Needs Update")).length

  const dashboardStats = [
    {
      title: "Total Sales",
      value: user.totalSales.toString(),
      change: "+12% vs last month",
      isPositive: true,
    },
    {
      title: "Total Revenue",
      value: `MAD ${user.totalRevenue.toLocaleString()}`,
      change: "+8.5% vs last month",
      isPositive: true,
    },
    {
      title: "Conversion rate",
      value: `${user.conversionRate}%`,
      change: "+0.24% vs last month",
      isPositive: true,
    },
    {
      title: "Orders",
      value: user.orders.toString(),
      change: "+1% vs last month",
      isPositive: true,
    },
  ]

  const performanceStats = [
    {
      title: "Returns",
      value: returns.toString(),
      change: "+20% vs last month",
      isPositive: false,
    },
    {
      title: "Listings Active",
      value: activeListings.toString(),
      change: "+5% vs last month",
      isPositive: true,
    },
    {
      title: "Listings in Progress",
      value: pendingListings.toString(),
      change: "+30% vs last month",
      isPositive: true,
    },
    {
      title: "Bids on hold",
      value: bidsOnHold.toString(),
      change: "+5% vs last month",
      isPositive: true,
    },
  ]

  // Badge progress calculations
  const currentRevenue = user.totalRevenue
  const currentBadge = user.status
  const badges = Object.keys(badgeThresholds) as Array<keyof typeof badgeThresholds>
  const currentBadgeIndex = badges.indexOf(currentBadge)
  const nextBadge = currentBadgeIndex < badges.length - 1 ? badges[currentBadgeIndex + 1] : null
  const nextBadgeThreshold = nextBadge ? badgeThresholds[nextBadge] : badgeThresholds.Elite

  const progressToNextBadge = nextBadge ? Math.min((currentRevenue / nextBadgeThreshold) * 100, 100) : 100

  const remainingRevenue = nextBadge ? Math.max(nextBadgeThreshold - currentRevenue, 0) : 0

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "Elite":
        return "from-purple-500 to-purple-700"
      case "Pro":
        return "from-blue-500 to-blue-700"
      case "Verified":
        return "from-green-500 to-green-700"
      default:
        return "from-gray-500 to-gray-700"
    }
  }

  // Simulate a sale and check for badge upgrade
  const simulateSale = async () => {
    const saleAmount = Math.floor(Math.random() * 5000) + 1000
    updateUserSales(saleAmount)

    // Check for badge upgrade
    const newBadge = checkBadgeUpgrade()
    if (newBadge) {
      setShowBadgeUpgrade(true)

      // Send badge upgrade email
      const emailTemplate = BrevoEmailService.createBadgeUpgradeEmail(user.email, newBadge)
      await emailService.sendEmail(emailTemplate)

      setTimeout(() => setShowBadgeUpgrade(false), 5000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Badge Upgrade Notification */}
      {showBadgeUpgrade && (
        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Award className="h-6 w-6 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-800">Congratulations! Badge Upgraded!</h3>
                <p className="text-sm text-yellow-700">You've been upgraded to {user.status} status!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Header with Progress Bar */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-black">Dashboard</h1>
              <Badge
                variant="secondary"
                className={`
                  ${
                    user.status === "Elite"
                      ? "bg-purple-100 text-purple-800 border-purple-200"
                      : user.status === "Pro"
                        ? "bg-blue-100 text-blue-800 border-blue-200"
                        : "bg-green-100 text-green-800 border-green-200"
                  }
                `}
              >
                {user.status}
              </Badge>
            </div>
            <p className="text-gray-600 text-sm">
              View a summary of your sales, listings, payouts and overall performance - all in one place.
            </p>
          </div>
          <Button onClick={simulateSale} className="bg-green-600 hover:bg-green-700">
            Simulate Sale
          </Button>
        </div>

        {/* Badge Progress Section */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-black">Badge Progress</h3>
                  <p className="text-sm text-gray-600">
                    {nextBadge ? `Progress to ${nextBadge} status` : "You've reached the highest badge level!"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-black">MAD {currentRevenue.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Current Revenue</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {currentBadge}: MAD {badgeThresholds[currentBadge].toLocaleString()}
                  </span>
                  {nextBadge && (
                    <span className="text-gray-600">
                      {nextBadge}: MAD {nextBadgeThreshold.toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full bg-gradient-to-r transition-all duration-500 ${getBadgeColor(nextBadge || currentBadge)}`}
                      style={{ width: `${progressToNextBadge}%` }}
                    ></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-white drop-shadow-sm">
                      {progressToNextBadge.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Badge Milestones */}
                <div className="flex justify-between relative">
                  {badges.map((badge, index) => (
                    <div key={badge} className="flex flex-col items-center">
                      <div
                        className={`w-4 h-4 rounded-full border-2 ${
                          index <= currentBadgeIndex
                            ? `bg-gradient-to-r ${getBadgeColor(badge)} border-transparent`
                            : "bg-white border-gray-300"
                        }`}
                      ></div>
                      <span
                        className={`text-xs mt-1 ${
                          index <= currentBadgeIndex ? "text-black font-medium" : "text-gray-500"
                        }`}
                      >
                        {badge}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Progress Details */}
                {nextBadge && remainingRevenue > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-900">Next Milestone: {nextBadge} Status</p>
                        <p className="text-sm text-blue-700">
                          Only MAD {remainingRevenue.toLocaleString()} more needed
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-900">{progressToNextBadge.toFixed(1)}%</div>
                        <div className="text-xs text-blue-700">Complete</div>
                      </div>
                    </div>
                  </div>
                )}

                {!nextBadge && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Award className="h-5 w-5 text-purple-600" />
                      <p className="text-sm font-medium text-purple-900">
                        🎉 Congratulations! You've achieved Elite status!
                      </p>
                    </div>
                    <p className="text-sm text-purple-700 mt-1">You're now part of our top-tier seller community.</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat) => (
          <Card key={stat.title} className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-black">{stat.value}</p>
                <div className="flex items-center text-sm text-gray-600">
                  {stat.isPositive ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  {stat.change}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceStats.map((stat) => (
          <Card key={stat.title} className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-black">{stat.value}</p>
                <div className="flex items-center text-sm text-gray-600">
                  {stat.isPositive ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  {stat.change}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Sellers */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-black">Top 5 Pro Sellers - June 2025</h3>
              <p className="text-sm text-gray-600 mt-1">
                Discover the top performing professional sellers based on total monthly revenue. Rankings are updated
                regularly to highlight the most successful contributors to our marketplace.
              </p>
            </div>

            <div className="space-y-4">
              {/* Header */}
              <div className="grid grid-cols-3 gap-4 pb-3 border-b border-gray-100">
                <div className="text-sm font-medium text-gray-600">Rank</div>
                <div className="text-sm font-medium text-gray-600">Seller</div>
                <div className="text-sm font-medium text-gray-600">Revenue (MAD)</div>
              </div>

              {/* Sellers List */}
              {topSellers.map((seller) => (
                <div key={seller.rank} className="grid grid-cols-3 gap-4 items-center py-2">
                  <div className="text-sm font-medium text-black">{seller.rank}</div>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                        {seller.username.slice(1, 3).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-black">{seller.username}</span>
                  </div>
                  <div className="text-sm font-medium text-black">{seller.revenue.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
