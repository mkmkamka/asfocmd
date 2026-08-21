#!/usr/bin/env python3
"""Rasterise the generated seal SVGs into the PNG/ICO the app needs.

Run gen.py first. Uses headless Chrome because it is already on the machine and
renders the same engine the site does — no extra native image dependencies.

    python3 tools/seal/gen.py && python3 tools/seal/raster.py
"""
import pathlib, struct, subprocess, sys, tempfile

ROOT = pathlib.Path(__file__).resolve().parents[2]
BRAND = ROOT / "public" / "brand"
APP = ROOT / "src" / "app"

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# svg stem -> [(destination, size), ...]
TARGETS = {
    "asfoc-seal": [(APP / "icon.png", 512), (BRAND / "asfoc-seal-512.png", 512)],
    "asfoc-seal-white": [(BRAND / "asfoc-seal-white-512.png", 512)],
}
ICO = ("asfoc-seal", APP / "favicon.ico", (32, 16))


def render(svg: pathlib.Path, px: int, dest: pathlib.Path) -> None:
    """Screenshot the SVG at px, on a transparent ground."""
    with tempfile.TemporaryDirectory() as tmp:
        page = pathlib.Path(tmp) / "page.html"
        page.write_text(
            f"<style>html,body{{margin:0;padding:0}}"
            f"svg{{display:block;width:{px}px;height:{px}px}}</style>"
            + svg.read_text()
        )
        subprocess.run(
            [CHROME, "--headless", "--disable-gpu", "--hide-scrollbars",
             "--default-background-color=00000000",
             "--force-device-scale-factor=1",
             f"--window-size={px},{px}",
             f"--screenshot={dest}", page.as_uri()],
            check=True, capture_output=True,
        )


def build_ico(pngs, dest: pathlib.Path) -> None:
    """Pack PNG-compressed images into a single .ico."""
    blobs = [p.read_bytes() for p in pngs]
    offset = 6 + 16 * len(blobs)
    out = struct.pack("<HHH", 0, 1, len(blobs))
    for (px, _), blob in zip(pngs_sizes(pngs), blobs):
        out += struct.pack("<BBBBHHII", px % 256, px % 256, 0, 0, 1, 32,
                           len(blob), offset)
        offset += len(blob)
    dest.write_bytes(out + b"".join(blobs))


def pngs_sizes(pngs):
    """(width, height) read back out of each PNG's IHDR."""
    for p in pngs:
        w, h = struct.unpack(">II", p.read_bytes()[16:24])
        yield w, h


if __name__ == "__main__":
    if not pathlib.Path(CHROME).exists():
        sys.exit(f"headless renderer not found at {CHROME}")

    for stem, jobs in TARGETS.items():
        for dest, px in jobs:
            render(BRAND / f"{stem}.svg", px, dest)
            print(f"{dest.relative_to(ROOT)}  {px}x{px}")

    stem, dest, sizes = ICO
    with tempfile.TemporaryDirectory() as tmp:
        parts = []
        for px in sizes:
            p = pathlib.Path(tmp) / f"{px}.png"
            render(BRAND / f"{stem}.svg", px, p)
            parts.append(p)
        build_ico(parts, dest)
    print(f"{dest.relative_to(ROOT)}  {' + '.join(map(str, sizes))}")
