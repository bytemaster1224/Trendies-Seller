"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: "voucher" | "service" | "membership" | "gift_card";
  isActive: boolean;
  imageUrl?: string;
  terms?: string;
}

export interface ClaimedReward {
  id: string;
  rewardId: string;
  rewardName: string;
  pointsCost: number;
  userId: string;
  username: string;
  claimedAt: string;
  status: "pending" | "approved" | "delivered" | "cancelled";
  adminNotes?: string;
}

export interface PointsTransaction {
  id: string;
  userId: string;
  username: string;
  type: "earned" | "redeemed" | "bonus" | "penalty";
  points: number;
  description: string;
  referenceId?: string; // referral ID, reward ID, etc.
  createdAt: string;
}

export interface LoyaltyUser {
  id: string;
  email: string;
  name: string;
  totalPoints: number;
  lifetimePoints: number;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  joinedAt: string;
}

interface LoyaltyState {
  currentUser: LoyaltyUser;
  rewards: LoyaltyReward[];
  claimedRewards: ClaimedReward[];
  pointsHistory: PointsTransaction[];

  // Actions
  addPoints: (
    points: number,
    description: string,
    referenceId?: string
  ) => void;
  redeemReward: (rewardId: string) => Promise<{
    success: boolean;
    message: string;
    claimedReward?: ClaimedReward;
  }>;
  getAvailableRewards: () => LoyaltyReward[];
  getUserClaimedRewards: (userId: string) => ClaimedReward[];
  getPointsHistory: (userId: string) => PointsTransaction[];
  updateRewardStatus: (
    claimedRewardId: string,
    status: ClaimedReward["status"],
    adminNotes?: string
  ) => void;
  calculateTier: (totalPoints: number) => LoyaltyUser["tier"];
}

const mockRewards: LoyaltyReward[] = [
  {
    id: "reward_1",
    name: "€5 Voucher",
    description: "€5 discount on your next purchase",
    pointsCost: 250,
    category: "voucher",
    isActive: true,
    terms: "Valid for 30 days. Cannot be combined with other offers.",
  },
  {
    id: "reward_2",
    name: "Free 2h Return",
    description: "Free 2-hour return service for any item",
    pointsCost: 100,
    category: "service",
    isActive: true,
    terms: "Valid within 30 days of purchase.",
  },
  {
    id: "reward_3",
    name: "Premium Delivery",
    description: "Free premium delivery on your next order",
    pointsCost: 750,
    category: "service",
    isActive: true,
    terms: "Valid for orders over €50.",
  },
  {
    id: "reward_4",
    name: "Free Authentication",
    description: "Free authentication service for luxury items",
    pointsCost: 1000,
    category: "service",
    isActive: true,
    terms: "Valid for items up to €5,000 value.",
  },
  {
    id: "reward_5",
    name: "VIP Silver (1 month)",
    description: "1 month of VIP Silver membership benefits",
    pointsCost: 3000,
    category: "membership",
    isActive: true,
    terms: "Includes priority support and exclusive access.",
  },
  {
    id: "reward_6",
    name: "€20 Gift Card",
    description: "€20 gift card for Trendies marketplace",
    pointsCost: 5000,
    category: "gift_card",
    isActive: true,
    terms: "Valid for 6 months. Cannot be exchanged for cash.",
  },
];

const mockUser: LoyaltyUser = {
  id: "user_1",
  email: "stephenneary747@gmail.com",
  name: "Stephen Neary",
  totalPoints: 2400,
  lifetimePoints: 3200,
  tier: "Silver",
  joinedAt: "2024-01-15T10:00:00Z",
};

export const useLoyaltyStore = create<LoyaltyState>()(
  persist(
    (set, get) => ({
      currentUser: mockUser,
      rewards: mockRewards,
      claimedRewards: [],
      pointsHistory: [
        {
          id: "tx_1",
          userId: "user_1",
          username: "Stephen Neary",
          type: "earned",
          points: 500,
          description: "Referral conversion - friend1@example.com",
          referenceId: "invite_1",
          createdAt: "2025-01-10T12:00:00Z",
        },
        {
          id: "tx_2",
          userId: "user_1",
          username: "Stephen Neary",
          type: "earned",
          points: 500,
          description: "Referral conversion - friend2@example.com",
          referenceId: "invite_2",
          createdAt: "2025-01-15T14:00:00Z",
        },
        {
          id: "tx_3",
          userId: "user_1",
          username: "Stephen Neary",
          type: "redeemed",
          points: -100,
          description: "Redeemed: Free 2h Return",
          referenceId: "reward_2",
          createdAt: "2025-01-16T10:00:00Z",
        },
      ],

      addPoints: (
        points: number,
        description: string,
        referenceId?: string
      ) => {
        const transaction: PointsTransaction = {
          id: `tx_${Date.now()}`,
          userId: get().currentUser.id,
          username: get().currentUser.name,
          type: points > 0 ? "earned" : "redeemed",
          points,
          description,
          referenceId,
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const newTotalPoints = state.currentUser.totalPoints + points;
          const newLifetimePoints =
            points > 0
              ? state.currentUser.lifetimePoints + points
              : state.currentUser.lifetimePoints;
          const newTier = get().calculateTier(newLifetimePoints);

          return {
            currentUser: {
              ...state.currentUser,
              totalPoints: Math.max(0, newTotalPoints),
              lifetimePoints: newLifetimePoints,
              tier: newTier,
            },
            pointsHistory: [transaction, ...state.pointsHistory],
          };
        });
      },

      redeemReward: async (rewardId: string) => {
        const { currentUser, rewards } = get();
        const reward = rewards.find((r) => r.id === rewardId);

        if (!reward) {
          return { success: false, message: "Reward not found" };
        }

        if (!reward.isActive) {
          return { success: false, message: "Reward is no longer available" };
        }

        if (currentUser.totalPoints < reward.pointsCost) {
          return { success: false, message: "Insufficient points" };
        }

        const claimedReward: ClaimedReward = {
          id: `claimed_${Date.now()}`,
          rewardId: reward.id,
          rewardName: reward.name,
          pointsCost: reward.pointsCost,
          userId: currentUser.id,
          username: currentUser.name,
          claimedAt: new Date().toISOString(),
          status: "pending",
        };

        // Add to claimed rewards list
        set((state) => ({
          claimedRewards: [claimedReward, ...state.claimedRewards],
        }));

        // Deduct points from user balance
        get().addPoints(
          -reward.pointsCost,
          `Redeemed: ${reward.name}`,
          reward.id
        );

        return {
          success: true,
          message:
            "Reward claimed successfully! Check your email for confirmation.",
          claimedReward,
        };
      },

      getAvailableRewards: () => {
        return get().rewards.filter((reward) => reward.isActive);
      },

      getUserClaimedRewards: (userId: string) => {
        return get().claimedRewards.filter(
          (claimed) => claimed.userId === userId
        );
      },

      getPointsHistory: (userId: string) => {
        return get().pointsHistory.filter((tx) => tx.userId === userId);
      },

      updateRewardStatus: (
        claimedRewardId: string,
        status: ClaimedReward["status"],
        adminNotes?: string
      ) => {
        set((state) => ({
          claimedRewards: state.claimedRewards.map((claimed) =>
            claimed.id === claimedRewardId
              ? { ...claimed, status, adminNotes }
              : claimed
          ),
        }));
      },

      calculateTier: (lifetimePoints: number) => {
        if (lifetimePoints >= 10000) return "Platinum";
        if (lifetimePoints >= 5000) return "Gold";
        if (lifetimePoints >= 2000) return "Silver";
        return "Bronze";
      },
    }),
    {
      name: "trendies-loyalty-storage",
    }
  )
);
