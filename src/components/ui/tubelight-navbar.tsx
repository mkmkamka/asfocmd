"use client";

import React from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { scrollPageToTop } from "@/lib/nav";

interface NavItem {
  name: string;
  url: string;
  /** Optional. The desktop bar passes none — it is words only. The mobile bar
      passes one for every item, because there are no labels down there. */
  icon?: LucideIcon;
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
   * Set while the pill floats over the home page's graded hero. The rail's
   * resting material is ink on a 5% light wash, which needs a bright page
   * behind it; over a graded picture the labels disappear. This flips the whole
   * pill to light type on a dark wash for as long as the fold is under it —
   * see `useOverHero` in TubelightNav.
   */
  onDark?: boolean;
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
}: NavBarProps) {
  const pathname = usePathname();

  // Every item is a real route now, so the current path alone decides the
  // highlight — no click memory, no scroll-spy, so reloads and external
  // navigation always land on the correct tab. Longest match wins so e.g.
  // `/stiri/slug` still lights up "News", and the shortest route (Home, `/ro`)
  // only wins at the very top level. A trailing hash on the URL (a deep link
  // like `/servicii#directoriu`) is ignored because usePathname strips it.
  const routeMatch = items
    .slice()
    .sort((a, b) => b.url.length - a.url.length)
    .find(
      (item) => pathname === item.url || pathname.startsWith(`${item.url}/`),
    );
  const activeTab = routeMatch?.name ?? items[0].name;

  // The pill itself is barely-there glass: a whisper of background, a hairline
  // border and a heavy backdrop blur — the page stays visible through it.
  return (
    <div
      className={cn(
        "flex items-center rounded-full border shadow-lg backdrop-blur-lg transition-colors duration-300",
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
                <div
                  className="absolute -top-2 left-1/2 h-1 w-8 -translate-x-1/2 rounded-t-full"
                  style={{ background: onDark ? "#D9847C" : "var(--ember)" }}
                >
                  <div className="absolute -left-2 -top-2 h-6 w-12 rounded-full bg-primary/20 blur-md" />
                  <div className="absolute -top-1 h-6 w-8 rounded-full bg-primary/20 blur-md" />
                  <div className="absolute left-2 top-0 h-4 w-4 rounded-full bg-primary/20 blur-sm" />
                </div>
              </motion.div>
            )}
          </Link>
        );
      })}
    </div>
  );
}
