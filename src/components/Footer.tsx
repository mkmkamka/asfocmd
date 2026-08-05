import Link from "next/link";
import Icon from "./Icon";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

export default function Footer({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  const f = dict.footer;
  const n = dict.nav;
  const base = `/${locale}`;

  const quickLinks = [
    { label: n.home, href: base },
    { label: n.about, href: `${base}/despre` },
    { label: n.services, href: `${base}/servicii` },
    { label: n.directory, href: `${base}/servicii#directoriu` },
    { label: n.training, href: `${base}/instruire` },
    { label: n.news, href: `${base}/stiri` },
    { label: n.contact, href: `${base}/contact` },
    // /resurse holds the statute scans and the downloadable documents. It was
    // reachable only by typing the URL, which is the same as not existing.
    { label: n.resources, href: `${base}/resurse` },
  ];

  return (
    <footer>
      <div className="wrap">
        <div className="foot-grid">
          {/* Stay Connected + newsletter */}
          <div className="foot-stay">
            <h3 className="foot-stay-title">{f.newsletter.title}</h3>
            <p className="foot-stay-sub">{f.newsletter.subtitle}</p>
            <form className="foot-news" action={`${base}/contact`}>
              <input
                type="email"
                name="email"
                placeholder={f.newsletter.placeholder}
                aria-label={f.newsletter.placeholder}
              />
              <button type="submit" aria-label={f.newsletter.cta}>
                <Icon name="send" size={18} />
              </button>
            </form>
          </div>

          {/* Quick links */}
          <div className="foot-col">
            <h4>{f.quickTitle}</h4>
            {quickLinks.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div className="foot-col">
            <h4>{f.colContact.title}</h4>
            <Link className="foot-line" href={`${base}/contact`}>
              <Icon name="pin" size={16} />
              <span>{f.colContact.address}</span>
            </Link>
            <a className="foot-line" href={`tel:${dict.top.phone.replace(/\s/g, "")}`}>
              <Icon name="phone" size={16} />
              <span>{dict.top.phone}</span>
            </a>
            <a className="foot-line" href={`mailto:${dict.top.email}`}>
              <Icon name="mail" size={16} />
              <span>{dict.top.email}</span>
            </a>
          </div>

          {/* Follow us */}
          <div className="foot-col">
            <h4>{f.followTitle}</h4>
            <div className="socials">
              <a href="#" aria-label="Facebook"><Icon name="facebook" size={20} /></a>
              <a href="#" aria-label="Instagram"><Icon name="instagram" size={20} /></a>
              <a href="#" aria-label="Telegram"><Icon name="send" size={20} /></a>
            </div>
            <div className="foot-theme" aria-hidden="true">
              <Icon name="sun" size={16} />
              <span className="theme-switch"><span className="knob" /></span>
              <Icon name="moon" size={16} />
            </div>
          </div>
        </div>

        <div className="foot-bottom">
          <span>{f.rights}</span>
        </div>
      </div>
    </footer>
  );
}
