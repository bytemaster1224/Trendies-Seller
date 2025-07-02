"use client";

import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Filter,
  Download,
  Users,
  TrendingUp,
  Award,
  Mail,
  Ban,
  Shield,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { useReferralStore } from "@/lib/referral-store";
import { useAdminStore } from "@/lib/admin-store";
import { Label } from "@/components/ui/label";

export default function AdminReferralsPage() {
  const { getAdminReferralStats, referralInvites, allUsers, referralCodes } =
    useReferralStore();
  const {
    blockReferral,
    unblockReferral,
    banUser,
    unbanUser,
    isReferralBlocked,
    isUserBanned,
    blockedReferrals,
    bannedUsers,
  } = useAdminStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [banReason, setBanReason] = useState("");
  const [selectedReferral, setSelectedReferral] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    email: string;
  } | null>(null);

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const adminStats = getAdminReferralStats();

  // Filter invites based on search and filters
  const filteredInvites = referralInvites.filter((invite) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      if (
        !invite.inviterEmail.toLowerCase().includes(searchLower) &&
        !invite.inviteeEmail.toLowerCase().includes(searchLower) &&
        !invite.referralCode.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    if (statusFilter === "all") {
      return true;
    }
    if (statusFilter && invite.status !== statusFilter) {
      return false;
    }

    if (userFilter) {
      const userLower = userFilter.toLowerCase();
      if (
        !invite.inviterEmail.toLowerCase().includes(userLower) &&
        !invite.inviteeEmail.toLowerCase().includes(userLower)
      ) {
        return false;
      }
    }

    if (dateFilter) {
      const inviteDate = new Date(invite.sentAt);
      const today = new Date();
      const daysDiff = Math.floor(
        (today.getTime() - inviteDate.getTime()) / (1000 * 60 * 60 * 24)
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

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleBlockReferral = (referralId: string) => {
    if (!blockReason.trim()) {
      showNotification("Please provide a reason for blocking", "error");
      return;
    }

    blockReferral(referralId, blockReason, "admin_user");
    setBlockReason("");
    setSelectedReferral(null);
    showNotification("Referral blocked successfully", "success");
  };

  const handleUnblockReferral = (referralId: string) => {
    unblockReferral(referralId, "admin_user");
    showNotification("Referral unblocked successfully", "success");
  };

  const handleBanUser = (userId: string, userEmail: string) => {
    if (!banReason.trim()) {
      showNotification("Please provide a reason for banning", "error");
      return;
    }

    banUser(userId, userEmail, banReason, "admin_user");
    setBanReason("");
    setSelectedUser(null);
    showNotification("User banned successfully", "success");
  };

  const handleUnbanUser = (userId: string) => {
    unbanUser(userId, "admin_user");
    showNotification("User unbanned successfully", "success");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "converted":
        return "bg-green-100 text-green-800";
      case "verified":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const exportData = () => {
    const csvContent = [
      [
        "Inviter Email",
        "Invitee Email",
        "Referral Code",
        "Status",
        "Sent Date",
        "Converted Date",
        "Rewards",
        "Blocked",
      ].join(","),
      ...filteredInvites.map((invite) =>
        [
          invite.inviterEmail,
          invite.inviteeEmail,
          invite.referralCode,
          invite.status,
          invite.sentAt,
          invite.convertedAt || "",
          invite.rewards,
          isReferralBlocked(invite.id) ? "Yes" : "No",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "referral_data.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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
          <h1 className="text-2xl font-bold text-black">Referral Management</h1>
          <p className="text-gray-600 text-sm">
            Monitor and manage all referral activities across the platform
          </p>
        </div>
        <Button onClick={exportData} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-black">
                  {adminStats.totalCodes}
                </div>
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
                <div className="text-2xl font-bold text-black">
                  {adminStats.totalInvites}
                </div>
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
                <div className="text-2xl font-bold text-green-600">
                  {adminStats.totalConversions}
                </div>
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
                <div className="text-2xl font-bold text-yellow-600">
                  MAD {adminStats.totalRewards}
                </div>
                <div className="text-sm text-gray-600">Total Rewards</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {blockedReferrals.length}
                </div>
                <div className="text-sm text-gray-600">Blocked</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {adminStats.conversionRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Conversion Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Banned Users Alert */}
      {bannedUsers.filter((u) => u.isActive).length > 0 && (
        <Card className="bg-red-50 border border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-red-800">
                {bannedUsers.filter((u) => u.isActive).length} Banned Users
              </h3>
            </div>
            <div className="mt-2 space-y-1">
              {bannedUsers
                .filter((u) => u.isActive)
                .slice(0, 3)
                .map((banned) => (
                  <div
                    key={banned.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-red-700">{banned.userEmail}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnbanUser(banned.userId)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      UnBan
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Referrers */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Top Referrers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {adminStats.topReferrers.map((user, index) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border border-gray-100 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">
                      #{index + 1}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-black">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  {isUserBanned(user.id) && (
                    <Badge className="bg-red-100 text-red-800">Banned</Badge>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-black">
                    MAD {user.totalRewards}
                  </p>
                  <p className="text-sm text-gray-600">
                    {user.convertedInvites}/{user.totalInvites} converted
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setSelectedUser({ id: user.id, email: user.email })
                      }
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      disabled={isUserBanned(user.id)}
                    >
                      <Ban className="h-4 w-4 mr-1" />
                      {isUserBanned(user.id) ? "Banned" : "Ban User"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Ban User: {user.email}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="banReason">Reason for banning</Label>
                        <Textarea
                          id="banReason"
                          value={banReason}
                          onChange={(e) => setBanReason(e.target.value)}
                          placeholder="Enter reason for banning this user..."
                          className="mt-1"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setBanReason("")}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => handleBanUser(user.id, user.email)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Ban User
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
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
                  <SelectItem value="all">All Status</SelectItem>
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
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-600">
              Showing {filteredInvites.length} of {referralInvites.length}{" "}
              referrals
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 text-sm font-medium text-gray-600">
                      Inviter
                    </th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">
                      Invitee
                    </th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">
                      Code
                    </th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">
                      Status
                    </th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">
                      Sent Date
                    </th>
                    <th className="text-left py-3 text-sm font-medium text-gray-600">
                      Rewards
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvites.map((invite) => {
                    const isBlocked = isReferralBlocked(invite.id);
                    return (
                      <tr
                        key={invite.id}
                        className="border-b border-gray-50 hover:bg-gray-50"
                      >
                        <td className="py-3 text-sm text-black">
                          {invite.inviterEmail}
                        </td>
                        <td className="py-3 text-sm text-black">
                          {invite.inviteeEmail}
                        </td>
                        <td className="py-3 text-sm font-mono text-gray-600">
                          {invite.referralCode}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(invite.status)}>
                              {invite.status}
                            </Badge>
                            {isBlocked && (
                              <Badge className="bg-red-100 text-red-800">
                                Blocked
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-sm text-gray-600">
                          {new Date(invite.sentAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 text-sm font-medium text-black">
                          {invite.rewards > 0 ? `MAD ${invite.rewards}` : "-"}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center space-x-2">
                            {isBlocked ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUnblockReferral(invite.id)}
                                className="text-green-600 border-green-300 hover:bg-green-50"
                              >
                                Unblock
                              </Button>
                            ) : (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      setSelectedReferral(invite.id)
                                    }
                                    className="text-red-600 border-red-300 hover:bg-red-50"
                                  >
                                    Block
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Block Referral</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label htmlFor="blockReason">
                                        Reason for blocking
                                      </Label>
                                      <Textarea
                                        id="blockReason"
                                        value={blockReason}
                                        onChange={(e) =>
                                          setBlockReason(e.target.value)
                                        }
                                        placeholder="Enter reason for blocking this referral..."
                                        className="mt-1"
                                      />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                      <Button
                                        variant="outline"
                                        onClick={() => setBlockReason("")}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        onClick={() =>
                                          handleBlockReferral(invite.id)
                                        }
                                        className="bg-red-600 hover:bg-red-700 text-white"
                                      >
                                        Block Referral
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredInvites.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No referrals match your search criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
