"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Share2 } from "lucide-react";
import { mockUser } from "@/lib/mock-data";

interface ReferralData {
  code: string;
  totalReferrals: number;
  pendingReferrals: number;
  convertedReferrals: number;
  earnings: number;
}

const mockReferralData: ReferralData = {
  code: mockUser.referralCode,
  totalReferrals: 12,
  pendingReferrals: 3,
  convertedReferrals: 9,
  earnings: 2400,
};

export function ReferralSystem() {
  const [copied, setCopied] = useState(false);
  const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}/invite/${mockReferralData.code}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Referral Program</h2>
        <p className="text-gray-600 mt-1">
          Invite friends and earn rewards when they join as sellers.
        </p>
      </div>

      {/* Referral Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">
              {mockReferralData.totalReferrals}
            </div>
            <div className="text-sm text-gray-600">Total Referrals</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {mockReferralData.pendingReferrals}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {mockReferralData.convertedReferrals}
            </div>
            <div className="text-sm text-gray-600">Converted</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              MAD {mockReferralData.earnings}
            </div>
            <div className="text-sm text-gray-600">Earnings</div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input value={referralLink} readOnly className="flex-1" />
              <Button onClick={copyToClipboard} variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                {copied ? "Copied!" : "Copy"}
              </Button>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Share this link with friends. You'll earn MAD 500 for each
              successful referral.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
