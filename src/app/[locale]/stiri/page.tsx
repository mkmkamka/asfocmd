import TubelightNav from "@/components/TubelightNav";
import ScrollGallery from "@/components/ScrollGallery";
import Footer from "@/components/Footer";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";
import { getNewsPosts } from "@/lib/cms";
import type { Metadata } from "next";

/* Content comes from the admin now, so a fully static page would keep serving
   whatever existed at build time. The admin's own actions revalidate this path
   on save; the window is the safety net. */
export const revalidate = 60;


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = await getDictionary(isLocale(raw) ? raw : defaultLocale);
  return {
    title: `${dict.nav.news} — ASFOCMD`,
    description: dict.pages.news.lead,
  };
}

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const dict = await getDictionary(locale);
  const base = `/${locale}`;
  const posts = await getNewsPosts();

  return (
    <>
      <TubelightNav locale={locale} dict={dict} />

      {/* The archive as one sideways run, the same band the home page and
          /instruire use — but here it *is* the page, opening straight under
          the nav with no header band of any kind above it. Every post is in
          it; this page is the full record, so nothing is filtered out, and
          the ones with no photograph are set as type (`.hscroll-card--text`). */}
      <ScrollGallery
        lead
        cards={posts.map((post) => ({
          href: `${base}/stiri/${post.slug}`,
          image: post.image,
          label: post.title[locale],
          meta: post.date[locale],
        }))}
      />

      <Footer locale={locale} dict={dict} />
    </>
  );
}
