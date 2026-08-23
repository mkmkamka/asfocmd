import TubelightNav from "@/components/TubelightNav";
import Footer from "@/components/Footer";
import Directory from "@/components/Directory";
import { getDistrictCounts, getMembers, getTotalMembers } from "@/lib/cms";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";
import type { Metadata } from "next";

/* The map, on its own page.
   It used to be a section inside /servicii — `#directoriu` deep-linked to it,
   and MapFocus hand-scrolled the map itself to the centre of the screen once
   the browser's own hash jump landed on the section heading above it. Sharing
   a page with the services grid and the closing CTA left the map fighting
   two other bands for the fold, and centring it needed that extra scroll step
   at all. Alone on its own route, it opens right under the page's own header
   with nothing to re-centre against. */
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = await getDictionary(isLocale(raw) ? raw : defaultLocale);
  return {
    title: `${dict.home.directory.title} — ASFOCMD`,
    description: dict.home.directory.subtitle,
  };
}

export default async function SpecialistsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const dict = await getDictionary(locale);
  const t = dict.home;
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
          <h1>{t.directory.title}</h1>
          <p className="lead">{t.directory.subtitle}</p>
        </div>
      </div>

      <section id="directoriu">
        <div className="wrap">
          <Directory
            locale={locale}
            dict={dict}
            members={members}
            districtCounts={districtCounts}
            totalMembers={totalMembers}
          />
        </div>
      </section>

      <Footer locale={locale} dict={dict} />
    </>
  );
}
