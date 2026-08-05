import Link from "next/link";
import TubelightNav from "@/components/TubelightNav";
import Footer from "@/components/Footer";
import Directory from "@/components/Directory";
import MapFocus from "@/components/MapFocus";
import Icon, { type IconName } from "@/components/Icon";
import { getDistrictCounts, getMembers, getTotalMembers } from "@/lib/cms";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";
import type { Metadata } from "next";

/* Content comes from the admin now, so a fully static page would keep serving
   whatever existed at build time. The admin's own actions revalidate this path
   on save; the window is the safety net. */
export const revalidate = 60;

const SERVICE_ICONS: IconName[] = ["svcSweep", "svcStove", "svcFireplace", "svcChimney", "svcHood"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = await getDictionary(isLocale(raw) ? raw : defaultLocale);
  return {
    title: `${dict.nav.services} — ASFOCMD`,
    description: dict.home.services.subtitle,
  };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const dict = await getDictionary(locale);
  const t = dict.home;
  const base = `/${locale}`;
  const [members, districtCounts, totalMembers] = await Promise.all([
    getMembers(),
    getDistrictCounts(),
    getTotalMembers(),
  ]);

  return (
    <>
      <TubelightNav locale={locale} dict={dict} />

      <div className="page-hero">
        <div className="wrap">
          <div className="kick" aria-hidden />
          <h1>{t.services.title}</h1>
          <p className="lead">{t.services.subtitle}</p>
        </div>
      </div>

      {/* SERVICES */}
      <section className="services">
        <div className="wrap">
          <div className="svc-grid">
            {t.services.items.map((s, i) => (
              <div className="svc" key={i}>
                <div className="ic"><Icon name={SERVICE_ICONS[i]} size={26} /></div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIRECTORY — find a sweep on the map */}
      <section id="directoriu" style={{ scrollMarginTop: 96 }}>
        <div className="wrap">
          <div className="sec-head">
            <div className="kick" aria-hidden />
            <h2>{t.directory.title}</h2>
            <p>{t.directory.subtitle}</p>
          </div>
          {/* No search panel above the map. The map *is* the finder: point at a
              district, the column beside it filters, and the trade filter now
              sits at the head of that column. A typed locality field floating
              over an interactive map is a second control for the same job, and
              having both is what read as clutter. */}
          <Directory
            locale={locale}
            dict={dict}
            members={members}
            districtCounts={districtCounts}
            totalMembers={totalMembers}
          />
        </div>
        <MapFocus hash="directoriu" />
      </section>

      {/* CTA */}
      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="cta">
            <h2>{t.cta.title}</h2>
            <p>{t.cta.subtitle}</p>
            <div className="btns">
              <Link className="btn btn-primary" href={`${base}/membru`}>{dict.nav.becomeMember}</Link>
              <Link
                className="btn btn-ghost"
                href={`${base}/contact`}
                style={{ color: "#fff", borderColor: "rgba(255,255,255,.25)" }}
              >
                {t.cta.secondary}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer locale={locale} dict={dict} />
    </>
  );
}
