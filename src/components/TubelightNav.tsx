"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  House,
  Info,
  Wrench,
  GraduationCap,
  Newspaper,
  Mail,
  UserPlus,
} from "lucide-react";
import { NavBar } from "@/components/ui/tubelight-navbar";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import { scrollPageToTop } from "@/lib/nav";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

/* Is the floating chrome currently sitting over the home page's graded hero?

   The rail's resting material is ink on a 5% light wash — it needs a bright
   page under it. The home fold is a full-screen graded picture, so for as long
   as it is behind the chrome the whole rail has to run light, then flip back as
   the page scrolls into the white bands below. That flip is what a nav over a
   cinematic hero is supposed to do; the alternative is a permanently dark pill
   on every page, which is a different (and much louder) decision.

   Two thresholds, because the top rail and the phone's bottom dock sit at
   opposite ends of the viewport and stop being over the fold at different
   moments. Pages without a `.hero-fold` never report true, so /despre,
   /servicii and the rest are untouched. */
function useOverHero() {
  const pathname = usePathname();
  const [state, setState] = useState({ top: false, bottom: false });

  useEffect(() => {
    const read = () => {
      const fold = document.querySelector(".hero-fold");
      const foot = fold ? fold.getBoundingClientRect().bottom : -1;
      // The top rail floats at 44px; give it its own height again as slack so
      // the flip happens while the pill is still fully over the picture.
      const next = { top: foot > 100, bottom: foot > window.innerHeight - 36 };
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

export default function TubelightNav({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const base = `/${locale}`;
  const nav = dict.nav;

  // Desktop rail: words only, no exceptions. Instruire used to carry a faint
  // pictogram as the one promoted destination, which made it the only tab in
  // the rail that was a different *shape* from its neighbours — the promotion
  // read as a rendering inconsistency rather than as emphasis. Seven plain
  // labels, one lamp.
  //
  // Membership is the last tab: it is the conversion action, and it opens the
  // same /membru page the hero's "Înregistrează-te" link does.
  const desktopItems = [
    { name: nav.home, url: base },
    { name: nav.about, url: `${base}/despre` },
    { name: nav.services, url: `${base}/servicii` },
    { name: nav.training, url: `${base}/instruire` },
    { name: nav.news, url: `${base}/stiri` },
    { name: nav.contact, url: `${base}/contact` },
    { name: nav.becomeMember, url: `${base}/membru` },
  ];

  // Bottom bar: no room for words, so every tab needs its own mark. Seven 44px
  // tabs plus the pill's padding is 316px, which still clears a 320px screen.
  const mobileItems = [
    { name: nav.home, url: base, icon: House },
    { name: nav.about, url: `${base}/despre`, icon: Info },
    { name: nav.services, url: `${base}/servicii`, icon: Wrench },
    { name: nav.training, url: `${base}/instruire`, icon: GraduationCap },
    { name: nav.news, url: `${base}/stiri`, icon: Newspaper },
    { name: nav.contact, url: `${base}/contact`, icon: Mail },
    { name: nav.becomeMember, url: `${base}/membru`, icon: UserPlus },
  ];

  const overHero = useOverHero();
  const pathname = usePathname();

  /* The seal is a link home; on the home page itself it is a link to the top of
     it. Without this, clicking the identity mark from the middle of the page is
     a dead press — Next resolves the href to the route you are already on. */
  const homeClick = (e: React.MouseEvent) => {
    if (pathname !== base) return;
    e.preventDefault();
    scrollPageToTop();
  };

  /* Identity and language wear the same glass shell; only the height differs.
     The seal sits alone — no wordmark — at the rail's full 44px, matching the
     nav pill beside it. Language runs 40px: it is a utility, and three
     two-letter codes do not need the same presence as the site's identity or
     its navigation. Height is a parameter rather than a `!h-10` override
     because Tailwind v4 moved the important modifier to a suffix, and a class
     string that silently stops applying is a bad way to find that out. */
  const capsule = (onDark: boolean, h = "h-11") =>
    `pointer-events-auto flex ${h} items-center rounded-full border shadow-lg backdrop-blur-lg transition-colors duration-300 ${
      onDark ? "border-white/20 bg-black/25" : "border-border bg-background/5"
    }`;

  /* The seal is black artwork, so its chip stays light on both grounds — it
     just goes more opaque over the picture, where a 45% white plate would let
     the footage through and break the engraving up. */
  const seal = (size: number, onDark: boolean) => (
    <span
      className={`grid h-9 w-9 place-items-center rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,.6)] transition-colors duration-300 ${
        onDark ? "bg-white/85" : "bg-white/45"
      }`}
    >
      <Logo size={size} />
    </span>
  );

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
      <div className="pointer-events-none fixed inset-x-0 top-11 z-50 hidden lg:block">
        <div className="wrap flex items-center justify-between gap-3">
          <Link
            href={base}
            aria-label="ASFOCMD"
            onClick={homeClick}
            className={`${capsule(overHero.top)} w-11 justify-center`}
          >
            {seal(30, overHero.top)}
          </Link>

          {/* In flow on lg (no room to center absolutely), truly centered on
              xl+. The absolute positioning resolves against the *fixed* parent,
              not this `.wrap`, so it stays centred on the viewport — which is
              where the measure's own centre is anyway. */}
          <div className="pointer-events-auto xl:absolute xl:left-1/2 xl:-translate-x-1/2">
            <NavBar
              items={desktopItems}
              lampId="lamp-desktop"
              onDark={overHero.top}
            />
          </div>

          {/* 40px, not 44. Three two-letter codes in 36px chips left so much
              dead ground inside the capsule that the control read as the
              largest thing in the rail while being the least important — see
              LanguageSwitcher. It is the one island that is a utility rather
              than identity or navigation, so it is the one that gives up
              height. */}
          <div className={`${capsule(overHero.top, "h-10")} px-1`}>
            <LanguageSwitcher
              current={locale}
              variant="light"
              onDark={overHero.top}
            />
          </div>
        </div>
      </div>

      {/* Mobile / tablet — identity and language stay at the top (they are
          reference, not navigation), and the tabs move to the bottom of the
          viewport, inside thumb reach. Same measure as the desktop rail: on a
          phone `.wrap` is a plain 24px gutter, which is the gutter the hero
          type below it uses. */}
      <div className="sticky top-0 z-50 py-2.5 lg:hidden">
        <div className="wrap flex items-center justify-between gap-2">
          <Link
            href={base}
            aria-label="ASFOCMD"
            onClick={homeClick}
            className={`${capsule(overHero.top)} w-11 justify-center`}
          >
            {seal(28, overHero.top)}
          </Link>
          <div className={`${capsule(overHero.top, "h-10")} px-1`}>
            <LanguageSwitcher
              current={locale}
              variant="light"
              onDark={overHero.top}
            />
          </div>
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
          lampId="lamp-mobile"
          onDark={overHero.bottom}
        />
      </div>
    </>
  );
}
