import Link from "next/link";
import Image from "next/image";
import TubelightNav from "@/components/TubelightNav";
import Footer from "@/components/Footer";
import Icon from "@/components/Icon";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";
import { getNewsPosts } from "@/lib/cms";
import type { Metadata } from "next";

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
  const t = dict.pages.news;
  const base = `/${locale}`;
  const posts = await getNewsPosts();

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
        <div className="wrap">
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

      <Footer locale={locale} dict={dict} />
    </>
  );
}
