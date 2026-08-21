import type { Dictionary } from "@/i18n/get-dictionary";

/**
 * The site's page order, as a ring.
 *
 * This is the order the nav rail already showed — join at the end because it
 * is the conversion action — and it is now also the order a swipe or an arrow
 * key walks. Both readings have to agree: a gesture that visited pages in a
 * different sequence from the tabs above it would make the lamp in the rail
 * look like it was jumping around at random.
 *
 * It is a *ring*, not a list. Past the last page a forward step lands back on
 * the home page rather than stopping dead, and a backward step from home
 * lands on the last one, so neither end of the sequence is a wall. Eight
 * pages is short enough that the wrap reads as "round again" rather than as a
 * navigation error.
 *
 * Keys are `dict.nav` keys, so the labels stay in whatever locale is mounted.
 */
export const PAGE_RING = [
  { segment: "", key: "home" },
  { segment: "/despre", key: "about" },
  { segment: "/servicii", key: "services" },
  { segment: "/instruire", key: "training" },
  { segment: "/stiri", key: "news" },
  { segment: "/contact", key: "contact" },
  { segment: "/membri", key: "memberArea" },
  { segment: "/membru", key: "becomeMember" },
] as const satisfies readonly {
  segment: string;
  key: keyof Dictionary["nav"];
}[];

export type RingStop = (typeof PAGE_RING)[number];

/**
 * Where on the ring is this path? `-1` for anywhere that is not on it.
 *
 * Sub-routes count as their section: a news article is `/stiri`, so stepping
 * forward out of an article goes to the page *after* the news index rather
 * than back to the start of the ring. Pages that are genuinely off the ring
 * (/resurse, the admin area) report -1 and are handled by `ringStep`.
 */
export function ringIndex(pathname: string, base: string): number {
  const rest = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  const path = rest.replace(/\/+$/, "");

  if (path === "") return 0;

  // Longest match first, so `/membru` can never be swallowed by `/membri`
  // (it cannot here — neither is a prefix of the other — but the ring is a
  // list other people will add to).
  let found = -1;
  let bestLen = -1;
  PAGE_RING.forEach((stop, i) => {
    if (!stop.segment) return;
    const hit = path === stop.segment || path.startsWith(`${stop.segment}/`);
    if (hit && stop.segment.length > bestLen) {
      found = i;
      bestLen = stop.segment.length;
    }
  });
  return found;
}

/**
 * One step around the ring. `dir` is 1 for the next page, -1 for the previous.
 *
 * From off the ring there is no "next" to compute, so a forward step enters at
 * the first page and a backward step at the last — the gesture always does
 * something, which matters more than which end it picks.
 */
export function ringStep(index: number, dir: 1 | -1): RingStop {
  const n = PAGE_RING.length;
  if (index < 0) return dir === 1 ? PAGE_RING[0] : PAGE_RING[n - 1];
  return PAGE_RING[(index + dir + n) % n];
}

export function ringHref(base: string, stop: RingStop): string {
  return `${base}${stop.segment}`;
}
