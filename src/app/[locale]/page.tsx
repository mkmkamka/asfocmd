import Link from "next/link";
import Image from "next/image";
import TubelightNav from "@/components/TubelightNav";
import Footer from "@/components/Footer";
import MemberStrip from "@/components/MemberStrip";
import StatCard from "@/components/StatCard";
import Icon, { type IconName } from "@/components/Icon";
import { AsfocHero } from "@/components/ui/asfoc-hero";
import { SpecialistSearch } from "@/components/ui/specialist-search";
import { getPosts } from "@/lib/cms";
import { heroClips } from "@/lib/hero-season";
import { getDictionary } from "@/i18n/get-dictionary";
import { isLocale, defaultLocale, type Locale } from "@/i18n/config";

/* The hero's running order depends on today's date, and this page is
   statically generated — without a revalidate window the season would be
   whatever it was on the day the site was built. An hour is far finer than the
   thing being tracked needs. */
export const revalidate = 60;

const SERVICE_ICONS: IconName[] = [
  "svcSweep",
  "svcStove",
  "svcFireplace",
  "svcChimney",
  "svcHood",
];

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const dict = await getDictionary(locale);
  const t = dict.home;
  const base = `/${locale}`;
  const latestPosts = (await getPosts()).slice(0, 3);

  /* The hero band is a story, played in order and then from the top — see
     HeroVideo for the playback. The arc is hearth → sky → country: it opens on
     the raw material, finds a pair of hands, follows the heat up the flue and
     out of the chimney, and pulls back until it is looking at a whole village.
     Ending wide is what makes the cut back to the wood pile read as the story
     starting again rather than as a mistake.

     Three deliberate choices in the running order:

     - The one shot with a person in it is second, not first. Opening on hands
       makes the fold a lifestyle advert; opening on stacked timber and *then*
       finding the hands makes it a trade.
     - The flue comes before the fire settles, not after. Cutting from the hand
       at the stove door straight into the flue follows the smoke the moment it
       leaves — which is the association's actual subject — and it holds the two
       widest, coolest interiors apart instead of running them back to back.
     - The order is now picked by date rather than interleaving the seasons —
       see `heroClips` in src/lib/hero-season.ts. Mid-May to mid-September the
       green rooftops open and the snowbound hillside sits out; the rest of the
       year runs the original arc. The lone brick chimney is gone from the story
       entirely (the file is in _archive/hero-unused).

     `revalidate` below is what makes this work on a statically generated page:
     without it the season would be frozen at whatever it was when the site was
     built. */
  const clips = heroClips();

  return (
    <>
      <TubelightNav locale={locale} dict={dict} />

      {/* HERO — ambient video band + search + the two confederation cards */}
      <AsfocHero
        base={base}
        hero={t.hero}
        cta={t.cta}
        becomeMember={dict.nav.becomeMember}
        training={dict.nav.training}
        clips={clips}
        membersSlot={
          <MemberStrip label={t.stats.bothLabel} memberships={t.memberships} />
        }
      />

      {/* Below the hero: one snippet per nav item, in nav order.
          The fold above is now a full-screen title card, so this band is the
          first thing a visitor scrolls to — and it opens with the specialist
          finder, which used to be crammed under the hero CTAs. Finder and fact
          card are two surfaces in one compartment: separate panes, shared
          measure and shared white ground, so the band reads as "find someone,
          and here's who we are" rather than as two unrelated sections. */}
      <section className="about-band" id="despre">
        <div className="wrap">
          <div className="mx-auto max-w-[1000px] space-y-7 md:space-y-9">
            {/* Specialist finder, in its full three-control shape (locality +
                service + search) — off the footage there is room for the
                middle field the hero's compact variant had to drop. */}
            <div className="finder-band">
              <SpecialistSearch hero={t.hero} className="!max-w-none" />
            </div>

            {/* The association in numbers — compact here (no affiliations
                footer; the hero rail carries it), the whole card opens /despre
                where the full set lives. */}
            <StatCard
              kick={t.stats.kick}
              blurb={t.stats.blurb}
              items={t.stats.items}
              href={`${base}/despre`}
              more={t.stats.aboutCta}
            />

            {/* The other question a visitor arrives with. The finder above
                answers "who can come and sweep my chimney"; this answers "did
                my application go through", which until now was only reachable
                by finding /membri in the nav — so the applicants who most
                needed it were the ones least likely to look for it.

                It is a link, not the lookup itself. The phone field lives on
                /membri and putting a second one here would give the band two
                input fields side by side, each asking for something different;
                the finder is the one thing on this band that should look like
                a form. */}
            <Link className="status-strip" href={`${base}/membri`}>
              <span className="status-strip-body">
                <span className="status-strip-kick">{t.statusCheck.kick}</span>
                <b>{t.statusCheck.title}</b>
                <span className="status-strip-desc">{t.statusCheck.desc}</span>
              </span>
              <span className="status-strip-cta">
                {t.statusCheck.cta}
                <Icon name="arrowRight" size={17} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICES — teaser, full grid + directory live on /servicii */}
      <section id="servicii">
        <div className="wrap">
          <div className="sec-head">
            <div className="kick" aria-hidden />
            <h2>{t.services.title}</h2>
            <p>{t.services.subtitle}</p>
          </div>
          <div className="svc-grid">
            {t.services.items.map((s, i) => (
              <div className="svc" key={i}>
                <div className="ic">
                  <Icon name={SERVICE_ICONS[i]} size={26} />
                </div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link className="btn btn-ghost" href={`${base}/servicii`}>
              {dict.nav.services}
              <Icon name="arrowRight" size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* TRAINING — band linking to /instruire */}
      <section id="instruire">
        <div className="wrap">
          <div className="band">
            <span className="badge-eu">
              <Icon name="badgeCheck" size={26} />
            </span>
            <div className="grow">
              <h2>{dict.pages.training.title}</h2>
              <p>{dict.pages.training.lead}</p>
            </div>
            <Link className="btn btn-primary" href={`${base}/instruire`}>
              {dict.nav.training}
              <Icon name="arrowRight" size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* NEWS — latest three posts */}
      <section id="stiri" className="services" style={{ background: "var(--sand)" }}>
        <div className="wrap">
          <div className="sec-head">
            <div className="kick" aria-hidden />
            <h2>{t.news.title}</h2>
          </div>
          <div className="news-grid">
            {latestPosts.map((post) => (
              <Link href={`${base}/stiri/${post.slug}`} key={post.slug}>
                <article className="post">
                  <div className={`cover${post.cover > 1 ? ` c${post.cover}` : ""}`}>
                    {post.image && (
                      <Image
                        src={post.image}
                        alt={post.title[locale]}
                        fill
                        sizes="(max-width: 860px) 100vw, 33vw"
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
                      {t.news.more}
                      <Icon name="arrowRight" size={16} />
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <Link className="btn btn-ghost" href={`${base}/stiri`}>
              {dict.pages.news.back}
              <Icon name="arrowRight" size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* CONTACT — closing CTA */}
      <section id="contact" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="cta">
            <h2>{t.cta.title}</h2>
            <p>{t.cta.subtitle}</p>
            <div className="btns">
              <Link className="btn btn-primary" href={`${base}/servicii#directoriu`}>
                {t.cta.primary}
              </Link>
              <Link
                className="btn btn-ghost"
                href={`${base}/contact`}
                style={{ color: "#fff", borderColor: "rgba(255,255,255,.25)" }}
              >
                {t.cta.secondary}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer locale={locale} dict={dict} />
    </>
  );
}
