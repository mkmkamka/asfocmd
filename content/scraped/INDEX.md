# Scrape of www.asfoc.md (Blogger) — 2026-07-20

Source: Blogger JSON feeds (`/feeds/posts/default`, `/feeds/pages/default`).
Converted by `scripts` in the session scratchpad; posts are re-processed into
`src/data/archive-posts.json` by `scripts/import-archive.mjs`.

## Contents

- `posts/` — all 45 blog posts (2017–2026), markdown + frontmatter (title, date,
  source_url, image/embed URLs).
- `pages/` — the 7 static Blogger pages: statut, c (contacte), scolarizare,
  acte-normative (empty on the old site), evenimente, foto, video.

## Migrated to the site

44 posts (including the six image-only announcements) →
`src/data/archive-posts.json` + `src/data/archive-meta.ts` (trilingual
titles/excerpts/categories) → served by `src/lib/cms.ts`. Bodies are the
Romanian originals; ru/en show an archive note. Excluded:

- `2026-07-blog-post` — "new website coming" announcement, irrelevant here.

## Images & videos

All post/page images were downloaded at full resolution into `public/archive/`
(`scripts/download-archive-images.mjs`, ~18 MB) and are rendered as card
covers, article heroes, and galleries; YouTube embeds render as iframes.
One image is unrecoverable: the cover of
`2023-02-curs-baza-sobar-in-cadrul-asociatiei` was an expired Facebook CDN
link (post falls back to the gradient cover).

## Assets to recover from the client

- Full statute: Google Drive, https://drive.google.com/open?id=10iteD05ck19APUnDAe6u709zYqtiOrcr
- Membership application template: https://drive.google.com/open?id=1UqHQDtWwP4Pumdk7uFk79WCo4XCLwsIv
- Registration decision + certificate scans (see `pages/statut.md` image URLs)
- The one YouTube video: https://www.youtube.com/embed/fiwSnIHEsNQ
- Legislation documents: the old "LEGISLATIE" page was empty — content never existed
- Photos: old site had only 2 uncaptioned images (`pages/foto.md`)
