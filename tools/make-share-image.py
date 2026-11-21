#!/usr/bin/env python3
"""Makes assets/share-logo.png: the square picture shown on the link card
(WhatsApp, Facebook, X, LinkedIn, Telegram...) for every page of the site.

It is the AK Explained portrait logo (assets/logo.png) on the site's own
off-white (#FBFCFD), 600 x 600, as a small palette PNG (well under 200 KB).
PNG, not WebP, on purpose: link-card crawlers read PNG everywhere.

Run from the repo root:   python3 tools/make-share-image.py
If the owner supplies a bigger logo, pass it:   python3 tools/make-share-image.py path/to/big-logo.png
A new picture needs a NEW file name (share-logo-2.png ...) because WhatsApp and
Facebook remember the old one; then change SHARE_IMAGE in eleventy.config.js and
sed the old name in the hand-written pages.
"""
import sys
from PIL import Image, ImageDraw, ImageFilter

SRC = sys.argv[1] if len(sys.argv) > 1 else "assets/logo.png"
OUT = "assets/share-logo.png"
SIZE, DIAMETER, SUPER = 600, 520, 4      # canvas, circle, edge smoothing
BG = (251, 252, 253)                      # same off-white as the old social card

logo = Image.open(SRC).convert("RGBA")
big = logo.resize((DIAMETER, DIAMETER), Image.LANCZOS).convert("RGB")
big = big.filter(ImageFilter.UnsharpMask(radius=1.0, percent=30, threshold=3))

# crisp circle, 5 px inside the old rim so no pale ring shows at the edge
inset = 5
mask = Image.new("L", (DIAMETER * SUPER, DIAMETER * SUPER), 0)
ImageDraw.Draw(mask).ellipse(
    (inset * SUPER, inset * SUPER, (DIAMETER - inset) * SUPER - 1, (DIAMETER - inset) * SUPER - 1), fill=255)
mask = mask.resize((DIAMETER, DIAMETER), Image.LANCZOS)

canvas = Image.new("RGB", (SIZE, SIZE), BG)
off = (SIZE - DIAMETER) // 2
canvas.paste(big, (off, off), mask)
canvas = canvas.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
canvas.save(OUT, optimize=True)
print("wrote", OUT, canvas.size)
