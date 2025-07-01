"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Share2,
  Users,
  TrendingUp,
  Award,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { useReferralStore } from "@/lib/referral-store";
import { EnhancedBrevoEmailService } from "@/lib/enhanced-email-service";

export default function ReferralsPage() {
  const {
    currentUser,
    referralInvites,
    sendReferralInvite,
    convertReferral,
    getUserReferralStats,
    generateReferralCode,
  } = useReferralStore();

  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const emailService = EnhancedBrevoEmailService.getInstance();
  const stats = getUserReferralStats(currentUser.id);
  const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}/invite/${currentUser.referralCode}`;

  const userInvites = referralInvites.filter(
    (invite) => invite.inviterUserId === currentUser.id
  );

  const showNotification = (message: string, type: "success" | "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload

    if (!inviteEmail.trim()) {
      showNotification("Please enter a valid email address", "error");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail)) {
      showNotification("Please enter a valid email address", "error");
      return;
    }

    setIsInviting(true);

    try {
      const result = await sendReferralInvite(inviteEmail);
      const name = currentUser.name;
      const referralCode = currentUser.referralCode;
      const res = await fetch(`api/sendReferral`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          inviteEmail,
          referralCode,
        }),
      });
      if (result.success && result.invite) {
        const emailTemplate =
          EnhancedBrevoEmailService.createReferralInviteEmail(
            currentUser.name,
            inviteEmail,
            currentUser.referralCode,
            result.invite.verificationToken
          );
        // Actually send the email through Brevo
        const emailResult = await emailService.sendEmail(emailTemplate);
        if (emailResult.success) {
          showNotification(
            `Referral sent to ${inviteEmail} with code ${currentUser.referralCode}! 🎉`,
            "success"
          );
          setInviteEmail("");
        } else {
          showNotification("Failed to send email. Please try again.", "error");
        }
      } else {
        showNotification(result.message, "error");
      }
    } catch (error) {
      showNotification("Failed to send referral. Please try again.", "error");
    } finally {
      setIsInviting(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showNotification("Failed to copy link", "error");
    }
  };

  const shareReferralLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Trendies as a Seller",
          text: `Start selling luxury items on Trendies and earn great commissions! Use my referral code: ${currentUser.referralCode}`,
          url: referralLink,
        });
      } catch (err) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const simulateConversion = async (inviteId: string) => {
    convertReferral(inviteId);

    const invite = userInvites.find((inv) => inv.id === inviteId);
    if (invite) {
      // Send confirmation email to referee
      const confirmationEmail =
        EnhancedBrevoEmailService.createReferralConfirmationEmail(
          invite.inviteeEmail,
          currentUser.referralCode,
          currentUser.name
        );
      await emailService.sendEmail(confirmationEmail);

      // Send success email to inviter
      const successEmail =
        EnhancedBrevoEmailService.createReferralConvertedEmail(
          currentUser.email,
          currentUser.name,
          invite.inviteeEmail
        );
      await emailService.sendEmail(successEmail);

      showNotification("Referral converted! You earned MAD 500! 🎉", "success");
    }
  };

  const generateNewCode = () => {
    const newCode = generateReferralCode(
      currentUser.id,
      currentUser.email,
      currentUser.name
    );
    showNotification(`New referral code generated: ${newCode}`, "success");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "converted":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "verified":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "expired":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
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

  // Polling for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      useReferralStore.setState((state) => ({ ...state }));
    }, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

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
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-black">Referrals</h1>
        <p className="text-gray-600 text-sm">
          Invite friends and earn MAD 500 for each successful referral. Share
          your unique code and start earning today!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-black">
                  {stats.totalInvites}
                </div>
                <div className="text-sm text-gray-600">Total Invites</div>
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
                  {stats.pendingInvites}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.convertedInvites}
                </div>
                <div className="text-sm text-gray-600">Converted</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Award className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  MAD {stats.totalRewards}
                </div>
                <div className="text-sm text-gray-600">Total Earned</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Referral Card */}
      <Card className="bg-white border-2 border-gray-200 shadow-sm">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-black mb-2">
                Invite your friends now by sharing your referral code with them
              </h2>
              <p className="text-gray-600">
                Enter your friend's email below and we'll send them your
                referral code
              </p>
            </div>

            <div className="flex gap-0">
              <form onSubmit={handleSendInvite} className="flex w-full">
                <Input
                  type="email"
                  placeholder="E-Mail"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 rounded-r-none border-r-0 h-12 text-sm"
                  onKeyPress={(e) => e.key === "Enter" && handleSendInvite(e)}
                />
                <Button
                  type="submit"
                  disabled={!inviteEmail.trim() || isInviting}
                  className="bg-gray-800 hover:bg-gray-900 text-white rounded-l-none h-12 px-8 font-medium"
                >
                  {isInviting ? "SENDING..." : "SEND CODE"}
                </Button>
              </form>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Your referral code:</strong>{" "}
                <span className="font-mono bg-blue-100 px-2 py-1 rounded text-lg">
                  {currentUser.referralCode}
                </span>
              </p>
              <p className="text-sm text-blue-700 mt-2">
                This code will be automatically included in the email we send to
                your friend.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Link Card */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Your Referral Link
            <Button variant="outline" size="sm" onClick={generateNewCode}>
              Generate New Code
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={referralLink}
                readOnly
                className="flex-1 font-mono text-sm bg-gray-50"
              />
              <Button onClick={copyToClipboard} variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button onClick={shareReferralLink} variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                Share this link or code with friends. You'll earn MAD 500 for
                each successful referral.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Card */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Referral Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {stats.conversionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Conversion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                MAD{" "}
                {(
                  stats.totalRewards / Math.max(stats.convertedInvites, 1)
                ).toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">
                Avg. Reward per Conversion
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {stats.totalInvites}
              </div>
              <div className="text-sm text-gray-600">Total Invites Sent</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral History */}
      {userInvites.length > 0 && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle>Referral History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(invite.status)}
                    <div>
                      <p className="font-medium text-black">
                        {invite.inviteeEmail}
                      </p>
                      <p className="text-sm text-gray-600">
                        Sent on {new Date(invite.sentAt).toLocaleDateString()}
                        {invite.convertedAt && (
                          <span>
                            {" "}
                            • Converted on{" "}
                            {new Date(invite.convertedAt).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        Code: {invite.referralCode}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(invite.status)}>
                      {invite.status}
                    </Badge>
                    {invite.rewards > 0 && (
                      <span className="text-sm font-medium text-green-600">
                        +MAD {invite.rewards}
                      </span>
                    )}
                    {invite.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => simulateConversion(invite.id)}
                      >
                        Simulate Conversion
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
