// Downloads the images referenced by the scraped Blogger posts/pages into
// public/archive/, at full resolution (Blogger serves any size via the /sNNNN/
// path segment). import-archive.mjs maps them by the same naming convention:
// /archive/<slug>-<index>.<ext>
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(root, "public/archive");
fs.mkdirSync(OUT, { recursive: true });

export function localImageName(slug, index, url) {
  const clean = url.split("?")[0];
  const extMatch = clean.match(/\.(jpe?g|png|gif|webp)$/i);
  const ext = extMatch ? extMatch[1].toLowerCase().replace("jpeg", "jpg") : "jpg";
  return `${slug}-${index}.${ext}`;
}

function fullSize(url) {
  return url.replace(/\/(s|w)\d+(-h\d+)?(-[a-z]+)?\//, "/s1600/");
}

async function download(url, dest) {
  const res = await fetch(fullSize(url), { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

const dirs = [path.join(root, "content/scraped/posts"), path.join(root, "content/scraped/pages")];
const jobs = [];
for (const dir of dirs) {
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".md"))) {
    const slug = f.replace(/\.md$/, "");
    const fm = fs.readFileSync(path.join(dir, f), "utf8").split("\n---\n")[0];
    const imagesSection = fm.split(/^images:/m)[1]?.split(/^embeds:/m)[0] ?? "";
    const urls = [...imagesSection.matchAll(/^ {2}- (https?:\S+)/gm)].map((m) => m[1]);
    urls.forEach((url, i) => jobs.push({ slug, i, url }));
  }
}

let ok = 0, failed = 0, skipped = 0;
const queue = [...jobs];
async function worker() {
  for (let job = queue.shift(); job; job = queue.shift()) {
    const dest = path.join(OUT, localImageName(job.slug, job.i, job.url));
    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) { skipped++; continue; }
    try {
      await download(job.url, dest);
      ok++;
    } catch (e) {
      try {
        await download(job.url, dest); // one retry
        ok++;
      } catch (e2) {
        failed++;
        console.error(`FAIL ${job.slug}#${job.i}: ${e2.message}`);
      }
    }
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
console.log(`downloaded ${ok}, skipped ${skipped}, failed ${failed} -> ${path.relative(root, OUT)}`);
