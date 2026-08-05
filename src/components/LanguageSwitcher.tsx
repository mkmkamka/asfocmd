"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, localeNames, isLocale, type Locale } from "@/i18n/config";

function useLocalizedPath() {
  const pathname = usePathname();
  return function localizedPath(target: Locale): string {
    const segments = pathname.split("/");
    // segments[0] is "" (leading slash); segments[1] is the current locale
    if (segments[1] && isLocale(segments[1])) {
      segments[1] = target;
    } else {
      segments.splice(1, 0, target);
    }
    return segments.join("/") || `/${target}`;
  };
}

/**
 * Header language control: all three codes visible in one row — one tap to
 * switch, no menu to discover. The active code sits on a quiet white glass
 * chip; the other two are muted until hovered. Deliberately colourless: the
 * ember accent is reserved for actions, not for state.
 *
 * Sizing is the whole point of this control's second draft. Three two-letter
 * codes used to sit in 36px square chips inside a 44px capsule — 122px of
 * chrome to hold six characters, which made the least important island in the
 * rail the most conspicuous one. The chips are now 30px and sized to their
 * content rather than square, so the capsule tightens to roughly 96px and the
 * codes read as a set of labels instead of three buttons. 30px is still a
 * comfortable pointer target inside a 40px capsule, and the whole row keeps its
 * 44px hit height on the mobile rail where it matters.
 */
function LanguageRow({
  current,
  onDark = false,
}: {
  current: Locale;
  /** Set while the control floats over the home page's graded hero, where the
      ink-on-glass treatment below has nothing left to sit on. */
  onDark?: boolean;
}) {
  const localizedPath = useLocalizedPath();

  return (
    <div className="flex items-center gap-px">
      {locales.map((locale) => (
        <Link
          key={locale}
          href={localizedPath(locale)}
          hrefLang={locale}
          aria-current={locale === current ? "true" : undefined}
          className={`grid h-[30px] place-items-center rounded-full px-2.5 text-[11px] font-semibold leading-none tracking-[.06em] transition-colors ${
            locale === current
              ? onDark
                ? "bg-white/20 text-white"
                : "bg-white/50 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,.6)]"
              : onDark
                ? "text-white/60 hover:text-white"
                : "text-foreground/55 hover:text-foreground"
          }`}
        >
          {localeNames[locale]}
        </Link>
      ))}
    </div>
  );
}

export default function LanguageSwitcher({
  current,
  variant = "dark",
  onDark = false,
}: {
  current: Locale;
  variant?: "dark" | "light";
  onDark?: boolean;
}) {
  const localizedPath = useLocalizedPath();

  if (variant === "light") {
    return <LanguageRow current={current} onDark={onDark} />;
  }

  return (
    <div className="lang">
      {locales.map((locale) => (
        <Link
          key={locale}
          href={localizedPath(locale)}
          className={locale === current ? "on" : ""}
          hrefLang={locale}
          aria-current={locale === current ? "true" : undefined}
        >
          {localeNames[locale]}
        </Link>
      ))}
    </div>
  );
}
