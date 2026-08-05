import { NextResponse } from "next/server";
import { findMedia } from "@/lib/media";

/**
 * Serves a cover image kept in the database (the Vercel case — see
 * `src/lib/media.ts`). Public on purpose: these are illustrations on news
 * articles, unlike the application documents in /api/admin/document, which are
 * identity papers and need a session.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const media = await findMedia(id);
  if (!media) return new NextResponse("not found", { status: 404 });

  return new NextResponse(new Uint8Array(Buffer.from(media.data, "base64")), {
    headers: {
      "Content-Type": media.type,
      // Content at this URL never changes — the id is minted per upload.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
