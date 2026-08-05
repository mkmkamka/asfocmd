// CMS access layer. Every page reads its content through this module, so the
// question of *where* content lives is answered in exactly one file.
//
// Two sources are merged:
//  · the migrated Blogger archive (src/data/archive.ts) — fixed, historical;
//  · whatever the owner has published in /admin, which lives in the store.
//
// The admin's shapes are richer than the public `Post` (localised fields where
// Romanian is the only required language, a course's dates and price), so they
// are adapted here rather than teaching every page a second shape.
import {
  members as sampleMembers,
  districtCounts as sampleCounts,
  TOTAL_MEMBERS as SAMPLE_TOTAL,
  type Member,
} from "@/data/members";
import { type Post, type PostBlock, type Localized } from "@/data/news";
import { archivePosts, localizedDate } from "@/data/archive";
import { readAll } from "@/lib/store";
import {
  pick,
  type AdminCourse,
  type AdminPost,
  type Localized as AdminLocalized,
  type StoredMember,
} from "@/lib/content-types";

export type { Member, Post };

/* ---- adapters ------------------------------------------------------------- */

/** Romanian is the only required language; the others fall back to it. */
function spread(value: AdminLocalized | undefined): Localized {
  return {
    ro: pick(value, "ro"),
    ru: pick(value, "ru"),
    en: pick(value, "en"),
  };
}

/** Blank-line-separated plain text becomes the article's paragraphs. */
function paragraphs(value: AdminLocalized | undefined): PostBlock[] {
  const split = (locale: "ro" | "ru" | "en") =>
    pick(value, locale)
      .split(/\r?\n\s*\r?\n/)
      .map((p) => p.trim())
      .filter(Boolean);

  const ro = split("ro");
  const ru = split("ru");
  const en = split("en");

  // Translations are optional and may not have the same number of paragraphs
  // as the Romanian; where one runs out, that paragraph falls back to Romanian
  // rather than leaving a hole in the middle of the article.
  return ro.map((text, i) => ({
    p: { ro: text, ru: ru[i] ?? text, en: en[i] ?? text },
  }));
}

const CATEGORY_NEWS: Localized = { ro: "Știri", ru: "Новости", en: "News" };
const CATEGORY_TRAINING: Localized = {
  ro: "Instruire",
  ru: "Обучение",
  en: "Training",
};

/** Deterministic cover variant, so a post's card does not change on reload. */
function coverFor(slug: string): 1 | 2 | 3 {
  let sum = 0;
  for (const ch of slug) sum += ch.charCodeAt(0);
  return ((sum % 3) + 1) as 1 | 2 | 3;
}

function fromAdminPost(post: AdminPost): Post {
  return {
    slug: post.slug,
    iso: post.date,
    cover: coverFor(post.slug),
    image: post.image,
    cat: CATEGORY_NEWS,
    date: localizedDate(post.date),
    title: spread(post.title),
    excerpt: spread(post.excerpt),
    body: paragraphs(post.body),
    link: post.link || undefined,
  };
}

/**
 * A course carries facts a reader needs before the prose — when, where, how
 * much, by when, and who to write to. They are lifted to the top of the body
 * as their own paragraph so they are visible without reading the announcement.
 */
function fromAdminCourse(course: AdminCourse): Post {
  const facts = (locale: "ro" | "ru" | "en") => {
    const L = {
      ro: { when: "Perioada", where: "Locul", price: "Preț", until: "Înscrieri până la", contact: "Contact" },
      ru: { when: "Период", where: "Место", price: "Цена", until: "Заявки до", contact: "Контакт" },
      en: { when: "Dates", where: "Location", price: "Price", until: "Apply by", contact: "Contact" },
    }[locale];

    const lines = [
      `${L.when}: ${course.startDate}${course.endDate ? ` – ${course.endDate}` : ""}`,
      pick(course.location, locale) && `${L.where}: ${pick(course.location, locale)}`,
      pick(course.price, locale) && `${L.price}: ${pick(course.price, locale)}`,
      course.deadline && `${L.until}: ${course.deadline}`,
      [course.contactEmail, course.contactPhone].filter(Boolean).length > 0 &&
        `${L.contact}: ${[course.contactEmail, course.contactPhone].filter(Boolean).join(" · ")}`,
    ].filter(Boolean);
    return lines.join("\n");
  };

  return {
    slug: course.slug,
    iso: course.startDate,
    cover: coverFor(course.slug),
    image: course.image,
    cat: CATEGORY_TRAINING,
    date: localizedDate(course.startDate),
    title: spread(course.title),
    excerpt: spread(course.summary),
    body: [
      { p: { ro: facts("ro"), ru: facts("ru"), en: facts("en") } },
      ...paragraphs(course.body),
    ],
    link: course.link || undefined,
  };
}

/* ---- readers -------------------------------------------------------------- */

async function adminPosts(): Promise<Post[]> {
  const rows = await readAll<AdminPost>("posts");
  return rows.filter((p) => p.published).map(fromAdminPost);
}

async function adminCourses(): Promise<Post[]> {
  const rows = await readAll<AdminCourse>("courses");
  return rows.filter((c) => c.published).map(fromAdminCourse);
}

export async function getPosts(): Promise<Post[]> {
  const [posts, courses] = await Promise.all([adminPosts(), adminCourses()]);
  return [...archivePosts, ...posts, ...courses].sort((a, b) =>
    b.iso.localeCompare(a.iso),
  );
}

// A post belongs to the "Instruiri" section when its category is training
// (cat.ro === "Instruire"); everything else is general news. The Romanian
// label is the stable key here — titles/excerpts differ per locale.
export function isTrainingPost(post: Post): boolean {
  return post.cat.ro === "Instruire";
}

export async function getNewsPosts(): Promise<Post[]> {
  return (await getPosts()).filter((p) => !isTrainingPost(p));
}

export async function getTrainingPosts(): Promise<Post[]> {
  return (await getPosts()).filter(isTrainingPost);
}

export async function getPost(slug: string): Promise<Post | undefined> {
  return (await getPosts()).find((p) => p.slug === slug);
}

/* ---- members -------------------------------------------------------------- */

/**
 * The directory shows whoever the owner has approved or entered by hand.
 *
 * Until there is a real list, the ten sample specialists stand in so the map
 * and the district colouring have something to show — the preview would
 * otherwise look broken rather than empty. The moment one real member exists
 * the sample disappears completely; there is never a mix of the two, which is
 * what would actually mislead someone.
 */
async function storedMembers(): Promise<StoredMember[]> {
  return (await readAll<StoredMember>("members")).filter((m) => m.listed);
}

export async function getMembers(): Promise<Member[]> {
  const rows = await storedMembers();
  if (rows.length === 0) return sampleMembers;
  return rows.map((m) => ({
    id: m.id,
    name: m.name,
    initials: m.initials,
    districtId: m.districtId,
    services: m.services,
    phone: m.phone || undefined,
  }));
}

export async function getDistrictCounts(): Promise<Record<string, number>> {
  const rows = await storedMembers();
  if (rows.length === 0) return sampleCounts;
  const counts: Record<string, number> = {};
  for (const m of rows) {
    if (m.districtId) counts[m.districtId] = (counts[m.districtId] ?? 0) + 1;
  }
  return counts;
}

export async function getTotalMembers(): Promise<number> {
  const rows = await storedMembers();
  return rows.length === 0 ? SAMPLE_TOTAL : rows.length;
}

/** True while the directory is still showing the stand-in sample. */
export async function usingSampleMembers(): Promise<boolean> {
  return (await storedMembers()).length === 0;
}
