import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { inviteEmail, referralCode } = body;

  if (!inviteEmail || !referralCode) {
    return NextResponse.json(
      { success: false, message: "Missing fields" },
      { status: 400 }
    );
  }

  // Configure Brevo API key

  const apiKey = process.env.BREVO_API_KEY;
  const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey!,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      to: [{ email: inviteEmail }],
      templateId: 6, // Replace with your Brevo template ID
      params: { REFERRAL_CODE: referralCode },
      headers: { "X-Mailin-custom": "Referral Email via Next.js" },
    }),
  });

  if (!brevoRes.ok) {
    const error = await brevoRes.json();
    console.error("Brevo error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to send email" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
