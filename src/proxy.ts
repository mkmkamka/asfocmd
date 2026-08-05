import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "@/i18n/config";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );
  if (hasLocale) return;

  // First visit always lands in Romanian; visitors can switch language from
  // the header afterwards (their choice then lives in the URL prefix).
  const url = req.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, API routes, the admin panel and any file with an
  // extension (favicon, images…). The admin is Romanian-only and lives outside
  // the `[locale]` tree, so redirecting it to /ro/admin would send the owner to
  // a page that does not exist.
  matcher: ["/((?!_next|api|admin|.*\\..*).*)"],
};
