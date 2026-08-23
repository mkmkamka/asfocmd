import Link from "next/link";
import TubelightNav from "@/components/TubelightNav";
import Footer from "@/components/Footer";
import Icon, { type IconName } from "@/components/Icon";
import StatCard from "@/components/StatCard";
import { Lightbox } from "@/components/Lightbox";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";
import type { Metadata } from "next";

const DIRECTION_ICONS: IconName[] = ["badgeCheck", "svcStove", "shieldCheck", "globe"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = await getDictionary(isLocale(raw) ? raw : defaultLocale);
  return {
    title: `${dict.nav.about} — ASFOCMD`,
    description: dict.pages.about.lead,
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const dict = await getDictionary(locale);
  const t = dict.pages.about;
  const base = `/${locale}`;

  return (
    <>
      <TubelightNav locale={locale} dict={dict} />

      <div className="page-hero">
        <div className="wrap">
          <div className="kick" aria-hidden />
          <h1>{t.title}</h1>
          <p className="lead">{t.lead}</p>
        </div>
      </div>

      {/* MISSION + STATS — the full set of figures, the home page carries the
          compact four. */}
      <section>
        <div className="wrap">
          <div className="about-mission">
            <h2>{t.mission.title}</h2>
            <p>{t.mission.p1}</p>
            <p>{t.mission.p2}</p>
          </div>
          <StatCard
            kick={dict.home.stats.kick}
            items={[...dict.home.stats.items, ...dict.home.stats.itemsExtra]}
            orgLabel={dict.home.stats.bothLabel}
            orgs={dict.home.memberships.items}
            columns={3}
          />
        </div>
      </section>

      {/* DIRECTIONS */}
      <section className="services">
        <div className="wrap">
          <div className="sec-head">
            <div className="kick" aria-hidden />
            <h2>{t.directions.title}</h2>
          </div>
          <div className="svc-grid cols-4">
            {t.directions.items.map((d, i) => (
              <div className="svc static" key={i}>
                <div className="ic"><Icon name={DIRECTION_ICONS[i]} size={26} /></div>
                <h3>{d.title}</h3>
                <p>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VEUKO */}
      <section>
        <div className="wrap">
          <div className="band">
            <span className="badge-eu"><Icon name="shield" size={26} /></span>
            <div className="grow">
              <h2>{t.veuko.title}</h2>
              <p>{t.veuko.p}</p>
            </div>
            <a
              className="btn btn-primary"
              href="https://www.veuko.eu"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.veuko.cta}
              <Icon name="arrowRight" size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* INTERNATIONAL MEMBERSHIPS */}
      <section className="services" id="afilieri">
        <div className="wrap">
          <div className="sec-head">
            <div className="kick" aria-hidden />
            <h2>{t.memberships.title}</h2>
            <p>{t.memberships.subtitle}</p>
          </div>
          <div className="member-badges">
            {t.memberships.items.map((it, i) => {
              const href = "href" in it ? (it.href as string) : undefined;
              const inner = (
                <>
                  <div className="mb-logo">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.logo} alt={it.name} />
                  </div>
                  <div className="mb-info">
                    <div className="mb-role">{it.role}</div>
                    <b>{it.name}</b>
                    <span>{it.full}</span>
                    {href && (
                      <span className="mb-link">
                        {t.memberships.visit}
                        <Icon name="arrowRight" size={15} />
                      </span>
                    )}
                  </div>
                </>
              );
              return href ? (
                <a
                  className="member-badge"
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {inner}
                </a>
              ) : (
                <div className="member-badge" key={i}>
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* LEADERSHIP */}
      <section className="services" id="conducere">
        <div className="wrap">
          <div className="sec-head">
            <div className="kick" aria-hidden />
            <h2>{t.leadership.title}</h2>
            <p>{t.leadership.subtitle}</p>
          </div>
          <div className="person">
            <div className="avatar">AG</div>
            <div>
              <div className="role">{t.leadership.presidentRole}</div>
              <div className="nm">{t.leadership.presidentName}</div>
              <p>{t.leadership.presidentBio}</p>
            </div>
          </div>
          <p className="board-note">{t.leadership.boardNote}</p>
        </div>
      </section>

      {/* STATUTE */}
      <section id="statut">
        <div className="wrap" style={{ maxWidth: 820 }}>
          <div className="doc-card">
            <div className="ic"><Icon name="doc" size={26} /></div>
            <div>
              <h3>{t.statute.title}</h3>
              <p>{t.statute.p}</p>

              <h4 style={{ marginTop: 24 }}>{t.statute.purposeTitle}</h4>
              <p>{t.statute.purposeIntro}</p>
              <ul className="statute-aims">
                {t.statute.aims.map((aim, i) => (
                  <li key={i}>{aim}</li>
                ))}
              </ul>

              <div className="btns" style={{ marginTop: 20 }}>
                <a
                  className="btn btn-primary"
                  href={t.statute.viewFullHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon name="doc" size={18} />
                  {t.statute.viewFull}
                </a>
                <a className="btn btn-ghost" href={t.statute.href} download>
                  <Icon name="doc" size={18} />
                  {t.statute.download}
                </a>
              </div>
            </div>
          </div>

          {/* OFFICIAL RECORD SCANS — statute, registration decision, certificate */}
          <div className="scans-head" style={{ marginTop: 32 }}>
            <h3>{dict.pages.resources.docs.scansTitle}</h3>
            <p>{dict.pages.resources.docs.scansSubtitle}</p>
          </div>
          <div className="scan-grid">
            {dict.pages.resources.docs.scans.map((s, i) => (
              <Lightbox
                className="scan-card"
                key={i}
                images={dict.pages.resources.docs.scans.map((x) => ({
                  src: x.img,
                  alt: x.label,
                }))}
                index={i}
              >
                <div className="scan-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.img} alt={s.label} loading="lazy" />
                </div>
                <div className="scan-label">
                  <span>{s.label}</span>
                  <em>{dict.pages.resources.docs.scansHint}</em>
                </div>
              </Lightbox>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="cta">
            <h2>{dict.home.cta.title}</h2>
            <p>{dict.home.cta.subtitle}</p>
            <div className="btns">
              <Link className="btn btn-primary" href={`${base}/specialisti`}>{dict.home.cta.primary}</Link>
              <Link
                className="btn btn-ghost"
                href={`${base}/contact`}
                style={{ color: "#fff", borderColor: "rgba(255,255,255,.25)" }}
              >
                {dict.home.cta.secondary}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer locale={locale} dict={dict} />
    </>
  );
}
