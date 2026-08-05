import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import TubelightNav from "@/components/TubelightNav";
import Footer from "@/components/Footer";
import Icon from "@/components/Icon";
import { Lightbox } from "@/components/Lightbox";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, defaultLocale, locales, type Locale } from "@/i18n/config";
import { getPost, getPosts, isTrainingPost } from "@/lib/cms";
import type { Metadata } from "next";

/* Content comes from the admin now, so a fully static page would keep serving
   whatever existed at build time. The admin's own actions revalidate this path
   on save; the window is the safety net. */
export const revalidate = 60;


export async function generateStaticParams() {
  const posts = await getPosts();
  return locales.flatMap((locale) =>
    posts.map((post) => ({ locale, slug: post.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const post = await getPost(slug);
  if (!post) return { title: "ASFOCMD" };
  return {
    title: `${post.title[locale]} — ASFOCMD`,
    description: post.excerpt[locale],
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const dict = await getDictionary(locale);
  const t = dict.pages.news;
  const base = `/${locale}`;
  const post = await getPost(slug);
  if (!post) notFound();

  const training = isTrainingPost(post);
  const backHref = training ? `${base}/instruire` : `${base}/stiri`;
  const backLabel = training ? dict.pages.training.recent.back : t.back;

  return (
    <>
      <TubelightNav locale={locale} dict={dict} />

      <article className="article">
        <Link className="a-back" href={backHref}>
          <Icon name="arrowRight" size={16} />
          {backLabel}
        </Link>
        <div className={`a-cover${post.cover > 1 ? ` c${post.cover}` : ""}`}>
          {post.image && (
            <Image
              src={post.image}
              alt={post.title[locale]}
              fill
              sizes="(max-width: 900px) 100vw, 860px"
              style={{ objectFit: "cover" }}
              priority
            />
          )}
        </div>
        <div className="a-meta">
          <span className="cat">{post.cat[locale]}</span>
          <span>{t.published}: {post.date[locale]}</span>
        </div>
        <h1>{post.title[locale]}</h1>
        <div className="a-body">
          {post.body.map((block, i) => (
            <div key={i}>
              {block.h && <h2>{block.h[locale]}</h2>}
              <p>{block.p[locale]}</p>
            </div>
          ))}
        </div>
        {post.gallery && (
          <div className="a-gallery">
            {post.gallery.map((src, i) => (
              <Lightbox
                key={src}
                images={post.gallery!.map((s) => ({
                  src: s,
                  alt: post.title[locale],
                }))}
                index={i}
              >
                <Image
                  src={src}
                  alt={post.title[locale]}
                  fill
                  sizes="(max-width: 640px) 100vw, 430px"
                  style={{ objectFit: "cover" }}
                />
              </Lightbox>
            ))}
          </div>
        )}
        {post.embeds?.map((src) => (
          <div className="a-embed" key={src}>
            <iframe src={src} title={post.title[locale]} allowFullScreen loading="lazy" />
          </div>
        ))}
      </article>

      <Footer locale={locale} dict={dict} />
    </>
  );
}
