"use client";

import Link from "next/link";
import { useState } from "react";
import { GraduationCap, Map, UserPlus, type LucideIcon } from "lucide-react";
import { MetalRing } from "@/components/ui/liquid-metal-ring";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

/* The three doors out of the fold, as marks.
 *
 * They used to be a row of labelled actions along the foot of the hero — one
 * saturated CTA and two underlined links — and the two quiet ones were also
 * tabs in the nav rail directly above them, so the fold stated the same three
 * destinations twice in one screen. They are stated once now, here, in the
 * corner the language switcher used to hold; Instruire and Înregistrează-te
 * have left the nav rail because this rail is where they live.
 *
 * This is chrome, not hero furniture: it rides on every page, which is what
 * lets those two tabs go. Dropping it from the inner pages would strand both
 * destinations behind the footer.
 *
 * ── Why an icon-only rail is allowed to be icon-only here ──
 * `nav-label-icon` says navigation needs words, and it is right: three
 * unlabelled glyphs in a corner are a guessing game. So every mark carries its
 * label — an `aria-label` that is always there for assistive tech, and a
 * visible tip that opens under the mark on hover *and* on keyboard focus. The
 * label is never more than a pointer away; it just is not spending 300px of
 * fold to say so. The primary navigation is still the seven-word rail in the
 * middle of the screen.
 */

type Action = {
  key: string;
  href: string;
  label: string;
  icon: LucideIcon;
  /** The primary of the three — the only one that wears the metal rim. */
  metal?: boolean;
};

export default function ActionRail({
  locale,
  dict,
  onDark = false,
}: {
  locale: Locale;
  dict: Dictionary;
  /** Set while the rail floats over the home page's graded hero. */
  onDark?: boolean;
}) {
  const base = `/${locale}`;
  const nav = dict.nav;

  /* The map is a *map*, not a dropped pin. A pin marks one place; what this
     opens is a national directory you browse by district, so the folded map is
     what it actually does. It keeps first position and the rim: it is the
     action the association most wants a visitor to take, and it is the one that
     used to be the fold's only saturated object. */
  const actions: Action[] = [
    {
      key: "directory",
      href: `${base}/servicii#directoriu`,
      label: nav.directory,
      icon: Map,
      metal: true,
    },
    { key: "member", href: `${base}/membru`, label: nav.becomeMember, icon: UserPlus },
    { key: "training", href: `${base}/instruire`, label: nav.training, icon: GraduationCap },
  ];

  /* Which mark is under the pointer. This drives one thing only — whether the
     shader rim is running its render loop — because a render loop is the one
     part of the hover that CSS cannot start. Every *visual* part of it (the
     rim's opacity, the ember fill, the tip) is `:hover`/`:focus-within` in
     globals.css, so the corner never waits on a re-render to look right, and
     never sticks lit if an enter arrives without its matching leave. */
  const [hot, setHot] = useState<string | null>(null);

  return (
    <nav
      className={`act-rail${onDark ? " on-dark" : ""}`}
      aria-label={nav.directory}
    >
      {actions.map(({ key, href, label, icon: Icon, metal }) => (
        <span
          key={key}
          className="act-slot"
          onMouseEnter={() => setHot(key)}
          onMouseLeave={() => setHot((h) => (h === key ? null : h))}
        >
          {/* Armed by the first hover and idle from then on — see MetalRing. */}
          {metal && <MetalRing active={hot === key} />}
          <Link
            href={href}
            className={`act${metal ? " act-primary" : ""}`}
            aria-label={label}
            onFocus={() => setHot(key)}
            onBlur={() => setHot((h) => (h === key ? null : h))}
          >
            <Icon size={19} strokeWidth={1.9} aria-hidden />
          </Link>
          {/* `aria-hidden`: the link's own `aria-label` already carries this
              word, and announcing it twice is how an icon rail ends up reading
              as "Instruire Instruire". */}
          <span className="act-tip" aria-hidden>
            {label}
          </span>
        </span>
      ))}
    </nav>
  );
}
