import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { isLoggedIn } from "@/lib/admin-auth";
import { findDocument } from "@/lib/media";

/**
 * Serves an application's attachments to a logged-in administrator.
 *
 * These are scans of registration certificates and identity cards, so they are
 * stored in `.data/uploads/` where nothing serves them by default. This route
 * is the only way back out, and it checks the session before touching the disk.
 */
const UPLOAD_ROOT = path.join(process.cwd(), ".data", "uploads");

const TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(req: NextRequest) {
  if (!(await isLoggedIn())) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  const rel = req.nextUrl.searchParams.get("path") ?? "";

  // Documents kept in the database (the Vercel case) carry a `db:` handle
  // rather than a path — see saveDocumentBytes.
  const fromDb = await findDocument(rel);
  if (fromDb) {
    return new NextResponse(new Uint8Array(Buffer.from(fromDb.data, "base64")), {
      headers: {
        "Content-Type": fromDb.type,
        "Cache-Control": "private, no-store",
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }
  if (rel.startsWith("db:")) return new NextResponse("not found", { status: 404 });
  // The parameter arrives from a URL, so it is untrusted: resolve it and then
  // prove the result is still inside the upload root. A prefix check on the
  // raw string would be fooled by `..%2f`; resolving first is what makes the
  // comparison meaningful.
  const target = path.resolve(UPLOAD_ROOT, rel);
  if (target !== UPLOAD_ROOT && !target.startsWith(UPLOAD_ROOT + path.sep)) {
    return new NextResponse("forbidden", { status: 403 });
  }

  let body: Buffer;
  try {
    body = await fs.readFile(target);
  } catch {
    return new NextResponse("not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(body), {
    headers: {
      "Content-Type": TYPES[path.extname(target).toLowerCase()] ??
        "application/octet-stream",
      // Never let a shared cache or a proxy keep a copy of an identity document.
      "Cache-Control": "private, no-store",
      "Content-Disposition": "inline",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
