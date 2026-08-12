#!/usr/bin/env python3
"""Generate thumbnails for explicitly requested full-size plate JPEGs."""
import argparse
from pathlib import Path

from PIL import Image, ImageOps

SCRIPT_ROOT = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_ROOT.parent
FULL_SIZE_ROOT = REPO_ROOT / "assets/plates/full"
THUMBNAIL_ROOT = REPO_ROOT / "assets/plates/thumbs"
MAX_WIDTH = 800
QUALITY = 85


def argument_parser():
    parser = argparse.ArgumentParser(
        description="Generate thumbnails for full-size plate JPEGs."
    )
    parser.add_argument("source_paths", nargs="+")
    return parser


def resolve_source_path(raw_source_path):
    source_path = (REPO_ROOT / raw_source_path).resolve()
    if not source_path.is_file():
        raise ValueError(f"{raw_source_path}: file does not exist")
    if source_path.suffix.lower() not in {".jpg", ".jpeg"}:
        raise ValueError(f"{raw_source_path}: must be a JPEG")
    try:
        source_path.relative_to(FULL_SIZE_ROOT)
    except ValueError:
        raise ValueError(
            f"{raw_source_path}: must be under assets/plates/full"
        ) from None
    return source_path


def generate_thumbnail(source_path):
    destination_path = THUMBNAIL_ROOT / source_path.relative_to(FULL_SIZE_ROOT)
    destination_path.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source_path) as source_image:
        image = ImageOps.exif_transpose(source_image)
        if image.mode != "RGB":
            image = image.convert("RGB")
        if image.width > MAX_WIDTH:
            new_height = round(image.height * MAX_WIDTH / image.width)
            image = image.resize((MAX_WIDTH, new_height), Image.LANCZOS)
        image.save(
            destination_path,
            "JPEG",
            quality=QUALITY,
            optimize=True,
            progressive=True,
        )


def main():
    parser = argument_parser()
    args = parser.parse_args()
    try:
        source_paths = [
            resolve_source_path(raw_source_path)
            for raw_source_path in args.source_paths
        ]
    except ValueError as error:
        parser.error(str(error))

    for source_path in source_paths:
        generate_thumbnail(source_path)
    print(f"Generated {len(source_paths)} thumbnail(s).")


if __name__ == "__main__":
    main()
