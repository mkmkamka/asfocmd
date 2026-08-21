"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

export type GalleryCard = {
  href: string;
  /** Optional. A card without one is set as type instead — see `.hscroll-card
      --text` in globals.css. Six of the eleven training announcements have no
      photograph, and dropping them to keep the row pretty would take six real
      courses off the page. */
  image?: string;
  label: string;
  meta: string;
};

/**
 * A band that reads sideways while the page scrolls down: the stage pins to the
 * viewport, and the track of cards is pulled left in step with how far through
 * the band you are.
 *
 * Three things are deliberately measured rather than typed in, because a
 * gallery whose numbers are written down in two files is a gallery that breaks
 * the first time someone adds a card:
 *
 * - **How far the track travels** is the track's own width less the width on
 *   screen, read from the DOM. Add a card, drop a card, change the card size at
 *   a breakpoint — the travel follows, and nothing in this file needs editing.
 * - **How tall the band is** is that same travel plus one screen. That keeps
 *   the exchange rate at 1px down for 1px across whatever the card count is, so
 *   six cards do not scroll at a different speed from three. A fixed `300vh`
 *   would mean the speed changed every time the content did.
 * - **Where the track starts** is the site measure, not the viewport edge —
 *   the first card's left edge lands on the same line as the headline above it
 *   and the hero title on the home page. See `.hscroll-stage` in globals.css.
 *
 * A `ResizeObserver` re-measures on layout change, so rotating a phone or
 * hitting a breakpoint re-derives all three rather than leaving stale numbers.
 */
export default function ScrollGallery({
  cards,
  kicker,
  title,
  more,
}: {
  cards: GalleryCard[];
  /** Both optional, and both omitted on /stiri: that page's own `page-hero`
      already carries the same words as its `<h1>`, and a band that repeats the
      heading directly above it reads as a rendering fault. Where the band is
      one section inside a longer page — the home page, /instruire — it needs
      its own head to say what it is. */
  kicker?: string;
  title?: string;
  /** The way out of the band — "all the news", and where it goes. */
  more?: { label: string; href: string };
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);

  useEffect(() => {
    const stage = stageRef.current;
    const track = trackRef.current;
    if (!stage || !track) return;

    const measure = () => {
      // The stage carries the measure's gutters as padding; the track carries
      // the trailing one. Comparing the track against the stage's *content* box
      // is what lands the last card's right edge on the measure's right edge.
      const cs = getComputedStyle(stage);
      const inner =
        stage.clientWidth -
        parseFloat(cs.paddingLeft) -
        parseFloat(cs.paddingRight);
      setTravel(Math.max(0, track.scrollWidth - inner));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    ro.observe(track);
    return () => ro.disconnect();
  }, [cards.length]);

  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -travel]);

  return (
    /* `data-no-page-swipe` because a sideways flick in here is about the
       gallery, not about leaving the page — PageSwipe reads that attribute and
       keeps its hands off. It already stands aside for real horizontal
       scrollers, but this one moves by transform, so it has to be told. */
    <section className="hscroll" data-no-page-swipe>
      <div
        ref={railRef}
        className="hscroll-rail"
        style={{ height: `calc(100vh + ${travel}px)` }}
      >
        <div ref={stageRef} className="hscroll-stage">
          {(kicker || title || more) && (
            <div className="hscroll-head">
              {kicker && <span className="hscroll-kick">{kicker}</span>}
              {title && <h2>{title}</h2>}
              {more && (
                <Link className="hscroll-more" href={more.href}>
                  {more.label}
                </Link>
              )}
            </div>
          )}

          <motion.div ref={trackRef} className="hscroll-track" style={{ x }}>
            {cards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className={`hscroll-card${card.image ? "" : " hscroll-card--text"}`}
              >
                {card.image && (
                  <Image
                    src={card.image}
                    alt=""
                    fill
                    sizes="(max-width: 700px) 78vw, 420px"
                    style={{ objectFit: "cover" }}
                  />
                )}
                <div className="hscroll-card-body">
                  <span className="hscroll-card-meta">{card.meta}</span>
                  <h3>{card.label}</h3>
                </div>
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
