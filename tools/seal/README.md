# The ASFOCMD seal

The logo is **generated**, not hand-drawn. Everything in `public/brand/asfoc-seal*.svg`,
`src/app/icon.png` and `src/app/favicon.ico` is output — edit the source here and
re-run, never the SVGs.

```bash
python3 tools/seal/gen.py      # -> public/brand/asfoc-seal*.svg
python3 tools/seal/raster.py   # -> src/app/icon.png, src/app/favicon.ico, brand PNGs
```

`raster.py` shells out to the headless Chrome already on the machine, so there
are no native image dependencies to install.

## Why generated

The mark is a seal: a ring, a band of type on an arc, and an illustration that
has to stay centred inside both. Those things are coupled — move the ring and
the type radius, the ribbon span and the motif scale all have to follow. Every
one of those is a named constant at the top of `gen.py`, and the shapes derive
from them, so a change stays in register instead of needing a dozen coordinates
re-tuned by hand.

The clearest example is `motif_box()`. The compact cut is centred and scaled
from the bounding box of whatever it actually draws, so dropping the fire
re-frames the mark automatically rather than leaving it sitting off-centre.

## The cut in use

**The full seal is the logo, at every size.** `src/components/Logo.tsx` renders
it and nothing else; `icon.png` and `favicon.ico` are rasterised from it too.

`gen.py` also emits a **compact** cut — ring, chimney, ladder and brush only,
scaled up to fill the ring — because below roughly 48px the lettering and the
brick coursing stop resolving. It is generated but **not currently used
anywhere**, kept as a ready option if a small placement ever needs it. Do not
swap it in without asking: the full seal is the approved mark.

## The three palettes

- **house** — the site's own soot and oxblood. This is the site mark
  (`asfoc-seal.svg`).
- **mono** — a greyscale cut, for the resting half of a hover swap (the fact
  card on `/despre` and the homepage). Deliberate greys, *not* a CSS
  `grayscale()` of the house palette: a luminance filter collapses the oxblood
  brick and the soot cap into nearly the same mid grey.
- **heritage** — the association's amber, brick and cream, flattened. For
  documents, stamps and print, where the traditional colours are expected.
- **knockout** — white, for dark grounds (`tone="footer"`).

## The lettering

ASFOCMD and MOLDOVA are **outlined**, not live text — a logo cannot depend on a
font being present. `outline.py` reads Onest (the site's own face) out of the
Next font cache, instances the variable font at weight 800, and lays each glyph
along its arc rotated to its own tangent. The result is committed as
`lettering.py`, so `gen.py` runs without fontTools.

Re-run `outline.py` only if the type metrics in `gen.py` (`WORD_TOP`,
`WORD_BOT`) change. It needs `fonttools` and `brotli`, and a built `.next/` for
the font cache:

```bash
python3 -m venv /tmp/sealenv && /tmp/sealenv/bin/pip install fonttools brotli
/tmp/sealenv/bin/python tools/seal/outline.py
```

## Provenance

Redrawn from the association's own seal as it appears on the February 2020
general-assembly notice (`public/archive/2020-02-adunarea-generala-anuala-si-cerebrarea-0.jpg`).
The composition is unchanged; the drawing is flat vector rather than a gradient
raster, so it holds from a favicon to a banner.
