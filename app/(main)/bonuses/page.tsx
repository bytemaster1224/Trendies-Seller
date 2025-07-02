"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";
import { BrevoEmailService } from "@/lib/email-service";
import { BadgeProgress } from "@/components/badge-progress";

export default function Bonuses() {
  const { user, updateUserSales, checkBadgeUpgrade } = useAppStore();
  const emailService = BrevoEmailService.getInstance();

  const bonusTiers = [
    {
      threshold: 35000,
      benefit: "5% commission reduction next month",
      achieved: user.currentMonthSales >= 35000,
    },
    {
      threshold: 500000,
      benefit: "10% commission reduction next month",
      achieved: user.currentMonthSales >= 500000,
    },
  ];

  // Calculate progress to next tier
  const nextTier = bonusTiers.find((tier) => !tier.achieved);
  const progressPercentage = nextTier
    ? (user.currentMonthSales / nextTier.threshold) * 100
    : 100;

  const remainingAmount = nextTier
    ? nextTier.threshold - user.currentMonthSales
    : 0;

  const simulateProgress = async () => {
    const saleAmount = Math.floor(Math.random() * 1000) + 1000;
    updateUserSales(saleAmount);

    // Check for badge upgrade
    const newBadge = checkBadgeUpgrade();
    if (newBadge) {
      const emailTemplate = BrevoEmailService.createBadgeUpgradeEmail(
        user.email,
        newBadge
      );
      await emailService.sendEmail(emailTemplate);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-black">
            Bonuses for Top Sellers
          </h1>
          <p className="text-gray-600 text-sm">
            Earn commission discounts based on your monthly sales performance.
            The more you sell, the more you save next month.
          </p>
        </div>
        <Button onClick={simulateProgress} variant="outline">
          Add Sale
        </Button>
      </div>

      {/* Badge Progress */}
      <BadgeProgress
        currentRevenue={user.totalRevenue}
        currentBadge={user.status}
        className="mb-6"
      />

      {/* Bonus Tiers */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-black">Bonus Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bonusTiers.map((tier) => (
            <Card
              key={tier.threshold}
              className={`bg-white border shadow-sm ${
                tier.achieved
                  ? "border-green-200 bg-green-50"
                  : "border-gray-200"
              }`}
            >
              <CardContent className="p-8">
                <div className="text-center space-y-3">
                  <div className="text-2xl font-bold text-black">
                    ≥ {tier.threshold.toLocaleString()} MAD
                  </div>
                  <div className="text-sm text-gray-600">{tier.benefit}</div>
                  {tier.achieved && (
                    <div className="text-green-600 font-medium text-sm flex items-center justify-center">
                      ✓ Achieved
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Current Progress */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-black">
              Your current progress
            </h3>

            <div className="space-y-4">
              <div className="text-sm text-black">
                Your sales this month:{" "}
                <span className="font-semibold">
                  {user.currentMonthSales.toLocaleString()} MAD
                </span>
              </div>

              <div className="space-y-3">
                <Progress
                  value={Math.min(progressPercentage, 100)}
                  className="h-4 bg-gray-200"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>0</span>
                  <span>35,000 MAD</span>
                  <span>50,000 MAD</span>
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                {bonusTiers[0].achieved && (
                  <div>
                    You've unlocked:{" "}
                    <span className="font-medium text-green-600">
                      5% commission reduction
                    </span>
                  </div>
                )}
                {bonusTiers[1].achieved && (
                  <div>
                    You've unlocked:{" "}
                    <span className="font-medium text-green-600">
                      10% commission reduction
                    </span>
                  </div>
                )}
                {remainingAmount > 0 && (
                  <div>
                    Only{" "}
                    <span className="font-medium text-black">
                      {remainingAmount.toLocaleString()} MAD
                    </span>{" "}
                    left to unlock {nextTier?.benefit}
                  </div>
                )}
                {remainingAmount <= 0 && (
                  <div className="text-green-600 font-medium">
                    🎉 Congratulations! You've unlocked all bonus tiers!
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
