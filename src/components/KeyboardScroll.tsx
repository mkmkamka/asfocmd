"use client";

import { useEffect } from "react";
import { scrollToAdjacentSection } from "@/lib/scroll-sections";

const TYPING_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

/**
 * Desktop keyboard nav: ↓ / ↑ advance one section at a time, on every page.
 * Mounted once from the locale layout, same as ScrollHint, which it shares
 * its "next section" logic with.
 *
 * Bails out whenever the arrow keys mean something else already — typing in
 * a field, a modifier held (browser/OS shortcuts), or a modal open (the
 * lightbox pins `document.body.style.overflow` while it's up and already
 * owns Left/Right; Up/Down falling through to a page-scroll under it would
 * be a second layer of movement fighting the one the user can see).
 */
export default function KeyboardScroll() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;

      const target = e.target as HTMLElement | null;
      if (target && (TYPING_TAGS.has(target.tagName) || target.isContentEditable)) return;
      if (document.body.style.overflow === "hidden") return;

      e.preventDefault();
      scrollToAdjacentSection(e.key === "ArrowDown" ? "down" : "up");
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}
