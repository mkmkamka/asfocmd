import Link from "next/link";
import Image from "next/image";
import TubelightNav from "@/components/TubelightNav";
import Footer from "@/components/Footer";
import Icon, { type IconName } from "@/components/Icon";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";
import { getTrainingPosts } from "@/lib/cms";
import type { Metadata } from "next";

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

      {/* TRAINING POSTS */}
      {posts.length > 0 && (
        <section>
          <div className="wrap">
            <div className="sec-head">
              <div className="kick" aria-hidden />
              <h2>{t.recent.title}</h2>
              <p>{t.recent.subtitle}</p>
            </div>
            <div className="news-grid listing">
              {posts.map((post) => (
                <Link href={`${base}/stiri/${post.slug}`} key={post.slug}>
                  <article className="post">
                    <div className={`cover${post.cover > 1 ? ` c${post.cover}` : ""}`}>
                      {post.image && (
                        <Image
                          src={post.image}
                          alt={post.title[locale]}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw"
                          style={{ objectFit: "cover" }}
                        />
                      )}
                      <span className="cat">{post.cat[locale]}</span>
                    </div>
                    <div className="body">
                      <div className="date">{post.date[locale]}</div>
                      <h3>{post.title[locale]}</h3>
                      <p>{post.excerpt[locale]}</p>
                      <span className="more">
                        {dict.home.news.more}
                        <Icon name="arrowRight" size={16} />
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
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
