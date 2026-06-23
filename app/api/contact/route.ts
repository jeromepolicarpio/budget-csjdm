import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const REASONS = ["Data error", "Missing data", "Suggestion", "Other"] as const;
type Reason = (typeof REASONS)[number];

function isValidReason(v: unknown): v is Reason {
  return REASONS.includes(v as Reason);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { email, reason, message } = body as Record<string, unknown>;

  if (
    typeof email !== "string" ||
    !email.includes("@") ||
    !isValidReason(reason) ||
    typeof message !== "string" ||
    message.trim().length < 5
  ) {
    return NextResponse.json({ error: "Invalid fields" }, { status: 422 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: "CSJDM Budget Portal <onboarding@resend.dev>",
    to: "policarpiojerome2005@gmail.com",
    replyTo: email,
    subject: `[CSJDM Budget] ${reason} — from ${email}`,
    text: `Reason: ${reason}\nFrom: ${email}\n\n${message.trim()}`,
  });

  if (error) {
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
