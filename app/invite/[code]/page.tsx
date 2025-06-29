"use client";

import { useParams, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import {
  CheckCircle,
  Mail,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  Instagram,
} from "lucide-react";
import { useReferralStore } from "@/lib/referral-store";

export default function InvitePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const referralCode = params.code as string;
  const emailFromUrl = searchParams.get("email");
  const tokenFromUrl = searchParams.get("token");

  const { verifyReferralCode, convertReferral, referralInvites } =
    useReferralStore();

  const [email, setEmail] = useState(emailFromUrl || "");
  const [name, setName] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "pending" | "verified" | "error"
  >("pending");
  const [hasJoined, setHasJoined] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Auto-verify if email and token are in URL
  useEffect(() => {
    if (emailFromUrl && tokenFromUrl && referralCode) {
      handleVerification();
    }
  }, [emailFromUrl, tokenFromUrl, referralCode]);

  const handleVerification = async () => {
    if (!email.trim() || !tokenFromUrl) return;

    setIsVerifying(true);
    setErrorMessage("");

    try {
      const result = await verifyReferralCode(
        referralCode,
        email,
        tokenFromUrl
      );
      if (result.success) {
        setVerificationStatus("verified");
      } else {
        setVerificationStatus("error");
        setErrorMessage(result.message);
      }
    } catch (error) {
      setVerificationStatus("error");
      setErrorMessage("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleJoin = async () => {
    if (!email.trim() || !name.trim()) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    setIsJoining(true);

    // Simulate account creation
    setTimeout(() => {
      // Find and convert the referral
      const invite = referralInvites.find(
        (inv) => inv.referralCode === referralCode && inv.inviteeEmail === email
      );
      if (invite) {
        convertReferral(invite.id);
      }

      setHasJoined(true);
      setIsJoining(false);
    }, 2000);
  };

  if (hasJoined) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Welcome to Trendies!</h2>
            <p className="text-gray-700">
              Your account has been created and your referral is confirmed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light text-black mb-8 tracking-wide">
            CONGRATULATIONS!
          </h1>

          <div className="mb-8">
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              You have been selected to join Trendies,
              <br />
              the first exclusive community dedicated to the resale of
              <br />
              authentic luxury items.
            </p>
          </div>
        </div>

        {/* Verification Status */}
        {emailFromUrl && tokenFromUrl && (
          <div className="mb-8">
            <Card
              className={`border-2 ${
                verificationStatus === "verified"
                  ? "border-green-200 bg-green-50"
                  : verificationStatus === "error"
                  ? "border-red-200 bg-red-50"
                  : "border-blue-200 bg-blue-50"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  {verificationStatus === "verified" && (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  )}
                  {verificationStatus === "error" && (
                    <Mail className="h-6 w-6 text-red-600" />
                  )}
                  {verificationStatus === "pending" && (
                    <Mail className="h-6 w-6 text-blue-600" />
                  )}
                  <div>
                    <h3
                      className={`font-semibold ${
                        verificationStatus === "verified"
                          ? "text-green-800"
                          : verificationStatus === "error"
                          ? "text-red-800"
                          : "text-blue-800"
                      }`}
                    >
                      {verificationStatus === "verified" &&
                        "Email Verified Successfully!"}
                      {verificationStatus === "error" && "Verification Failed"}
                      {verificationStatus === "pending" && "Verifying Email..."}
                    </h3>
                    <p
                      className={`text-sm ${
                        verificationStatus === "verified"
                          ? "text-green-700"
                          : verificationStatus === "error"
                          ? "text-red-700"
                          : "text-blue-700"
                      }`}
                    >
                      {verificationStatus === "verified" &&
                        "You can now complete your signup below."}
                      {verificationStatus === "error" && errorMessage}
                      {verificationStatus === "pending" &&
                        "Please wait while we verify your email..."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sign Up Form */}
        <Card className="bg-white shadow-lg max-w-md mx-auto mb-12">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-black mb-6 text-center">
              Join as a Seller
            </h2>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{errorMessage}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referral Code
                </label>
                <Input
                  type="text"
                  value={referralCode}
                  readOnly
                  className={emailFromUrl ? "bg-gray-50" : ""}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!!emailFromUrl}
                  className={emailFromUrl ? "bg-gray-50" : ""}
                />
                {emailFromUrl && (
                  <p className="text-xs text-gray-500 mt-1">
                    Email pre-filled from invitation
                  </p>
                )}
              </div>

              <Button
                onClick={handleJoin}
                disabled={
                  !Boolean(email.trim()) ||
                  !Boolean(name.trim()) ||
                  Boolean(isJoining) ||
                  (Boolean(emailFromUrl) && verificationStatus !== "verified")
                }
                className="w-full h-12 text-base bg-black hover:bg-gray-800 rounded-none font-medium tracking-wide"
              >
                {isJoining ? "Creating Account..." : "JOIN TRENDIES NOW"}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By joining, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <div className="mb-12">
            <h2 className="text-4xl font-light text-black tracking-wider mb-8">
              trendies
            </h2>
          </div>

          <div className="mb-12">
            <p className="text-gray-700 font-medium text-lg">
              See you very soon,
            </p>
            <p className="text-gray-700 text-lg">The Trendies team</p>
          </div>

          <div className="mb-12">
            <p className="text-sm text-gray-600 mb-6">Follow us</p>
            <div className="flex justify-center space-x-6">
              <Facebook className="h-6 w-6 text-gray-600 hover:text-blue-600 cursor-pointer transition-colors" />
              <Twitter className="h-6 w-6 text-gray-600 hover:text-blue-400 cursor-pointer transition-colors" />
              <Youtube className="h-6 w-6 text-gray-600 hover:text-red-600 cursor-pointer transition-colors" />
              <Instagram className="h-6 w-6 text-gray-600 hover:text-pink-600 cursor-pointer transition-colors" />
              <Linkedin className="h-6 w-6 text-gray-600 hover:text-blue-700 cursor-pointer transition-colors" />
              <div className="w-6 h-6 bg-gray-600 rounded-full hover:bg-black cursor-pointer transition-colors"></div>{" "}
              {/* TikTok placeholder */}
            </div>
          </div>

          <div className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
            <p>
              You are receiving this email because you requested to receive news
              about Trendies.
            </p>
            <p className="mt-2">
              Want to change how you receive these emails? You can update your
              preferences or unsubscribe from this list.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
