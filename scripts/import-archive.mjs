// Converts content/scraped/posts/*.md (Blogger export of asfoc.md) into
// src/data/archive-posts.json: cleaned Romanian paragraphs per post.
// Trilingual titles/excerpts/categories live in src/data/archive-meta.ts.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SRC = path.join(root, "content/scraped/posts");
const OUT = path.join(root, "src/data/archive-posts.json");

// Not worth publishing on the new site ("new website coming" announcement).
const SKIP = new Set(["2026-07-blog-post"]);

function parse(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const fm = m[1];
  const body = m[2];
  const title = (fm.match(/^title: (.*)$/m)?.[1] ?? "").replace(/^"|"$/g, "");
  const date = fm.match(/^date: (.*)$/m)?.[1] ?? "";
  const source = fm.match(/^source_url: (.*)$/m)?.[1] ?? "";
  const imagesSection = fm.split(/^images:/m)[1]?.split(/^embeds:/m)[0] ?? "";
  const images = [...imagesSection.matchAll(/^ {2}- (https?:\S+)/gm)].map((x) => x[1]);
  const embedsSection = fm.split(/^embeds:/m)[1] ?? "";
  const embeds = [...embedsSection.matchAll(/^ {2}- (https?:\S+)/gm)].map((x) => x[1]);
  return { title, date, source, images, embeds, body };
}

function cleanBody(body) {
  let s = body;
  s = s.replace(/!\[[^\]]*\]\([^)]*\)/g, " "); // images
  s = s.replace(/\[EMBED:[^\]]*\]/g, " ");
  s = s.replace(/\[IMAGINE ÎNCORPORATĂ[^\]]*\]/g, " ");
  s = s.replace(/\[([^\]]*)\]\((https?:[^)]+)\)/g, (_, txt, url) => {
    const t = txt.replace(/\s+/g, " ").trim();
    return t ? `${t} (${url})` : "";
  });
  // Leftovers from image-wrapped links and tracking params.
  s = s.replace(/\(?https?:\/\/(blogger|1\.bp|2\.bp|3\.bp|4\.bp)\.[^\s)]+\)?/g, " ");
  s = s.replace(/\(https?:\/\/www\.facebook\.com\/[^)]*__cft__[^)]*\)/g, " ");
  s = s.replace(/^\s*\.\w{2,4}\)\s*/gm, " "); // stray ".png)" fragments
  s = s.replace(/\*\*|\*|__/g, ""); // body renders as plain text, drop md emphasis
  const paras = s
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim().replace(/^\.\w{2,4}\)\s*/, ""))
    .filter((p) => p && !/^[[\]().\-–—*_ ]*$/.test(p));
  // Blogger line breaks split sentences mid-way; merge fragments that don't
  // end a sentence with the next paragraph, capped so lists stay readable.
  const merged = [];
  const norm = (t) => t.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
  for (const p of paras) {
    const prev = merged[merged.length - 1];
    // Blogger sources sometimes repeat a paragraph, occasionally with tiny
    // punctuation differences — compare letters/digits only.
    if (prev && norm(prev) === norm(p)) continue;
    if (prev && !/[.!?:;]$/.test(prev) && prev.length + p.length < 600) {
      merged[merged.length - 1] = `${prev} ${p}`;
    } else {
      merged.push(p);
    }
  }
  return merged;
}

// Images were fetched by download-archive-images.mjs using the same
// slug-index naming; keep only the ones that actually exist on disk.
const IMG_DIR = path.join(root, "public/archive");
function localImages(slug, urls) {
  const out = [];
  for (let i = 0; i < urls.length; i++) {
    const clean = urls[i].split("?")[0];
    const extMatch = clean.match(/\.(jpe?g|png|gif|webp)$/i);
    const ext = extMatch ? extMatch[1].toLowerCase().replace("jpeg", "jpg") : "jpg";
    const name = `${slug}-${i}.${ext}`;
    if (fs.existsSync(path.join(IMG_DIR, name))) out.push(`/archive/${name}`);
  }
  return out;
}

const posts = [];
for (const f of fs.readdirSync(SRC).filter((f) => f.endsWith(".md"))) {
  const slug = f.replace(/\.md$/, "");
  if (SKIP.has(slug)) continue;
  const { title, date, source, images, embeds, body } = parse(fs.readFileSync(path.join(SRC, f), "utf8"));
  const paragraphs = cleanBody(body);
  const local = localImages(slug, images);
  if (!paragraphs.length && !local.length && !embeds.length) continue;
  posts.push({ slug, iso: date, source, title, images: local, embeds, paragraphs });
}
posts.sort((a, b) => b.iso.localeCompare(a.iso));
fs.writeFileSync(OUT, JSON.stringify(posts, null, 2) + "\n");
console.log(`wrote ${posts.length} posts -> ${path.relative(root, OUT)}`);
for (const p of posts) {
  console.log(`\n### ${p.slug} | ${p.iso} | ${p.title}`);
  console.log(`  ${(p.paragraphs[0] ?? `[${p.images.length} img, ${p.embeds.length} embed]`).slice(0, 220)}`);
}
