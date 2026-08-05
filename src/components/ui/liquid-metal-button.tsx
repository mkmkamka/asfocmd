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
    let poll: number | undefined;

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
          u_offsetX: 0.1,
          u_offsetY: -0.1,
          u_worldWidth: 100,
          u_worldHeight: 100,
        },
        undefined,
        reduce ? 0 : 0.55,
      );
      mountRef.current = mount;

      /* Only reveal the canvas once it has actually drawn. ShaderMount pauses
         itself while the tab is hidden or the element is off-screen, so a
         button rendered in a background tab has a live-but-blank canvas sitting
         over the fallback — an opaque black ring, which is worse than no effect
         at all. Polling `getCurrentFrame` on a timer rather than rAF is
         deliberate: rAF is exactly what is not running in that state. */
      const m = mount;
      poll = window.setInterval(() => {
        if (reduce || m.getCurrentFrame() > 0) {
          host.dataset.live = "1";
          window.clearInterval(poll);
        }
      }, 120);
    } catch {
      // WebGL unavailable — the static gradient floor stays visible.
      host.dataset.shader = "off";
    }

    return () => {
      window.clearInterval(poll);
      mount?.dispose();
      mountRef.current = null;
    };
  }, [reduce]);

  // A touch more life under the pointer, then back. Cheap: it is the same
  // render loop, just advanced faster.
  const speed = (v: number) => mountRef.current?.setSpeed(reduce ? 0 : v);

  return (
    <span
      className="lm-rim"
      onMouseEnter={() => speed(1.1)}
      onMouseLeave={() => speed(0.55)}
    >
      <span ref={ringRef} className="lm-rim-shader" aria-hidden />
      <Link href={href} className={className} {...rest}>
        {children}
      </Link>
    </span>
  );
}
