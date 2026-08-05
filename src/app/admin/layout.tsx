import type { Metadata } from "next";
import { Onest } from "next/font/google";
import "../globals.css";

/* The admin is deliberately outside the `[locale]` tree: it is Romanian only,
   it has no public navigation, and nothing in it should ever be reachable by
   switching language. It carries its own <html> for the same reason the locale
   layout does — this is a separate document root, not a page inside the site. */
const onest = Onest({
  subsets: ["latin", "latin-ext"],
  variable: "--font-onest",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Administrare — ASFOCMD",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro" className={onest.variable}>
      <body>{children}</body>
    </html>
  );
}
