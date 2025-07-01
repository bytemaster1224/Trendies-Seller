import type React from "react";
export interface RewardClaimSummary {
  id: string;
  rewardName: string;
  pointsCost: number;
  claimedAt: string;
  userEmail: string;
  userName: string;
  remainingPoints: number;
  status: "pending" | "approved" | "delivered" | "cancelled";
  estimatedDelivery?: string;
  trackingInfo?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  totalPoints: number;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  joinedAt: string;
}

export interface NotificationProps {
  message: string;
  type: "success" | "error" | "info" | "warning";
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export interface ActionButtonProps {
  variant: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}
