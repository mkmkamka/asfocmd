import Link from "next/link";
import TubelightNav from "@/components/TubelightNav";
import Footer from "@/components/Footer";
import Icon, { type IconName } from "@/components/Icon";
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

      {/* SERVICES — each box opens the directory, filtered to nothing in
          particular yet: the map is the finder, not a fourth click deep on a
          category page for a trade with three specialists in it. */}
      <section className="services">
        <div className="wrap">
          <div className="svc-grid">
            {t.services.items.map((s, i) => (
              <Link className="svc" href={`${base}/specialisti`} key={i}>
                <div className="ic"><Icon name={SERVICE_ICONS[i]} size={26} /></div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="cta">
            <h2>{t.joinCta.title}</h2>
            <p>{t.joinCta.subtitle}</p>
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
