import { NextRequest, NextResponse } from "next/server";

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
    console.error("[contact] 422 — fields:", {
      emailOk: typeof email === "string" && email.includes("@"),
      reasonOk: isValidReason(reason),
      reason,
      messageOk: typeof message === "string" && (message as string).trim().length >= 5,
      messageLength: typeof message === "string" ? (message as string).trim().length : null,
    });
    return NextResponse.json({ error: "Invalid fields" }, { status: 422 });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("[contact] RESEND_API_KEY is not set");
    return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CSJDM Budget Portal <onboarding@resend.dev>",
        to: ["policarpiojerome2005@gmail.com"],
        reply_to: [email],
        subject: `[CSJDM Budget] ${reason} - from ${email}`,
        text: `Reason: ${reason}\nFrom: ${email}\n\n${message.trim()}`,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[contact] Resend API error:", res.status, body);
      return NextResponse.json({ error: "Failed to send" }, { status: 500 });
    }
  } catch (err) {
    console.error("[contact] fetch threw:", err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
