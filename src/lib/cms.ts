// CMS access layer. Today it serves the placeholder data from src/data; once
// the Sanity project exists (see cms/README.md) the fetchers below switch to
// live GROQ queries without touching any component.
import { members, districtCounts, TOTAL_MEMBERS, type Member } from "@/data/members";
import { type Post } from "@/data/news";
// Real posts migrated from the old Blogger site. The placeholder posts in
// src/data/news.ts are no longer served — they were invented content.
import { archivePosts as posts } from "@/data/archive";

export type { Member, Post };

export async function getMembers(): Promise<Member[]> {
  // Live version:
  // return sanityFetch(`*[_type == "member" && verified == true]{...}`);
  return members;
}

export async function getDistrictCounts(): Promise<Record<string, number>> {
  // Live version:
  // return sanityFetch(`{"counts": *[_type=="member" && verified==true] {districtId}}`) → reduce
  return districtCounts;
}

export async function getTotalMembers(): Promise<number> {
  return TOTAL_MEMBERS;
}

export async function getPosts(): Promise<Post[]> {
  // Live version:
  // return sanityFetch(`*[_type == "post"] | order(publishedAt desc){...}`);
  return [...posts].sort((a, b) => b.iso.localeCompare(a.iso));
}

// A post belongs to the "Instruiri" section when its category is training
// (cat.ro === "Instruire"); everything else is general news. The Romanian
// label is the stable key here — titles/excerpts differ per locale.
export function isTrainingPost(post: Post): boolean {
  return post.cat.ro === "Instruire";
}

// News listing: everything except the training posts.
export async function getNewsPosts(): Promise<Post[]> {
  return (await getPosts()).filter((p) => !isTrainingPost(p));
}

// Instruiri listing: only the training/course posts.
export async function getTrainingPosts(): Promise<Post[]> {
  return (await getPosts()).filter(isTrainingPost);
}

export async function getPost(slug: string): Promise<Post | undefined> {
  // Live version:
  // return sanityFetch(`*[_type == "post" && slug.current == $slug][0]{...}`);
  return posts.find((p) => p.slug === slug);
}

/*
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

async function sanityFetch<T>(query: string): Promise<T> {
  const url = `https://${projectId}.apicdn.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Sanity ${res.status}`);
  return (await res.json()).result as T;
}
*/
