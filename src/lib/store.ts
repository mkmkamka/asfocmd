import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";

/**
 * The site's writable storage — one driver chosen at runtime.
 *
 * · `DATABASE_URL` set  → Postgres (Neon). This is what runs on Vercel, where
 *   the filesystem is read-only: a write to `.data/` there does not silently
 *   lose the edit, it throws EROFS the moment the owner presses Save.
 * · nothing set         → JSON files under `.data/`, which is what local
 *   development has always used and needs no account to run.
 *
 * Both drivers store a whole collection as one JSON document, which is the
 * simplest thing that can work: no per-entity tables, no migrations, and the
 * table is created on first use. The collections are a handful of rows each —
 * a members list and a few dozen posts — so reading a collection to write one
 * item costs nothing worth optimising, and keeping the two drivers behaviourally
 * identical is worth much more than the saving would be.
 */

const DATA_DIR = path.join(process.cwd(), ".data");

export type Collection =
  | "posts"
  | "courses"
  | "members"
  | "submissions"
  | "messages"
  | "media"
  | "documents";

function databaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  return url && url.length > 0 ? url : undefined;
}

export function usingPostgres(): boolean {
  return databaseUrl() !== undefined;
}

/* ---- Postgres driver ------------------------------------------------------ */

let ready: Promise<void> | undefined;

function sql() {
  const url = databaseUrl();
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

/** Create the table once per process, not once per query. */
function ensureTable(): Promise<void> {
  ready ??= (async () => {
    await sql()`
      CREATE TABLE IF NOT EXISTS collections (
        name text PRIMARY KEY,
        data jsonb NOT NULL DEFAULT '[]'::jsonb,
        updated_at timestamptz NOT NULL DEFAULT now()
      )`;
  })();
  return ready;
}

/* ---- file driver ---------------------------------------------------------- */

function file(name: Collection): string {
  return path.join(DATA_DIR, `${name}.json`);
}

/* ---- public API ----------------------------------------------------------- */

export async function readAll<T>(name: Collection): Promise<T[]> {
  if (usingPostgres()) {
    await ensureTable();
    const rows = (await sql()`
      SELECT data FROM collections WHERE name = ${name}`) as { data: T[] }[];
    const data = rows[0]?.data;
    return Array.isArray(data) ? data : [];
  }
  try {
    const parsed = JSON.parse(await fs.readFile(file(name), "utf8"));
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export async function writeAll<T>(name: Collection, rows: T[]): Promise<void> {
  if (usingPostgres()) {
    await ensureTable();
    await sql()`
      INSERT INTO collections (name, data, updated_at)
      VALUES (${name}, ${JSON.stringify(rows)}::jsonb, now())
      ON CONFLICT (name)
      DO UPDATE SET data = EXCLUDED.data, updated_at = now()`;
    return;
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  const target = file(name);
  // Write to a temporary file and rename into place. A rename is atomic on the
  // same filesystem, so a crash mid-write leaves the previous version intact
  // rather than a truncated file — for a JSON document store that is the
  // difference between losing one edit and losing every post ever written.
  const tmp = `${target}.${randomUUID()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(rows, null, 2), "utf8");
  await fs.rename(tmp, target);
}

/** Insert or replace by `id`, newest write wins. */
export async function upsert<T extends { id: string }>(
  name: Collection,
  row: T,
): Promise<void> {
  const rows = await readAll<T>(name);
  const i = rows.findIndex((r) => r.id === row.id);
  if (i === -1) rows.push(row);
  else rows[i] = row;
  await writeAll(name, rows);
}

export async function remove(name: Collection, id: string): Promise<void> {
  const rows = await readAll<{ id: string }>(name);
  await writeAll(
    name,
    rows.filter((r) => r.id !== id),
  );
}

export async function findById<T extends { id: string }>(
  name: Collection,
  id: string,
): Promise<T | undefined> {
  return (await readAll<T>(name)).find((r) => r.id === id);
}

/* Romanian is the source language, so slugs come off the Romanian title with
   its diacritics folded down — `Instruire profesională` becomes
   `instruire-profesionala`, not `instruire-profesional`. */
export function slugify(input: string): string {
  return (
    input
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      // ș and ț decompose to a comma-below that NFD does not strip on every
      // platform; map the four Romanian letters explicitly.
      .replace(/[șş]/gi, "s")
      .replace(/[țţ]/gi, "t")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "articol"
  );
}

/** A slug that no other row in the collection is already using. */
export async function uniqueSlug(
  name: Collection,
  title: string,
  selfId?: string,
): Promise<string> {
  const base = slugify(title);
  const rows = await readAll<{ id: string; slug?: string }>(name);
  const taken = new Set(rows.filter((r) => r.id !== selfId).map((r) => r.slug));
  if (!taken.has(base)) return base;
  for (let n = 2; n < 500; n++) {
    if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
  }
  return `${base}-${Date.now()}`;
}

export { randomUUID as newId };
