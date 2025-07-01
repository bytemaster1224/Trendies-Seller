import { NextRequest, NextResponse } from "next/server";

// Demo: In-memory array (server-side only, resets on server restart)
let invites = [
  {
    id: "invite_1",
    referralCode: "REF-STEPHEN2025",
    inviteeEmail: "friend1@example.com",
    status: "pending",
  },
  // ... more invites
];

export async function POST(req: NextRequest) {
  try {
    const { email, password, referralCode } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }
    // Access referral store (mock/in-memory)
    // NOTE: In a real app, this would be a DB call, not Zustand store!
    // We simulate the logic here for demo purposes.
    let referralConverted = false;

    // Check if referral code is valid and tied to this email
    const invite = invites.find(
      (inv) =>
        inv.referralCode === referralCode &&
        inv.inviteeEmail === email &&
        inv.status === "pending"
    );

    if (invite) {
      // Mark as converted
      invite.status = "converted";
      referralConverted = true;
    }

    // Simulate user creation (in real app, save to DB)
    // ...

    return NextResponse.json({ success: true, referralConverted });
  } catch (err) {
    return NextResponse.json({
      success: false,
      message: err instanceof Error ? err.message : String(err),
    });
  }
}
