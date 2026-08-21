"use client";

import React from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { scrollPageToTop } from "@/lib/nav";
import { Lamp } from "@/components/ui/lamp";

interface NavItem {
  name: string;
  url: string;
  /** Optional. The desktop bar passes none — it is words only. The mobile bar
      passes one for every item, because there are no labels down there. */
  icon?: LucideIcon;
  /** One line saying what the page is, opened under the tab on hover and on
      keyboard focus. The labelled bar only: the icon-only dock has no room,
      and a phone has no pointer to open it with. */
  hint?: string;
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
  /**
   * Icon-only, tightly padded pill — the mobile bottom bar, where the six tabs
   * have to share a 375px row and the label would never fit.
   */
  iconOnly?: boolean;
  /** Unique per mounted instance — motion shares layoutId globally. */
  lampId?: string;
  /**
   * Set while the pill floats over a dark ground — the home page's graded hero,
   * a soot band, the closing call to action, the footer. The rail's resting
   * material is ink on a 5% light wash, which needs a bright page behind it;
   * over anything dark the labels disappear with it. This flips the whole pill
   * to light type on a dark wash for as long as that ground is under it — see
   * `useOverDark` in TubelightNav.
   */
  onDark?: boolean;
  /**
   * Something else owns the highlight for now, so no tab burns.
   *
   * The map is a section of Servicii, not a page of its own: while it is on
   * screen the corner rail's Caută un specialist is lit, and two lights for
   * one place would read as a bug. The tab takes it back the moment the map
   * leaves the screen — see `useAtDirectory` in TubelightNav.
   */
  dimmed?: boolean;
}

/* The tubelight pill. Positioning belongs to the caller (TubelightNav): on
   desktop it floats as the centre island of the top rail, on phones it is
   fixed to the bottom of the viewport where the thumb actually is. */
export function NavBar({
  items,
  className,
  iconOnly = false,
  lampId = "lamp",
  onDark = false,
  dimmed = false,
}: NavBarProps) {
  const pathname = usePathname();

  // Every item is a real route now, so the current path alone decides the
  // highlight — no click memory, no scroll-spy, so reloads and external
  // navigation always land on the correct tab. Longest match wins so e.g.
  // `/stiri/slug` still lights up "News", and the shortest route (Home, `/ro`)
  // only wins at the very top level. A trailing hash on the URL (a deep link
  // like `/servicii#directoriu`) is ignored because usePathname strips it.
  /* Home is the one tab that may not match by prefix. Every path on the site
     starts with `/ro`, so a prefix rule hands Home every page it does not
     recognise — which was invisible while all eight pages had a tab of their
     own and the longest match won, and became "you are on Acasă" the moment
     Instruire left this rail. It is the shortest url by construction, so the
     rule is derived rather than written down: nothing to update when a stop
     is added or the locale changes. */
  const home = items.reduce((a, b) => (b.url.length < a.url.length ? b : a));
  const routeMatch = items
    .slice()
    .sort((a, b) => b.url.length - a.url.length)
    .find((item) =>
      item === home
        ? pathname === item.url
        : pathname === item.url || pathname.startsWith(`${item.url}/`),
    );
  /* No match means no lamp — not "fall back to the first tab". Since Instruire,
     Membri and Înregistrează-te left this rail for the corner, those three
     paths match nothing here, and the old `?? items[0].name` fallback would
     have lit *Acasă* while you stood on Instruire: the one thing the highlight
     exists to never do. Off-rail pages are the corner rail's to light. */
  const activeTab = dimmed ? null : (routeMatch?.name ?? null);

  // The pill itself is barely-there glass: a whisper of background, a hairline
  // border and a heavy backdrop blur — the page stays visible through it.
  return (
    <div
      className={cn(
        // `translate` — not `transform` — is in the list because the caller may
        // hand this pill a travel class to ride out on when the top rail steps
        // off the screen (see `useChromeAway`). Tailwind v4 compiles
        // `translate-y-*` to the standalone `translate` property, so a
        // transition naming `transform` covers nothing at all and the rail
        // teleports instead of sliding — silently, with the class list looking
        // entirely correct. Named properties rather than `transition-colors`
        // plus a second utility, because two `transition-property` utilities on
        // one element are decided by the order Tailwind emits them in, not the
        // order they are written here.
        "flex items-center rounded-full border shadow-lg backdrop-blur-lg transition-[translate,background-color,border-color] duration-300 ease-out",
        onDark ? "border-white/20 bg-black/25" : "border-border bg-background/5",
        // 44px tall on desktop so the pill matches the seal and language
        // capsules either side of it; the icon-only bar sizes to its tabs.
        iconOnly ? "gap-0 px-1 py-1" : "h-11 gap-0.5 px-1",
        className,
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.name;

        return (
          <Link
            key={item.name}
            href={item.url}
            aria-label={iconOnly ? item.name : undefined}
            aria-current={isActive ? "page" : undefined}
            // Pressing the tab you are already on returns you to the top of it
            // rather than doing nothing — see `scrollPageToTop`. This is also
            // what makes "Servicii" deterministic: it always goes to the top of
            // the page, while the hero's "Caută un specialist" keeps its
            // `#directoriu` deep link to the map.
            onClick={(e) => {
              if (pathname !== item.url) return;
              e.preventDefault();
              scrollPageToTop();
            }}
            className={cn(
              "relative cursor-pointer whitespace-nowrap rounded-full text-sm font-semibold transition-colors",
              iconOnly
                ? "grid h-11 w-11 place-items-center"
                : "flex h-9 items-center px-3 xl:px-4",
              onDark
                ? "text-white/80 hover:text-white"
                : "text-foreground/80 hover:text-primary",
              isActive &&
                (onDark ? "bg-white/12 text-white" : "bg-muted/80 text-primary"),
            )}
          >
            {iconOnly ? (
              Icon && <Icon size={19} strokeWidth={2} aria-hidden />
            ) : (
              <span className="inline-flex items-center gap-1.5">
                {/* Kept for any future labelled bar that wants a mark; the
                    desktop rail passes no icons at all. Faint by design, so a
                    marked tab never outshouts the lamp. */}
                {Icon && (
                  <Icon
                    size={14}
                    strokeWidth={1.75}
                    className="shrink-0 opacity-45"
                    aria-hidden
                  />
                )}
                {item.name}
              </span>
            )}
            {/* The description, opened under the tab by hover or focus. It is
                `absolute`, so an opening tip cannot change the pill's height
                and shove the page around; `aria-hidden` because the tab's own
                word is the accessible name and a screen reader reading both
                would say the sentence twice. Hover only, by the user's call —
                which means it does not exist on a phone, where there is no
                pointer to open it and the dock is icon-only anyway. */}
            {!iconOnly && item.hint && (
              <span className="nav-hint" aria-hidden>
                {item.hint}
              </span>
            )}
            {isActive && (
              <motion.div
                layoutId={lampId}
                className={cn(
                  "absolute inset-0 -z-10 w-full rounded-full",
                  onDark ? "bg-white/5" : "bg-primary/5",
                )}
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              >
                {/* The lamp burns oxblood on a light page. Over the graded hero
                    that value disappears into the picture, so it switches to
                    the palette's light oxide red — the same tone the fold's
                    eyebrow rule uses. */}
                <Lamp
                  color={onDark ? "#D9847C" : "var(--ember)"}
                  halo={onDark ? "rgba(217,132,124,.30)" : "var(--ember-halo)"}
                />
              </motion.div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
