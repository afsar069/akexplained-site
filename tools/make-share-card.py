#!/usr/bin/env python3
"""Makes assets/share-card.jpg: the picture shown on the link card (WhatsApp, Facebook,
X, LinkedIn, Telegram...) for every page of the site.

Source: tools/share-card-source.webp, the owner's own card art (1774 x 887, exactly 2:1).
Output: 1200 x 600 (same 2:1), a light JPEG (about 137 KB; WhatsApp's own limit is 600 KB).
JPEG on purpose: it is the one format every link-card app reads, and a palette PNG
spoils the portrait (blocky skin and hair), while a full-colour PNG is 330 KB.

Run from the repo root:   python3 tools/make-share-card.py [other-source-image]
Keep all text and the face inside the middle ~94% of the width: Facebook and LinkedIn
trim a 2:1 picture to 1.91:1, about 2.4% off each side (X shows 2:1 whole).
A changed picture needs a NEW file name (the apps remember the old one): change OUT here,
SHARE_IMAGE in eleventy.config.js, and the name in the hand-written pages.
"""
import sys
from PIL import Image

SRC = sys.argv[1] if len(sys.argv) > 1 else "tools/share-card-source.webp"
OUT = "assets/share-card.jpg"
W, H = 1200, 600

im = Image.open(SRC).convert("RGB")
assert abs(im.width / im.height - 2.0) < 0.01, "the card art must be 2:1 (for example 1774 x 887)"
im.resize((W, H), Image.LANCZOS).save(OUT, "JPEG", quality=92, optimize=True, subsampling=0)
print("wrote", OUT, (W, H))
