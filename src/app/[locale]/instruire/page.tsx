import Link from "next/link";
import TubelightNav from "@/components/TubelightNav";
import ScrollGallery from "@/components/ScrollGallery";
import Footer from "@/components/Footer";
import Icon, { type IconName } from "@/components/Icon";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";
import { getTrainingPosts } from "@/lib/cms";
import type { Metadata } from "next";

/* Content comes from the admin now, so a fully static page would keep serving
   whatever existed at build time. The admin's own actions revalidate this path
   on save; the window is the safety net. */
export const revalidate = 60;


const MODULE_ICONS: IconName[] = ["svcSweep", "svcStove", "shieldCheck", "doc"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = await getDictionary(isLocale(raw) ? raw : defaultLocale);
  return {
    title: `${dict.nav.training} — ASFOCMD`,
    description: dict.pages.training.lead,
  };
}

export default async function TrainingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const dict = await getDictionary(locale);
  const t = dict.pages.training;
  const base = `/${locale}`;
  const posts = await getTrainingPosts();

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

      {/* INTRO + FACTS */}
      <section>
        <div className="wrap two-col">
          <div>
            <h2>{t.intro.title}</h2>
            <p>{t.intro.p}</p>
          </div>
          <div className="facts" style={{ gridTemplateColumns: "1fr" }}>
            {t.facts.map((f, i) => (
              <div className="fact" key={i}>
                <div className="fl">{f.label}</div>
                <div className="fv">{f.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section className="services">
        <div className="wrap">
          <div className="sec-head">
            <div className="kick" aria-hidden />
            <h2>{t.modules.title}</h2>
          </div>
          <div className="svc-grid cols-4">
            {t.modules.items.map((m, i) => (
              <div className="svc static" key={i}>
                <div className="ic"><Icon name={MODULE_ICONS[i]} size={26} /></div>
                <h3>{m.title}</h3>
                <p>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRAINING POSTS — the same sideways band the home page's news section
          uses. Every announcement is here, not just the photographed ones: this
          is the training page's own record of what it has run, so a course
          disappearing because nobody attached a picture to it would be a worse
          bug than an uneven row. The ones without a photograph are set as type
          instead — see `.hscroll-card--text` in globals.css. */}
      {posts.length > 0 && (
        <ScrollGallery
          cards={posts.map((post) => ({
            href: `${base}/stiri/${post.slug}`,
            image: post.image,
            label: post.title[locale],
            meta: post.date[locale],
          }))}
          kicker={dict.nav.training}
          title={t.recent.title}
        />
      )}

      {/* UPCOMING + CTA */}
      <section>
        <div className="wrap">
          <div className="cta">
            <h2>{t.upcoming.title}</h2>
            <p>{t.upcoming.p}</p>
            <div className="btns">
              <Link className="btn btn-primary" href={`${base}/contact`}>
                {t.upcoming.cta}
                <Icon name="arrowRight" size={18} />
              </Link>
              <Link
                className="btn btn-ghost"
                href={`${base}/stiri`}
                style={{ color: "#fff", borderColor: "rgba(255,255,255,.25)" }}
              >
                {dict.nav.news}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer locale={locale} dict={dict} />
    </>
  );
}
