import { NextRequest, NextResponse } from "next/server";
import * as Brevo from "@getbrevo/brevo";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { username, toEmail, rewardName, remainingPoints } = body;

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new Error("BREVO_API_KEY not set");

  const client = new Brevo.TransactionalEmailsApi();
  client.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);

  if (!toEmail || !rewardName) {
    return NextResponse.json(
      { success: false, message: "Missing fields" },
      { status: 400 }
    );
  }

  const emailData: Brevo.SendSmtpEmail = {
    to: [{ email: toEmail }],
    templateId: 47, // Replace with your real template ID
    params: {
      username,
      rewardName,
      remainingPoints,
    },
  };

  try {
    const result = await client.sendTransacEmail(emailData);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Brevo API error:", error);
    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }
}
