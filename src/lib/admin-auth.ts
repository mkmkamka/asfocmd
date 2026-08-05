import "server-only";
import { createHmac, timingSafeEqual, randomUUID } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Admin session: one shared password, one signed cookie.
 *
 * There is exactly one person who edits this site, so there is no user table,
 * no registration and no password reset — the password lives in the server's
 * environment and the browser gets a signed, expiring token in return. That
 * keeps the whole of authentication to this one file.
 *
 * The token is `expiry.signature`, signed with HMAC-SHA256. Nothing about the
 * session is stored server-side, so it survives restarts and deploys without a
 * database; the signature is what makes the cookie unforgeable, and the expiry
 * inside the *signed* payload is what stops a copied cookie living forever
 * (a cookie's own `maxAge` is a hint to the browser, not a rule the server can
 * rely on).
 *
 * The signing key defaults to a value derived from the password itself, which
 * has a useful consequence: changing `ADMIN_PASSWORD` invalidates every session
 * that was issued under the old one. Set `ADMIN_SESSION_SECRET` when you want
 * sessions to survive a password change instead.
 */

export const SESSION_COOKIE = "asfoc_admin";
const SESSION_DAYS = 30;

export function adminPassword(): string | undefined {
  const value = process.env.ADMIN_PASSWORD;
  return value && value.length > 0 ? value : undefined;
}

/** True when the server has been given a password to check against. */
export function isConfigured(): boolean {
  return adminPassword() !== undefined;
}

function signingKey(): string {
  return process.env.ADMIN_SESSION_SECRET || `derived:${adminPassword() ?? ""}`;
}

function sign(payload: string): string {
  return createHmac("sha256", signingKey()).update(payload).digest("hex");
}

/** Constant-time compare that also tolerates length differences. */
function sameString(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  // timingSafeEqual throws on unequal lengths, and the throw itself would leak
  // the length — hash both sides first so the comparison is always 32 bytes.
  const ah = createHmac("sha256", "cmp").update(ab).digest();
  const bh = createHmac("sha256", "cmp").update(bb).digest();
  return timingSafeEqual(ah, bh);
}

export function checkPassword(candidate: unknown): boolean {
  const expected = adminPassword();
  if (!expected || typeof candidate !== "string") return false;
  return sameString(candidate, expected);
}

export function issueToken(): { token: string; maxAge: number } {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  const expires = Date.now() + maxAge * 1000;
  // The nonce makes two sessions issued in the same millisecond distinct, so a
  // token can be told apart from another rather than being a pure function of
  // the clock.
  const payload = `${expires}.${randomUUID()}`;
  return { token: `${payload}.${sign(payload)}`, maxAge };
}

export function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const cut = token.lastIndexOf(".");
  if (cut < 0) return false;
  const payload = token.slice(0, cut);
  const signature = token.slice(cut + 1);
  if (!sameString(signature, sign(payload))) return false;
  const expires = Number(payload.split(".")[0]);
  return Number.isFinite(expires) && expires > Date.now();
}

/** Read the current request's cookie and say whether it carries a live session. */
export async function isLoggedIn(): Promise<boolean> {
  const jar = await cookies();
  return verifyToken(jar.get(SESSION_COOKIE)?.value);
}

/**
 * Guard for Server Actions and admin pages.
 *
 * Server Actions are reachable by a direct POST, not only through the panel's
 * own buttons, so every one of them has to check for itself — a page-level
 * redirect protects the page, not the action. Throwing (rather than
 * redirecting) is deliberate: an unauthenticated action must fail, not
 * quietly navigate.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isLoggedIn())) throw new Error("unauthorized");
}

/* ---- login throttle -------------------------------------------------------
   A single shared password is only as good as the number of guesses allowed
   against it. This is per-process and in-memory on purpose: it costs nothing,
   needs no storage, and the worst case of losing it on restart is that an
   attacker gets one more window of attempts. */
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const attempts = new Map<string, { count: number; first: number }>();

export function tooManyAttempts(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.first > ATTEMPT_WINDOW_MS) return false;
  return entry.count >= MAX_ATTEMPTS;
}

export function recordFailure(key: string): void {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now - entry.first > ATTEMPT_WINDOW_MS) {
    attempts.set(key, { count: 1, first: now });
    return;
  }
  entry.count += 1;
}

export function clearAttempts(key: string): void {
  attempts.delete(key);
}
