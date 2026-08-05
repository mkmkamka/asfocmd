"use client";

import mapData from "@/data/moldova-districts.json";
import type { Locale } from "@/i18n/config";

type District = { id: string; ro: string; ru: string; en: string; d: string };

type Props = {
  locale: Locale;
  counts: Record<string, number>;
  selected: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
};

export default function DistrictMap({ locale, counts, selected, onSelect, onHover }: Props) {
  return (
    <svg
      className="md-map"
      viewBox={mapData.viewBox}
      role="group"
      aria-label="Moldova districts map"
      xmlns="http://www.w3.org/2000/svg"
    >
      {(mapData.districts as District[]).map((d) => {
        const name = d[locale] ?? d.ro;
        const count = counts[d.id] ?? 0;
        const isSel = selected === d.id;
        const cls = `district${count ? " has" : ""}${isSel ? " sel" : ""}`;
        const toggle = () => onSelect(isSel ? null : d.id);
        return (
          <path
            key={d.id}
            d={d.d}
            className={cls}
            role="button"
            tabIndex={0}
            aria-pressed={isSel}
            aria-label={`${name}: ${count}`}
            onClick={toggle}
            onMouseEnter={() => onHover(d.id)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(d.id)}
            onBlur={() => onHover(null)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggle();
              }
            }}
          >
            <title>{`${name} · ${count}`}</title>
          </path>
        );
      })}
    </svg>
  );
}
