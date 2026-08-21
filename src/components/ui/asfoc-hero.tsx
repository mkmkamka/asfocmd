"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import Logo from "@/components/Logo";
import { HeroVideo } from "@/components/ui/hero-video";
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

   Then it was the other way round: type low and left against the site's 1180px
   measure, one saturated CTA and two quiet links along the foot. That fixed the
   ranking and the alignment and left one thing unsaid — the association's own
   mark was a 30px chip in the corner, smaller than any single word of its name.

   This is the third arrangement, and the seal is the subject of it. Mark and
   name are one lockup in the middle of the frame, at a size that reads as an
   institution's crest rather than as a favicon: the seal roughly as tall as the
   three lines of name beside it, sharing a baseline block with them.

   Two things left the fold to make room, and neither of them left the site:

   - The three actions are now the pictogram rail in the top-right corner (see
     ActionRail), which rides on every page. They were a labelled row here *and*
     two tabs in the nav rail directly above, so the fold was stating the same
     destinations twice within one screen.
   - The "Caută pe hartă" button with the liquid-metal rim is gone as a button.
     The rim survives as the material the map pictogram wears on hover — the
     effect now belongs to the mark it always described.

   The credit rail along the foot is untouched. Nothing in the fold is glass any
   more: that is the site's nav material, and wearing it inside the frame is
   what made the old actions read as chrome. */

export function AsfocHero({
  hero,
  clips,
  membersSlot,
}: {
  hero: HomeDict["hero"];
  /** The hero story, in order — see HeroVideo. */
  clips: string[];
  /** Affiliations, set into the credit rail along the foot of the fold.
      Passed in from the server page so it can stay a server component. */
  membersSlot?: ReactNode;
}) {
  const reduce = useReducedMotion();

  /* One orchestrated entrance rather than three independent delays: the seal
     settles, the name rises behind it, the credits last. Reduced motion
     collapses the whole sequence to a plain fade. */
  const stage = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.11, delayChildren: 0.15 } },
  };
  const rise = {
    hidden: { opacity: 0, y: reduce ? 0 : 22 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0.3 : 0.72, ease: [0.16, 1, 0.3, 1] as const },
    },
  };
  /* The seal arrives by settling rather than rising — a stamp, pressed onto the
     frame. It is the one element in the fold that is an object rather than
     type, so it is the one that gets its own gesture. */
  const press = {
    hidden: { opacity: 0, scale: reduce ? 1 : 0.92 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { duration: reduce ? 0.3 : 0.85, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <main>
      {/* Below `lg` the nav is a *sticky* 64px row in normal flow (language
          switcher + action rail — see TubelightNav), which would otherwise push
          a full-height fold 64px past the bottom of the screen and clip the
          credit rail. The row has no surface of its own, just two floating
          capsules, so the fold is pulled back up under it and the footage runs
          behind them exactly as it runs behind the desktop pill. */}
      <section className="hero-fold relative -mt-16 flex min-h-dvh w-full flex-col lg:mt-0">
        <HeroVideo
          clips={clips}
          className="inset-y-0 left-1/2 w-screen -translate-x-1/2"
        />

        {/* The stage centres its contents in the frame. The paddings are not
            symmetric: the credit rail below carries real visual weight and the
            floating chrome above carries almost none, so an optically centred
            lockup sits a touch high of the geometric middle. */}
        <motion.div
          className="hero-stage wrap"
          variants={stage}
          initial="hidden"
          animate="show"
        >
          <div className="hero-lockup">
            {/* White knockout, no plate. The black line-art seal is what the
                nav chip wears on a bright page; at this size over graded
                footage it would need a white disc behind it, and a 160px white
                disc in the middle of the frame is a hole, not a crest. */}
            <motion.span className="hero-seal" variants={press}>
              <Logo size={512} tone="footer" />
            </motion.span>

            <motion.div className="hero-lockup-text" variants={rise}>
              {/* Eyebrow and short name on one line. They used to be two
                  elements a headline apart — a copper kicker above the title
                  and an ember `ASFOCMD` mark below it — which stated the same
                  identity twice in the same 200px of fold. One label, one rule,
                  one accent. */}
              <div className="hero-eyebrow">
                <span className="hero-eyebrow-rule" aria-hidden />
                {hero.eyebrow}
                <span className="hero-eyebrow-sep" aria-hidden />
                ASFOCMD
              </div>

              {/* The association's full name, still the headline — but set in a
                  measure instead of across the viewport. Holding it on one line
                  forced it down to min(2.55vw,42px), which is 32px on a 1280
                  screen: the longest string on the page was also among the
                  smallest type on it. In three lines it can take its real size,
                  and three lines is also what stands the text column at the
                  same height as the seal beside it. */}
              <h1 className="hero-title">{hero.titleLine1}</h1>
            </motion.div>
          </div>
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
