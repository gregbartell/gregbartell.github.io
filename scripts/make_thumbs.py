#!/usr/bin/env python3
"""Generate 800px-wide JPEG thumbnails of every plate image under pics/.

Mirrors directory structure under pics/thumbs/. Skips files whose thumb
already exists, so repeat runs are cheap. Honors EXIF orientation.
"""
from pathlib import Path
from PIL import Image, ImageOps

SRC_ROOT = Path(__file__).resolve().parent.parent / "pics"
DST_ROOT = SRC_ROOT / "thumbs"
MAX_WIDTH = 800
QUALITY = 85

done = skipped = 0
for src in SRC_ROOT.rglob("*"):
    if not src.is_file():
        continue
    if src.suffix.lower() not in (".jpg", ".jpeg"):
        continue
    if DST_ROOT in src.parents:
        continue
    rel = src.relative_to(SRC_ROOT)
    dst = DST_ROOT / rel
    if dst.exists():
        skipped += 1
        continue
    dst.parent.mkdir(parents=True, exist_ok=True)
    img = ImageOps.exif_transpose(Image.open(src))
    if img.mode != "RGB":
        img = img.convert("RGB")
    if img.width > MAX_WIDTH:
        new_h = round(img.height * MAX_WIDTH / img.width)
        img = img.resize((MAX_WIDTH, new_h), Image.LANCZOS)
    img.save(dst, "JPEG", quality=QUALITY, optimize=True, progressive=True)
    done += 1

print(f"Generated {done}, skipped {skipped}")
