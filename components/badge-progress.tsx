"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, TrendingUp } from "lucide-react"

interface BadgeProgressProps {
  currentRevenue: number
  currentBadge: "Verified" | "Pro" | "Elite"
  className?: string
}

const badgeThresholds = {
  Verified: 0,
  Pro: 150000,
  Elite: 500000,
}

export function BadgeProgress({ currentRevenue, currentBadge, className = "" }: BadgeProgressProps) {
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

  const getBadgeTextColor = (badge: string) => {
    switch (badge) {
      case "Elite":
        return "text-purple-800"
      case "Pro":
        return "text-blue-800"
      case "Verified":
        return "text-green-800"
      default:
        return "text-gray-800"
    }
  }

  return (
    <Card className={`bg-white border border-gray-200 shadow-sm ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-5 w-5 text-gray-600" />
              <div>
                <h3 className="text-lg font-semibold text-black">Badge Progress</h3>
                <p className="text-sm text-gray-600">
                  {nextBadge ? `Progress to ${nextBadge} status` : "You've reached the highest badge level!"}
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={`
                ${
                  currentBadge === "Elite"
                    ? "bg-purple-100 text-purple-800 border-purple-200"
                    : currentBadge === "Pro"
                      ? "bg-blue-100 text-blue-800 border-blue-200"
                      : "bg-green-100 text-green-800 border-green-200"
                }
              `}
            >
              {currentBadge}
            </Badge>
          </div>

          {/* Revenue Display */}
          <div className="text-center py-2">
            <div className="text-3xl font-bold text-black">MAD {currentRevenue.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Revenue</div>
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
                  className={`h-4 rounded-full bg-gradient-to-r transition-all duration-700 ease-out ${getBadgeColor(nextBadge || currentBadge)}`}
                  style={{ width: `${progressToNextBadge}%` }}
                ></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium text-white drop-shadow-sm">{progressToNextBadge.toFixed(1)}%</span>
              </div>
            </div>

            {/* Badge Milestones */}
            <div className="flex justify-between relative">
              {badges.map((badge, index) => (
                <div key={badge} className="flex flex-col items-center">
                  <div
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                      index <= currentBadgeIndex
                        ? `bg-gradient-to-r ${getBadgeColor(badge)} border-transparent shadow-sm`
                        : "bg-white border-gray-300"
                    }`}
                  ></div>
                  <span
                    className={`text-xs mt-1 transition-colors duration-300 ${
                      index <= currentBadgeIndex ? `font-medium ${getBadgeTextColor(badge)}` : "text-gray-500"
                    }`}
                  >
                    {badge}
                  </span>
                  <span className="text-xs text-gray-400">{badgeThresholds[badge].toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Progress Details */}
            {nextBadge && remainingRevenue > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">🎯 Next Milestone: {nextBadge} Status</p>
                    <p className="text-sm text-blue-700">Only MAD {remainingRevenue.toLocaleString()} more needed</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-blue-900">{progressToNextBadge.toFixed(1)}%</div>
                    <div className="text-xs text-blue-700">Complete</div>
                  </div>
                </div>
              </div>
            )}

            {!nextBadge && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Award className="h-6 w-6 text-purple-600" />
                  <p className="text-lg font-bold text-purple-900">🎉 Elite Status Achieved!</p>
                </div>
                <p className="text-sm text-purple-700">
                  You're now part of our top-tier seller community with exclusive benefits.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
