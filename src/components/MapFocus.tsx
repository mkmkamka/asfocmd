"use client";

import { useEffect } from "react";

// Matches TubelightNav's own `lg:` switch between the floating desktop rail
// and the phone/tablet chrome (sticky top capsule + fixed bottom dock).
const MOBILE_BREAKPOINT = 1024;
// Same clearance the anchors themselves carry (`#directoriu`'s
// `scroll-margin-top` in globals.css) — the sticky top capsule below `lg`,
// the floating pill above it.
const TOP_CLEARANCE_MOBILE = 64;
const TOP_CLEARANCE_DESKTOP = 104;

/**
 * When the page is opened via a "find on the map" link (…/servicii#directoriu),
 * bring the interactive map itself to the centre of the screen instead of
 * landing on the section heading with the intro content above it.
 *
 * Targets the map panel specifically, not the whole two-column grid: below
 * `lg` that grid stacks map-over-list, and centring the *grid* on a phone
 * routinely centred somewhere in the member list underneath the map instead
 * of on the map itself.
 *
 * Centring is computed by hand rather than via `scrollIntoView({block:
 * "center"})`, which centres against the full window height — on a phone
 * that ignores the fixed bottom tab dock sitting on top of the page, so the
 * "centred" map was actually pushed low enough to run half under it.
 */
export default function MapFocus({ hash = "directoriu" }: { hash?: string }) {
  useEffect(() => {
    let id = 0;

    const focus = () => {
      if (window.location.hash.replace("#", "") !== hash) return;
      const el =
        document.getElementById("map-panel-focus") ??
        document.getElementById("map-focus") ??
        document.getElementById(hash);
      if (!el) return;

      // Let the browser's own hash jump happen first, then re-centre on the map.
      id = window.setTimeout(() => {
        const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
        const dock = isMobile
          ? document.querySelector<HTMLElement>(".navbar-dock")
          : null;
        const dockHeight = dock ? dock.getBoundingClientRect().height : 0;
        const topClearance = isMobile ? TOP_CLEARANCE_MOBILE : TOP_CLEARANCE_DESKTOP;

        const visible = window.innerHeight - topClearance - dockHeight;
        const rect = el.getBoundingClientRect();
        const target =
          window.scrollY +
          rect.top -
          topClearance -
          Math.max(0, (visible - rect.height) / 2);

        window.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
        // Spend the fragment once it has been honoured. Left in the address
        // bar it made the page's own nav tab ambiguous — a later arrival at
        // /servicii could be re-aimed at the anchor by the browser's scroll
        // restoration, so the same click landed on the map some of the time
        // and at the top of the page the rest of it.
        history.replaceState(null, "", window.location.pathname);
      }, 120);
    };

    focus();
    // Same-page deep links (the footer's "Directoriu") change only the
    // fragment, which does not remount this page.
    window.addEventListener("hashchange", focus);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("hashchange", focus);
    };
  }, [hash]);

  return null;
}
