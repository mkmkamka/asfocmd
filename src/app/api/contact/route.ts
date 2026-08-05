import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

// Contact messages land here. For the concept phase they are appended to
// .data/messages.json; in production this will notify the secretariat by email.
const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "messages.json");

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
    receivedAt: new Date().toISOString(),
    name: body.name.trim().slice(0, 200),
    email: body.email.trim().slice(0, 200),
    subject: String(body.subject ?? "").trim().slice(0, 300),
    message: body.message.trim().slice(0, 5000),
    locale: String(body.locale ?? "ro").slice(0, 5),
  };

  await fs.mkdir(DATA_DIR, { recursive: true });
  let all: unknown[] = [];
  try {
    all = JSON.parse(await fs.readFile(DATA_FILE, "utf8"));
    if (!Array.isArray(all)) all = [];
  } catch {
    all = [];
  }
  all.push(entry);
  await fs.writeFile(DATA_FILE, JSON.stringify(all, null, 2));

  return NextResponse.json({ ok: true });
}
