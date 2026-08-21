"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { GraduationCap, Map, UserPlus, type LucideIcon } from "lucide-react";
import { Lamp } from "@/components/ui/lamp";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

const LAMP = "var(--copper-soft)";
const LAMP_HALO = "rgba(217,132,124,.30)";

/* The three doors that are not tabs.
 *
 * Instruire and Înregistrează-te used to be both a tab in the middle rail and
 * a link in the fold below it, so one screen stated the same two destinations
 * twice. They are stated once now — here — which is what let the rail come
 * down to five. Caută un specialist joins them because the directory is the
 * thing most visitors arrive wanting, and it should be reachable from the
 * corner of every page rather than only from the top of the home page.
 *
 * Capsules, not circles. A circle in a corner reads as a floating widget; a
 * capsule reads as a control belonging to the bar it sits in. The word is not
 * printed — three labels would take the width the fold needs — but it is never
 * more than a pointer away: `act-tip` opens under the mark on hover *and* on
 * keyboard focus, and the link's own `aria-label` carries it for screen
 * readers whether or not anything is hovered.
 *
 * Two lights, two meanings, never the same signal:
 *   · the hairline under a capsule wakes on hover — "this is clickable"
 *   · the Lamp on top burns while you are there — "you are here"
 * The rail is chrome, so it rides every page; without it, dropping the two
 * tabs would strand both destinations behind the footer.
 */

type Action = {
  key: string;
  href: string;
  label: string;
  icon: LucideIcon;
  /** True while this is the place you are actually looking at. */
  lit: boolean;
};

export default function ActionRail({
  locale,
  dict,
  atDirectory,
  onDark = false,
  travel,
}: {
  locale: Locale;
  dict: Dictionary;
  /** The map is on screen — see `useAtDirectory` in TubelightNav. */
  atDirectory: boolean;
  /** Set while the rail floats over the home page's graded hero. */
  onDark?: boolean;
  /**
   * The travel class, when the top chrome is stepping off the screen.
   *
   * It rides on each capsule rather than on the rail around them, and that is
   * not a style choice: these are `backdrop-filter` boxes, and a transform on
   * an ancestor makes that ancestor a backdrop root — the blur keeps running,
   * samples nothing, and the marks go flat with no error anywhere. A box
   * moving itself is fine. See the same note on the nav pill.
   */
  travel?: string;
}) {
  const base = `/${locale}`;
  const nav = dict.nav;
  const pathname = usePathname();

  /* Which mark is showing its word on a touchscreen.
   *
   * The word opens on hover and on focus, and a phone has neither — so on
   * touch it opens on a long press instead. Held rather than tapped, because a
   * tap has to stay what it is: the whole point of these marks is that one
   * press goes to the page. `touchend` and `touchmove` both cancel, so a press
   * that turns into a scroll does not leave a label stranded on screen.
   */
  const [held, setHeld] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const hold = useCallback((key: string) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setHeld(key), 450);
  }, []);
  const release = useCallback(() => {
    window.clearTimeout(timer.current);
    setHeld(null);
  }, []);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  /* A section, not a page, so it cannot be matched on the path alone: you can
     stand on /servicii with the map far below you, and the tab above should
     own that. The map being *visible* is the whole condition, which is why it
     arrives measured rather than parsed out of the URL. The hash only decides
     where the browser drops you; staying lit is the map's business. */
  const actions: Action[] = [
    {
      key: "directory",
      href: `${base}/servicii#directoriu`,
      label: nav.directory,
      icon: Map,
      lit: atDirectory,
    },
    {
      key: "member",
      href: `${base}/membru`,
      label: nav.becomeMember,
      icon: UserPlus,
      lit: pathname.startsWith(`${base}/membru`),
    },
    {
      key: "training",
      href: `${base}/instruire`,
      label: nav.training,
      icon: GraduationCap,
      lit: pathname.startsWith(`${base}/instruire`),
    },
  ];

  return (
    <nav className={`act-rail${onDark ? " on-dark" : ""}`} aria-label={nav.directory}>
      {actions.map(({ key, href, label, icon: Icon, lit }) => (
        <span
          key={key}
          className={`act-slot${held === key ? " is-held" : ""}`}
          onTouchStart={() => hold(key)}
          onTouchEnd={release}
          onTouchMove={release}
          onTouchCancel={release}
        >
          <Link
            href={href}
            className={`act${key === "directory" ? " act-primary" : ""}${lit ? " is-lit" : ""} ${travel ?? ""}`}
            aria-label={label}
            aria-current={lit ? "page" : undefined}
          >
            {lit && <Lamp className="act-lamp" color={LAMP} halo={LAMP_HALO} />}
            <Icon size={18} strokeWidth={1.9} aria-hidden />
          </Link>
          {/* `aria-hidden`: the link's `aria-label` already says this word, and
              announcing it twice is how an icon rail reads as "Instruire
              Instruire". */}
          <span className="act-tip" aria-hidden>
            {label}
          </span>
        </span>
      ))}
    </nav>
  );
}
