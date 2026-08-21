"use client";

import { useEffect, useRef, type ReactNode } from "react";
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

/* The arithmetic under "Instruire" — the plateau lengths themselves.
   See `.hero-link:nth-of-type(2)` in globals.css for the rule they drive.

   A CSS `@keyframes` can only ever state one sequence, so the rule used to
   count out the same five lengths in the same order on every pass. Anything
   watched for more than one cycle then reads as a loop rather than as a
   measurement. This draws instead: a bag of plateaus, emptied in a fresh
   shuffle each pass, with the travel and the hold drawn per step — so the
   rule keeps stating and revising a quantity without ever repeating itself.

   Returns the ref for `.hero-actions`: `--sum` is inherited, so setting it on
   the lane's container reaches a pseudo-element that JS cannot address. */
function useVaryingRule(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    // Eight, not four: a full pass has to outlast the time anyone spends
    // looking at the fold, or the reshuffle is what becomes the pattern.
    const PLATEAUS = [1, 0.92, 0.81, 0.7, 0.6, 0.49, 0.38, 0.29];
    let bag: number[] = [];
    let last = 1;
    let timer = 0;

    const draw = () => {
      if (!bag.length) {
        bag = PLATEAUS.slice();
        for (let i = bag.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [bag[i], bag[j]] = [bag[j], bag[i]];
        }
        // Never state the same length either side of a reshuffle: held twice
        // in a row it reads as the rule having stalled, not as a value.
        if (bag[0] === last) [bag[0], bag[1]] = [bag[1], bag[0]];
      }
      return bag.shift() as number;
    };

    const step = () => {
      const next = draw();
      const move = Math.round(240 + Math.random() * 260);
      const hold = Math.round(620 + Math.random() * 900);
      last = next;
      el.style.setProperty("--sum-move", `${move}ms`);
      el.style.setProperty("--sum", next.toFixed(3));
      timer = window.setTimeout(step, move + hold);
    };

    // The fold's own entrance runs for about a second; the rule waits it out
    // rather than starting to count under a headline that is still arriving.
    timer = window.setTimeout(step, 1800);

    // Background tabs keep firing timers while nothing is composited, so the
    // bag would be halfway drained by the time the page is looked at again.
    const onVisibility = () => {
      window.clearTimeout(timer);
      if (!document.hidden) timer = window.setTimeout(step, 400);
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled]);

  return ref;
}

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
  const actionsRef = useVaryingRule(!reduce);

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
      {/* Below `lg` the nav is a *sticky* row in normal flow (identity capsule +
          language switcher — see TubelightNav), which would otherwise push a
          full-height fold past the bottom of the screen and clip the credit
          rail. The row has no surface of its own, just two floating capsules,
          so the fold is pulled back up under it and the footage runs behind
          them exactly as it runs behind the desktop pill.

          The pull-up has to match the shell's real height — capsule + its own
          `py-2.5` — or a strip of the page background shows above the video.
          It drifted once already when the seal capsule's size changed and
          this number was not updated with it; it is spelled out here so the
          next resize is a find, not a rediscovery. h-14 capsule (56px) +
          py-2.5 (10px top + 10px bottom) = 76px. */}
      <section className="hero-fold relative -mt-[76px] flex min-h-dvh w-full flex-col lg:mt-0">
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

          {/* Three lanes, not a row: each destination gets its own line, and
              the order now reads as a sequence rather than a rank — join,
              then train, and the specialist search closes the block as the
              most likely next click once someone already knows the
              association exists.

              Each action carries its own mark, same 16px size across all
              three, sitting on the same left column — a membership card for
              joining, a cap for the courses, a folded map for the
              directory. All three marks are siblings of the thing they
              introduce, the third one included — it is outside the capsule,
              not in it, which is the only way it lands on the same left
              column as the other two. */}
          <motion.div className="hero-actions" variants={rise} ref={actionsRef}>
            <Link className="hero-link" href={`${base}/membru`}>
              <UserPlus className="hero-link-mark" size={16} aria-hidden />
              <span className="hero-link-label">{becomeMember}</span>
            </Link>
            <Link className="hero-link" href={`${base}/instruire`}>
              <GraduationCap className="hero-link-mark" size={16} aria-hidden />
              <span className="hero-link-label">{training}</span>
            </Link>
            {/* The map mark sits outside the capsule, as a sibling of it, so
                it starts on the same left column as the two marks above —
                inside the pill it could never be on that column, because the
                pill's own rim and padding always stood in front of it. The
                button itself is text-only and symmetrically padded again.
                The one saturated object in the frame, wearing a 2px
                liquid-metal rim: fill, type and every responsive rule still
                come from `.hero-cta`; the wrapper only adds the edge. Last in
                the stack, so the primary action closes the sequence instead of
                opening it. */}
            {/* The mark moved inside the capsule. It used to sit outside as a
                sibling so it could share a left column with the two above —
                which was right while these were a stack of two bare words and
                one pill. They are three capsules of one shape now, so the
                column that mattered is the capsule's edge, not the glyph's,
                and a mark hanging outside its own button is what would break
                the row. Still the one saturated object in the frame. */}
            <LiquidMetalLink
              className="hero-cta"
              href={`${base}/servicii#directoriu`}
            >
              <Map className="hero-cta-mark" size={16} aria-hidden />
              <span className="hero-cta-label">{cta.primary}</span>
            </LiquidMetalLink>
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
