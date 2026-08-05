// Posts migrated from the old Blogger site (www.asfoc.md), assembled from
// archive-posts.json (cleaned Romanian originals, see scripts/import-archive.mjs)
// and archive-meta.ts (hand-authored trilingual titles/excerpts/categories).
// Bodies are served in Romanian for every locale until translated; ru/en
// readers get an archive note as the first paragraph.
import type { Locale } from "@/i18n/config";
import type { Localized, Post, PostBlock } from "@/data/news";
import { archiveMeta } from "@/data/archive-meta";
import raw from "@/data/archive-posts.json";

type RawPost = {
  slug: string;
  iso: string;
  source: string;
  title: string;
  images: string[]; // local /archive/... paths
  embeds: string[]; // YouTube embed URLs
  paragraphs: string[];
};

const MONTHS: Record<Locale, string[]> = {
  ro: ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"],
  ru: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};

export function localizedDate(iso: string): Localized {
  const [y, m, d] = iso.split("-").map(Number);
  const day = String(d);
  return {
    ro: `${day} ${MONTHS.ro[m - 1]} ${y}`,
    ru: `${day} ${MONTHS.ru[m - 1]} ${y}`,
    en: `${day} ${MONTHS.en[m - 1]} ${y}`,
  };
}

const ARCHIVE_NOTE: Localized = {
  ro: "",
  ru: "Материал из архива прежнего сайта; текст доступен только на румынском языке.",
  en: "Item from the previous website's archive; the text is available in Romanian only.",
};

function toBlocks(paragraphs: string[]): PostBlock[] {
  if (!paragraphs.length) return []; // image-only post: excerpt carries the context
  const note: PostBlock[] = [
    { p: { ro: paragraphs[0], ru: `${ARCHIVE_NOTE.ru} — ${paragraphs[0]}`, en: `${ARCHIVE_NOTE.en} — ${paragraphs[0]}` } },
  ];
  const rest = paragraphs.slice(1).map((p) => ({ p: { ro: p, ru: p, en: p } }));
  return [...note, ...rest];
}

export const archivePosts: Post[] = (raw as RawPost[]).map((r, i) => {
  const meta = archiveMeta[r.slug];
  if (!meta) throw new Error(`archive-meta.ts is missing an entry for ${r.slug}`);
  return {
    slug: r.slug,
    iso: r.iso,
    cover: ((i % 3) + 1) as 1 | 2 | 3,
    image: r.images[0],
    gallery: r.images.length > 1 ? r.images.slice(1) : undefined,
    embeds: r.embeds.length ? r.embeds : undefined,
    cat: meta.cat,
    date: localizedDate(r.iso),
    title: meta.title,
    excerpt: meta.excerpt,
    body: toBlocks(r.paragraphs),
  };
});
