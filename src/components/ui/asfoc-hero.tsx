"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { GraduationCap, Map, UserPlus } from "lucide-react";
import { HeroVideo } from "@/components/ui/hero-video";
import { LiquidMetalLink } from "@/components/ui/liquid-metal-button";
import type { Dictionary } from "@/i18n/get-dictionary";

type HomeDict = Dictionary["home"];

/* The fold as a title card.

   It used to be a centred stack on clear footage: eyebrow, the legal name set
   on one edge-to-edge line, three identical frosted capsules and a floating
   glass pill of logos. Four things made that read as a template rather than as
   an institution — the composition was dead-centre with no anchor, the name was
   a banner rather than a headline, the three actions carried identical weight
   so the eye had nowhere to go, and the dark type needed a white halo behind
   every glyph to survive the picture.

   This is the other way round. The footage is graded (see HeroVideo), the type
   is light, and the whole block is set low and left against the site's own
   1180px measure — the same left edge as the fact card, the services grid and
   the news row below, which the old `max-w-5xl` hero never lined up with. The
   top two thirds of the frame are left to the picture.

   Nothing in here is glass any more. The frosted capsule is the site's nav
   material, and wearing it three times across the fold is what made the actions
   read as chrome; the one saturated object left is the primary CTA. */

export function AsfocHero({
  base,
  hero,
  cta,
  becomeMember,
  training,
  clips,
  membersSlot,
}: {
  base: string;
  hero: HomeDict["hero"];
  cta: HomeDict["cta"];
  becomeMember: string;
  training: string;
  /** The hero story, in order — see HeroVideo. */
  clips: string[];
  /** Affiliations, set into the credit rail along the foot of the fold.
      Passed in from the server page so it can stay a server component. */
  membersSlot?: ReactNode;
}) {
  const reduce = useReducedMotion();

  /* One orchestrated entrance rather than four independent delays: the rule
     draws, the name rises, the actions follow, the credits settle last. Reduced
     motion collapses the whole sequence to a plain fade. */
  const stage = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.09, delayChildren: 0.15 } },
  };
  const rise = {
    hidden: { opacity: 0, y: reduce ? 0 : 22 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0.3 : 0.72, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <main>
      {/* Below `lg` the nav is a *sticky* 64px row in normal flow (identity
          capsule + language switcher — see TubelightNav), which would otherwise
          push a full-height fold 64px past the bottom of the screen and clip the
          credit rail. The row has no surface of its own, just two floating
          capsules, so the fold is pulled back up under it and the footage runs
          behind them exactly as it runs behind the desktop pill. */}
      <section className="hero-fold relative -mt-16 flex min-h-dvh w-full flex-col lg:mt-0">
        <HeroVideo
          clips={clips}
          className="inset-y-0 left-1/2 w-screen -translate-x-1/2"
        />

        {/* The stage pushes its contents to the foot of the frame. `pt-28`
            only guarantees the block never collides with the nav on a short
            laptop; on any normal screen the picture takes that space. */}
        <motion.div
          className="hero-stage wrap"
          variants={stage}
          initial="hidden"
          animate="show"
        >
          {/* Eyebrow and short name on one line. They used to be two elements a
              headline apart — a copper kicker above the title and an ember
              `ASFOCMD` mark below it — which stated the same identity twice in
              the same 200px of fold. One label, one rule, one accent. */}
          <motion.div className="hero-eyebrow" variants={rise}>
            <span className="hero-eyebrow-rule" aria-hidden />
            {hero.eyebrow}
            <span className="hero-eyebrow-sep" aria-hidden />
            ASFOCMD
          </motion.div>

          {/* The association's full name, still the headline — but set in a
              measure instead of across the viewport. Holding it on one line
              forced it down to min(2.55vw,42px), which is 32px on a 1280 screen:
              the longest string on the page was also among the smallest type on
              it. In three lines it can take its real size. */}
          <motion.h1 className="hero-title" variants={rise}>
            {hero.titleLine1}
          </motion.h1>

          {/* One primary, two quiet. All three destinations stay — the eye just
              gets an order now.

              Each action carries its own mark, leading: a folded map for the
              directory, a membership card for joining, a cap for the courses.
              Three words with no marks made the row read as body copy that
              happened to be underlined; the pictograms are what tell you at a
              glance that these are the three doors out of the fold. The mark
              sits *before* the label on all three (the CTA's trailing arrow was
              the only glyph in the row, which put the emphasis on "away" rather
              than on what you get).

              The map is a *map*, not a dropped pin. A pin marks one place; what
              this button opens is a national directory you browse by district,
              so the folded map is what it actually does. */}
          <motion.div className="hero-actions" variants={rise}>
            {/* The one saturated object in the frame, now wearing a 2px
                liquid-metal rim. The fill, the type and every responsive rule
                still come from `.hero-cta`; the wrapper only adds the edge. */}
            <LiquidMetalLink
              className="hero-cta"
              href={`${base}/servicii#directoriu`}
            >
              <Map className="hero-cta-mark" size={17} aria-hidden />
              {cta.primary}
            </LiquidMetalLink>
            <Link className="hero-link" href={`${base}/membru`}>
              <UserPlus className="hero-link-mark" size={16} aria-hidden />
              <span className="hero-link-label">{becomeMember}</span>
            </Link>
            <Link className="hero-link" href={`${base}/instruire`}>
              <GraduationCap className="hero-link-mark" size={16} aria-hidden />
              <span className="hero-link-label">{training}</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Credit rail. The logos used to float in a rounded glass pill in the
            middle of the frame; they are credentials, so they now read as
            credits — a hairline across the foot of the fold, caption left,
            bodies right. */}
        {membersSlot && (
          <motion.div
            className="hero-credits"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduce ? 0 : 0.75, duration: 0.7 }}
          >
            <div className="wrap hero-credits-inner">{membersSlot}</div>
          </motion.div>
        )}
      </section>
    </main>
  );
}
