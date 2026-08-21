"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
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
 * Header language control: the current code, and the other two on demand.
 *
 * It used to lay all three codes out in a row, on the argument that one tap
 * beats a menu. That is true of a control people use — but a visitor picks a
 * language once and then never touches it again, so for the whole rest of the
 * visit two thirds of the widest island in the rail were codes nobody was going
 * to press. It now shows what you are reading in, and opens the alternatives
 * when you ask.
 *
 * "When you ask" is two gestures, not one. Hover opens it on a mouse, which is
 * the gesture that was asked for; but hover does not exist on a touchscreen, so
 * the trigger is a real button that toggles on click as well, and the hover
 * half is gated behind `(hover:hover)` so a tap on a phone does not open and
 * immediately re-close it. The chevron is there because a lone "RO" is a label,
 * not a control, and nothing else on the chip says it can be pressed.
 *
 * The two alternatives stay mounted and are hidden with `visibility` rather
 * than unmounted: `hreflang` alternates are worth leaving in the document for
 * crawlers, and `visibility:hidden` is the one way of hiding them that also
 * takes them out of the accessibility tree and the tab order while closed.
 */
function LanguagePicker({
  current,
  onDark = false,
}: {
  current: Locale;
  /** Set while the control floats over the home page's graded hero, where the
      ink-on-glass treatment below has nothing left to sit on. */
  onDark?: boolean;
}) {
  const localizedPath = useLocalizedPath();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  /* Asked at the moment of the gesture rather than kept in state. A stored
     answer would have to be read on the client after mount (the server has no
     media queries), which is a render the control does not otherwise need — and
     the question is only ever asked while a pointer is already moving. */
  const hoverOpens = () =>
    window.matchMedia("(hover:hover) and (pointer:fine)").matches;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const others = locales.filter((locale) => locale !== current);

  return (
    <div
      ref={rootRef}
      className={`lang-pick${onDark ? " on-dark" : ""}${open ? " is-open" : ""}`}
      onMouseEnter={() => hoverOpens() && setOpen(true)}
      onMouseLeave={() => hoverOpens() && setOpen(false)}
    >
      <button
        type="button"
        className="lang-current"
        aria-expanded={open}
        aria-haspopup="menu"
        // The visible text is a two-letter code; on its own it announces as
        // "RO button", which says nothing about what pressing it does.
        aria-label={`${localeNames[current]} — ${locales.map((l) => localeNames[l]).join(" / ")}`}
        onClick={() => setOpen((v) => !v)}
      >
        {localeNames[current]}
        <ChevronDown className="lang-caret" size={12} aria-hidden />
      </button>

      <div className="lang-pop" role="menu">
        {others.map((locale) => (
          <Link
            key={locale}
            href={localizedPath(locale)}
            hrefLang={locale}
            role="menuitem"
            className="lang-alt"
            // Keyboard users reach these by tabbing out of the trigger, which
            // means the panel has to open for focus rather than only for the
            // pointer — otherwise the tab stop is invisible.
            onFocus={() => setOpen(true)}
            // Picking a language is a client-side navigation: the component
            // stays mounted, so nothing else would close the panel and it would
            // still be hanging open on the page it took you to.
            onClick={() => setOpen(false)}
          >
            {localeNames[locale]}
          </Link>
        ))}
      </div>
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
    return <LanguagePicker current={current} onDark={onDark} />;
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
