import TubelightNav from "@/components/TubelightNav";
import Footer from "@/components/Footer";
import MembershipForm from "@/components/MembershipForm";
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
  return { title: `${dict.home.membershipForm.title} — ASFOCMD` };
}

export default async function MembershipPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const dict = await getDictionary(locale);
  const f = dict.home.membershipForm;
  const m = dict.home.membership;
  const mem = dict.pages.members;

  return (
    <>
      <TubelightNav locale={locale} dict={dict} />
      <section className="apply">
        <div className="wrap apply-grid">
          <div className="apply-side">
            <div className="kick">{m.kick}</div>
            <h1>{f.title}</h1>
            <p className="lead">{f.subtitle}</p>
            <ol className="apply-steps">
              {m.steps.map((s, i) => (
                <li key={i}>
                  <b>{s.title}</b>
                  <span>{s.desc}</span>
                </li>
              ))}
            </ol>
          </div>
          <MembershipForm locale={locale} dict={dict} />
        </div>
      </section>

      {/* MEMBER COMPANIES */}
      <section className="services" id="companii">
        <div className="wrap">
          <div className="sec-head">
            <div className="kick" aria-hidden />
            <h2>{mem.title}</h2>
            <p>{mem.subtitle}</p>
          </div>
          <div className="company-grid">
            {mem.companies.map((c, i) => (
              <div className="company-card" key={i}>
                <h3>{c.name}</h3>
                <dl>
                  <div>
                    <dt>{mem.fieldAddress}</dt>
                    <dd>{c.address}</dd>
                  </div>
                  <div>
                    <dt>{mem.fieldRep}</dt>
                    <dd>{c.rep} · {c.role}</dd>
                  </div>
                  <div>
                    <dt>{mem.fieldReg}</dt>
                    <dd>{c.reg}</dd>
                  </div>
                  {c.idno && (
                    <div>
                      <dt>{mem.fieldIdno}</dt>
                      <dd>{c.idno}</dd>
                    </div>
                  )}
                </dl>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer locale={locale} dict={dict} />
    </>
  );
}
