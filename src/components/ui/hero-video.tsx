"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SyntheticEvent } from "react";

/* Overlap, in seconds, between the outgoing and incoming layer. Must stay in
   step with the 700ms opacity transition below (a little longer, so the fade
   has finished before the outgoing layer is rewound). */
const FADE = 0.9;

/* Ambient background video band.

   It plays a *story*, in order, on a loop: firewood, a hand feeding the stove,
   the fire taking, smoke inside the flue, the chimney top, the rooftops of a
   village, the same rooftops under snow, dusk. Then back to the wood pile. The
   arc pulls out from one pair of hands to a whole country and closes wide, so
   the seam back to the opening close-up is the one cut in the sequence that is
   supposed to feel like a reset.

   This used to be an `intro` plus a `loops[]` list, with the intro brought back
   around every 3–4 loops so the band never sat on one clip forever. A playlist
   that cycles solves that on its own — every beat comes back around, in the
   order it was cut — so the special case is gone and the caller passes one
   ordered list.

   Two stacked <video> layers cross-fade by opacity. The important part is that
   the band never uses the native `loop` attribute — a native loop cuts hard
   from the last frame back to the first, and unless the clip was authored to
   be perfectly seamless that cut is visible. Instead, ~0.9s before the playing
   layer ends we start the *other* layer from frame 0 and cross-fade to it, so
   every transition is hidden behind a dissolve regardless of how the footage
   was cut. With eight unrelated clips that matters more than it did with one:
   nothing here is meant to match on action.

   Both layers are generic: whichever one has just faded out is handed the clip
   it will show on its next turn, so it has a full clip's worth of time to
   preload before it is needed. Only the first clip is on the critical path for
   the fold. */
export function HeroVideo({
  clips,
  className = "",
}: {
  /** The story, in order. Played start to finish, then from the top. */
  clips: string[];
  className?: string;
}) {
  const aRef = useRef<HTMLVideoElement | null>(null);
  const bRef = useRef<HTMLVideoElement | null>(null);
  const [active, setActive] = useState<"a" | "b">("a");
  // A opens on the first beat, B holds the second. From there each layer is
  // re-pointed after it fades out — see `assignNext`.
  const [srcA, setSrcA] = useState(clips[0]);
  const [srcB, setSrcB] = useState(clips[1] ?? clips[0]);
  // One handoff per cycle — `timeupdate` fires many times inside the window.
  const handedOff = useRef(false);
  // Next beat to hand out. A and B already hold 0 and 1.
  const nextIdx = useRef(2);

  // The caller passes an array literal, so its identity changes on every render
  // while its contents almost never do. Depend on the contents.
  const clipsKey = clips.join("|");

  const layer = (which: "a" | "b") => (which === "a" ? aRef : bRef).current;

  // Hand the just-retired layer the beat it will play on its next turn.
  const assignNext = useCallback(
    (which: "a" | "b") => {
      const set = which === "a" ? setSrcA : setSrcB;
      const list = clipsKey.split("|");
      set(list[nextIdx.current % list.length]);
      nextIdx.current += 1;
    },
    [clipsKey],
  );

  const handoff = useCallback(() => {
    if (handedOff.current) return;
    handedOff.current = true;
    const outgoing = active;
    const next = active === "a" ? "b" : "a";
    const nv = layer(next);
    if (nv) {
      try {
        nv.currentTime = 0;
      } catch {
        /* seeking before metadata lands is fine — it starts at 0 anyway */
      }
      nv.play().catch(() => {});
    }
    setActive(next);
    // Re-point the outgoing layer only once the cross-fade has finished, so a
    // `load()` can never blank a frame that is still visible.
    window.setTimeout(() => assignNext(outgoing), 1000);
  }, [active, assignNext]);

  // Re-arm for the next cycle whenever the live layer changes.
  useEffect(() => {
    handedOff.current = false;
  }, [active]);

  // React won't reload a <video> just because its src prop changed.
  useEffect(() => {
    const a = aRef.current;
    if (a && !a.currentSrc.endsWith(srcA)) a.load();
  }, [srcA]);

  useEffect(() => {
    const b = bRef.current;
    if (b && !b.currentSrc.endsWith(srcB)) b.load();
  }, [srcB]);

  /* Autoplay is fragile (first-visit races, tab restores, power saving). Kick
     play() on mount and on every readiness event for whichever layer is live. */
  useEffect(() => {
    const v = layer(active);
    if (!v) return;
    const tryPlay = () => {
      if (v.paused) v.play().catch(() => {});
    };
    const kick = () => {
      if (v.readyState === 0) v.load();
      tryPlay();
    };
    tryPlay();
    v.addEventListener("loadeddata", tryPlay);
    v.addEventListener("canplay", tryPlay);
    v.addEventListener("stalled", kick);
    v.addEventListener("error", kick);
    document.addEventListener("visibilitychange", tryPlay);
    const tick = setInterval(kick, 5_000);
    return () => {
      v.removeEventListener("loadeddata", tryPlay);
      v.removeEventListener("canplay", tryPlay);
      v.removeEventListener("stalled", kick);
      v.removeEventListener("error", kick);
      document.removeEventListener("visibilitychange", tryPlay);
      clearInterval(tick);
    };
  }, [active]);

  const layerProps = (which: "a" | "b") => ({
    className:
      // Ungraded: the footage plays at its own colour and its own levels. The
      // brightness/contrast trim and the masked `saturate(.3)` pane that used to
      // sit on top are both gone — the band is meant to read as full colour
      // edge to edge now.
      "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
    style: { opacity: active === which ? 1 : 0 },
    muted: true,
    playsInline: true,
    preload: "auto" as const,
    onTimeUpdate: (e: SyntheticEvent<HTMLVideoElement>) => {
      if (active !== which) return;
      const v = e.currentTarget;
      if (v.duration && v.currentTime >= v.duration - FADE) handoff();
    },
    // Safety net: if `timeupdate` never lands inside the window (throttled tab,
    // very short clip) the ended event still keeps the band alive.
    onEnded: () => {
      if (active === which) handoff();
    },
  });

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute -z-10 overflow-hidden ${className}`}
    >
      <video ref={aRef} src={srcA} autoPlay {...layerProps("a")} />
      <video ref={bRef} src={srcB} {...layerProps("b")} />

      {/* Cinematic grade. The band ran clear for a while and the type fought it:
          dark glyphs on full-contrast footage needed a white halo behind every
          letter and a frosted plate behind every control, which is a legibility
          hack you can see. This is the honest fix — grade the picture, then set
          light type on it, the way a title card does.

          Two ramps, not a flat veil. The vertical one is weighted to the foot of
          the frame, where the name and the credit rail sit, and stays nearly
          open through the upper third so the chimney and the sky keep their own
          light. The horizontal one is a soft left bias that holds the type block
          steady when a bright snowfield drifts under it — the loop clip's
          left half swings a long way in luminance across a cycle, and without it
          the headline flickers between comfortable and unreadable.
          Both are the same near-black as `--soot`, so the fold grades toward the
          site's own ink rather than toward grey. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(10,11,13,.82) 0%, rgba(10,11,13,.66) 26%, rgba(10,11,13,.36) 54%, rgba(10,11,13,.18) 76%, rgba(10,11,13,.30) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(10,11,13,.52) 0%, rgba(10,11,13,.22) 38%, rgba(10,11,13,0) 68%)",
        }}
      />
    </div>
  );
}
