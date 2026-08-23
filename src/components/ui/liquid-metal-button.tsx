"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useReducedMotion } from "motion/react";
import { liquidMetalFragmentShader, ShaderMount } from "@paper-design/shaders";

/* Liquid-metal rim.
 *
 * This is the reference component turned inside out. The original is a whole
 * button made of shader: a dark pill floating over a full-bleed liquid-metal
 * canvas, with the label in mid-grey. Dropping that into the fold would have
 * replaced the one saturated object on the page — the oxblood CTA that carries
 * the site's entire accent — with a grey capsule, which is a different design
 * decision than the one that was asked for.
 *
 * So only the *edge* is shader. The wrapper carries `--lm-ring` of padding; the
 * canvas fills the wrapper and is clipped to its radius; the real button sits on
 * top with its own ember fill and its own radius, covering everything except a
 * 2px rim. Nothing about `.hero-cta` changes — colour, type, padding, hover and
 * the phone's viewport-relative shrink all still come from globals.css, and the
 * ring scales with them because it is only ever `inset:0` plus padding.
 *
 * Three things are deliberately not the reference implementation:
 *
 *   - No injected global stylesheet. The reference appends a <style> to <head>
 *     forcing `canvas{border-radius:100px}` on every shader canvas in the
 *     document. `overflow:hidden` on the clip does the same job locally.
 *   - The ring keeps a static metal gradient underneath the canvas. WebGL
 *     context creation fails on locked-down browsers, in some remote sessions
 *     and once a page has too many live contexts; without a floor under it the
 *     button would render with a black rim rather than no effect at all.
 *   - `prefers-reduced-motion` pins the speed to 0. ShaderMount stops its rAF
 *     entirely at speed 0, so the reduced-motion path costs one static frame
 *     rather than a permanent render loop.
 *
 * At rest the rim is paused (speed 0) and centred — a still metal ring, not a
 * constant shimmer competing with the rest of the fold. Motion is a hover
 * response, not ambient decoration: entering starts the sweep and biases it
 * toward wherever the pointer landed, tracking the cursor as it crosses the
 * rim, and leaving eases the pattern back to centre and pauses it again.
 */
export function LiquidMetalLink({
  href,
  className,
  children,
  ...rest
}: {
  href: string;
  className?: string;
  children: ReactNode;
} & Omit<React.ComponentProps<typeof Link>, "href" | "className">) {
  const ringRef = useRef<HTMLSpanElement | null>(null);
  const mountRef = useRef<ShaderMount | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const host = ringRef.current;
    if (!host) return;

    let mount: ShaderMount | null = null;

    try {
      mount = new ShaderMount(
        host,
        liquidMetalFragmentShader,
        {
          /* These are not the reference component's numbers. They were picked
             by rendering the real fragment shader one frame at a time across a
             grid of candidates and reading the result back, because two things
             about this shader are not guessable:

             - `u_colorTint` blends by *colour burn*, so it darkens. Anything
               below about 0.8 burns the whole rim to near-black — which is what
               the reference's dark-back/mid-tint pairing is for, since it wants
               a dark button. A bright rim needs the tint at white and the base
               brightness carried by `u_colorBack`.
             - at the reference's `u_scale: 8` the pattern is zoomed so far past
               a 200x58 rim that only one flat sweep crosses it. Scale 3 puts two
               or three bands on the ring, which is what makes it read as metal
               moving rather than a strip that gets lighter and darker. */
          // Cool steel, not brass. The palette has exactly one warm accent and
          // the button already is it; a gold rim would put two competing warms
          // within 2px of each other.
          u_colorBack: [0.58, 0.6, 0.64, 1],
          u_colorTint: [1, 1, 1, 1],
          u_image: undefined,
          u_isImage: false,
          u_repetition: 6,
          u_softness: 0.22,
          // The red/blue dispersion is the iridescent fringe on each band edge.
          // It is most of what sells the material at this size.
          u_shiftRed: 0.3,
          u_shiftBlue: 0.3,
          u_distortion: 0.15,
          u_contour: 0,
          u_angle: 45,
          // Shape 1 is the built-in circle.
          u_shape: 1,
          /* `fit: cover` over a square world, and this is the whole reason the
             rim reads as metal at the *ends* of the pill rather than only along
             its top and bottom.

             With `fit: none` (the reference's setting) the pattern box is
             derived from the canvas, so on a 203x58 button the circle is
             squashed into a wide, flat ellipse and the two end caps land in
             dead space outside it. Measured by walking the pill's perimeter and
             sampling luminance: top edge range 212/255, bottom 217, right cap
             194 — and the left cap 5. Five. That is flat paint, which is
             exactly what it looked like.

             Making the pattern finer makes it worse, not better: at scale 1.2
             both caps measure 0, because the ends fall further outside the
             shape. Only an isotropic pattern that covers the canvas wraps the
             caps. With cover over a square world all four arcs land between
             192 and 213 — a rim that flows the whole way round. */
          u_fit: 2,
          u_scale: 1.2,
          u_rotation: 0,
          u_originX: 0.5,
          u_originY: 0.5,
          /* Centred, not `0.1 / -0.1`. `cover` scales the pattern up until it
             fills the canvas and crops the overflow — for a wide/short pill
             that overflow is nearly all horizontal, so a fixed rightward
             offsetX crops asymmetrically: more comes off the left than the
             right. That was survivable on the wider icon+label button this
             was tuned against; on the slimmer text-only capsule the same
             0.1 is a bigger fraction of the (now smaller) crop margin, and
             the left cap's arc gets cropped into the shape's flat interior —
             which reads as the rim just not moving over there. Zero keeps
             the crop even on both ends regardless of how narrow the capsule
             gets. */
          u_offsetX: 0,
          u_offsetY: 0,
          u_worldWidth: 100,
          u_worldHeight: 100,
        },
        undefined,
        // Paused at mount — see the note above. ShaderMount still draws the
        // one frame this needs to swap in for the CSS floor below.
        0,
      );
      mountRef.current = mount;

      /* The canvas used to stay transparent until `getCurrentFrame()` reported
         a drawn frame, because a live-but-blank canvas over the old always-on
         rim was an opaque black ring. That gate cannot work now — the shader
         mounts paused, so the frame counter never advances and the canvas
         would never be revealed at all.

         It is also no longer needed. The whole layer sits at `opacity:0` until
         the pointer arrives, and the reveal is a 280ms fade against a shader
         that starts drawing on the first frame after `setSpeed`, so it has
         painted long before it is visible. A failed context is still handled —
         see `catch`. */
      host.dataset.live = "1";
    } catch {
      // WebGL unavailable — the plain rim on `.lm-rim` stays, and hovering
      // simply does nothing rather than exposing a black ring.
      host.dataset.shader = "off";
    }

    return () => {
      mount?.dispose();
      mountRef.current = null;
    };
  }, [reduce]);

  /* Where the pointer is on the rim, handed to CSS as two percentages. The
     mask in `.lm-rim-shader` is a disc centred on them, so the metal shows
     only in an arc around the cursor and travels with it — the melt leans
     into where you are rather than sweeping the whole ring on a fixed cycle.

     Written straight to the element as custom properties rather than held in
     React state: this fires on every mousemove, and a re-render per frame to
     move a gradient is work the browser can do on its own.

     Measured against the rim, not the button inside it, because the rim is
     the thing being revealed — its box includes the 2px ring the mask is
     actually cutting into. */
  const track = (e: React.MouseEvent<HTMLSpanElement>) => {
    const host = e.currentTarget;
    const r = host.getBoundingClientRect();
    host.style.setProperty("--lm-mx", `${((e.clientX - r.left) / r.width) * 100}%`);
    host.style.setProperty("--lm-my", `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  const speed = (v: number) => mountRef.current?.setSpeed(reduce ? 0 : v);

  return (
    <span
      className="lm-rim"
      /* The shader only runs while the pointer is on the button. Off it, the
         speed goes to 0 — which stops ShaderMount's rAF entirely, not just
         the visible motion — and the rim falls back to the plain colour
         underneath. Reduced motion never starts it at all: `speed()` pins to
         0, so hovering reveals a still frame of metal rather than nothing,
         and no render loop is entered. */
      onMouseEnter={(e) => {
        track(e);
        e.currentTarget.dataset.hover = "1";
        speed(1.1);
      }}
      onMouseMove={track}
      onMouseLeave={(e) => {
        delete e.currentTarget.dataset.hover;
        speed(0);
      }}
    >
      <span ref={ringRef} className="lm-rim-shader" aria-hidden />
      <Link href={href} className={className} {...rest}>
        {children}
      </Link>
    </span>
  );
}
