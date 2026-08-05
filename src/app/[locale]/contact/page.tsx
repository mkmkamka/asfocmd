import TubelightNav from "@/components/TubelightNav";
import ContactForm from "@/components/ContactForm";
import Icon from "@/components/Icon";
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
    title: `${dict.nav.contact} — ASFOCMD`,
    description: dict.pages.contact.lead,
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const dict = await getDictionary(locale);
  const t = dict.pages.contact;
  const phone = dict.top.phone;
  const email = dict.top.email;

  // Address, phone and e-mail are already the first three rows of the details
  // box, so the requisites box drops them and keeps only what is legal/bank
  // data. The row order is identical across ro/ru/en, hence the index list.
  const DUPLICATE_ROWS = [2, 3, 5]; // address · phone · e-mail
  const orgRows = t.org.rows.filter((_, i) => !DUPLICATE_ROWS.includes(i));

  return (
    <>
      <TubelightNav locale={locale} dict={dict} />

      {/* One fold: header + three aligned boxes, sized to fit a laptop screen
          without scrolling. The site footer is deliberately not rendered here —
          it would push the page past the fold, and this page already is the
          contact information. */}
      <main className="contact-screen">
        <div className="wrap contact-inner">
          <header className="contact-head">
            <div className="kick" aria-hidden />
            <h1>{t.title}</h1>
            <p className="lead">{t.lead}</p>
          </header>

          <div className="contact-trio">
            {/* 1 — reach us */}
            <section className="c-box">
              <h2 className="c-box-title">{dict.footer.colContact.title}</h2>
              <div className="c-list">
                <div className="c-item">
                  <div className="ic"><Icon name="phone" size={18} /></div>
                  <div className="min-w-0">
                    <b>{t.cards.phone}</b>
                    <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
                  </div>
                </div>
                <div className="c-item">
                  <div className="ic"><Icon name="mail" size={18} /></div>
                  <div className="min-w-0">
                    <b>{t.cards.email}</b>
                    <a href={`mailto:${email}`}>{email}</a>
                  </div>
                </div>
                <div className="c-item">
                  <div className="ic"><Icon name="pin" size={18} /></div>
                  <div className="min-w-0">
                    <b>{t.cards.address}</b>
                    <span className="v">{dict.footer.colContact.address}</span>
                  </div>
                </div>
                <div className="c-item">
                  <div className="ic"><Icon name="clock" size={18} /></div>
                  <div className="min-w-0">
                    <b>{t.cards.hours}</b>
                    <span className="v">{t.cards.hoursValue}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 2 — write to us */}
            <ContactForm locale={locale} dict={dict} />

            {/* 3 — legal / bank details */}
            <section className="c-box" id="rechizite">
              <h2 className="c-box-title">{t.org.title}</h2>
              <dl className="req-list">
                {orgRows.map((row) => (
                  <div className="req-item" key={row.label}>
                    <dt>{row.label}</dt>
                    <dd>{row.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
