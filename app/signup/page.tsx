"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function SignupForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [referralCode, setReferralCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [referralConverted, setReferralConverted] = useState(false);

  useEffect(() => {
    const code = searchParams.get("referral") || searchParams.get("code");
    const userEmail = searchParams.get("email");
    if (code) setReferralCode(code);
    if (userEmail) setEmail(decodeURIComponent(userEmail));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    setReferralConverted(false);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, referralCode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setReferralConverted(!!data.referralConverted);
        setTimeout(() => router.push("/"), 2000);
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="max-w-md w-full">
        <Card className="bg-white border border-gray-200 shadow-lg">
          <CardContent className="p-8 space-y-6">
            <h1 className="text-2xl font-bold text-center mb-2">
              Sign Up for Trendies
            </h1>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Referral Code
                </label>
                <Input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              {success && (
                <div className="text-green-600 text-sm text-center">
                  Signup successful!{" "}
                  {referralConverted
                    ? "Referral credited."
                    : "No referral credit awarded."}{" "}
                  Redirecting...
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-black hover:bg-gray-800 text-white py-3 text-lg font-medium"
                disabled={loading}
              >
                {loading ? "Signing up..." : "Sign Up"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
