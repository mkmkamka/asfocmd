"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * The "Devino membru" CTA — the same transparent glass pill the tubelight nav
 * uses (no fill of its own). At rest it carries no colour at all: plain nav
 * glass, hairline border, Tailwind's shadow-lg. The blue rim and wash it used
 * to hold at rest read as an unexplained outline, so the sapphire now lives
 * entirely in the hover, where the lamp settles on the top edge and the bloom
 * fills the glass. When `active` (the visitor is on the membership page) that
 * lit state is simply held — the exact shape as the nav's active-tab lamp,
 * recoloured blue. Sized a touch tighter than the nav tabs so it sits
 * comfortably in the header.
 */

const BLUE = "#2f80d8";
const HALO = "rgba(47,128,216,0.24)";

// Resting shadow: the nav's own shadow-lg, nothing more.
const RESTING_GLOW =
  "0 10px 15px -3px rgba(20,21,24,0.10), 0 4px 6px -4px rgba(20,21,24,0.10)";
// Lit glow: rim firms up, inner and outer halos brighten and spread. Used on
// hover, and held steady while `active`.
const LIT_GLOW =
  "inset 0 0 0 1px rgba(74,150,230,0.55), inset 0 1px 18px rgba(74,150,230,0.32), 0 5px 26px -4px rgba(47,128,216,0.60)";

interface LimelightButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** On the membership page: light the lamp and hold the button lit. */
  active?: boolean;
  /** Light the lamp on hover (fades in), settling back off when the pointer leaves. */
  hoverLamp?: boolean;
}

export const LimelightButton = React.forwardRef<
  HTMLButtonElement,
  LimelightButtonProps
>(({ className, children, style, active = false, hoverLamp = false, ...props }, ref) => (
  <button
    ref={ref}
    data-active={active ? "" : undefined}
    className={cn(
      "group relative isolate cursor-pointer whitespace-nowrap rounded-full",
      "border border-border bg-background/5 backdrop-blur-lg",
      "px-4 py-1.5 text-[13.5px] font-semibold text-foreground/90",
      "transition-[color,box-shadow,border-color] duration-300 hover:text-foreground",
      "hover:border-[rgba(47,128,216,0.55)] data-[active]:border-[rgba(47,128,216,0.55)]",
      // Rest → lit on hover, or held lit while active.
      "[box-shadow:var(--glow-rest)] hover:[box-shadow:var(--glow-lit)]",
      "data-[active]:text-foreground data-[active]:[box-shadow:var(--glow-lit)]",
      className,
    )}
    style={
      {
        "--glow-rest": RESTING_GLOW,
        "--glow-lit": LIT_GLOW,
        ...style,
      } as React.CSSProperties
    }
    {...props}
  >
    {/* Lit bloom: the light fills the glass — on hover, and held steady while
        active. There is no resting wash; at rest this is plain nav glass. */}
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-data-[active]:opacity-100"
      style={{
        background:
          "radial-gradient(125% 145% at 50% -10%, rgba(74,150,230,0.40), rgba(74,150,230,0.14) 55%, transparent 85%)",
      }}
    />

    {/* The lamp — identical shape to the nav's tubelight lamp, in blue. Held lit
        while active; with `hoverLamp` it fades in on hover and settles off when
        the pointer leaves, so the button reads as switching on under the cursor. */}
    {(active || hoverLamp) && (
      <span
        aria-hidden
        className={cn(
          "absolute -top-2 left-1/2 -z-10 h-1 w-8 -translate-x-1/2 rounded-t-full",
          hoverLamp &&
            !active &&
            "opacity-0 transition-opacity duration-300 group-hover:opacity-100",
        )}
        style={{ background: BLUE }}
      >
        <span
          className="absolute -left-2 -top-2 h-6 w-12 rounded-full blur-md"
          style={{ background: HALO }}
        />
        <span
          className="absolute -top-1 h-6 w-8 rounded-full blur-md"
          style={{ background: HALO }}
        />
        <span
          className="absolute left-2 top-0 h-4 w-4 rounded-full blur-sm"
          style={{ background: HALO }}
        />
      </span>
    )}

    <span className="relative z-10">{children}</span>
  </button>
));
LimelightButton.displayName = "LimelightButton";
