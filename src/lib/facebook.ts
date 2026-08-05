import "server-only";

/**
 * Reading the association's own Facebook page through the Graph API.
 *
 * Why the API and not the post URL the owner would naturally paste: a modern
 * Facebook permalink is `/asfocmd/posts/pfbid02Xy…`, and that `pfbid` is an
 * opaque privacy token, not the post id — it cannot be resolved back to one.
 * Fetching the page as a bot does not help either, because Facebook answers
 * anything that is not a logged-in browser with a login wall, so there are no
 * Open Graph tags to read. Listing the page's own posts with a Page token is
 * the one route that is both reliable and within Facebook's terms.
 *
 * Everything here is optional: with no token configured the importer shows
 * setup instructions instead of a list, and the rest of the admin is unaffected.
 */

/* Overridable so the import path can be exercised against a stub without a
   live Page token — the alternative is shipping the only code path that
   matters having never run. Unset in production, where it is graph.facebook.com. */
const GRAPH = process.env.FACEBOOK_GRAPH_BASE || "https://graph.facebook.com";

/** Graph API versions are retired roughly two years after release. Kept as an
    env var so a deprecation is a one-line fix rather than a redeploy of code. */
function apiVersion(): string {
  return process.env.FACEBOOK_API_VERSION || "v21.0";
}

export function facebookConfig():
  | { pageId: string; token: string }
  | undefined {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const token = process.env.FACEBOOK_PAGE_TOKEN;
  if (!pageId || !token) return undefined;
  return { pageId, token };
}

export type FacebookPost = {
  id: string;
  message: string;
  createdTime: string;
  permalink: string;
  picture?: string;
};

export class FacebookError extends Error {}

type GraphPost = {
  id: string;
  message?: string;
  created_time?: string;
  permalink_url?: string;
  full_picture?: string;
};

async function graph<T>(path: string, params: Record<string, string>): Promise<T> {
  const config = facebookConfig();
  if (!config) throw new FacebookError("not_configured");

  const url = new URL(`${GRAPH}/${apiVersion()}/${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("access_token", config.token);

  const res = await fetch(url, { cache: "no-store" });
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    // Facebook's own message is far more useful than anything we could
    // paraphrase ("Error validating access token: Session has expired"), so it
    // is surfaced verbatim to whoever is looking at the importer.
    const detail =
      (json as { error?: { message?: string } })?.error?.message ??
      `HTTP ${res.status}`;
    throw new FacebookError(detail);
  }
  return json as T;
}

/** The page's most recent posts, newest first. */
export async function fetchRecentPosts(limit = 25): Promise<FacebookPost[]> {
  const config = facebookConfig();
  if (!config) throw new FacebookError("not_configured");

  const data = await graph<{ data: GraphPost[] }>(`${config.pageId}/posts`, {
    fields: "id,message,created_time,permalink_url,full_picture",
    limit: String(Math.min(Math.max(limit, 1), 50)),
  });

  return (data.data ?? [])
    // Photo-only posts with no caption have nothing to become an article.
    .filter((p) => (p.message ?? "").trim().length > 0)
    .map((p) => ({
      id: p.id,
      message: (p.message ?? "").trim(),
      createdTime: p.created_time ?? "",
      permalink: p.permalink_url ?? "",
      picture: p.full_picture,
    }));
}

export async function fetchPost(id: string): Promise<FacebookPost> {
  const post = await graph<GraphPost>(id, {
    fields: "id,message,created_time,permalink_url,full_picture",
  });
  return {
    id: post.id,
    message: (post.message ?? "").trim(),
    createdTime: post.created_time ?? "",
    permalink: post.permalink_url ?? "",
    picture: post.full_picture,
  };
}

/**
 * A Facebook post has no title; a news article needs one. The first line is
 * the closest thing to a headline that exists, so it is trimmed to a sensible
 * length and offered as a starting point — the importer opens the post as a
 * draft precisely so this can be corrected before anyone sees it.
 */
export function deriveTitle(message: string): string {
  const firstLine = message.split(/\r?\n/).find((l) => l.trim().length > 0) ?? "";
  const cleaned = firstLine
    // Drop leading decoration ("📣 ", "‼️", "— ") that reads as noise in a
    // headline even though it works on Facebook.
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .trim();
  if (cleaned.length <= 90) return cleaned || "Știre importată din Facebook";
  const cut = cleaned.slice(0, 90);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

/** First two sentences, as the listing excerpt. */
export function deriveExcerpt(message: string): string {
  const body = message.replace(/\s+/g, " ").trim();
  if (body.length <= 200) return body;
  const cut = body.slice(0, 200);
  const lastStop = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "));
  return lastStop > 80 ? cut.slice(0, lastStop + 1) : `${cut.trim()}…`;
}
