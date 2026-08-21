#!/usr/bin/env python3
"""Set the seal's two words on their arcs and emit them as outlined paths.

A logo cannot depend on a font being installed, so the lettering is converted
to geometry here. Onest is the site's own face, instanced at the weight the
seal uses; glyphs are laid along the arc one at a time, each rotated to its own
tangent, the way text-on-a-path is meant to work.
"""
import glob, math, pathlib, sys

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Identity

FONT_DIR = "/Users/mac/Documents/site/asfoc_new_site/.next/static/media/*.woff2"
NEEDED = set("ASFOCMDLV")
WEIGHT = 800


def load_face():
    """Pick the Onest subset that actually carries the seal's letters."""
    for path in sorted(glob.glob(FONT_DIR)):
        try:
            font = TTFont(path, lazy=False)
        except Exception:
            continue
        if font["name"].getDebugName(1) != "Onest":
            continue
        if not NEEDED <= set(map(chr, font.getBestCmap())):
            continue
        if "fvar" in font:
            font = instancer.instantiateVariableFont(font, {"wght": WEIGHT})
        return font, path
    raise SystemExit("no Onest subset covers " + "".join(sorted(NEEDED)))


def glyph_paths(font, text, size):
    """(svg path data at `size` px, advance) for each character."""
    upem = font["head"].unitsPerEm
    cmap, gs, hmtx = font.getBestCmap(), font.getGlyphSet(), font["hmtx"]
    k = size / upem
    out = []
    for ch in text:
        name = cmap[ord(ch)]
        pen = SVGPathPen(gs, ntos=lambda v: f"{v:.2f}".rstrip("0").rstrip("."))
        # flip y (font space is up-positive, SVG is down-positive) and scale
        gs[name].draw(TransformPen(pen, Identity.scale(k, -k)))
        out.append((pen.getCommands(), hmtx[name][0] * k))
    return out


def on_arc(font, text, radius, size, tracking, centre_deg, upright_out, C=256.0):
    """Lay `text` along a circle of `radius`, centred on `centre_deg`.

    upright_out=True puts the glyph tops away from the centre (the top word);
    False puts them toward it (the bottom word).
    """
    glyphs = glyph_paths(font, text, size)
    advances = [a + tracking for a, _ in ((adv, d) for d, adv in glyphs)]
    total = sum(advances) - tracking
    span = math.degrees(total / radius)          # angular width of the whole word
    direction = 1 if upright_out else -1
    theta = centre_deg - direction * span / 2    # leading edge

    parts = []
    for (d, adv), step in zip(glyphs, advances):
        mid = theta + direction * math.degrees((step - tracking) / 2 / radius)
        a = math.radians(mid)
        px, py = C + radius * math.cos(a), C + radius * math.sin(a)
        phi = mid + (90 if upright_out else -90)
        parts.append(
            f'<g transform="translate({px:.2f} {py:.2f}) rotate({phi:.2f}) '
            f'translate({-(step - tracking) / 2:.2f} 0)"><path d="{d}"/></g>'
        )
        theta += direction * math.degrees(step / radius)
    return "\n      ".join(parts)


if __name__ == "__main__":
    font, path = load_face()
    print(f"# Onest @ wght {WEIGHT} from {pathlib.Path(path).name}", file=sys.stderr)
    import gen
    top = on_arc(font, *gen.WORD_TOP)
    bot = on_arc(font, *gen.WORD_BOT)
    out = pathlib.Path(__file__).parent / "lettering.py"
    out.write_text(f'TOP = """{top}"""\n\nBOTTOM = """{bot}"""\n')
    print(f"wrote {out}", file=sys.stderr)
