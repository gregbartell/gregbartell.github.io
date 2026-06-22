#!/usr/bin/env python3
"""Generate 800px-wide JPEG thumbnails of every plate image under pics/.

Mirrors directory structure under pics/thumbs/. Skips current thumbnails, so
repeat runs are cheap, and refreshes thumbnails older than their source image.
Honors EXIF orientation.
"""
import json
from pathlib import Path
import subprocess

from PIL import Image, ImageOps

SCRIPT_ROOT = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_ROOT.parent
MAX_WIDTH = 800
QUALITY = 85


def thumbnail_jobs():
    result = subprocess.run(
        ["node", str(SCRIPT_ROOT / "thumbnail_plan.js")],
        check=True,
        capture_output=True,
        text=True,
    )
    return json.loads(result.stdout)


generated = refreshed = skipped = 0
for job in thumbnail_jobs():
    if job["action"] == "skip":
        skipped += 1
        continue
    src = REPO_ROOT / job["sourcePath"]
    dst = REPO_ROOT / job["thumbnailPath"]
    dst.parent.mkdir(parents=True, exist_ok=True)
    img = ImageOps.exif_transpose(Image.open(src))
    if img.mode != "RGB":
        img = img.convert("RGB")
    if img.width > MAX_WIDTH:
        new_h = round(img.height * MAX_WIDTH / img.width)
        img = img.resize((MAX_WIDTH, new_h), Image.LANCZOS)
    img.save(dst, "JPEG", quality=QUALITY, optimize=True, progressive=True)
    if job["action"] == "refresh":
        refreshed += 1
    else:
        generated += 1

print(f"Generated {generated}, refreshed {refreshed}, skipped {skipped}")
