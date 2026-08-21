"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import Icon from "@/components/Icon";
import Logo from "@/components/Logo";

export type Stat = { n: string; l: string };
export type Org = { logo: string; name: string; full: string; href: string };

/* Splits "230+" into ["", 230, "+"] so only the number itself animates and the
   prefix/suffix stay put. Anything without digits is returned as-is. */
function parse(value: string) {
  const m = /^(\D*?)([\d .,\s]*\d)(.*)$/.exec(value);
  if (!m) return null;
  const digits = Number(m[2].replace(/[^\d]/g, ""));
  if (!Number.isFinite(digits)) return null;
  return { pre: m[1], value: digits, post: m[3] };
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/* One figure. It counts up the first time it scrolls into view, then holds.
   Years (four digits) climb from a couple of decades back rather than from
   zero — counting to 2017 from 0 looks like a bug, not a flourish.

   The tick is written straight to the node rather than through state: the
   rendered markup (and anything without JS) always carries the real figure,
   and a 60fps counter never re-renders the card. */
function Figure({ value }: { value: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parsed = parse(value);
    if (!el || !parsed) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const from = parsed.value >= 1000 ? parsed.value - 40 : 0;
    const render = (n: number) => `${parsed.pre}${n}${parsed.post}`;

    let frame = 0;
    const run = () => {
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / 1100);
        el.textContent = render(
          Math.round(from + (parsed.value - from) * easeOut(t)),
        );
        if (t < 1) frame = requestAnimationFrame(step);
      };
      step(start);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          run();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
      // Whatever the animation was mid-way through, leave the real figure.
      el.textContent = value;
    };
  }, [value]);

  return (
    <div className="fx-n" ref={ref}>
      {value}
    </div>
  );
}

/* "The association in numbers".
   Compact on the home page (four figures, the whole card links through to
   /despre); full on the about page, where it carries the extra figures and the
   affiliation logos link out to each confederation. */
export default function StatCard({
  kick,
  blurb,
  items,
  orgLabel,
  orgs,
  href,
  more,
  columns = 4,
}: {
  kick: string;
  /** Short standfirst inside the card — used on the home page, where the box
      replaced the section headline and has to introduce the association. */
  blurb?: string;
  items: Stat[];
  /** Affiliations footer. Omitted on the home page, where the hero's own
      logo rail already carries the same caption and the same logos — the
      card there ends at the figures. */
  orgLabel?: string;
  orgs?: Org[];
  /** When set, the whole card is a link (and the org chips go inert). */
  href?: string;
  more?: string;
  columns?: 3 | 4;
}) {
  const body = (
    <>
      <div className="factbox-head">
        {/* Seal + wordmark in black, the same lockup as the mark in the top-left
            corner — the box identifies the association rather than labelling a
            row of figures, so it gets the logo, not a coloured kicker. */}
        <span className="factbox-kick">
          {/* Rests in the greyscale cut and comes up in full colour when the
              card is hovered, matching the partner logos in the card's foot.
              Two stacked marks rather than a CSS grayscale() of the colour one:
              a luminance filter flattens the oxblood brick and the soot cap
              into the same mid grey. */}
          <span className="seal-swap">
            <Logo size={26} tone="mono" />
            <Logo size={26} />
          </span>
          {kick}
        </span>
        {href && more && (
          <span className="factbox-more">
            {more}
            <Icon name="arrowRight" size={14} />
          </span>
        )}
      </div>

      {blurb && <p className="factbox-blurb">{blurb}</p>}

      <div className={`fact-grid${columns === 3 ? " fact-grid--3" : ""}`}>
        {items.map((s, i) => (
          <div className="fx-item" key={i}>
            <Figure value={s.n} />
            <div className="fx-l">{s.l}</div>
          </div>
        ))}
      </div>

      {orgLabel && orgs && (
        <div className="factbox-foot">
          <span className="fx-foot-label">{orgLabel}</span>
          <div className="fx-orgs">
            {orgs.map((o) =>
              href ? (
                <span className="fx-org" key={o.name} title={o.full}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={o.logo} alt="" aria-hidden />
                  <span>{o.name}</span>
                </span>
              ) : (
                <a
                  className="fx-org"
                  key={o.name}
                  href={o.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={o.full}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={o.logo} alt="" aria-hidden />
                  <span>{o.name}</span>
                </a>
              ),
            )}
          </div>
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link className="factbox factbox--link" href={href}>
        {body}
      </Link>
    );
  }
  return <div className="factbox">{body}</div>;
}
