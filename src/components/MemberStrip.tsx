import type { Dictionary } from "@/i18n/get-dictionary";

type Memberships = Dictionary["home"]["memberships"];

/* Affiliations rail: a compact glass pill anchored to the bottom of the hero
   fold — the caption "Membru cu drepturi depline în" followed by the three
   bodies ASFOCMD belongs to. Each association's name lives in its tooltip +
   aria-label since the visible text is a logo only.

   ASFOCMD's own seal used to lead the row, which made the pill read as a logo
   lockup rather than a statement of membership — it is already the seal in the
   nav's top-left corner and the header of the fact card below. The caption
   moved here from that card's footer, where it duplicated this rail.
   Positioning is left to the caller.

   Order is by standing, not by convenience: the two European bodies first
   (ESCHFOE, then VEUKO — the order they are listed in the dictionary), and the
   Romanian sister association last. ASFOCH used to lead the row purely because
   it was the one hard-coded item; that put a national partner ahead of the two
   European federations the association is a full member of. */
export default function MemberStrip({
  label,
  memberships,
}: {
  /** "Membru cu drepturi depline în" — `home.stats.bothLabel`. */
  label: string;
  memberships: Memberships;
}) {
  return (
    <div className="member-strip">
      <span className="ms-label">{label}</span>
      {memberships.items.map((it, i) => (
        <a
          className="ms-item"
          key={i}
          href={it.href}
          target="_blank"
          rel="noopener noreferrer"
          title={it.full}
          aria-label={it.name}
        >
          {/* Each mark gets its own hook. The three artworks are a filled
              square badge, an open portrait plate and a white seal, so they
              cannot share one height and read as the same size — see the
              per-logo trims in globals.css. The name is identical in all three
              locales, so it is safe to key off. */}
          <span className={`ms-logo ms-logo--${it.name.toLowerCase()}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={it.logo} alt={it.name} />
          </span>
        </a>
      ))}
      {/* ASFOCH România — its official logo is white artwork, hence the dark chip. */}
      <a
        className="ms-item"
        href={memberships.asfoch.href}
        target="_blank"
        rel="noopener noreferrer"
        title={memberships.asfoch.desc}
        aria-label={memberships.asfoch.name}
      >
        <span className="ms-logo ms-logo--dark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/asfoch-ro-logo.png" alt={memberships.asfoch.name} />
        </span>
      </a>
    </div>
  );
}
