"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { clearHash } from "@/lib/nav";
import { PAGE_RING, ringHref, ringIndex, ringStep } from "@/lib/page-ring";
import type { Dictionary } from "@/i18n/get-dictionary";

/**
 * Sideways navigation: the pages as a deck you can page through.
 *
 * A swipe left goes to the next page in `PAGE_RING`, a swipe right to the
 * previous one, and both ends wrap — the last page's "next" is the home page
 * again. On a desktop the same two steps are ← and →. The page itself does
 * the sliding: every step is a `nav-forward` / `nav-back` view transition (see
 * "Sideways navigation" in globals.css), so the direction of the gesture and
 * the direction the page moves are the same thing.
 *
 * Mounted once from the locale layout, next to KeyboardScroll, which owns the
 * vertical half of the same idea (↑ / ↓ walk the sections of a page).
 *
 * Three things it deliberately keeps its hands off:
 *
 * - Anything that scrolls sideways itself, or is marked `data-no-page-swipe`.
 *   A horizontal drag inside a scroller belongs to the scroller.
 * - Gestures starting within 24px of a screen edge. That strip belongs to iOS
 *   and Android's own back gesture, and fighting it means both happen.
 * - Whatever the lightbox is doing while it is up. It pins `body.overflow`
 *   and already owns ← and →, which is exactly the guard KeyboardScroll uses.
 */

const TYPING_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

/** How far the finger has to travel to commit, and the flick that skips it. */
const commitDistance = () => Math.min(window.innerWidth * 0.25, 120);
const FLICK_SPEED = 0.55; // px/ms
const FLICK_DISTANCE = 45;
/** The strip along each edge left to the OS's own back gesture. */
const EDGE_GUTTER = 24;
/** Before the drag is claimed as horizontal, and the vertical slack allowed. */
const LOCK_DISTANCE = 12;
const LOCK_RATIO = 1.6;

function inBlockedRegion(target: EventTarget | null): boolean {
  let el = target instanceof Element ? target : null;
  while (el && el !== document.body) {
    if (el instanceof HTMLElement) {
      if (TYPING_TAGS.has(el.tagName) || el.isContentEditable) return true;
      if (el.dataset.noPageSwipe !== undefined) return true;
      if (el.scrollWidth > el.clientWidth + 2) {
        const overflow = getComputedStyle(el).overflowX;
        if (overflow === "auto" || overflow === "scroll") return true;
      }
    }
    el = el.parentElement;
  }
  return false;
}

export default function PageSwipe({
  base,
  nav,
}: {
  base: string;
  nav: Dictionary["nav"];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const hintRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  /* Where the *next* step counts from. A push takes a moment to come back as
     a new `pathname`, and pressing → twice inside that window would otherwise
     measure both steps from the page being left — the second press would
     re-issue the first one and a page would be skipped. Holding the page in
     flight means the keys queue up the way flipping pages does. Cleared by
     the route it was waiting for, or by any other navigation overtaking it. */
  const pendingRef = useRef<string | null>(null);
  useEffect(() => {
    pendingRef.current = null;
  }, [pathname]);

  const stepFrom = useCallback(
    (dir: 1 | -1) => {
      const from = pendingRef.current ?? pathname;
      return { from, stop: ringStep(ringIndex(from, base), dir) };
    },
    [base, pathname],
  );

  const go = useCallback(
    (dir: 1 | -1) => {
      const { from, stop } = stepFrom(dir);
      const href = ringHref(base, stop);
      if (href === from) return;
      pendingRef.current = href;

      /* Both sheets have to be captured at the same scroll offset or the
         slide carries a vertical lurch with it: the outgoing snapshot is the
         whole document, so if it is captured halfway down a long page while
         the incoming one is captured at its top, the browser interpolates
         between the two positions and the page appears to rush upwards while
         it leaves. Landing at the top is also what the incoming page does,
         which is the behaviour of every pager there has ever been.

         `instant` on purpose: `html` carries `scroll-behavior:smooth`, and a
         smooth scroll here would still be running when the capture is taken. */
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      clearHash();

      router.push(href, {
        transitionTypes: [dir === 1 ? "nav-forward" : "nav-back"],
      });
    },
    [base, router, stepFrom],
  );

  /* Both neighbours, up front. The gesture is committed at the moment the
     finger lifts, so anything fetched after that lands mid-slide — the page
     would arrive already sliding and then pop. Two routes is a cheap price
     for the step being instant in both directions. */
  useEffect(() => {
    const here = ringIndex(pathname, base);
    for (const dir of [1, -1] as const) {
      const href = ringHref(base, ringStep(here, dir));
      if (href !== pathname) router.prefetch(href);
    }
  }, [base, pathname, router]);

  /* ── Keyboard ──────────────────────────────────────────────────────── */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (inBlockedRegion(e.target)) return;
      if (document.body.style.overflow === "hidden") return;

      e.preventDefault();
      go(e.key === "ArrowRight" ? 1 : -1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [go]);

  /* ── Touch ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let startT = 0;
    let dx = 0;
    let dir: 1 | -1 = 1;
    let tracking = false;
    let locked = false;

    /* The hint is written to directly rather than held in state: it moves with
       the finger, and a re-render of the whole subtree per touchmove frame is
       not a price worth paying for a pill with two words in it. */
    const paint = (progress: number) => {
      const hint = hintRef.current;
      if (!hint) return;
      hint.style.setProperty("--p", progress.toFixed(3));
      hint.dataset.armed = progress >= 1 ? "1" : "0";
    };

    /* Point the cue at a destination. Called on lock and again whenever the
       finger crosses back over where it started — a drag that changes its
       mind has changed which page it is asking for, and the pill has to be
       naming the page that would actually arrive. */
    const aim = (next: 1 | -1) => {
      dir = next;
      const { stop } = stepFrom(next);
      if (labelRef.current) labelRef.current.textContent = nav[stop.key];
      const hint = hintRef.current;
      if (!hint) return;
      // The next page enters from the side the finger is heading towards, so
      // the cue waits on that edge.
      hint.dataset.side = next === 1 ? "right" : "left";
      hint.dataset.active = "1";
    };

    const release = () => {
      tracking = false;
      locked = false;
      const hint = hintRef.current;
      if (hint) {
        hint.dataset.active = "0";
        paint(0);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) {
        release();
        return;
      }
      const t = e.touches[0];
      if (t.clientX < EDGE_GUTTER || t.clientX > window.innerWidth - EDGE_GUTTER) return;
      if (document.body.style.overflow === "hidden") return;
      if (inBlockedRegion(e.target)) return;

      startX = t.clientX;
      startY = t.clientY;
      startT = e.timeStamp;
      dx = 0;
      tracking = true;
      locked = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!tracking) return;
      if (e.touches.length !== 1) {
        release();
        return;
      }
      const t = e.touches[0];
      dx = t.clientX - startX;
      const dy = t.clientY - startY;

      if (!locked) {
        // Whichever axis declares itself first wins the gesture outright. A
        // drag that starts vertical stays a scroll however far sideways it
        // wanders afterwards.
        if (Math.abs(dy) > LOCK_DISTANCE && Math.abs(dy) >= Math.abs(dx)) {
          tracking = false;
          return;
        }
        if (Math.abs(dx) < LOCK_DISTANCE || Math.abs(dx) < Math.abs(dy) * LOCK_RATIO) return;

        locked = true;
        aim(dx < 0 ? 1 : -1);
      } else if (dx !== 0 && (dx < 0 ? 1 : -1) !== dir) {
        aim(dx < 0 ? 1 : -1);
      }

      // Claimed. Stop the browser treating the rest of it as an overscroll or
      // as its own back gesture, which needs a non-passive listener.
      if (e.cancelable) e.preventDefault();
      paint(Math.min(1, Math.abs(dx) / commitDistance()));
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!tracking || !locked) {
        release();
        return;
      }
      const speed = Math.abs(dx) / Math.max(1, e.timeStamp - startT);
      const commit =
        Math.abs(dx) >= commitDistance() ||
        (speed > FLICK_SPEED && Math.abs(dx) > FLICK_DISTANCE);

      release();
      if (commit) go(dir);
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", release);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", release);
    };
  }, [go, nav, stepFrom]);

  /* Decoration for a gesture that is already happening — the destination is
     announced by the page arriving, so there is nothing here for a screen
     reader to read. */
  return (
    <div
      ref={hintRef}
      className="swipe-hint"
      data-side="right"
      data-active="0"
      aria-hidden
    >
      <ChevronLeft className="swipe-hint-mark" size={15} />
      <span ref={labelRef} className="swipe-hint-label">
        {nav[PAGE_RING[0].key]}
      </span>
      <ChevronRight className="swipe-hint-mark" size={15} />
    </div>
  );
}
