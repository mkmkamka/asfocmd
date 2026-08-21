import type { Metadata } from "next";
import { ViewTransition } from "react";
import { Onest } from "next/font/google";
import "../globals.css";
import { locales, isLocale, defaultLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { notFound } from "next/navigation";
import ScrollHint from "@/components/ScrollHint";
import KeyboardScroll from "@/components/KeyboardScroll";
import PageSwipe from "@/components/PageSwipe";

/* One family in two roles — the Apple / Linear register rather than a display
   serif over a body sans. Onest is a modern neutral grotesque with native
   Cyrillic (the Russian locale needs it, which rules out most of the fashionable
   grotesques: Instrument Sans, Bricolage, Geist and Satoshi are all latin-only),
   and it is uncommon enough not to read as a template. Headings and body are
   separated by weight, size and tracking, never by family. */
const onest = Onest({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-onest",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = await getDictionary(isLocale(locale) ? locale : defaultLocale);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  return (
    <html lang={locale} className={onest.variable}>
      <body>
        {/* The whole page as one moving object.

            `update` rather than `enter`/`exit`: this wrapper is part of the
            layout, so it never unmounts between routes — what changes is its
            content, which is precisely the case `update` describes. The class
            it takes comes from the transition type the navigation carried, so
            only the sideways steps PageSwipe and the ring nav make animate;
            an ordinary click, a language switch or a first load has no type
            and falls through to `none`.

            The animations themselves are in globals.css, under "Sideways
            navigation" — including the rule that pins the floating chrome in
            place while the page slides out from under it. */}
        <ViewTransition
          update={{
            "nav-forward": "nav-forward",
            "nav-back": "nav-back",
            default: "none",
          }}
          default="none"
        >
          <div className="page-shell">{children}</div>
        </ViewTransition>
        <ScrollHint text={dict.scrollHint} />
        <KeyboardScroll />
        <PageSwipe base={`/${locale}`} nav={dict.nav} />
      </body>
    </html>
  );
}
