import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    /* Turns on Next's half of React's <ViewTransition>: route changes become
       transitions the browser can animate, and `transitionTypes` passed to
       router.push reach the CSS. The locale layout wraps every page in one —
       see "Sideways navigation" in globals.css. */
    viewTransition: true,
  },

  async headers() {
    return [
      {
        /* The whole site is `noindex` while it is a client preview.
           `X-Robots-Tag` is a response header, so it covers every route —
           pages, images, PDFs — not just documents that can carry a <meta>
           tag. Delete this block on the day the site actually launches; that
           is the single switch that makes it findable. */
        source: "/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive, nosnippet",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
