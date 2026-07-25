# Generates the link-preview assets — what people see before they ever open the
# site: the browser-tab / home-screen icon and the card that unfurls when the URL
# is pasted into iMessage, Slack, Discord, X, LinkedIn…
#
#   src/app/icon.svg              cursive "EM" monogram, vector, transparent bg
#   src/app/favicon.ico           the same monogram at 16/32/48 (legacy browsers)
#   src/app/apple-icon.png        180x180, full-bleed (iOS rounds it itself)
#   src/app/opengraph-image.jpg   1200x630 social card — the hero, re-framed
#
# icon.svg / favicon.ico are transparent so they sit on whatever chrome color
# the browser gives them, and use dark ink rather than the site's cream accent
# — cream nearly disappears against the light tab bar most browsers still
# default to. apple-icon.png keeps its solid tile: iOS still fills transparent
# pixels in with black on plenty of devices, so it isn't worth the risk there.
#
# Next picks all four up by filename (see the app-icons / opengraph-image file
# conventions) — nothing imports them.
#
# The card is a faithful rebuild of the hero rather than a screenshot of it: same
# photo, same two-gradient wash from `.hero__overlay`, same tracked Cormorant
# caps as `.hero__title` — just cropped to 1.91:1 and without the page chrome
# (menu button, scroll cue) that would make it read as a screenshot.
#
# Run with: npm run social      (needs Pillow + fontTools, and network on the
#                                first run to pull the two Google fonts)
import io
import re
import sys
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.misc.transform import Transform
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
APP = ROOT / "src/app"
FONT_CACHE = Path(__file__).resolve().parent / ".fonts"

# ---------------------------------------------------------------- palette ----
# Straight from globals.css so the icon can't drift from the site.
SLATE = (29, 39, 48)        # --dark
CREAM = (246, 234, 210)     # --cream
WASH = (25, 33, 40)         # the color both .hero__overlay gradients fade in


# ------------------------------------------------------------------ fonts ----
def google_font(family: str, weight: int = 400) -> Path:
    """Resolve a Google font to a local .ttf, caching it under scripts/.fonts."""
    slug = family.lower().replace(" ", "-")
    out = FONT_CACHE / f"{slug}-{weight}.ttf"
    if out.exists():
        return out
    # The CSS API hands back .woff2 to modern browsers and .ttf to old ones, and
    # fontTools reads .ttf without a brotli dependency — so ask as an old one.
    css_url = (
        "https://fonts.googleapis.com/css?family="
        + family.replace(" ", "+")
        + f":{weight}"
    )
    req = urllib.request.Request(css_url, headers={"User-Agent": "Mozilla/4.0"})
    css = urllib.request.urlopen(req, timeout=30).read().decode()
    match = re.search(r"url\((https://[^)]+\.ttf)\)", css)
    if not match:
        sys.exit(f"could not find a .ttf for {family} {weight} in:\n{css}")
    FONT_CACHE.mkdir(exist_ok=True)
    out.write_bytes(urllib.request.urlopen(match.group(1), timeout=60).read())
    return out


# --------------------------------------------------------------- monogram ----
MONOGRAM = "EM"
# Fraction of the tile the monogram's ink spans, and how far its optical center
# sits below the tile's — script capitals hang lower than their bounding box
# suggests, so nudging up reads as centered. icon.svg / favicon.ico run right
# to the frame edge since they're transparent (nothing to clip against); the
# apple-icon tile keeps a bit more margin since iOS applies its own rounded
# mask on top and could crop letters that sit too close to the edge.
GLYPH_WIDTH = 0.94
APPLE_GLYPH_WIDTH = 0.84
GLYPH_NUDGE_Y = -0.015
# Outward thickening of every stroke, as a fraction of the tile. Great Vibes'
# hairlines are thinner than one device pixel at tab size and drop out to
# nothing; this is optical-size compensation as much as a style choice, kept
# proportional so all four faces read as the same weight. Past ~0.016 the
# counters (the loops inside the E and M) start filling in and it blobs.
GLYPH_WEIGHT = 0.012


def monogram_outline(font_path: Path):
    """The monogram as one SVG path in font units, plus its ink bounds.

    Returned Y still points up (font convention); callers flip it.
    """
    font = TTFont(font_path)
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    pen = SVGPathPen(glyphs)
    x = 0
    for char in MONOGRAM:
        name = cmap[ord(char)]
        glyphs[name].draw(TransformPen(pen, Transform().translate(x, 0)))
        x += glyphs[name].width
    path = pen.getCommands()

    # Ink bounds (not advance bounds) — script faces overhang their advances
    # wildly, and it's the ink we want centered in the tile.
    from fontTools.pens.boundsPen import BoundsPen

    bounds = BoundsPen(glyphs)
    x = 0
    for char in MONOGRAM:
        name = cmap[ord(char)]
        glyphs[name].draw(TransformPen(bounds, Transform().translate(x, 0)))
        x += glyphs[name].width
    return path, bounds.bounds, font["head"].unitsPerEm


def write_icon_svg(font_path: Path, size: int = 512) -> None:
    """The vector icon: bold dark-ink monogram, transparent background."""
    path, (x0, y0, x1, y1), _upm = monogram_outline(font_path)
    scale = (GLYPH_WIDTH * size) / (x1 - x0)
    # Flip Y, then land the ink's center on the tile's (nudged) center.
    tx = size / 2 - (x0 + x1) / 2 * scale
    ty = size * (0.5 + GLYPH_NUDGE_Y) + (y0 + y1) / 2 * scale
    # SVG strokes straddle the outline (half in, half out) while Pillow's grow
    # outward only — so double the width here to land on the same weight, and
    # divide by the group's scale because it's applied in font units.
    stroke = 2 * GLYPH_WEIGHT * size / scale
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" width="{size}" height="{size}">
  <g transform="translate({tx:.2f} {ty:.2f}) scale({scale:.5f} {-scale:.5f})">
    <path fill="rgb{SLATE}" stroke="rgb{SLATE}" stroke-width="{stroke:.1f}"
          stroke-linejoin="round" stroke-linecap="round" d="{path}"/>
  </g>
</svg>
"""
    (APP / "icon.svg").write_text(svg)
    print("wrote src/app/icon.svg")


def render_monogram(
    font_path: Path, size: int, ink, bg=None, radius_frac: float = 0, width=GLYPH_WIDTH
) -> Image.Image:
    """Raster tile, drawn 8x and downsampled so the hairlines survive.

    Great Vibes' thin strokes drop out entirely if rasterized straight at 16 or
    32px; supersampling turns them into soft grays instead of gaps. `bg=None`
    leaves the tile transparent; otherwise it's filled (rounded if radius_frac).
    """
    ss = 8
    box = size * ss
    tile = Image.new("RGBA", (box, box), (0, 0, 0, 0))
    if bg is not None:
        if radius_frac:
            mask = Image.new("L", (box, box), 0)
            ImageDraw.Draw(mask).rounded_rectangle(
                (0, 0, box - 1, box - 1), radius=round(box * radius_frac), fill=255
            )
            tile.paste(Image.new("RGBA", (box, box), (*bg, 255)), mask=mask)
        else:
            tile.paste(Image.new("RGBA", (box, box), (*bg, 255)))

    # Match the SVG's framing: scale by ink width, center on the ink's bbox.
    probe = ImageFont.truetype(str(font_path), 100)
    px0, py0, px1, py1 = probe.getbbox(MONOGRAM)
    font_size = round(100 * (width * box) / (px1 - px0))
    font = ImageFont.truetype(str(font_path), font_size)
    gx0, gy0, gx1, gy1 = font.getbbox(MONOGRAM)
    draw = ImageDraw.Draw(tile)
    draw.text(
        (
            box / 2 - (gx0 + gx1) / 2,
            box * (0.5 + GLYPH_NUDGE_Y) - (gy0 + gy1) / 2,
        ),
        MONOGRAM,
        font=font,
        fill=(*ink, 255),
        stroke_width=round(box * GLYPH_WEIGHT),
        stroke_fill=(*ink, 255),
    )
    return tile.resize((size, size), Image.LANCZOS)


def write_raster_icons(font_path: Path) -> None:
    # iOS applies its own rounding + it dislikes transparency, so ship it square
    # and opaque — same tile look the icon used to have everywhere.
    render_monogram(
        font_path, 180, ink=CREAM, bg=SLATE, width=APPLE_GLYPH_WIDTH
    ).convert("RGB").save(APP / "apple-icon.png")
    print("wrote src/app/apple-icon.png")

    # Transparent + dark ink so it holds up on the light tab bar most browsers
    # still default to (cream would all but vanish there).
    sizes = [16, 32, 48]
    largest = render_monogram(font_path, sizes[-1], ink=SLATE)
    largest.save(APP / "favicon.ico", sizes=[(s, s) for s in sizes])
    print("wrote src/app/favicon.ico")


# ------------------------------------------------------------------- card ----
CARD_W, CARD_H = 1200, 630
# `background-position: 60% 88%` from .hero__bg. The card is far wider than the
# hero's viewport, so 88% would crop past the horizon — 62% keeps the rainbow,
# the horizon and Ethan all in frame, which is the shot the hero is about.
CARD_FOCUS = (0.60, 0.62)
TITLE = "ETHAN MICLAT"
TITLE_SIZE = 62          # ~= the hero's clamp(30px, 5.6vw, 78px) at this width
TITLE_TRACKING = 0.14    # letter-spacing: 0.14em
TITLE_Y = 0.40           # a touch above center, echoing the hero's upper-third


def cover_crop(img: Image.Image, w: int, h: int, focus) -> Image.Image:
    """CSS `background-size: cover` + `background-position`."""
    scale = max(w / img.width, h / img.height)
    scaled = img.resize(
        (round(img.width * scale), round(img.height * scale)), Image.LANCZOS
    )
    fx, fy = focus
    left = round((scaled.width - w) * fx)
    top = round((scaled.height - h) * fy)
    return scaled.crop((left, top, left + w, top + h))


def hero_wash(w: int, h: int) -> Image.Image:
    """The two `.hero__overlay` gradients, as one WASH-colored alpha layer."""
    ys, xs = np.mgrid[0:h, 0:w]
    u, v = xs / (w - 1), ys / (h - 1)

    # radial-gradient(90% 70% at 50% 48%, .32 0%, .12 55%, 0 80%)
    r = np.sqrt(((u - 0.50) / 0.90) ** 2 + ((v - 0.48) / 0.70) ** 2)
    radial = np.interp(r, [0.0, 0.55, 0.80], [0.32, 0.12, 0.0])

    # linear-gradient(180deg, .34 0%, .04 22%, .06 70%, .45 100%)
    linear = np.interp(v, [0.0, 0.22, 0.70, 1.0], [0.34, 0.04, 0.06, 0.45])

    # Two stacked translucent layers of the same color composite to this.
    alpha = radial + linear - radial * linear
    wash = Image.new("RGBA", (w, h), (*WASH, 0))
    wash.putalpha(Image.fromarray((alpha * 255).round().astype(np.uint8)))
    return wash


def draw_tracked_text(size, font, text, tracking, fill) -> Image.Image:
    """Letter-spaced text on its own transparent layer, horizontally centered.

    Pillow has no letter-spacing, so the run is stepped out glyph by glyph.
    """
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    step = round(font.size * tracking)
    widths = [draw.textlength(c, font=font) for c in text]
    total = sum(widths) + step * (len(text) - 1)
    # CSS puts the trailing letter's space inside the box; .hero__title cancels
    # it with `text-indent: 0.14em`, which nets out to centering the ink itself.
    x = (size[0] - total) / 2
    for char, advance in zip(text, widths):
        draw.text((x, size[1] / 2), char, font=font, fill=fill, anchor="lm")
        x += advance + step
    return layer


def write_card(font_path: Path) -> None:
    photo = Image.open(ROOT / "public/assets/hero-bg.jpeg").convert("RGB")
    card = cover_crop(photo, CARD_W, CARD_H, CARD_FOCUS).convert("RGBA")
    card.alpha_composite(hero_wash(CARD_W, CARD_H))

    font = ImageFont.truetype(str(font_path), TITLE_SIZE)
    band = (CARD_W, round(TITLE_SIZE * 2.4))
    title = draw_tracked_text(band, font, TITLE, TITLE_TRACKING, (255, 255, 255, 245))

    # text-shadow: 0 2px 22px rgba(0, 0, 0, 0.35)
    shadow = Image.new("RGBA", band, (0, 0, 0, 0))
    shadow.putalpha(title.getchannel("A").point(lambda a: round(a * 0.35)))
    shadow = shadow.filter(ImageFilter.GaussianBlur(11))

    top = round(CARD_H * TITLE_Y - band[1] / 2)
    card.alpha_composite(shadow, (0, top + 2))
    card.alpha_composite(title, (0, top))

    out = APP / "opengraph-image.jpg"
    card.convert("RGB").save(out, quality=88, optimize=True, progressive=True)
    print(f"wrote src/app/opengraph-image.jpg ({out.stat().st_size // 1024} KB)")


def main() -> None:
    script = google_font("Great Vibes")
    write_icon_svg(script)
    write_raster_icons(script)
    write_card(google_font("Cormorant Garamond"))


if __name__ == "__main__":
    main()
