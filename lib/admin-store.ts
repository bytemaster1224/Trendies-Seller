"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BlockedReferral {
  id: string;
  referralId: string;
  reason: string;
  blockedAt: string;
  blockedBy: string;
}

export interface BannedUser {
  id: string;
  userId: string;
  userEmail: string;
  reason: string;
  bannedAt: string;
  bannedBy: string;
  isActive: boolean;
}

export interface AdminAction {
  id: string;
  type: "block_referral" | "ban_user" | "approve_reward" | "reject_reward";
  targetId: string;
  reason: string;
  performedBy: string;
  performedAt: string;
  metadata?: Record<string, any>;
}

interface AdminState {
  blockedReferrals: BlockedReferral[];
  bannedUsers: BannedUser[];
  adminActions: AdminAction[];

  // Actions
  blockReferral: (referralId: string, reason: string, adminId: string) => void;
  unblockReferral: (referralId: string, adminId: string) => void;
  banUser: (
    userId: string,
    userEmail: string,
    reason: string,
    adminId: string
  ) => void;
  unbanUser: (userId: string, adminId: string) => void;
  isReferralBlocked: (referralId: string) => boolean;
  isUserBanned: (userId: string) => boolean;
  getAdminActions: () => AdminAction[];
  addAdminAction: (action: Omit<AdminAction, "id" | "performedAt">) => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      blockedReferrals: [],
      bannedUsers: [],
      adminActions: [],

      blockReferral: (referralId: string, reason: string, adminId: string) => {
        const blockedReferral: BlockedReferral = {
          id: `blocked_${Date.now()}`,
          referralId,
          reason,
          blockedAt: new Date().toISOString(),
          blockedBy: adminId,
        };

        const adminAction: AdminAction = {
          id: `action_${Date.now()}`,
          type: "block_referral",
          targetId: referralId,
          reason,
          performedBy: adminId,
          performedAt: new Date().toISOString(),
        };

        set((state) => ({
          blockedReferrals: [...state.blockedReferrals, blockedReferral],
          adminActions: [adminAction, ...state.adminActions],
        }));
      },

      unblockReferral: (referralId: string, adminId: string) => {
        set((state) => ({
          blockedReferrals: state.blockedReferrals.filter(
            (blocked) => blocked.referralId !== referralId
          ),
        }));
      },

      banUser: (
        userId: string,
        userEmail: string,
        reason: string,
        adminId: string
      ) => {
        const bannedUser: BannedUser = {
          id: `banned_${Date.now()}`,
          userId,
          userEmail,
          reason,
          bannedAt: new Date().toISOString(),
          bannedBy: adminId,
          isActive: true,
        };

        const adminAction: AdminAction = {
          id: `action_${Date.now()}`,
          type: "ban_user",
          targetId: userId,
          reason,
          performedBy: adminId,
          performedAt: new Date().toISOString(),
          metadata: { userEmail },
        };

        set((state) => ({
          bannedUsers: [...state.bannedUsers, bannedUser],
          adminActions: [adminAction, ...state.adminActions],
        }));
      },

      unbanUser: (userId: string, adminId: string) => {
        set((state) => ({
          bannedUsers: state.bannedUsers.map((banned) =>
            banned.userId === userId ? { ...banned, isActive: false } : banned
          ),
        }));
      },

      isReferralBlocked: (referralId: string) => {
        return get().blockedReferrals.some(
          (blocked) => blocked.referralId === referralId
        );
      },

      isUserBanned: (userId: string) => {
        return get().bannedUsers.some(
          (banned) => banned.userId === userId && banned.isActive
        );
      },

      getAdminActions: () => {
        return get().adminActions;
      },

      addAdminAction: (action: Omit<AdminAction, "id" | "performedAt">) => {
        const newAction: AdminAction = {
          ...action,
          id: `action_${Date.now()}`,
          performedAt: new Date().toISOString(),
        };

        set((state) => ({
          adminActions: [newAction, ...state.adminActions],
        }));
      },
    }),
    {
      name: "trendies-admin-storage",
    }
  )
);
