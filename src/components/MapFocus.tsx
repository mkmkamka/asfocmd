"use client";

import { useEffect } from "react";

/**
 * When the page is opened via a "find on the map" link (…/servicii#directoriu),
 * bring the interactive map itself to the centre of the screen instead of
 * landing on the section heading with the intro content above it.
 */
export default function MapFocus({ hash = "directoriu" }: { hash?: string }) {
  useEffect(() => {
    let id = 0;

    const focus = () => {
      if (window.location.hash.replace("#", "") !== hash) return;
      const el =
        document.getElementById("map-focus") ?? document.getElementById(hash);
      if (!el) return;
      // Let the browser's own hash jump happen first, then re-centre on the map.
      id = window.setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
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
