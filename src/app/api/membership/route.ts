import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { saveDocumentBytes } from "@/lib/media";
import { readAll, usingPostgres, writeAll } from "@/lib/store";

// Membership applications land here. For the concept phase they are appended to
// .data/submissions.json; in production this will notify the secretariat by
// email and/or create a pending entry in the CMS.
//
// Attachments (registration certificate, identity card) go to .data/uploads/,
// deliberately *not* to public/ — these are scans of identity documents, and
// anything under public/ is served to anyone who guesses the URL. The admin
// panel will read them back through an authenticated route.
const UPLOAD_DIR = path.join(process.cwd(), ".data", "uploads");

const ACCEPT = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const EXT: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_FILES = 10;

type Submission = {
  fullName: string;
  phone: string;
  email: string;
  districtId: string;
  locality: string;
  isCompany: boolean;
  companyName: string;
  companyIdno: string;
  companyAddress: string;
  companyEmail: string;
  companyDesc: string;
  domains: number[];
  experience: string;
  about: string;
  heardFrom: string;
  advantage: string;
  attraction: string;
  consentGdpr: boolean;
  consentStatut: boolean;
  declaration: boolean;
  locale: string;
};

const str = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

function isValid(b: unknown): b is Submission {
  if (typeof b !== "object" || b === null) return false;
  const s = b as Record<string, unknown>;
  const base =
    typeof s.fullName === "string" && s.fullName.trim().length > 1 &&
    typeof s.phone === "string" && /^\+?[\d\s\-()]{8,}$/.test(s.phone.trim()) &&
    typeof s.email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email.trim()) &&
    typeof s.districtId === "string" && s.districtId.length > 0 &&
    typeof s.locality === "string" && s.locality.trim().length > 0 &&
    Array.isArray(s.domains) && s.domains.length > 0 &&
    // All three declarations are legal record, not UI decoration: an
    // application that arrives without them is not an application.
    s.consentGdpr === true && s.consentStatut === true && s.declaration === true;
  if (!base) return false;
  if (s.isCompany === true) {
    return (
      typeof s.companyName === "string" && s.companyName.trim().length > 0 &&
      typeof s.companyIdno === "string" && s.companyIdno.trim().length > 0
    );
  }
  return true;
}

/* Attachment names come from the applicant's own disk, so they are treated as
   untrusted text: the stored name is generated here and only the *display*
   name keeps anything the applicant typed, stripped of separators so it can
   never climb out of the folder. */
function safeLabel(name: string): string {
  return (
    name
      .replace(/[/\\]/g, "_")
      .replace(/[^\w.\- ]+/g, "")
      .slice(-120) || "document"
  );
}

export async function POST(req: NextRequest) {
  const type = req.headers.get("content-type") ?? "";
  if (!type.includes("multipart/form-data")) {
    return NextResponse.json({ error: "expected multipart" }, { status: 415 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid form data" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = JSON.parse(String(form.get("payload") ?? ""));
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!isValid(body)) {
    return NextResponse.json({ error: "invalid submission" }, { status: 422 });
  }

  const files = form.getAll("files").filter((v): v is File => v instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ error: "documents required" }, { status: 422 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: "too many files" }, { status: 413 });
  }
  for (const file of files) {
    if (!ACCEPT.has(file.type)) {
      return NextResponse.json({ error: "unsupported file" }, { status: 415 });
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "file too large" }, { status: 413 });
    }
  }

  const id = randomUUID();
  // Only needed by the on-disk driver; harmless (and skipped) when the
  // documents are going to the database instead.
  if (!usingPostgres()) {
    await fs.mkdir(path.join(UPLOAD_DIR, id), { recursive: true });
  }

  const stored: { stored: string; name: string; type: string; size: number }[] =
    [];
  for (const [i, file] of files.entries()) {
    const filename = `${i + 1}.${EXT[file.type]}`;
    const handle = await saveDocumentBytes(
      Buffer.from(await file.arrayBuffer()),
      file.type,
      `${id}/${filename}`,
      async (rel, bytes) => {
        await fs.writeFile(path.join(UPLOAD_DIR, rel), bytes);
      },
    );
    stored.push({
      stored: handle,
      name: safeLabel(file.name),
      type: file.type,
      size: file.size,
    });
  }

  const entry = {
    id,
    receivedAt: new Date().toISOString(),
    // Pending until the secretariat approves it in the admin panel; only then
    // does the applicant become findable by the membership lookup.
    status: "pending" as const,
    fullName: str(body.fullName, 200),
    phone: str(body.phone, 40),
    email: str(body.email, 200),
    districtId: str(body.districtId, 50),
    locality: str(body.locality, 200),
    isCompany: body.isCompany === true,
    companyName: str(body.companyName, 200),
    companyIdno: str(body.companyIdno, 60),
    companyAddress: str(body.companyAddress, 300),
    companyEmail: str(body.companyEmail, 200),
    companyDesc: str(body.companyDesc, 2000),
    domains: body.domains.filter(
      (n) => Number.isInteger(n) && n >= 0 && n < 20,
    ),
    experience: str(body.experience, 10),
    about: str(body.about, 2000),
    heardFrom: str(body.heardFrom, 500),
    advantage: str(body.advantage, 2000),
    attraction: str(body.attraction, 2000),
    consentGdpr: true,
    consentStatut: true,
    declaration: true,
    locale: str(body.locale, 5) || "ro",
    files: stored,
  };

  // Through the store, so the application lands wherever the rest of the
  // site's data lives — a JSON file locally, Postgres on Vercel.
  const all = await readAll<unknown>("submissions");
  all.push(entry);
  await writeAll("submissions", all);

  return NextResponse.json({ ok: true, id });
}
