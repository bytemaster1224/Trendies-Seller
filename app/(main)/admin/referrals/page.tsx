"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Filter, Download, Users, TrendingUp, Award, Mail } from "lucide-react"
import { useReferralStore } from "@/lib/referral-store"

export default function AdminReferralsPage() {
  const { getAdminStats, referralInvites, allUsers, referralCodes } = useReferralStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")

  const adminStats = getAdminStats()

  // Filter invites based on search and filters
  const filteredInvites = referralInvites.filter((invite) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      if (
        !invite.inviterEmail.toLowerCase().includes(searchLower) &&
        !invite.inviteeEmail.toLowerCase().includes(searchLower) &&
        !invite.referralCode.toLowerCase().includes(searchLower)
      ) {
        return false
      }
    }

    if (statusFilter && invite.status !== statusFilter) {
      return false
    }

    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "converted":
        return "bg-green-100 text-green-800"
      case "verified":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "expired":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const exportData = () => {
    const csvContent = [
      ["Inviter Email", "Invitee Email", "Referral Code", "Status", "Sent Date", "Converted Date", "Rewards"].join(","),
      ...filteredInvites.map((invite) =>
        [
          invite.inviterEmail,
          invite.inviteeEmail,
          invite.referralCode,
          invite.status,
          invite.sentAt,
          invite.convertedAt || "",
          invite.rewards,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "referral_data.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Referral Management</h1>
          <p className="text-gray-600 text-sm">Monitor and manage all referral activities across the platform</p>
        </div>
        <Button onClick={exportData} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-black">{adminStats.totalCodes}</div>
                <div className="text-sm text-gray-600">Active Codes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Mail className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold text-black">{adminStats.totalInvites}</div>
                <div className="text-sm text-gray-600">Total Invites</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-600">{adminStats.totalConversions}</div>
                <div className="text-sm text-gray-600">Conversions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Award className="h-8 w-8 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">MAD {adminStats.totalRewards}</div>
                <div className="text-sm text-gray-600">Total Rewards</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{adminStats.conversionRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Conversion Rate</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Referrers */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Top Referrers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {adminStats.topReferrers.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-black">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-black">MAD {user.totalRewards}</p>
                  <p className="text-sm text-gray-600">
                    {user.convertedInvites}/{user.totalInvites} converted
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Referral Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex gap-4 flex-wrap">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search emails, codes..."
                  className="pl-10 h-9 text-sm border-gray-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-9 text-sm border-gray-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[140px] h-9 text-sm border-gray-200">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-600">
              Showing {filteredInvites.length} of {referralInvites.length} referrals
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Inviter</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Invitee</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Code</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Sent Date</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">Rewards</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvites.map((invite) => (
                    <tr key={invite.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 text-sm text-black">{invite.inviterEmail}</td>
                      <td className="py-3 text-sm text-black">{invite.inviteeEmail}</td>
                      <td className="py-3 text-sm font-mono text-gray-600">{invite.referralCode}</td>
                      <td className="py-3">
                        <Badge className={getStatusColor(invite.status)}>{invite.status}</Badge>
                      </td>
                      <td className="py-3 text-sm text-gray-600">{new Date(invite.sentAt).toLocaleDateString()}</td>
                      <td className="py-3 text-sm font-medium text-black">
                        {invite.rewards > 0 ? `MAD ${invite.rewards}` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredInvites.length === 0 && (
              <div className="text-center py-8 text-gray-500">No referrals match your search criteria.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
