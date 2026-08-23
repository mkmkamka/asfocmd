"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  House,
  Info,
  Wrench,
  GraduationCap,
  Newspaper,
  Mail,
  UserPlus,
} from "lucide-react";
import { NavBar } from "@/components/ui/tubelight-navbar";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "@/components/Logo";
import { scrollPageToTop } from "@/lib/nav";
import { RAIL_STOPS, type RingStop } from "@/lib/page-ring";
import ActionRail from "@/components/ActionRail";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

/* One mark per destination, for the phone's bottom bar. Keyed by ring stop
   rather than listed in order, so the running order lives in exactly one
   place — PAGE_RING — and this stays a lookup. */
const TAB_MARKS: Record<RingStop["key"], typeof House> = {
  home: House,
  about: Info,
  services: Wrench,
  training: GraduationCap,
  news: Newspaper,
  contact: Mail,
  memberArea: ShieldCheck,
  becomeMember: UserPlus,
};

/* Every dark ground on the site, named in one place.

   The chrome's resting material is ink on a 5% light wash, so it needs a bright
   page under it; over anything dark the labels go with it and the rail reads as
   empty. The home fold was only the first and loudest of those grounds, and
   checking it alone is what left the nav invisible further down: the soot bands
   (`.band`), the closing call to action (`.cta`) and the footer are all just as
   dark, and the footer is the one that matters most because it is on every page
   and the phone's bottom dock comes to rest on it at the end of every scroll.

   `.page-hero` is deliberately absent — the inner pages open on sand-to-white,
   which the resting material is already built for. /stiri has no header band
   at all; it opens straight onto `.hscroll`, which is already listed here.

   This list is the known weak point, and every entry after the first three was
   added the same way: something dark shipped, the nav went invisible over it,
   someone noticed. `.a-cover` is the soot fallback behind an article's cover
   photo, which six of the archive posts have no image for; `.hscroll` is the
   sideways gallery. Both were live and broken before being typed in here.
   Nothing links this list to the rules that actually paint those surfaces
   dark, which is why it keeps going stale — see the note in globals.css. */
const DARK_BANDS =
  ".hero-fold,.band,.cta,footer,.a-cover,.hscroll,.news-recent";

/* Is the floating chrome sitting over one of them right now?

   Two answers, because the top rail and the phone's bottom dock sit at opposite
   ends of the viewport and cross a given band at quite different moments.

   Where those two live is measured rather than typed in. The rail that belongs
   to the other breakpoint is `display:none` and measures 0×0, so it simply
   drops out, and the answer stays correct when the rail's height or the dock's
   safe-area inset changes — a pair of hand-tuned pixel thresholds would quietly
   drift away from the boxes they were describing. */
const SLACK = 12; // Flip while the pill is still clear of the seam, not on it.

function useOverDark() {
  const pathname = usePathname();
  const [state, setState] = useState({ top: false, bottom: false });

  useEffect(() => {
    // Cached per page: the bands are markup, and markup only changes when the
    // route does — which is exactly when this effect re-runs.
    const bands = Array.from(document.querySelectorAll(DARK_BANDS));
    // The shells, not the capsules inside them. The capsules now slide off the
    // top of the screen on the way down (see `useChromeAway`), and a box that
    // is mid-slide reports a rect 90px above where it will come to rest — read
    // during the return trip, that samples the wrong band and the rail lands
    // wearing the wrong material for a moment before correcting itself. The
    // shells never move, and a transform on a child does not touch the parent's
    // layout box, so they describe the same y-band at rest and stay honest
    // throughout the slide.
    const topChrome = Array.from(document.querySelectorAll(".chrome-shell"));
    const dockChrome = Array.from(document.querySelectorAll(".vt-dock-nav"));

    // Vertical overlap only. Every band here runs the full measure, and so does
    // the rail, so there is no case where the two share a y-range and miss each
    // other on x.
    const overlaps = (boxes: Element[], rects: DOMRect[]) =>
      boxes.some((box) => {
        const b = box.getBoundingClientRect();
        if (!b.width || !b.height) return false; // display:none at this breakpoint
        return rects.some(
          (d) => d.top < b.bottom + SLACK && d.bottom > b.top - SLACK,
        );
      });

    const read = () => {
      const rects = bands.map((el) => el.getBoundingClientRect());
      const next = {
        top: overlaps(topChrome, rects),
        bottom: overlaps(dockChrome, rects),
      };
      // Bail out when nothing moved — this runs on every scroll frame, and a
      // fresh object each time would re-render the whole rail all the way down
      // the page for no reason.
      setState((prev) =>
        prev.top === next.top && prev.bottom === next.bottom ? prev : next,
      );
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, [pathname]);

  return state;
}

/* ── The rail steps out of the way ─────────────────────────────────────
   Present when the page opens, gone as soon as you head down it, back the
   instant you turn around. Reading is the one thing the chrome cannot help
   with, and on a phone the top capsules and the bottom dock together eat
   about a fifth of the screen; going down means you are reading, coming back
   up means you are looking for something — which is when navigation should be
   under your thumb again, without a trip to the top of the page to fetch it.

   Direction, not depth. A rail that reappears only at the top of the document
   makes you scroll for it; one that reappears on any upward flick is where
   you left it. The one exception is the top of the page itself, where the
   rail is always out: there is nothing above it to go back to.

   Only the top chrome travels. The phone's bottom dock stays put — it is
   already at the far end of the screen, out of the reading column, and a set
   of tabs that ducks away from the thumb reaching for it is worse than one
   that is simply there. */

const SETTLE = 6; // px. Below this it is momentum wobble, not a decision.

function useChromeAway() {
  const pathname = usePathname();
  const [away, setAway] = useState(false);
  // Mirrored in a ref so the scroll handler can compare against the live value
  // without re-subscribing on every flip, and so a reveal from outside the
  // handler (focus, route change) is visible to it.
  const awayRef = useRef(false);

  const set = useCallback((next: boolean) => {
    if (awayRef.current === next) return;
    awayRef.current = next;
    setAway(next);
  }, []);

  useEffect(() => {
    set(false); // A new page opens with its navigation showing.

    /* How far the page has to travel before the rail is allowed to leave: the
       depth of the band the rail itself occupies. Measured off the shells
       rather than typed in, so it stays correct when the rail's height or its
       top offset changes, and so the two breakpoints — a 44px rail floating at
       44px, a shorter bar sitting flush at the top — each get their own answer
       without either being written down anywhere. */
    const restBand = () =>
      Array.from(document.querySelectorAll(".chrome-shell")).reduce(
        (deepest, shell) => {
          const b = shell.getBoundingClientRect();
          if (!b.height) return deepest; // display:none at this breakpoint
          return Math.max(deepest, b.bottom);
        },
        0,
      );

    let band = restBand();
    let last = Math.max(0, window.scrollY);

    /* A sideways gallery is the one place scrolling down does not mean
       reading down — the page is stationary and the cards are travelling
       across it, so the rail stays put rather than hiding while nothing is
       being uncovered.

       While the gallery is *pinned*, though — not merely while some part of
       it is on screen. Testing plain visibility against `.hscroll` brought
       the rail back the instant the band's top edge appeared at the foot of
       the viewport, a screen and a half before the sideways run actually
       began, and kept it out long after the run had finished. The pinned
       span is a thing that can be measured exactly: `.hscroll-rail` is the
       tall scroll region and the stage inside it is `sticky top:0`, so the
       stage is stuck precisely while the rail's top has passed the top of
       the viewport and its foot has not yet reached the bottom. That window
       is the horizontal scroll, start to end. */
    const inGallery = () =>
      Array.from(document.querySelectorAll(".hscroll-rail")).some((el) => {
        const b = el.getBoundingClientRect();
        return b.top <= 0 && b.bottom >= window.innerHeight;
      });

    const read = () => {
      const y = Math.max(0, window.scrollY); // iOS rubber-bands past zero
      const travel = y - last;
      if (Math.abs(travel) < SETTLE) return;
      last = y;
      if (inGallery()) return set(false);
      set(travel > 0 && y > band);
    };

    const remeasure = () => {
      band = restBand();
      read();
    };

    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", remeasure);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", remeasure);
    };
  }, [pathname, set]);

  // Something took focus inside chrome that is off the screen — a keyboard
  // user tabbing into a rail they cannot see. Bring it back before they land.
  return { away, show: () => set(false) };
}

/**
 * Is the directory map the page you are on?
 *
 * The map used to be a section of Servicii rather than a page of its own,
 * which meant the URL alone could not settle this — you could stand on
 * /servicii with the map a screen and a half below you, still on the
 * "Servicii" tab. Now that Caută un specialist opens its own route, it is
 * exactly that case: a prefix match, the same test every other off-rail
 * destination in ActionRail already uses.
 */
function useAtDirectory(): boolean {
  const pathname = usePathname();
  // Locale-prefixed (`/ro/specialisti`), so a leading match is not enough —
  // the segment can appear anywhere after it.
  return /\/specialisti(\/|$)/.test(pathname);
}

/**
 * Has the page's own seal — the one every page opens on, in the home fold's
 * lockup or in `.page-hero`'s kicker — scrolled out of view?
 *
 * The corner rail gave up its seal when it moved down into the page itself
 * (see `dacf278`), so the identity mark is the first thing on screen without
 * exception. A second, small copy in the corner while that is still visible
 * would just be saying the same thing twice in one glance; it earns its
 * corner back only once the page one has scrolled away, and only while you
 * are looking for it — which is why `useChromeAway`'s direction still gates
 * it, this only decides whether it is eligible to show at all.
 *
 * A scroll read rather than an IntersectionObserver, for the same reason
 * `useOverDark` is one: everything else the chrome does is decided on the
 * scroll frame, and a seal fading on the observer's schedule while the rail
 * it sits in slides on the scroll's is two clocks driving one row. The mark
 * is a single box on the page's own axis, so there is nothing here an
 * observer would measure better.
 */
function usePastMark(): boolean {
  const pathname = usePathname();
  const [past, setPast] = useState(false);

  useEffect(() => {
    const read = () => {
      const mark = document.querySelector(".hero-lockup, .page-hero");
      // No mark on this page (e.g. /contact) — the corner is free.
      // Otherwise: past it once its foot has cleared the rail's own band,
      // so the two seals are never both on screen at once.
      const next = mark ? mark.getBoundingClientRect().bottom <= 56 : true;
      setPast((prev) => (prev === next ? prev : next));
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    return () => {
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, [pathname]);

  return past;
}

export default function TubelightNav({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const base = `/${locale}`;
  const nav = dict.nav;
  const navHint = dict.navHint;

  // Desktop rail: words only, no exceptions. Instruire used to carry a faint
  // pictogram as the one promoted destination, which made it the only tab in
  // the rail that was a different *shape* from its neighbours — the promotion
  // read as a rendering inconsistency rather than as emphasis. Seven plain
  // labels, one lamp.
  //
  // Membership is the last tab: it is the conversion action, and it opens the
  // same /membru page the hero's "Înregistrează-te" link does.
  //
  // The order is not written here any more. It comes from PAGE_RING, which a
  // sideways swipe and the ← / → keys also walk (see PageSwipe) — two orders
  // that drifted apart would put the lamp in this rail somewhere other than
  // where a swipe just went.
  // Five, not eight. Instruire and Înregistrează-te moved to the corner rail
  // and Membri is a members-only door reached from the footer, so this bar is
  // the public sections only. RAIL_STOPS is a filter over PAGE_RING rather than
  // a second hand-written list — the swipe order and the tab order still come
  // from one place, which is the whole point of the ring.
  const desktopItems = RAIL_STOPS.map((stop) => ({
    name: nav[stop.key],
    url: `${base}${stop.segment}`,
    hint: navHint[stop.key as keyof typeof navHint],
  }));

  // Bottom bar: still all eight. The corner rail is a hover-and-focus control,
  // and a phone has neither — dropping three tabs down here would strand
  // Instruire and Înregistrează-te behind the footer on exactly the devices
  // that can least afford the scroll. No labels down here, so the repetition
  // the desktop rail was suffering from does not arise.
  //
  // No room for words, so every tab needs its own mark. Eight 44px tabs plus
  // the pill's padding is 360px, which still clears a 375px screen.
  const mobileItems = RAIL_STOPS.map((stop) => ({
    name: nav[stop.key],
    url: `${base}${stop.segment}`,
    icon: TAB_MARKS[stop.key],
  }));

  const overDark = useOverDark();
  const atDirectory = useAtDirectory();
  const pastMark = usePastMark();
  const { away, show } = useChromeAway();
  const pathname = usePathname();

  /* The seal is a link home; on the home page itself it is a link to the top
     of it. Without this, clicking the identity mark from the middle of the
     page is a dead press — Next resolves the href to the route you are
     already on. */
  const homeClick = (e: React.MouseEvent) => {
    if (pathname !== base) return;
    e.preventDefault();
    scrollPageToTop();
  };

  /* The trip off the screen, carried by each capsule rather than by the shell
     around it. Moving an ancestor — `transform`, or `translate` as Tailwind v4
     compiles this — makes that ancestor a backdrop root, and a backdrop root
     above the glass is what turns these capsules into flat tint: the same trap
     the view-transition names avoid, for the same reason (see the block in
     globals.css). A box moving itself is fine; the root lands at the blurred
     box rather than above it.

     One distance for every capsule, not `calc(-100% - 3rem)`. A percentage
     resolves against each box's *own* height, so the 44px pill, the 40px
     corner marks and the 30px language chip were each covering a different
     number of pixels in the same 300ms — same start, same finish, three
     different speeds, which is exactly why the row did not read as one
     object leaving. 8rem clears the tallest capsule plus the 44px offset it
     floats at and the shadow under it, so a single value serves all of them
     and the rail moves as a unit. */
  const travel = away ? "-translate-y-32" : "translate-y-0";


  return (
    <>
      {/* Desktop — three floating islands over the page: the seal on the left,
          the transparent tubelight pill in the middle, language on the right.
          The outer wrapper ignores pointer events so the page stays clickable
          between islands.

          The islands used to hang off the *viewport* edges (`px-5`), 134px
          outside the 1180px measure everything else on the site sits on. Two
          grids running at once is what made the page feel unaligned however
          carefully each individual band was set: the seal, the headline and the
          credit rail all started at different x. The inner `.wrap` puts the
          chrome on the site's own measure, so the seal now shares a left edge
          with the hero title, the fact card and the services grid, and the
          language capsule shares a right edge with the credit logos. */}
      <div
        className="chrome-shell pointer-events-none fixed inset-x-0 top-11 z-50 hidden lg:block"
        onFocusCapture={show}
      >
        <div className="wrap flex items-center justify-between gap-3">
          {/* The corner the seal used to hold, and — once the page's own mark
              has scrolled away — the corner it comes back to. The seal's real
              size lives down in the fold or in `.page-hero`'s kicker; a second
              copy here is only a wayfinder while that one is out of view, so
              it stays small and fades in behind the language capsule rather
              than announcing itself. */}
          <div className="pointer-events-auto flex items-center gap-2">
            <Link
              href={base}
              aria-label="ASFOCMD"
              onClick={homeClick}
              data-shown={pastMark || undefined}
              className={`vt-mark-seal ${travel} ${overDark.top ? "on-dark" : ""}`}
            >
              <Logo size={34} tone={overDark.top ? "footer" : "dark"} />
            </Link>
            <div
              className={`vt-rail-lang transition-[translate] duration-300 ease-out ${travel}`}
            >
              <LanguageSwitcher
                current={locale}
                variant="light"
                onDark={overDark.top}
              />
            </div>
          </div>

          {/* In flow on lg (no room to center absolutely), truly centered on
              xl+. The absolute positioning resolves against the *fixed* parent,
              not this `.wrap`, so it stays centred on the viewport — which is
              where the measure's own centre is anyway. */}
          <div className="pointer-events-auto xl:absolute xl:left-1/2 xl:-translate-x-1/2">
            <NavBar
              items={desktopItems}
              className={`vt-rail-nav ${travel}`}
              lampId="lamp-desktop"
              onDark={overDark.top}
              dimmed={atDirectory}
            />
          </div>

          {/* 40px, not 44. Three two-letter codes in 36px chips left so much
              dead ground inside the capsule that the control read as the
              largest thing in the rail while being the least important — see
              LanguageSwitcher. It is the one island that is a utility rather
              than identity or navigation, so it is the one that gives up
              height. */}
          {/* The three destinations that are not tabs, kept as separate marks
              rather than gathered into one pill: they go to three unrelated
              places, and a single capsule around them would claim they are one
              control. `pointer-events-auto` on an otherwise transparent shell,
              so the dead ground beside them still belongs to the page. */}
          <div className="pointer-events-auto">
            <ActionRail
              locale={locale}
              dict={dict}
              atDirectory={atDirectory}
              onDark={overDark.top}
              travel={travel}
              lampId="act-lamp-desktop"
            />
          </div>
        </div>
      </div>

      {/* Mobile / tablet — identity and language stay at the top (they are
          reference, not navigation), and the tabs move to the bottom of the
          viewport, inside thumb reach. Same measure as the desktop rail: on a
          phone `.wrap` is a plain 24px gutter, which is the gutter the hero
          type below it uses. */}
      <div
        className="chrome-shell sticky top-0 z-50 py-2.5 lg:hidden"
        onFocusCapture={show}
      >
        <div className="wrap flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Link
              href={base}
              aria-label="ASFOCMD"
              onClick={homeClick}
              data-shown={pastMark || undefined}
              className={`vt-mark-seal ${travel} ${overDark.top ? "on-dark" : ""}`}
            >
              <Logo size={34} tone={overDark.top ? "footer" : "dark"} />
            </Link>
            <div
              className={`vt-top-lang transition-[translate] duration-300 ease-out ${travel}`}
            >
              <LanguageSwitcher
                current={locale}
                variant="light"
                onDark={overDark.top}
              />
            </div>
          </div>
          {/* Same three marks as the desktop corner. The bottom dock is five
              tabs now, so without these the phone would have no route to
              Instruire or Înregistrează-te at all. */}
          <ActionRail
            locale={locale}
            dict={dict}
            atDirectory={atDirectory}
            onDark={overDark.top}
            travel={travel}
            lampId="act-lamp-mobile"
          />
        </div>
      </div>

      {/* The bottom bar itself. Fixed, centred, clear of the home indicator on
          iOS via the safe-area inset (see `.navbar-dock` in globals.css). It
          takes the *bottom* threshold — it stops being over the fold as soon as
          the foot of the picture rises past it, long before the top rail does. */}
      <div className="navbar-dock lg:hidden">
        <NavBar
          items={mobileItems}
          iconOnly
          className="vt-dock-nav"
          lampId="lamp-mobile"
          onDark={overDark.bottom}
        />
      </div>
    </>
  );
}
