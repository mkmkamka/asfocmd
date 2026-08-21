import TubelightNav from "@/components/TubelightNav";
import Footer from "@/components/Footer";
import ScrollGallery, { type GalleryCard } from "@/components/ScrollGallery";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";
import { getNewsPosts } from "@/lib/cms";
import type { Metadata } from "next";

/* A place to look at the sideways gallery against real content before deciding
   where it belongs. Not in PAGE_RING, so it is not a stop on the swipe ring and
   no nav tab lights up for it — reachable only by typing the URL, which is what
   a preview should be. Delete this file and the component survives. */
export const metadata: Metadata = {
  title: "Galerie orizontală (previzualizare) — ASFOCMD",
  robots: { index: false, follow: false },
};

export default async function DemoScrollPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const dict = await getDictionary(locale);
  const base = `/${locale}`;

  // Real posts, real photographs — a gallery judged on placeholder images is a
  // gallery judged on the placeholder images.
  const posts = (await getNewsPosts()).filter((p) => p.image).slice(0, 8);
  const cards: GalleryCard[] = posts.map((post) => ({
    href: `${base}/stiri/${post.slug}`,
    image: post.image!,
    label: post.title[locale],
    meta: post.date[locale],
  }));

  return (
    <>
      <TubelightNav locale={locale} dict={dict} />

      {/* A screen of ordinary page above and below, so the pin and the release
          can both be seen doing their job. */}
      <section className="page-hero">
        <div className="wrap" style={{ padding: "140px 24px 90px" }}>
          <h1>{dict.pages.news.title}</h1>
          <p style={{ maxWidth: 620, marginTop: 14 }}>{dict.pages.news.lead}</p>
        </div>
      </section>

      <ScrollGallery
        cards={cards}
        kicker={dict.nav.news}
        title={dict.pages.news.title}
      />

      <section>
        <div className="wrap" style={{ padding: "120px 24px" }}>
          <h2>{dict.pages.news.back}</h2>
        </div>
      </section>

      <Footer locale={locale} dict={dict} />
    </>
  );
}
