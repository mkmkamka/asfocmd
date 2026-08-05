import TubelightNav from "@/components/TubelightNav";
import Footer from "@/components/Footer";
import Icon from "@/components/Icon";
import { Lightbox } from "@/components/Lightbox";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const dict = await getDictionary(isLocale(raw) ? raw : defaultLocale);
  return {
    title: `${dict.pages.resources.title} — ASFOCMD`,
    description: dict.pages.resources.lead,
  };
}

export default async function ResourcesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const dict = await getDictionary(locale);
  const t = dict.pages.resources;

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

      {/* DOCUMENTS */}
      <section>
        <div className="wrap">
          <div className="sec-head">
            <div className="kick" aria-hidden />
            <h2>{t.docs.title}</h2>
            <p>{t.docs.subtitle}</p>
          </div>
          <div className="res-list">
            {t.docs.items.map((doc, i) => {
              const href = "href" in doc ? (doc.href as string) : undefined;
              const isLink = doc.meta === "Link" || doc.meta === "Ссылка";
              const row = (
                <>
                  <div className="ic">
                    <Icon name={isLink ? "globe" : "doc"} size={22} />
                  </div>
                  <div className="info">
                    <b>{doc.title}</b>
                    <span>{doc.desc} · {doc.meta}</span>
                  </div>
                  {href ? (
                    <span className="tag-dl">{t.docs.download}</span>
                  ) : (
                    <span className="tag-soon">{t.docs.soon}</span>
                  )}
                </>
              );
              return href ? (
                <a className="res-row is-link" key={i} href={href} download>
                  {row}
                </a>
              ) : (
                <div className="res-row" key={i}>{row}</div>
              );
            })}
          </div>

          {/* CERERE DE ADERARE — preview */}
          <div className="doc-preview">
            <a
              className="doc-preview-img"
              href="/docs/cerere-aderare.pdf"
              download
              aria-label={t.docs.previewTitle}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/docs/cerere-preview.jpg" alt={t.docs.previewTitle} />
            </a>
            <div className="doc-preview-body">
              <div className="kick">{t.kick}</div>
              <h3>{t.docs.previewTitle}</h3>
              <p>{t.docs.previewDesc}</p>
              <a className="btn btn-primary" href="/docs/cerere-aderare.pdf" download>
                <Icon name="doc" size={18} />
                {t.docs.download} (PDF)
              </a>
            </div>
          </div>

          {/* OFFICIAL RECORD SCANS */}
          <div className="scans-head">
            <h3>{t.docs.scansTitle}</h3>
            <p>{t.docs.scansSubtitle}</p>
          </div>
          <div className="scan-grid">
            {t.docs.scans.map((s, i) => (
              <Lightbox
                className="scan-card"
                key={i}
                images={t.docs.scans.map((x) => ({ src: x.img, alt: x.label }))}
                index={i}
              >
                <div className="scan-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.img} alt={s.label} loading="lazy" />
                </div>
                <div className="scan-label">
                  <span>{s.label}</span>
                  <em>{t.docs.scansHint}</em>
                </div>
              </Lightbox>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="services" id="galerie">
        <div className="wrap">
          <div className="sec-head">
            <div className="kick" aria-hidden />
            <h2>{t.gallery.title}</h2>
            <p>{t.gallery.subtitle}</p>
          </div>
          <div className="photo-grid">
            {t.gallery.photos.map((photo, i) => (
              <Lightbox
                className="photo-tile"
                key={i}
                images={t.gallery.photos.map((p) => ({
                  src: p.img,
                  alt: p.caption,
                }))}
                index={i}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.img} alt={photo.caption} loading="lazy" />
              </Lightbox>
            ))}
          </div>
          <p className="gal-note">{t.gallery.note}</p>
        </div>
      </section>

      <Footer locale={locale} dict={dict} />
    </>
  );
}
