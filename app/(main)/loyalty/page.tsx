"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Gift,
  Trophy,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Award,
} from "lucide-react";
import { useLoyaltyStore } from "@/lib/loyalty-store";
import { EnhancedBrevoEmailService } from "@/lib/enhanced-email-service";

export default function LoyaltyPage() {
  const {
    currentUser,
    rewards,
    claimedRewards,
    pointsHistory,
    redeemReward,
    getAvailableRewards,
    getUserClaimedRewards,
    getPointsHistory,
  } = useLoyaltyStore();

  const [isRedeeming, setIsRedeeming] = useState<string | null>(null);

  const emailService = EnhancedBrevoEmailService.getInstance();
  const availableRewards = getAvailableRewards();
  const userClaimedRewards = getUserClaimedRewards(currentUser.id);
  const userPointsHistory = getPointsHistory(currentUser.id);

  const handleRedeemReward = async (rewardId: string) => {
    setIsRedeeming(rewardId);

    try {
      const result = await redeemReward(rewardId);

      if (result.success) {
        const reward = rewards.find((r) => r.id === rewardId);
        if (reward) {
          // Send redemption confirmation email
          const res = await fetch(`api/redeem`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username: currentUser.name,
              toEmail: currentUser.email,
              rewardName: reward.name,
              remainingPoints: currentUser.totalPoints - reward.pointsCost,
            }),
          });
          const redemptionEmail =
            EnhancedBrevoEmailService.createLoyaltyRedemptionEmail(
              currentUser.email,
              currentUser.name,
              reward.name,
              reward.pointsCost,
              currentUser.totalPoints - reward.pointsCost // Remaining points after redemption
            );
          await emailService.sendEmail(redemptionEmail);
        }
      }
    } catch (error) {
      console.error("Error redeeming reward:", error);
    } finally {
      setIsRedeeming(null);
    }
  };

  const getTierProgress = () => {
    const tiers = {
      Bronze: { min: 0, max: 2000, color: "bg-amber-500" },
      Silver: { min: 2000, max: 5000, color: "bg-gray-400" },
      Gold: { min: 5000, max: 10000, color: "bg-yellow-500" },
      Platinum: { min: 10000, max: 15000, color: "bg-purple-500" },
    };

    const currentTier = tiers[currentUser.tier];
    const progress =
      currentUser.tier === "Platinum"
        ? 100
        : ((currentUser.lifetimePoints - currentTier.min) /
            (currentTier.max - currentTier.min)) *
          100;

    return { progress: Math.min(progress, 100), currentTier };
  };

  const { progress, currentTier } = getTierProgress();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
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
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-black">Loyalty Rewards</h1>
        <p className="text-gray-600 text-sm">
          Use your points to unlock rewards, perks, and exclusive access. Earn
          500 points for each successful referral!
        </p>
      </div>

      {/* Points Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-black">
                {currentUser.totalPoints.toLocaleString()} Trendies Points
              </h2>
              <p className="text-gray-600">
                ≈ €{(currentUser.totalPoints / 240).toFixed(0)} value
              </p>
              <p className="text-sm text-blue-600 mt-1">
                💡 Earn 500 points for each successful referral
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={`${currentTier.color} text-white`}>
                {currentUser.tier}
              </Badge>
              <Trophy className="h-6 w-6 text-yellow-500" />
            </div>
          </div>

          {/* Tier Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress to next tier</span>
              <span className="text-gray-600">{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-gray-500">
              {currentUser.tier === "Platinum"
                ? "You've reached the highest tier!"
                : `${(
                    currentTier.max - currentUser.lifetimePoints
                  ).toLocaleString()} points to next tier`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="catalog" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="catalog">Rewards Catalog</TabsTrigger>
          <TabsTrigger value="my-rewards">My Rewards</TabsTrigger>
          <TabsTrigger value="history">Points History</TabsTrigger>
        </TabsList>

        {/* Rewards Catalog */}
        <TabsContent value="catalog" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableRewards.map((reward) => {
              const canAfford = currentUser.totalPoints >= reward.pointsCost;
              const isCurrentlyRedeeming = isRedeeming === reward.id;

              return (
                <Card
                  key={reward.id}
                  className="bg-white border border-gray-200 shadow-sm relative"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{reward.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          {reward.description}
                        </p>
                      </div>
                      <Gift className="h-6 w-6 text-blue-500 flex-shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent className="pb-16">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-black">
                          {reward.pointsCost.toLocaleString()} Points
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {reward.category}
                        </Badge>
                      </div>

                      {reward.terms && (
                        <p className="text-xs text-gray-500">{reward.terms}</p>
                      )}

                      {!canAfford && (
                        <p className="text-xs text-red-500 text-center">
                          Need{" "}
                          {(
                            reward.pointsCost - currentUser.totalPoints
                          ).toLocaleString()}{" "}
                          more points
                        </p>
                      )}
                    </div>
                  </CardContent>

                  {/* Fixed position button */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <Button
                      onClick={() => handleRedeemReward(reward.id)}
                      disabled={!canAfford || isCurrentlyRedeeming}
                      className={`w-full ${
                        canAfford
                          ? "bg-black hover:bg-gray-800 text-white"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {isCurrentlyRedeeming
                        ? "REDEEMING..."
                        : canAfford
                        ? "REDEEM NOW"
                        : "NOT ENOUGH POINTS"}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* My Rewards */}
        <TabsContent value="my-rewards" className="space-y-6">
          {userClaimedRewards.length === 0 ? (
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-12 text-center">
                <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No rewards yet
                </h3>
                <p className="text-gray-600">
                  You haven't redeemed any rewards yet.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Start earning points through referrals to unlock rewards!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {userClaimedRewards.map((claimed) => (
                <Card
                  key={claimed.id}
                  className="bg-white border border-gray-200"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Gift className="h-8 w-8 text-blue-500" />
                        <div>
                          <h3 className="font-semibold text-black">
                            {claimed.rewardName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Redeemed on{" "}
                            {new Date(claimed.claimedAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Cost: {claimed.pointsCost.toLocaleString()} points
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(claimed.status)}>
                          {claimed.status}
                        </Badge>
                        {getStatusIcon(claimed.status)}
                      </div>
                    </div>
                    {claimed.adminNotes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Admin Notes:</strong> {claimed.adminNotes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Points History */}
        <TabsContent value="history" className="space-y-6">
          <Card className="bg-white border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Points Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userPointsHistory.map((transaction) => (
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
