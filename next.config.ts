import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
