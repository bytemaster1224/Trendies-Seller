"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Search,
  Filter,
  Download,
  Gift,
  Users,
  TrendingUp,
  Award,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { useLoyaltyStore } from "@/lib/loyalty-store";
import { useAdminStore } from "@/lib/admin-store";

export default function AdminLoyaltyPage() {
  const { rewards, claimedRewards, pointsHistory, updateRewardStatus } =
    useLoyaltyStore();
  const { addAdminAction } = useAdminStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Filter claimed rewards
  const filteredClaimedRewards = claimedRewards.filter((claimed) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (
        !claimed.rewardName.toLowerCase().includes(searchLower) &&
        !claimed.userId.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }

    if (statusFilter === "all") {
      return true;
    }

    if (statusFilter && claimed.status !== statusFilter) {
      return false;
    }

    if (dateFilter) {
      const claimedDate = new Date(claimed.claimedAt);
      const today = new Date();
      const daysDiff = Math.floor(
        (today.getTime() - claimedDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      switch (dateFilter) {
        case "all":
          break;
        case "today":
          if (daysDiff > 0) return false;
          break;
        case "week":
          if (daysDiff > 7) return false;
          break;
        case "month":
          if (daysDiff > 30) return false;
          break;
      }
    }

    return true;
  });

  // Calculate loyalty stats
  const loyaltyStats = {
    totalRewards: rewards.length,
    totalClaimed: claimedRewards.length,
    pendingApproval: claimedRewards.filter((c) => c.status === "pending")
      .length,
    totalPointsRedeemed: claimedRewards.reduce(
      (sum, c) => sum + c.pointsCost,
      0
    ),
    totalPointsEarned: pointsHistory
      .filter((p) => p.type === "earned")
      .reduce((sum, p) => sum + p.points, 0),
  };

  const handleUpdateRewardStatus = (
    claimedRewardId: string,
    newStatus: any,
    notes?: string
  ) => {
    const claimed = claimedRewards.find((c) => c.id === claimedRewardId);
    updateRewardStatus(claimedRewardId, newStatus, notes || adminNotes);

    // Log admin action
    addAdminAction({
      type: newStatus === "approved" ? "approve_reward" : "reject_reward",
      targetId: claimedRewardId,
      reason: notes || adminNotes || `Reward ${newStatus}`,
      performedBy: "admin_user",
      metadata: {
        rewardName: claimed?.rewardName,
        userId: claimed?.userId,
        username: claimed?.username,
        pointsCost: claimed?.pointsCost,
      },
    });

    setAdminNotes("");
    setSelectedReward(null);
    showNotification(`Reward ${newStatus} successfully`, "success");
  };

  const handleBulkApprove = () => {
    const pendingRewards = filteredClaimedRewards.filter(
      (r) => r.status === "pending"
    );
    pendingRewards.forEach((reward) => {
      updateRewardStatus(reward.id, "approved", "Bulk approved by admin");
      addAdminAction({
        type: "approve_reward",
        targetId: reward.id,
        reason: "Bulk approved by admin",
        performedBy: "admin_user",
        metadata: {
          rewardName: reward.rewardName,
          userId: reward.userId,
          username: reward.username,
          pointsCost: reward.pointsCost,
        },
      });
    });
    showNotification(`Approved ${pendingRewards.length} rewards`, "success");
  };

  const exportData = () => {
    const csvContent = [
      [
        "User ID",
        "User Name",
        "Reward Name",
        "Points Cost",
        "Status",
        "Claimed Date",
        "Admin Notes",
      ].join(","),
      ...filteredClaimedRewards.map((claimed) =>
        [
          claimed.userId,
          claimed.username,
          claimed.rewardName,
          claimed.pointsCost,
          claimed.status,
          claimed.claimedAt,
          claimed.adminNotes || "",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "loyalty_rewards_data.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "delivered":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">Loyalty Management</h1>
          <p className="text-gray-600 text-sm">
            Monitor and manage loyalty rewards and points system
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleBulkApprove} variant="outline">
            <CheckCircle className="h-4 w-4 mr-2" />
            Bulk Approve
          </Button>
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Gift className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-black">
                  {loyaltyStats.totalRewards}
                </div>
                <div className="text-sm text-gray-600">Available Rewards</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold text-black">
                  {loyaltyStats.totalClaimed}
                </div>
                <div className="text-sm text-gray-600">Total Claimed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {loyaltyStats.pendingApproval}
                </div>
                <div className="text-sm text-gray-600">Pending Approval</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {loyaltyStats.totalPointsEarned.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Points Earned</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Award className="h-8 w-8 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {loyaltyStats.totalPointsRedeemed.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Points Redeemed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="claimed-rewards" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="claimed-rewards">Claimed Rewards</TabsTrigger>
          <TabsTrigger value="reward-catalog">Reward Catalog</TabsTrigger>
          <TabsTrigger value="points-activity">Points Activity</TabsTrigger>
        </TabsList>

        {/* Claimed Rewards Management */}
        <TabsContent value="claimed-rewards" className="space-y-6">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Claimed Rewards Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filters */}
                <div className="flex gap-4 flex-wrap">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search rewards, users..."
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
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-[140px] h-9 text-sm border-gray-200">
                      <SelectValue placeholder="Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Results */}
                <div className="text-sm text-gray-600">
                  Showing {filteredClaimedRewards.length} of{" "}
                  {claimedRewards.length} claimed rewards
                </div>

                {/* Claimed Rewards List */}
                <div className="space-y-4">
                  {filteredClaimedRewards.map((claimed) => (
                    <Card key={claimed.id} className="border border-gray-100">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Gift className="h-8 w-8 text-blue-500" />
                            <div>
                              <h3 className="font-semibold text-black">
                                {claimed.rewardName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                User: {claimed.username}
                              </p>
                              <p className="text-sm text-gray-600">
                                Claimed:{" "}
                                {new Date(
                                  claimed.claimedAt
                                ).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-600">
                                Cost: {claimed.pointsCost.toLocaleString()}{" "}
                                points
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge className={getStatusColor(claimed.status)}>
                              {claimed.status}
                            </Badge>
                            {getStatusIcon(claimed.status)}
                            <div className="flex space-x-2">
                              {claimed.status === "pending" && (
                                <>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          setSelectedReward(claimed.id)
                                        }
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                      >
                                        Approve
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>
                                          Approve Reward: {claimed.rewardName}
                                        </DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div>
                                          <Label htmlFor="adminNotes">
                                            Admin Notes (Optional)
                                          </Label>
                                          <Textarea
                                            id="adminNotes"
                                            value={adminNotes}
                                            onChange={(e) =>
                                              setAdminNotes(e.target.value)
                                            }
                                            placeholder="Add any notes about this approval..."
                                            className="mt-1"
                                          />
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                          <Button
                                            variant="outline"
                                            onClick={() => setAdminNotes("")}
                                          >
                                            Cancel
                                          </Button>
                                          <Button
                                            onClick={() =>
                                              handleUpdateRewardStatus(
                                                claimed.id,
                                                "approved"
                                              )
                                            }
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                          >
                                            Approve Reward
                                          </Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          setSelectedReward(claimed.id)
                                        }
                                      >
                                        Reject
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>
                                          Reject Reward: {claimed.rewardName}
                                        </DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div>
                                          <Label htmlFor="adminNotes">
                                            Reason for Rejection
                                          </Label>
                                          <Textarea
                                            id="adminNotes"
                                            value={adminNotes}
                                            onChange={(e) =>
                                              setAdminNotes(e.target.value)
                                            }
                                            placeholder="Enter reason for rejecting this reward..."
                                            className="mt-1"
                                            required
                                          />
                                        </div>
                                        <div className="flex justify-end space-x-2">
                                          <Button
                                            variant="outline"
                                            onClick={() => setAdminNotes("")}
                                          >
                                            Cancel
                                          </Button>
                                          <Button
                                            onClick={() =>
                                              handleUpdateRewardStatus(
                                                claimed.id,
                                                "cancelled"
                                              )
                                            }
                                            className="bg-red-600 hover:bg-red-700 text-white"
                                          >
                                            Reject Reward
                                          </Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </>
                              )}
                              {claimed.status === "approved" && (
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleUpdateRewardStatus(
                                      claimed.id,
                                      "delivered",
                                      "Delivered to user"
                                    )
                                  }
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  Mark Delivered
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        {claimed.adminNotes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <strong>Admin Notes:</strong> {claimed.adminNotes}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {filteredClaimedRewards.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No claimed rewards match your search criteria.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reward Catalog */}
        <TabsContent value="reward-catalog" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => (
              <Card
                key={reward.id}
                className="bg-white border border-gray-200 shadow-sm"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{reward.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {reward.description}
                      </p>
                    </div>
                    <Badge variant={reward.isActive ? "default" : "secondary"}>
                      {reward.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Cost:</span>
                      <span className="font-semibold">
                        {reward.pointsCost.toLocaleString()} points
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Category:</span>
                      <span className="text-sm">{reward.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Times Claimed:
                      </span>
                      <span className="text-sm">
                        {
                          claimedRewards.filter((c) => c.rewardId === reward.id)
                            .length
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Points Activity */}
        <TabsContent value="points-activity" className="space-y-6">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Recent Points Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pointsHistory.slice(0, 20).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          transaction.type === "earned"
                            ? "bg-green-100"
                            : "bg-red-100"
                        }`}
                      >
                        {transaction.type === "earned" ? (
                          <Award className="h-4 w-4 text-green-600" />
                        ) : (
                          <Gift className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-black">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-600">
                          User: {transaction.userId} •{" "}
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        transaction.points > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.points > 0 ? "+" : ""}
                      {transaction.points.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
