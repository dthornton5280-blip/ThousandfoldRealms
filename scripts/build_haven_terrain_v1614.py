#!/usr/bin/env python3
"""Build the approved Haven-only v1.6.14 terrain atlas.

The source is a presentation sheet, not a regular sprite atlas.  We crop the
painted center of each approved card, discard gutters/card edges, and resize
with nearest-neighbor sampling.  Rotations are permitted by the art approval;
no pixels are generated or repainted.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = ROOT / "reference/approved/haven_ground_tileset_source.png"
DEFAULT_ATLAS = ROOT / "source/assets/thousandfold/tiles/haven-ground-handcrafted-v1614.png"
DEFAULT_MANIFEST = ROOT / "source/assets/thousandfold/tiles/haven-ground-handcrafted-v1614.json"
EXPECTED_SOURCE_SIZE = (1448, 1086)
EXPECTED_SOURCE_SHA256 = "b6b9cc27a0e783bc00a169c126fd48e1361cac21561dbdb17acbd61a5d1024cd"
TILE = 32
MACRO = 96
COLS = 16

# Measured centers of the six-by-four approved card layout.  A 176px square
# stays inside the painted surface and excludes black gutters, rounded edges,
# card shadows, and empty presentation padding.
CARD_CENTERS_X = (140, 377, 609, 841, 1073, 1305)
CARD_CENTERS_Y = (149, 388, 630, 875)
SOURCE_CROP_SIZE = 176

BASE_TILES = [
    ("haven_grass_clean_01", 0, 0),
    ("haven_grass_flowers_01", 0, 1),
    ("haven_grass_dense_01", 0, 2),
    ("haven_grass_rocks_01", 0, 3),
    ("haven_grass_worn_01", 0, 4),
    ("haven_grass_dense_02", 0, 5),
    ("haven_grass_worn_02", 1, 0),
    ("haven_grass_flowers_02", 1, 1),
    ("haven_grass_rocks_02", 1, 2),
    ("haven_grass_clean_02", 1, 3),
    ("haven_path_dirt_01", 1, 4),
    ("haven_path_dirt_rocks_01", 1, 5),
    ("haven_path_dirt_rocks_02", 2, 0),
    ("haven_path_dirt_02", 2, 1),
    ("haven_path_dirt_worn_01", 2, 2),
    ("haven_cobble_01", 2, 3),
    ("haven_cobble_moss_01", 2, 4),
    ("haven_cobble_cracked_01", 2, 5),
]

# Source composition, semantic family, and the orientation visible in the
# unrotated crop.  Names describe where the second material lies relative to
# the first material.  Clockwise rotation supplies every cardinal direction.
TRANSITION_SOURCES = [
    ("edge_grass_path", 3, 2, ("e", "s", "w", "n")),
    ("corner_grass_path", 3, 0, ("se", "sw", "nw", "ne")),
    ("edge_grass_cobble", 3, 3, ("e", "s", "w", "n")),
    ("corner_grass_cobble", 3, 1, ("se", "sw", "nw", "ne")),
    ("corner_path_cobble", 3, 4, ("se", "sw", "nw", "ne")),
    ("junction_grass_path_cobble", 3, 5, ("se", "sw", "nw", "ne")),
]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def crop_card(source: Image.Image, row: int, col: int) -> tuple[Image.Image, list[int]]:
    half = SOURCE_CROP_SIZE // 2
    cx, cy = CARD_CENTERS_X[col], CARD_CENTERS_Y[row]
    box = (cx - half, cy - half, cx + half, cy + half)
    card = source.crop(box)
    if card.size != (SOURCE_CROP_SIZE, SOURCE_CROP_SIZE):
        raise RuntimeError(f"unexpected crop size for card {row},{col}: {card.size}")
    # Preserve the card as a 3x3 gameplay macro texture.  The previous pipeline
    # collapsed all 176 source pixels into one 32px cell, destroying most of the
    # authored flowers, stones, cracks, and wear.  Reducing to 96px and then
    # slicing nine native-detail cells keeps coherent features across the map.
    macro = card.resize((MACRO, MACRO), Image.Resampling.NEAREST).convert("RGBA")
    return macro, list(box)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    parser.add_argument("--atlas", type=Path, default=DEFAULT_ATLAS)
    parser.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    args = parser.parse_args()

    if not args.source.is_file():
        raise SystemExit(f"approved source sheet is missing: {args.source}")
    if sha256(args.source) != EXPECTED_SOURCE_SHA256:
        raise SystemExit("approved source sheet checksum does not match the reviewed asset")

    source = Image.open(args.source)
    if source.size != EXPECTED_SOURCE_SIZE:
        raise SystemExit(f"unexpected source dimensions {source.size}; expected {EXPECTED_SOURCE_SIZE}")

    outputs: list[tuple[str, Image.Image, dict]] = []
    for name, row, col in BASE_TILES:
        macro, crop = crop_card(source, row, col)
        for patch_y in range(3):
            for patch_x in range(3):
                patch = macro.crop((patch_x * TILE, patch_y * TILE,
                                    (patch_x + 1) * TILE, (patch_y + 1) * TILE))
                outputs.append((f"{name}_p{patch_y}{patch_x}", patch, {
                    "sourceCard": [row, col], "sourceCrop": crop, "rotation": 0,
                    "macroSize": MACRO, "macroPatch": [patch_x, patch_y],
                }))

    for family, row, col, orientations in TRANSITION_SOURCES:
        source_macro, crop = crop_card(source, row, col)
        for turns, orientation in enumerate(orientations):
            macro = source_macro.rotate(-90 * turns, resample=Image.Resampling.NEAREST, expand=False)
            # The authored boundary/intersection lies in the center of each
            # transition card.  Crop that native-detail cell after orientation.
            tile = macro.crop((TILE, TILE, TILE * 2, TILE * 2))
            name = f"haven_{family}_{orientation}"
            outputs.append((name, tile, {
                "sourceCard": [row, col], "sourceCrop": crop, "rotation": turns * 90,
                "macroSize": MACRO, "macroPatch": [1, 1],
            }))

    rows = (len(outputs) + COLS - 1) // COLS
    atlas = Image.new("RGBA", (COLS * TILE, rows * TILE), (0, 0, 0, 0))
    tiles = {}
    for index, (name, tile, provenance) in enumerate(outputs):
        x, y = (index % COLS) * TILE, (index // COLS) * TILE
        atlas.paste(tile, (x, y))
        tiles[name] = {"x": x, "y": y, "w": TILE, "h": TILE, "index": index, **provenance}

    args.atlas.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(args.atlas, format="PNG", optimize=False, compress_level=9)
    manifest = {
        "version": "1.6.14-dev",
        "scope": "Haven exterior only",
        "tileSize": TILE,
        "source": {
            "path": str(args.source.relative_to(ROOT)).replace("\\", "/"),
            "sha256": EXPECTED_SOURCE_SHA256,
            "dimensions": list(EXPECTED_SOURCE_SIZE),
            "layout": {"columns": 6, "rows": 4, "cropSize": SOURCE_CROP_SIZE,
                       "macroSize": MACRO, "patchesPerBase": 9},
        },
        "atlas": {"path": str(args.atlas.relative_to(ROOT)).replace("\\", "/"),
                  "width": atlas.width, "height": atlas.height, "columns": COLS, "rows": rows},
        "tiles": tiles,
    }
    args.manifest.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"Built {len(outputs)} approved Haven tiles: {atlas.width}x{atlas.height}")


if __name__ == "__main__":
    main()
