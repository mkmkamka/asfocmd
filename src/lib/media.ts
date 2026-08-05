import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { newId, readAll, upsert, usingPostgres } from "@/lib/store";

/**
 * Cover images for news and courses.
 *
 * Locally they are ordinary files under `public/uploads/` and Next serves them
 * as static assets. On Vercel that directory is read-only, so the same image is
 * kept in the database alongside everything else and handed back by
 * `/api/media/<id>`. The caller does not care which happened — it gets a URL.
 *
 * Storing image bytes in Postgres is not what you would do for a photo library.
 * For this site it is the right trade: a handful of cover images, no second
 * service to sign up for, no extra token to keep alive, and one place to back
 * up. If the association ever starts publishing galleries, this is the piece to
 * swap for object storage.
 */

const MEDIA_DIR = path.join(process.cwd(), "public", "uploads");

export const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
export const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

export type StoredMedia = {
  id: string;
  type: string;
  /** base64, because JSON has no bytes. */
  data: string;
  createdAt: string;
};

/** Save image bytes and return the URL that will serve them. */
export async function saveImageBytes(
  bytes: Buffer,
  contentType: string,
): Promise<string | undefined> {
  const ext = IMAGE_TYPES[contentType];
  if (!ext) return undefined;
  if (bytes.byteLength > MAX_IMAGE_BYTES) return undefined;

  if (usingPostgres()) {
    const id = newId();
    await upsert<StoredMedia>("media", {
      id,
      type: contentType,
      data: bytes.toString("base64"),
      createdAt: new Date().toISOString(),
    });
    return `/api/media/${id}`;
  }

  await fs.mkdir(MEDIA_DIR, { recursive: true });
  const name = `${newId()}.${ext}`;
  await fs.writeFile(path.join(MEDIA_DIR, name), bytes);
  return `/uploads/${name}`;
}

export async function findMedia(id: string): Promise<StoredMedia | undefined> {
  return (await readAll<StoredMedia>("media")).find((m) => m.id === id);
}

/**
 * The same problem for the documents attached to a membership application —
 * a registration certificate and an ID card — except these must never become
 * a public URL. They go in their own collection, and the only way back out is
 * the session-checked route at /api/admin/document.
 *
 * The returned handle is what gets recorded on the application: `db:<id>` when
 * it lives in the database, or a relative path when it is a file on disk.
 * The prefix is what tells the two apart on the way back.
 */
export async function saveDocumentBytes(
  bytes: Buffer,
  contentType: string,
  suggestedPath: string,
  writeFile: (relative: string, bytes: Buffer) => Promise<void>,
): Promise<string> {
  if (!usingPostgres()) {
    await writeFile(suggestedPath, bytes);
    return suggestedPath;
  }
  const id = newId();
  await upsert<StoredMedia>("documents", {
    id,
    type: contentType,
    data: bytes.toString("base64"),
    createdAt: new Date().toISOString(),
  });
  return `db:${id}`;
}

export async function findDocument(
  handle: string,
): Promise<StoredMedia | undefined> {
  if (!handle.startsWith("db:")) return undefined;
  const id = handle.slice(3);
  return (await readAll<StoredMedia>("documents")).find((d) => d.id === id);
}
