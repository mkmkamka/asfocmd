import Link from "next/link";
import TubelightNav from "@/components/TubelightNav";
import Footer from "@/components/Footer";
import MemberCheck from "@/components/MemberCheck";
import Icon, { type IconName } from "@/components/Icon";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";
import type { Metadata } from "next";

/* The status check reads the live member list, so this page must not be frozen
   at build time — an applicant approved this morning has to be findable this
   afternoon. */
export const revalidate = 60;

const BENEFIT_ICONS: IconName[] = ["shieldCheck", "globe", "doc", "badgeCheck"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = await getDictionary(isLocale(raw) ? raw : defaultLocale);
  return {
    title: `${dict.pages.memberArea.title} — ASFOCMD`,
    description: dict.pages.memberArea.lead,
  };
}

export default async function MembersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const dict = await getDictionary(locale);
  const t = dict.pages.memberArea;
  const base = `/${locale}`;

  // What the association stands for is already written once, for the trust
  // band on the home page. Restating it here in different words would be two
  // sources of truth for the same claim, so this reads the same list.
  const benefits = dict.home.trust.items;

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

      <section>
        <div className="wrap members-grid">
          <MemberCheck locale={locale} dict={dict} />

          <div className="members-side">
            <h2 className="c-box-title">{t.benefitsTitle}</h2>
            <ul className="members-benefits">
              {benefits.map((b, i) => (
                <li key={i}>
                  <span className="ic">
                    <Icon name={BENEFIT_ICONS[i % BENEFIT_ICONS.length]} size={18} />
                  </span>
                  <div>
                    <b>{b.title}</b>
                    <p>{b.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link className="btn btn-primary" href={`${base}/membru`}>
              {t.applyCta}
              <Icon name="arrowRight" size={18} />
            </Link>
          </div>
        </div>
      </section>

      <Footer locale={locale} dict={dict} />
    </>
  );
}
