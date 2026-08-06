"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import DistrictMap from "./DistrictMap";
import Icon from "./Icon";
import mapData from "@/data/moldova-districts.json";
import type { Member } from "@/data/members";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

type District = { id: string; ro: string; ru: string; en: string };

/* The directory is a client component (the map needs hover and selection), so
   its content is handed to it by the server page rather than imported — that
   is what lets it show whoever the owner has actually approved in /admin
   instead of a file baked in at build time. */
export default function Directory({
  locale,
  dict,
  members,
  districtCounts,
  totalMembers,
}: {
  locale: Locale;
  dict: Dictionary;
  members: Member[];
  districtCounts: Record<string, number>;
  totalMembers: number;
}) {
  const d = dict.home.directory;
  const services = dict.home.hero.services;
  const base = `/${locale}`;

  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  /* The service filter used to live in a floating "Caută un specialist" panel
     above the map — a second, typed way of doing what the map already does by
     pointing at it, which is what made this section feel busy. It belongs to
     the result column: district comes from the map, trade comes from here. */
  const [service, setService] = useState<number | null>(null);

  const nameOf = useMemo(() => {
    const map: Record<string, string> = {};
    for (const dd of mapData.districts as District[]) map[dd.id] = dd[locale] ?? dd.ro;
    return map;
  }, [locale]);

  const active = hover ?? selected;
  const readoutName = active ? nameOf[active] : d.allMoldova;
  const readoutCount = active ? (districtCounts[active] ?? 0) : totalMembers;

  const list = members.filter(
    (m) =>
      (!selected || m.districtId === selected) &&
      (service === null || m.services.includes(service)),
  );

  return (
    <div className="dir-grid" id="map-focus">
      <div className="map-panel" id="map-panel-focus">
        <div className="map-readout">
          <div className="rn">{readoutName}</div>
          <div className="rc">
            {readoutCount} {d.specialists}
          </div>
        </div>
        <div className="map-wrap">
          <DistrictMap
            locale={locale}
            counts={districtCounts}
            selected={selected}
            onSelect={setSelected}
            onHover={setHover}
          />
        </div>
        <div className="map-legend">
          <span><i className="lg has" />{d.legend.has}</span>
          <span><i className="lg none" />{d.legend.none}</span>
          <span><i className="lg sel" />{d.legend.sel}</span>
        </div>
      </div>

      <div className="dir-list">
        <div className="dir-filters" role="group" aria-label={services.join(", ")}>
          <button
            type="button"
            className={`pick sm${service === null ? " on" : ""}`}
            aria-pressed={service === null}
            onClick={() => setService(null)}
          >
            {dict.home.hero.serviceAll}
          </button>
          {services.map((s, i) => (
            <button
              type="button"
              key={i}
              className={`pick sm${service === i ? " on" : ""}`}
              aria-pressed={service === i}
              onClick={() => setService(service === i ? null : i)}
            >
              {s}
            </button>
          ))}
        </div>

        {selected && (
          <button className="reset-btn" onClick={() => setSelected(null)}>
            <Icon name="arrowRight" size={16} />
            {d.reset}
          </button>
        )}

        {list.length > 0 ? (
          <>
            {list.slice(0, 6).map((m) => (
              <div className="mcard" key={m.id}>
                <div className="avatar">{m.initials}</div>
                <div className="info">
                  <div className="name">
                    {m.name}
                    <span className="verified" title={d.verified}>
                      <Icon name="shieldCheck" size={16} />
                    </span>
                  </div>
                  <div className="meta">
                    <Icon name="pinSmall" size={14} />
                    {nameOf[m.districtId]}
                  </div>
                  <div className="chips">
                    {m.services.map((s, j) => (
                      <span key={j}>{services[s]}</span>
                    ))}
                  </div>
                </div>
                <a
                  className="call"
                  href={`tel:${(m.phone ?? dict.top.phone).replace(/\s/g, "")}`}
                  aria-label={m.phone ?? dict.top.phone}
                >
                  <Icon name="phone" size={18} />
                </a>
              </div>
            ))}
            {!selected && (
              <Link
                className="btn btn-ghost"
                href={`${base}#`}
                style={{ justifyContent: "center", marginTop: 4 }}
              >
                {d.viewAll}
                <Icon name="arrowRight" size={20} />
              </Link>
            )}
          </>
        ) : (
          <div className="empty">
            <div className="ei">
              <Icon name="pin" size={26} />
            </div>
            <h4>{d.emptyTitle}</h4>
            <p>{d.emptyDesc}</p>
            <Link className="btn btn-primary" href={`${base}/membru`}>
              {d.becomeMember}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
