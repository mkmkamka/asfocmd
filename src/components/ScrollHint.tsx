"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { scrollToAdjacentSection } from "@/lib/scroll-sections";

/**
 * "Scroll to explore" cue, pinned to the bottom-right corner.
 *
 * Rendered once from the locale layout so it rides every page. Two chevrons
 * drifting downwards carry the invitation instead of a line of text, so it
 * never competes with the hero copy or the affiliations pill in the middle of
 * the fold. The visible label is gone; the wording stays as the accessible
 * name.
 *
 * It stays available for the whole visit rather than burning out on the first
 * scroll — the only time it hides is when there is nothing left to scroll to.
 * Clicking it advances roughly one screen, so it is a control and not just
 * decoration. `prefers-reduced-motion` keeps the button and drops the drift.
 *
 * Two things about where it sits. It is wrapped in a full-width rail carrying
 * the site's `.wrap` measure rather than being pinned to `right-7`: pinned to
 * the viewport it floated 126px outside the 1180px column everything else lines
 * up on, and it was the last piece of chrome still doing that. Inside the rail
 * its right edge is the same right edge as the credit logos beneath it and the
 * language capsule above it. Using a flex rail rather than a `calc()` on 100vw
 * also keeps it honest when a classic scrollbar is present, since 100vw counts
 * the scrollbar and the measure does not.
 *
 * And over the home fold it lifts. The credit rail occupies the bottom ~90px of
 * that fold, and at the resting offset the cue landed inside it — which is what
 * the `padding-right` reservations in `.hero-credits-inner` used to be working
 * around. Riding the same `onDark` signal the colour flip already needs, the
 * cue rises above the rule instead, and the logos get their full measure back.
 */
export default function ScrollHint({ text }: { text: string }) {
  const reduce = useReducedMotion();
  const [atEnd, setAtEnd] = useState(false);
  // The cue rests as an ember glyph on light glass, which needs a bright page
  // under it. While it floats over the home page's graded hero it runs light
  // instead — same flip the nav rail makes, see `useOverDark` in TubelightNav.
  const [onDark, setOnDark] = useState(false);
  const pathname = usePathname();

  /* Both flags are read from the live document, and the cue is mounted once in
     the locale layout — so it never remounts on a client-side navigation. With
     an empty dependency list the effect therefore measured the *first* page of
     the visit and then only ever corrected itself when something scrolled,
     which is why the cue behaved differently depending on how you arrived:
     coming back to the home page it kept the previous page's un-lifted offset
     and sat on top of the credit logos, and on /contact — which is one fold
     with nothing to scroll — it kept the previous page's "there is more below".
     Re-running on `pathname` is the fix; the delayed re-reads cover the gap
     between this effect firing and the new page finishing its layout. */
  useEffect(() => {
    const read = () => {
      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement;
      // A page that does not scroll has nothing to point at. `atEnd` already
      // covered "you have reached the bottom"; this extends it to "there was
      // never a bottom to reach", which is the /contact case.
      const scrollable = scrollHeight - clientHeight > 24;
      setAtEnd(!scrollable || scrollTop + clientHeight >= scrollHeight - 120);
      const fold = document.querySelector(".hero-fold");
      setOnDark(
        !!fold && fold.getBoundingClientRect().bottom > window.innerHeight - 36,
      );
    };
    read();

    const timers = [50, 250, 700].map((d) => window.setTimeout(read, d));
    // Late layout — a font swap, the hero video's first frame, an image
    // arriving — changes the page height without any scroll or resize event.
    const ro = new ResizeObserver(read);
    ro.observe(document.body);
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      ro.disconnect();
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, [pathname]);

  /* Advance to the next section, not by a fixed distance.
     Scrolling by 86% of the viewport was arbitrary: it landed mid-band as
     often as not, so the control that promises "there is more below" delivered
     you to the middle of a sentence. Every band on every page is a <section>,
     so the next one down is a thing that can be found and aimed at — the same
     logic the ↓ / ↑ keyboard handler uses, in `lib/scroll-sections`. */
  const advance = useCallback(() => {
    scrollToAdjacentSection("down");
  }, []);

  return (
    <div
      className="scroll-cue-rail hidden lg:block"
      data-lifted={onDark || undefined}
      aria-hidden={atEnd || undefined}
    >
      <div className="wrap flex justify-end">
        <button
          type="button"
          onClick={advance}
          aria-label={text}
          title={text}
          data-hidden={atEnd || undefined}
          data-on-dark={onDark || undefined}
          className="scroll-cue"
        >
          <motion.span
            className="scroll-cue-arrows"
            aria-hidden
            animate={reduce ? undefined : { y: [0, 5, 0] }}
            transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Two chevrons: the leading one is solid, the trailing one fades
                off, so it reads as movement even before the drift starts. */}
            <svg viewBox="0 0 24 14" width="22" height="13" fill="none">
              <path
                d="M2 2l10 9 10-9"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <svg
              viewBox="0 0 24 14"
              width="22"
              height="13"
              fill="none"
              opacity="0.4"
            >
              <path
                d="M2 2l10 9 10-9"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.span>
        </button>
      </div>
    </div>
  );
}
