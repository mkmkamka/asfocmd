#!/usr/bin/env python3
"""Emit the ASFOCMD seal as flat SVG from a handful of parameters.

Everything positional is derived here, so the shapes stay in register when a
parameter moves — there are no hand-placed coordinates to re-tune one by one.
Colour lives in PALETTES; geometry is shared across every variant.
"""
import math, pathlib

C = 256.0                          # centre of the 512 viewBox
RING_R, RING_W = 240.0, 11.0

BAND_A0, BAND_A1 = 202.0, 338.0    # ribbon span, screen degrees (0=right, 90=down)
BAND_RI, BAND_RO = 166.0, 214.0

# word: (text, baseline radius, size, tracking, centre angle, tops-outward)
WORD_TOP = ("ASFOCMD", 174.0, 46.0, 1.5, 270.0, True)
WORD_BOT = ("MOLDOVA", 222.0, 36.0, 11.0, 90.0, False)

CH_HW, CH_DY = 54.0, 23.0          # chimney half-width, rhombus half-depth
CH_TOP, CH_H = 244.0, 170.0        # top-face centre-line y, body height
CAP_OVER, CAP_RISE, CAP_T = 1.18, 7.0, 10.0   # cap overhang, lift, thickness
COURSE = 22.0                      # brick course height

LADDER_FOOT, LADDER_HEAD = (138.0, 404.0), (198.0, 196.0)
LADDER_OFF, LADDER_BALL = (34.0, 8.0), 14.0   # rail separation, counterweight
BRUSH_HUB, BRUSH_CORE, BRUSH_R0, BRUSH_R1 = (238.0, 168.0), 17.0, 14.0, 27.0
FIRE_HW, FIRE_TOP, FIRE_BOT = 115.0, 216.0, 418.0   # fire's drawn extent

# Full seal: shrink slightly and lift, so the motif clears the MOLDOVA arc.
MOTIF_S, MOTIF_DY = 0.95, -10.0
COMPACT_FILL = 0.96                # fraction of the ring's inner radius to fill
# The fire is a pale wash in the site palette; at favicon size it reads as a
# smudge rather than as flame, so the small cut drops it.
COMPACT_FIRE = False


def motif_box(with_fire):
    """Bounding box of everything the motif actually draws.

    The compact cut is centred and scaled from this, so dropping an element
    (the fire) re-frames the mark instead of leaving it off-centre.
    """
    xs = [LADDER_FOOT[0] - LADDER_BALL, BRUSH_HUB[0] - BRUSH_R1,
          C - CH_HW * CAP_OVER, C + CH_HW * CAP_OVER]
    ys = [BRUSH_HUB[1] - BRUSH_R1, CH_TOP - CAP_RISE - CH_DY * CAP_OVER,
          CH_TOP + CH_DY + CH_H, LADDER_FOOT[1] + LADDER_BALL]
    if with_fire:
        xs += [C - FIRE_HW, C + FIRE_HW]
        ys += [FIRE_TOP, FIRE_BOT]
    return min(xs), min(ys), max(xs), max(ys)

PALETTES = {
    # faithful to the association's colours, flattened
    "heritage": dict(
        ring="#3E241D", brick_l="#A65B3E", brick_r="#8A4630",
        mortar_l="#C9865F", mortar_r="#A75D42", cap="#7E2C22",
        cap_edge="#5E1D16", flue="#241713",
        wood="#9C6636", rod="#5A3A22", soot="#1E1B19", smoke="#C9CED4",
        fire="#E9A81C", fire_lit="#F7C93B",
        rib_face="#EFD5AC", rib_fold="#C79A6A", rib_tail="#D2A876",
        type_top="#221310", type_bot="#3E241D",
    ),
    # the site's own tokens: soot + oxblood, cool greys, no gold
    "house": dict(
        ring="#141518", brick_l="#8C2A1F", brick_r="#5E140E",
        mortar_l="#B0554A", mortar_r="#8C2A1F", cap="#141518",
        cap_edge="#000000", flue="#141518",
        wood="#6B6D72", rod="#3A3C42", soot="#141518", smoke="#DEDEE2",
        fire="#E7D3D0", fire_lit="#D0A8A2",
        rib_face="#E8E8EC", rib_fold="#C2C2CA", rib_tail="#D4D4DA",
        type_top="#141518", type_bot="#141518",
    ),
    # greyscale cut for the resting state of a hover swap. Deliberate greys,
    # not a CSS grayscale() of the house palette — a luminance filter turns the
    # oxblood brick and the soot cap into nearly the same mid grey.
    "mono": dict(
        ring="#141518", brick_l="#75777D", brick_r="#4C4E54",
        mortar_l="#9EA0A6", mortar_r="#6B6D73", cap="#141518",
        cap_edge="#000000", flue="#141518",
        wood="#A9ABB1", rod="#3A3C42", soot="#141518", smoke="#DEDEE2",
        fire="#E6E6EA", fire_lit="#D0D0D6",
        rib_face="#E8E8EC", rib_fold="#C2C2CA", rib_tail="#D4D4DA",
        type_top="#141518", type_bot="#141518",
    ),
    # white knockout for the footer and any dark surface
    "knockout": dict(
        ring="#FFFFFF", brick_l="#FFFFFF", brick_r="rgba(255,255,255,.66)",
        mortar_l="rgba(20,21,24,.55)", mortar_r="rgba(20,21,24,.32)",
        cap="rgba(255,255,255,.86)", cap_edge="rgba(255,255,255,.55)",
        flue="rgba(20,21,24,.85)",
        wood="rgba(255,255,255,.80)", rod="rgba(255,255,255,.80)",
        soot="#FFFFFF", smoke="rgba(255,255,255,.26)",
        fire="rgba(255,255,255,.20)", fire_lit="rgba(255,255,255,.32)",
        rib_face="#FFFFFF", rib_fold="rgba(255,255,255,.58)",
        rib_tail="rgba(255,255,255,.76)",
        type_top="#141518", type_bot="#FFFFFF",
    ),
}


def P(a_deg, r):
    a = math.radians(a_deg)
    return (C + r * math.cos(a), C + r * math.sin(a))


def f(v):
    return f"{v:.1f}".rstrip("0").rstrip(".")


def pt(p):
    return f"{f(p[0])} {f(p[1])}"


def arc(a0, a1, r, sweep):
    return f"M {pt(P(a0, r))} A {f(r)} {f(r)} 0 0 {sweep} {pt(P(a1, r))}"


def poly(pts):
    return "M " + " L ".join(pt(p) for p in pts) + " Z"


# ---------------------------------------------------------------- chimney --
def chimney_faces():
    top, hw, dy, h = CH_TOP, CH_HW, CH_DY, CH_H
    L = [(C - hw, top), (C, top + dy), (C, top + dy + h), (C - hw, top + h)]
    R = [(C, top + dy), (C + hw, top), (C + hw, top + h), (C, top + dy + h)]
    return poly(L), poly(R)


def chimney(pal, idp, detail=True):
    top, hw, dy, h = CH_TOP, CH_HW, CH_DY, CH_H
    faceL, faceR = chimney_faces()
    n = int(h / COURSE)

    def courses(side):
        out = []
        for i in range(1, n):
            y = top + i * COURSE
            if side < 0:
                out.append(f"M {f(C-hw-8)} {f(y-3.2)} L {f(C+8)} {f(y+dy+3.2)}")
            else:
                out.append(f"M {f(C-8)} {f(y+dy+3.2)} L {f(C+hw+8)} {f(y-3.2)}")
        return out

    def joints(side):
        out = []
        for i in range(n):
            for frac in ((0.34, 0.72) if i % 2 == 0 else (0.53,)):
                x = C + side * hw * frac
                y0 = top + i * COURSE + dy * (1 - frac)
                out.append(f"M {f(x)} {f(y0)} L {f(x)} {f(y0 + COURSE)}")
        return out

    cap_hw, cap_dy, cap_y = hw * CAP_OVER, dy * CAP_OVER, top - CAP_RISE
    cap = poly([(C, cap_y - cap_dy), (C + cap_hw, cap_y),
                (C, cap_y + cap_dy), (C - cap_hw, cap_y)])
    t = CAP_T
    cap_edge = poly([(C - cap_hw, cap_y), (C, cap_y + cap_dy), (C + cap_hw, cap_y),
                     (C + cap_hw, cap_y + t), (C, cap_y + cap_dy + t),
                     (C - cap_hw, cap_y + t)])
    flue = poly([(C, top - dy * 0.60), (C + hw * 0.60, top),
                 (C, top + dy * 0.60), (C - hw * 0.60, top)])

    brick = ""
    if detail:
        brick = f'''
    <g clip-path="url(#{idp}faceL)" stroke="{pal['mortar_l']}" stroke-width="3.2" fill="none">
      <path d="{" ".join(courses(-1) + joints(-1))}"/>
    </g>
    <g clip-path="url(#{idp}faceR)" stroke="{pal['mortar_r']}" stroke-width="3.2" fill="none">
      <path d="{" ".join(courses(1) + joints(1))}"/>
    </g>'''

    return f'''  <g class="chimney">
    <path d="{faceL}" fill="{pal['brick_l']}"/>
    <path d="{faceR}" fill="{pal['brick_r']}"/>{brick}
    <path d="{cap_edge}" fill="{pal['cap_edge']}"/>
    <path d="{cap}" fill="{pal['cap']}"/>
    <path d="{flue}" fill="{pal['flue']}"/>
  </g>'''


# ----------------------------------------------------------------- ladder --
def ladder(pal):
    foot, head, off = LADDER_FOOT, LADDER_HEAD, LADDER_OFF
    vx, vy = head[0] - foot[0], head[1] - foot[1]
    rungs, n = [], 7
    for i in range(1, n + 1):
        t = i / (n + 1.0)
        x, y = foot[0] + vx * t, foot[1] + vy * t
        rungs.append(f"M {f(x)} {f(y)} L {f(x+off[0])} {f(y+off[1])}")
    return f'''  <g class="ladder" stroke="{pal['wood']}" stroke-width="9"
     stroke-linecap="round" fill="none">
    <path d="M {pt(foot)} L {pt(head)}"/>
    <path d="M {f(foot[0]+off[0])} {f(foot[1]+off[1])} L {f(head[0]+off[0])} {f(head[1]+off[1])}"/>
    <path d="{" ".join(rungs)}" stroke-width="6.5"/>
  </g>
  <circle cx="{f(foot[0])}" cy="{f(foot[1])}" r="{f(LADDER_BALL)}" fill="{pal['soot']}"/>'''


# ------------------------------------------------------------------ brush --
def brush(pal):
    hub, core, r0, r1, n = BRUSH_HUB, BRUSH_CORE, BRUSH_R0, BRUSH_R1, 22
    bristles = []
    for i in range(n):
        a = math.radians(i * 360.0 / n)
        ca, sa = math.cos(a), math.sin(a)
        bristles.append(f"M {f(hub[0]+r0*ca)} {f(hub[1]+r0*sa)} "
                        f"L {f(hub[0]+r1*ca)} {f(hub[1]+r1*sa)}")
    return f'''  <g class="brush">
    <path d="M {f(C)} {f(CH_TOP+4)} L {f(hub[0]+2)} {f(hub[1]+14)}"
          stroke="{pal['rod']}" stroke-width="7" stroke-linecap="round" fill="none"/>
    <path d="{" ".join(bristles)}" stroke="{pal['soot']}" stroke-width="4.2"
          stroke-linecap="round" fill="none"/>
    <circle cx="{f(hub[0])}" cy="{f(hub[1])}" r="{f(core)}" fill="{pal['soot']}"/>
  </g>'''


# ------------------------------------------------------------------- fire --
def fire(pal, tongues=True):
    bed = (f"M {f(C)} 252 C 198 276 152 308 146 350 C 141 392 192 418 {f(C)} 418 "
           f"C 320 418 371 392 366 350 C 360 308 314 276 {f(C)} 252 Z")

    def tongue(side):
        x = lambda v: C + side * v
        return (f"M {f(x(52))} 356 "
                f"C {f(x(40))} 306 {f(x(56))} 258 {f(x(74))} 216 "
                f"C {f(x(94))} 256 {f(x(110))} 300 {f(x(106))} 348 Z")

    extra = ""
    if tongues:
        extra = (f'\n    <path d="{tongue(-1)}" fill="{pal["fire_lit"]}"/>'
                 f'\n    <path d="{tongue(1)}" fill="{pal["fire_lit"]}"/>')
    return f'''  <g class="fire">
    <path d="{bed}" fill="{pal['fire']}"/>{extra}
  </g>'''


# ------------------------------------------------------------------ smoke --
def smoke(pal):
    return f'''  <g class="smoke" transform="translate(-8 16)">
    <path d="M272 216 C246 216 232 200 238 184 C226 170 236 150 254 152
             C260 136 284 132 294 144 C312 138 328 152 322 168
             C338 176 336 198 318 202 C314 216 292 222 272 216 Z"
          fill="{pal['smoke']}"/>
  </g>'''


# ----------------------------------------------------------------- ribbon --
def ribbon(pal):
    o0, o1 = P(BAND_A0, BAND_RO), P(BAND_A1, BAND_RO)
    i0, i1 = P(BAND_A0, BAND_RI), P(BAND_A1, BAND_RI)
    band = (f"M {pt(o0)} A {f(BAND_RO)} {f(BAND_RO)} 0 0 1 {pt(o1)} "
            f"L {pt(i1)} A {f(BAND_RI)} {f(BAND_RI)} 0 0 0 {pt(i0)} Z")

    def tail(o, i, side):
        dx = side * 34
        return poly([o, i,
                     (i[0] + dx * 0.15, i[1] + 54),
                     (i[0] + dx * 0.72, i[1] + 30),
                     (o[0] + dx * 0.42, o[1] + 62)])

    def fold(o, i, side):
        return poly([o, i, (i[0] - side * 3, i[1] + 17), (o[0] - side * 3, o[1] + 19)])

    return f'''  <g class="ribbon">
    <path d="{tail(o0, i0, -1)}" fill="{pal['rib_tail']}"/>
    <path d="{tail(o1, i1, 1)}" fill="{pal['rib_tail']}"/>
    <path d="{band}" fill="{pal['rib_face']}"/>
    <path d="{fold(o0, i0, -1)}" fill="{pal['rib_fold']}"/>
    <path d="{fold(o1, i1, 1)}" fill="{pal['rib_fold']}"/>
  </g>'''


def build(variant="heritage", idp="a", compact=False):
    pal = PALETTES[variant]
    faceL, faceR = chimney_faces()
    if compact:
        x0, y0, x1, y1 = motif_box(COMPACT_FIRE)
        bx, by = (x0 + x1) / 2, (y0 + y1) / 2
        half = math.hypot(x1 - x0, y1 - y0) / 2
        s = COMPACT_FILL * (RING_R - RING_W / 2) / half
        motif_tf = f"translate({f(C - s*bx)} {f(C - s*by)}) scale({f(s)})"
    else:
        s = MOTIF_S
        tx = (1 - s) * C
        motif_tf = f"translate({f(tx)} {f(tx + MOTIF_DY)}) scale({s})"

    parts = [] if (compact and not COMPACT_FIRE) else [fire(pal)]
    if not compact:
        parts.append(smoke(pal))
    parts += [chimney(pal, idp, detail=not compact), ladder(pal), brush(pal)]
    motif = "\n".join(parts)

    import lettering
    chrome = "" if compact else f'''{ribbon(pal)}
  <g class="word-top" fill="{pal['type_top']}">
      {lettering.TOP}
  </g>
  <g class="word-bottom" fill="{pal['type_bot']}">
      {lettering.BOTTOM}
  </g>'''

    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img">
  <defs>
    <clipPath id="{idp}faceL"><path d="{faceL}"/></clipPath>
    <clipPath id="{idp}faceR"><path d="{faceR}"/></clipPath>
  </defs>
  <g transform="{motif_tf}">
{motif}
  </g>
  <circle cx="{f(C)}" cy="{f(C)}" r="{f(RING_R)}" fill="none"
          stroke="{pal['ring']}" stroke-width="{f(RING_W)}"/>
{chrome}
</svg>
'''


# filename -> build args. "house" is the site mark; "heritage" keeps the
# association's own amber/cream for documents, stamps and print.
ASSETS = {
    "asfoc-seal": dict(variant="house", idp="s"),
    "asfoc-seal-mono": dict(variant="mono", idp="m"),
    "asfoc-seal-compact": dict(variant="house", idp="p", compact=True),
    "asfoc-seal-white": dict(variant="knockout", idp="k"),
    "asfoc-seal-compact-white": dict(variant="knockout", idp="q", compact=True),
    "asfoc-seal-heritage": dict(variant="heritage", idp="h"),
    "asfoc-seal-heritage-compact": dict(variant="heritage", idp="c", compact=True),
}

if __name__ == "__main__":
    out = pathlib.Path(__file__).resolve().parents[2] / "public" / "brand"
    out.mkdir(parents=True, exist_ok=True)
    for name, kw in ASSETS.items():
        (out / f"{name}.svg").write_text(build(**kw))
    print(f"wrote {len(ASSETS)} SVGs to {out}")
