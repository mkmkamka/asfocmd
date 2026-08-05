import { NextRequest, NextResponse } from "next/server";
import { newId, readAll, writeAll } from "@/lib/store";

// Contact messages land in the "messages" collection and show up in the admin
// inbox. Sending them on by e-mail is still to come — it needs a provider key.

type Message = {
  name: string;
  email: string;
  subject: string;
  message: string;
  locale: string;
};

function isValid(b: unknown): b is Message {
  if (typeof b !== "object" || b === null) return false;
  const m = b as Record<string, unknown>;
  return (
    typeof m.name === "string" && m.name.trim().length > 1 &&
    typeof m.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email.trim()) &&
    typeof m.message === "string" && m.message.trim().length > 4
  );
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!isValid(body)) {
    return NextResponse.json({ error: "invalid message" }, { status: 422 });
  }

  const entry = {
    // The admin inbox acts on rows by id, and legacy rows without one had to
    // be healed on read — new ones carry theirs from the start.
    id: newId(),
    receivedAt: new Date().toISOString(),
    read: false,
    name: body.name.trim().slice(0, 200),
    email: body.email.trim().slice(0, 200),
    subject: String(body.subject ?? "").trim().slice(0, 300),
    message: body.message.trim().slice(0, 5000),
    locale: String(body.locale ?? "ro").slice(0, 5),
  };

  // Through the store: a JSON file locally, Postgres on Vercel — where the
  // filesystem is read-only and the direct fs write this replaced returned a
  // 500 to anyone who used the contact form.
  const all = await readAll<unknown>("messages");
  all.push(entry);
  await writeAll("messages", all);

  return NextResponse.json({ ok: true });
}
