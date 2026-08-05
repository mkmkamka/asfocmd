import { NextRequest, NextResponse } from "next/server";
import { readAll } from "@/lib/store";
import { normalisePhone, type StoredMember } from "@/lib/content-types";

/**
 * "Am I a member?" — answered by phone number and nothing else.
 *
 * The reply is deliberately thin: confirmed or not, the join date, and the
 * district. No name, no list, no way to ask a second question from the first
 * answer. That is the whole reason the lookup is by phone rather than by name:
 * a name can be guessed, so a name search would let anyone walk the membership
 * roll one guess at a time. You have to already know the number.
 *
 * The throttle below is what closes the remaining gap. Moldovan mobile numbers
 * are only so many digits, and without a limit a script could work through the
 * range; eight tries a minute makes that pointless while never getting in the
 * way of someone checking their own number.
 */

const WINDOW_MS = 60 * 1000;
const MAX_TRIES = 8;
const attempts = new Map<string, { count: number; first: number }>();

function throttled(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.first > WINDOW_MS) {
    attempts.set(key, { count: 1, first: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_TRIES;
}

export async function POST(req: NextRequest) {
  const key =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "local";
  if (throttled(key)) {
    return NextResponse.json({ error: "too_many" }, { status: 429 });
  }

  let phone: unknown;
  try {
    phone = (await req.json())?.phone;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (typeof phone !== "string" || normalisePhone(phone).length < 6) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 422 });
  }

  const wanted = normalisePhone(phone);
  const members = await readAll<StoredMember>("members");
  // Deliberately matches hidden members too: someone who asked not to appear
  // in the public directory is still a member, and is still entitled to a
  // straight answer about their own status.
  const found = members.find((m) => normalisePhone(m.phone ?? "") === wanted);

  if (!found) return NextResponse.json({ member: false });
  return NextResponse.json({
    member: true,
    joinedAt: found.joinedAt,
    districtId: found.districtId,
  });
}
