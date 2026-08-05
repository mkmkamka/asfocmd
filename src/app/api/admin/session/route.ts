import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  checkPassword,
  clearAttempts,
  isConfigured,
  issueToken,
  recordFailure,
  tooManyAttempts,
} from "@/lib/admin-auth";

/** Client identity for throttling only — never trusted for anything else. */
function clientKey(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "local"
  );
}

// POST /api/admin/session — log in.
export async function POST(req: NextRequest) {
  if (!isConfigured()) {
    // No password set on the server. Say so plainly rather than rejecting the
    // owner's correct password with "wrong password" — this is a setup step
    // that has been missed, not a failed login.
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const key = clientKey(req);
  if (tooManyAttempts(key)) {
    return NextResponse.json({ error: "too_many" }, { status: 429 });
  }

  let password: unknown;
  try {
    password = (await req.json())?.password;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  if (!checkPassword(password)) {
    recordFailure(key);
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }

  clearAttempts(key);
  const { token, maxAge } = issueToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
  return res;
}

// DELETE /api/admin/session — log out.
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
