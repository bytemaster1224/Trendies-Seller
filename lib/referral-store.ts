"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type InviteStatus =
  | "pending"
  | "verified"
  | "converted"
  | "expired"
  | "blocked";
export interface ReferralCode {
  id: string;
  code: string;
  userId: string;
  userEmail: string;
  userName: string;
  createdAt: string;
  isActive: boolean;
}

export interface ReferralInvite {
  id: string;
  referralCode: string;
  inviterUserId: string;
  inviterName: string;
  inviterEmail: string;
  inviteeEmail: string;
  status: InviteStatus;
  sentAt: string;
  verifiedAt?: string;
  convertedAt?: string;
  verificationToken: string;
  isBlocked?: boolean;
  blockReason?: string;
  rewards: number;
}

export interface ReferralUser {
  id: string;
  email: string;
  name: string;
  referralCode: string;
  totalInvites: number;
  convertedInvites: number;
  totalRewards: number;
  conversionRate: number;
  status: "active" | "banned";
}

export interface AdminReferralStats {
  totalCodes: number;
  totalInvites: number;
  totalConversions: number;
  totalRewards: number;
  conversionRate: number;
  topReferrers: ReferralUser[];
}

interface ReferralState {
  currentUser: ReferralUser;
  referralCodes: ReferralCode[];
  referralInvites: ReferralInvite[];
  allUsers: ReferralUser[];

  // Actions
  generateReferralCode: (
    userId: string,
    userEmail: string,
    userName: string
  ) => string;
  sendReferralInvite: (
    inviteeEmail: string
  ) => Promise<{ success: boolean; message: string; invite?: ReferralInvite }>;
  verifyReferralCode: (
    code: string,
    email: string,
    token: string
  ) => Promise<{ success: boolean; message: string }>;
  convertReferral: (inviteId: string) => void;
  getUserReferralStats: (userId: string) => {
    totalInvites: number;
    pendingInvites: number;
    convertedInvites: number;
    totalRewards: number;
    conversionRate: number;
  };
  blockReferral: (inviteId: string, reason: string) => void;
  unblockReferral: (inviteId: string) => void;
  banUser: (userId: string, reason: string) => void;
  unbanUser: (userId: string) => void;
  getAdminReferralStats: () => AdminReferralStats;
  updateUserProfile: (updates: Partial<ReferralUser>) => void;
}

const mockCurrentUser: ReferralUser = {
  id: "user_1",
  email: "stephen@trendies.com",
  name: "Stephen Neary",
  referralCode: "REF-STEPHEN2025",
  totalInvites: 5,
  convertedInvites: 2,
  totalRewards: 400,
  conversionRate: 40,
  status: "active",
};

const mockUsers: ReferralUser[] = [
  mockCurrentUser,
  {
    id: "user_2",
    email: "sarah@trendies.com",
    name: "Sarah Wilson",
    referralCode: "REF-SARAH2025",
    totalInvites: 8,
    convertedInvites: 5,
    totalRewards: 1000,
    conversionRate: 62.5,
    status: "active",
  },
  {
    id: "user_3",
    email: "mike@trendies.com",
    name: "Mike Chen",
    referralCode: "REF-MIKE2025",
    totalInvites: 3,
    convertedInvites: 1,
    totalRewards: 500,
    conversionRate: 33.3,
    status: "active",
  },
];

export const useReferralStore = create<ReferralState>()(
  persist(
    (set, get) => ({
      currentUser: mockCurrentUser,
      allUsers: mockUsers,
      referralCodes: [
        {
          id: "code_1",
          code: "REF-STEPHEN2025",
          userId: "user_1",
          userEmail: "stephen@trendies.com",
          userName: "Stephen Neary",
          createdAt: new Date().toISOString(),
          isActive: true,
        },
      ],
      referralInvites: [
        {
          id: "invite_1",
          referralCode: "REF-STEPHEN2025",
          inviterUserId: "user_1",
          inviterName: "Stephen Neary",
          inviterEmail: "stephen@trendies.com",
          inviteeEmail: "friend1@example.com",
          status: "converted",
          sentAt: "2025-01-10T10:00:00Z",
          verifiedAt: "2025-01-10T11:00:00Z",
          convertedAt: "2025-01-10T12:00:00Z",
          verificationToken: "token_123",
          rewards: 500,
        },
        {
          id: "invite_2",
          referralCode: "REF-STEPHEN2025",
          inviterUserId: "user_1",
          inviterName: "Stephen Neary",
          inviterEmail: "stephen@trendies.com",
          inviteeEmail: "friend2@example.com",
          status: "pending",
          sentAt: "2025-01-15T14:00:00Z",
          verificationToken: "token_456",
          rewards: 0,
        },
      ],

      generateReferralCode: (
        userId: string,
        userEmail: string,
        userName: string
      ) => {
        const timestamp = Date.now().toString().slice(-4);
        const nameCode = userName.split(" ")[0].toUpperCase();
        const newCode = `REF-${nameCode}${timestamp}`;

        const newReferralCode: ReferralCode = {
          id: `code_${Date.now()}`,
          code: newCode,
          userId,
          userEmail,
          userName,
          createdAt: new Date().toISOString(),
          isActive: true,
        };

        set((state) => ({
          referralCodes: [...state.referralCodes, newReferralCode],
          currentUser: { ...state.currentUser, referralCode: newCode },
        }));

        return newCode;
      },

      sendReferralInvite: async (inviteeEmail: string) => {
        const { currentUser } = get();

        // Check if email already invited
        const existingInvite = get().referralInvites.find(
          (invite) =>
            invite.inviteeEmail === inviteeEmail &&
            invite.inviterUserId === currentUser.id
        );

        if (existingInvite) {
          return {
            success: false,
            message: "This email has already been invited.",
          };
        }

        // Generate verification token
        const verificationToken = Math.random().toString(36).substring(2, 15);

        const newInvite: ReferralInvite = {
          id: `invite_${Date.now()}`,
          referralCode: currentUser.referralCode,
          inviterUserId: currentUser.id,
          inviterName: currentUser.name,
          inviterEmail: currentUser.email,
          inviteeEmail,
          status: "pending",
          sentAt: new Date().toISOString(),
          verificationToken,
          rewards: 0,
        };

        set((state) => ({
          referralInvites: [...state.referralInvites, newInvite],
          currentUser: {
            ...state.currentUser,
            totalInvites: state.currentUser.totalInvites + 1,
          },
        }));

        return {
          success: true,
          message: "Referral invitation sent successfully!",
          invite: newInvite,
        };
      },

      verifyReferralCode: async (
        code: string,
        email: string,
        token: string
      ) => {
        const invite = get().referralInvites.find(
          (inv) =>
            inv.referralCode === code &&
            inv.inviteeEmail === email &&
            inv.verificationToken === token
        );

        if (!invite) {
          return {
            success: false,
            message: "Invalid referral code or verification token.",
          };
        }

        if (invite.status !== "pending") {
          return {
            success: false,
            message: "This referral has already been processed.",
          };
        }

        set((state) => ({
          referralInvites: state.referralInvites.map((inv) =>
            inv.id === invite.id
              ? {
                  ...inv,
                  status: "verified" as const,
                  verifiedAt: new Date().toISOString(),
                }
              : inv
          ),
        }));

        return {
          success: true,
          message:
            "Email verified successfully! You can now complete your signup.",
        };
      },

      convertReferral: (inviteId: string) => {
        set((state) => {
          const updatedInvites = state.referralInvites.map((invite) =>
            invite.id === inviteId
              ? {
                  ...invite,
                  status: "converted" as const,
                  convertedAt: new Date().toISOString(),
                  rewards: 500,
                }
              : invite
          );

          const convertedInvite = updatedInvites.find(
            (inv) => inv.id === inviteId
          );
          const isCurrentUserInvite =
            convertedInvite?.inviterUserId === state.currentUser.id;

          return {
            referralInvites: updatedInvites,
            currentUser: isCurrentUserInvite
              ? {
                  ...state.currentUser,
                  convertedInvites: state.currentUser.convertedInvites + 1,
                  totalRewards: state.currentUser.totalRewards + 500,
                  conversionRate:
                    ((state.currentUser.convertedInvites + 1) /
                      state.currentUser.totalInvites) *
                    100,
                }
              : state.currentUser,
          };
        });
      },

      getUserReferralStats: (userId: string) => {
        const { referralInvites } = get();
        const userInvites = referralInvites.filter(
          (invite) => invite.inviterUserId === userId
        );

        const totalInvites = userInvites.length;
        const pendingInvites = userInvites.filter(
          (inv) => inv.status === "pending"
        ).length;
        const convertedInvites = userInvites.filter(
          (inv) => inv.status === "converted"
        ).length;
        const totalRewards = userInvites.reduce(
          (sum, inv) => sum + inv.rewards,
          0
        );
        const conversionRate =
          totalInvites > 0 ? (convertedInvites / totalInvites) * 100 : 0;

        return {
          totalInvites,
          pendingInvites,
          convertedInvites,
          totalRewards,
          conversionRate,
        };
      },

      getAdminReferralStats: () => {
        const { referralInvites, referralCodes, allUsers } = get();

        const totalCodes = referralCodes.filter((code) => code.isActive).length;
        const totalInvites = referralInvites.length;
        const totalConversions = referralInvites.filter(
          (i) => i.status === "converted"
        ).length;
        const totalRewards = referralInvites.reduce(
          (sum, i) => sum + i.rewards,
          0
        );
        const conversionRate = totalInvites
          ? (totalConversions / totalInvites) * 100
          : 0;

        // Build per-referrer aggregates
        const map = new Map<
          string,
          {
            convertedInvites: number;
            totalInvites: number;
            totalRewards: number;
          }
        >();

        referralInvites.forEach((inv) => {
          const item = map.get(inv.inviterUserId) ?? {
            convertedInvites: 0,
            totalInvites: 0,
            totalRewards: 0,
          };

          item.totalInvites += 1;
          item.totalRewards += inv.rewards;
          if (inv.status === "converted") item.convertedInvites += 1;

          map.set(inv.inviterUserId, item);
        });

        const topReferrers = [...map.entries()]
          .map(([userId, stats]) => {
            const user = allUsers.find((u) => u.id === userId)!;
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              totalRewards: stats.totalRewards,
              convertedInvites: stats.convertedInvites,
              totalInvites: stats.totalInvites,
              referralCode: user.referralCode,
              conversionRate: user.conversionRate,
              status: user.status,
            };
          })
          .sort((a, b) => b.totalRewards - a.totalRewards)
          .slice(0, 10);

        return {
          totalCodes,
          totalInvites,
          totalConversions,
          totalRewards,
          conversionRate,
          topReferrers,
        };
      },
      blockReferral: (inviteId: string, reason: string) => {
        set((state) => ({
          referralInvites: state.referralInvites.map((invite) =>
            invite.id === inviteId
              ? {
                  ...invite,
                  isBlocked: true,
                  blockReason: reason,
                  status: "blocked" as const,
                }
              : invite
          ),
        }));
      },

      unblockReferral: (inviteId: string) => {
        set((state) => ({
          referralInvites: state.referralInvites.map((invite) =>
            invite.id === inviteId
              ? {
                  ...invite,
                  isBlocked: false,
                  blockReason: undefined,
                  status: "pending" as const,
                }
              : invite
          ),
        }));
      },

      banUser: (userId: string, reason: string) => {
        set((state) => ({
          allUsers: state.allUsers.map((user) =>
            user.id === userId ? { ...user, status: "banned" as const } : user
          ),
          referralCodes: state.referralCodes.map((code) =>
            code.userId === userId ? { ...code, isActive: false } : code
          ),
        }));
      },

      unbanUser: (userId: string) => {
        set((state) => ({
          allUsers: state.allUsers.map((user) =>
            user.id === userId ? { ...user, status: "active" as const } : user
          ),
          referralCodes: state.referralCodes.map((code) =>
            code.userId === userId ? { ...code, isActive: true } : code
          ),
        }));
      },

      updateUserProfile: (updates: Partial<ReferralUser>) => {
        set((state) => ({
          currentUser: { ...state.currentUser, ...updates },
        }));
      },
    }),
    {
      name: "trendies-referral-storage",
    }
  )
);
