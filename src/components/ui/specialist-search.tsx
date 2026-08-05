"use client";

import { LayoutGrid, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Dictionary } from "@/i18n/get-dictionary";

type HeroDict = Dictionary["home"]["hero"];

/* "Găsește un specialist lângă tine" — the locality + service finder.

   Two shapes:
   · "full" (used on /servicii, above the directory) keeps all three controls
     on one row: locality, service, and the search button.
   · "compact" (the home hero) is a single locality field plus the button. The
     label above and the popular-service chips below are what tell a first-time
     visitor what the site is actually for, so they stay in both shapes.

   Shape *and* material follow the nav: every control is a full-round capsule
   cut from the same glass as the tubelight tabs and the hero CTAs — see
   `.glass-panel` / `.glass-field` in globals.css, which carry the nav's own
   fill, hairline and blur. Nothing here is a rectangle, and the controls are
   44px tall so the row lines up with the CTA pair above. */
export function SpecialistSearch({
  hero,
  variant = "full",
  shell = true,
  className = "",
}: {
  hero: HeroDict;
  variant?: "full" | "compact";
  /** Set false when the finder is already inside a glass panel (the home hero's
      action pane) — it then contributes only its rows, so the caller's panel
      stays one surface rather than a pane nested in a pane. */
  shell?: boolean;
  className?: string;
}) {
  const compact = variant === "compact";
  return (
    <div
      className={`w-full text-left ${
        shell
          ? `glass-panel rounded-[28px] p-2.5 ${compact ? "" : "max-w-3xl"}`
          : ""
      } ${className}`}
    >
      <div
        className={`mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground ${
          shell ? "px-4 pt-1.5" : "px-2"
        }`}
      >
        {hero.searchLabel}
      </div>
      <div
        className={`grid gap-2 ${
          compact ? "grid-cols-[1fr_auto]" : "sm:grid-cols-[1fr_1fr_auto]"
        }`}
      >
        <div className="relative">
          <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-copper" />
          <Input
            // `bg-transparent` is needed because the shadcn Input ships
            // `bg-background`, which would sit opaque on top of the glass fill.
            className="glass-field h-11 w-full rounded-full bg-transparent pl-11 pr-5 focus-visible:ring-offset-0"
            placeholder={hero.locationPlaceholder}
            aria-label={hero.locationPlaceholder}
          />
        </div>
        {!compact && (
          <div className="relative">
            <LayoutGrid className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-copper" />
            <select
              className="glass-field flex h-11 w-full appearance-none rounded-full pl-11 pr-9 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={hero.serviceAll}
              defaultValue=""
            >
              <option value="">{hero.serviceAll}</option>
              {hero.services.map((s, i) => (
                <option key={i}>{s}</option>
              ))}
            </select>
          </div>
        )}
        {/* Neutral at rest like the two CTAs above it — the solid ember pill
            was the only saturated object in the fold — and it kindles the same
            ember tint on hover as "Caută pe hartă". */}
        <Button
          variant="outline"
          className="glow-ember h-11 shrink-0 rounded-full px-6 text-[14.5px] font-semibold"
        >
          <Search className="mr-2 h-4 w-4" />
          {hero.searchBtn}
        </Button>
      </div>
      <div
        className={`mt-3 flex flex-wrap items-center gap-1.5 px-2 text-xs text-muted-foreground ${
          shell ? "pb-1" : ""
        }`}
      >
        {hero.popularLabel}
        {hero.popular.map((p, i) => (
          <span
            key={i}
            className="glass glass-neutral cursor-pointer rounded-full px-2.5 py-1 text-[11px] font-medium"
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}
