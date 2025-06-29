"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useAppStore } from "@/lib/store";

// Mock upcoming payouts data
const upcomingPayouts = [
  {
    id: "upcoming_1",
    orderId: "#123460",
    estimatedDate: "June 15, 2025",
    item: "Hermès Scarf",
    buyer: "@LuxuryLover",
    amount: 1850,
    status: "Processing",
  },
  {
    id: "upcoming_2",
    orderId: "#123461",
    estimatedDate: "June 18, 2025",
    item: "Cartier Watch",
    buyer: "@TimeCollector",
    amount: 12500,
    status: "Pending Verification",
  },
  {
    id: "upcoming_3",
    orderId: "#123462",
    estimatedDate: "June 20, 2025",
    item: "Louis Vuitton Wallet",
    buyer: "@StyleIcon",
    amount: 950,
    status: "Awaiting Shipment",
  },
];

export default function Payouts() {
  const { payouts } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Separate completed and upcoming payouts
  const completedPayouts = payouts.filter((p) => p.status === "Paid");
  const allPayouts = [...payouts];

  // Calculate payout summary
  const payoutSummary = useMemo(() => {
    const totalBalance = allPayouts.reduce((sum, p) => sum + p.amount, 0);
    const pending = allPayouts
      .filter((p) => p.status === "Pending")
      .reduce((sum, p) => sum + p.amount, 0);
    const processing = allPayouts
      .filter((p) => p.status === "Processing")
      .reduce((sum, p) => sum + p.amount, 0);
    const paid = completedPayouts.reduce((sum, p) => sum + p.amount, 0);
    const failed = allPayouts
      .filter((p) => p.status === "Failed")
      .reduce((sum, p) => sum + p.amount, 0);

    return [
      { title: "Total Balance", amount: totalBalance, color: "text-black" },
      { title: "Completed", amount: paid, color: "text-green-600" },
      { title: "Pending", amount: pending, color: "text-yellow-600" },
      { title: "Processing", amount: processing, color: "text-blue-600" },
      { title: "Failed/Returned", amount: failed, color: "text-red-600" },
    ];
  }, [payouts, completedPayouts]);

  // Filter payouts based on search and filters
  const filteredPayouts = useMemo(() => {
    return allPayouts.filter((payout) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (
          !payout.orderId.toLowerCase().includes(searchLower) &&
          !payout.item.toLowerCase().includes(searchLower) &&
          !payout.buyer.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Status filter
      if (statusFilter === "All") {
        // If "All" is selected, include all statuses
        return true;
      } else if (statusFilter && payout.status !== statusFilter) {
        return false; // Filter out non-matching statuses
      }

      // Date filter (simplified - in real app would use proper date filtering)
      if (dateFilter) {
        const payoutDate = new Date(payout.date);
        const now = new Date();

        switch (dateFilter) {
          case "all":
            return true; // No date filter applied
          case "last-week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (payoutDate < weekAgo) return false;
            break;
          case "last-month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            if (payoutDate < monthAgo) return false;
            break;
          case "last-3-months":
            const threeMonthsAgo = new Date(
              now.getTime() - 90 * 24 * 60 * 60 * 1000
            );
            if (payoutDate < threeMonthsAgo) return false;
            break;
        }
      }

      return true;
    });
  }, [searchTerm, statusFilter, dateFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      case "Pending Verification":
        return "bg-orange-100 text-orange-800";
      case "Awaiting Shipment":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-black">Payouts</h1>
        <p className="text-gray-600 text-sm">
          View your earnings and track payout status for sold items.
        </p>
      </div>

      {/* Payout Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {payoutSummary.map((item) => (
          <Card
            key={item.title}
            className="bg-white border border-gray-200 shadow-sm"
          >
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">
                  {item.title}
                </p>
                <p className={`text-xl font-bold ${item.color}`}>
                  MAD {item.amount.toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming Payouts */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-purple-700">
            Upcoming Payouts (Estimated)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Estimated payouts based on current orders in progress
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 text-sm font-medium text-gray-600">
                      Order #
                    </th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">
                      Est. Date
                    </th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">
                      Item
                    </th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">
                      Buyer
                    </th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">
                      Amount (MAD)
                    </th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingPayouts.map((payout) => (
                    <tr
                      key={payout.id}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      <td className="py-3 text-sm font-medium text-black">
                        {payout.orderId}
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {payout.estimatedDate}
                      </td>
                      <td className="py-3 text-sm text-black">{payout.item}</td>
                      <td className="py-3 text-sm text-gray-600">
                        {payout.buyer}
                      </td>
                      <td className="py-3 text-sm font-medium text-black">
                        MAD {payout.amount.toLocaleString()}
                      </td>
                      <td className="py-3">
                        <Badge className={getStatusColor(payout.status)}>
                          {payout.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Payouts History */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-black">
              All Payout History
            </h3>
            {/* Search and Filters */}
            <div className="flex gap-4 flex-wrap">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search orders, items, buyers..."
                  className="pl-10 h-9 text-sm border-gray-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[140px] h-9 text-sm border-gray-200">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="last-week">Last Week</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-9 text-sm border-gray-200">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Results count */}
            <div className="text-sm text-gray-600">
              Showing {filteredPayouts.length} of {allPayouts.length} payouts
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 text-sm font-medium text-gray-600">
                      Order #
                    </th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">
                      Date
                    </th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">
                      Item sold
                    </th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">
                      Buyer
                    </th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">
                      Amount (MAD)
                    </th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayouts.map((payout) => (
                    <tr
                      key={payout.id}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      <td className="py-3 text-sm font-medium text-black">
                        {payout.orderId}
                      </td>
                      <td className="py-3 text-sm text-gray-600">
                        {payout.date}
                      </td>
                      <td className="py-3 text-sm text-black">{payout.item}</td>
                      <td className="py-3 text-sm text-gray-600">
                        {payout.buyer}
                      </td>
                      <td className="py-3 text-sm font-medium text-black">
                        MAD {payout.amount.toLocaleString()}
                      </td>
                      <td className="py-3">
                        <Badge className={getStatusColor(payout.status)}>
                          {payout.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredPayouts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No payouts match your search criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
