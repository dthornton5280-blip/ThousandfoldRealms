#!/usr/bin/env python3
"""Build starter-interior surfaces from the approved Black Lantern kit."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
KIT = ROOT / "reference/approved/black_lantern_master_kit.png"
GROUND = ROOT / "reference/approved/haven_ground_tileset_source.png"
ATLAS = ROOT / "source/assets/thousandfold/tiles/haven-interiors-v1614.png"
MANIFEST = ROOT / "source/assets/thousandfold/tiles/haven-interiors-v1614.json"
KIT_SHA = "c84747912ba39de7027c9697a09ea34c70a80fa20a2d1a97603e8d5f58368c59"
GROUND_SHA = "b6b9cc27a0e783bc00a169c126fd48e1361cac21561dbdb17acbd61a5d1024cd"
TILE = 32


def verify(path: Path, digest: str, size: tuple[int, int]) -> Image.Image:
    if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != digest:
        raise SystemExit(f"approved source missing or changed: {path}")
    image = Image.open(path).convert("RGBA")
    if image.size != size:
        raise SystemExit(f"unexpected source size for {path}: {image.size}")
    return image


def main() -> None:
    kit = verify(KIT, KIT_SHA, (1448, 1086))
    ground = verify(GROUND, GROUND_SHA, (1448, 1086))
    outputs: list[tuple[str, Image.Image, dict]] = []
    xs = (22, 79, 136, 193, 250)
    for family, y in (("polished_wood", 99), ("worn_wood", 174)):
        for index, x in enumerate(xs):
            box = (x, y, x + 50, y + 50)
            tile = kit.crop(box).resize((TILE, TILE), Image.Resampling.NEAREST)
            outputs.append((f"interior_{family}_{index}", tile, {"source": "black_lantern", "crop": list(box)}))

    # A rug card is a complete design, not an interchangeable 32px tile.
    # Enlarge one approved card into a coherent 3x3 macro and slice it so rooms
    # keep a continuous carpet instead of repeating five miniature rugs.
    rug_box = (22, 235, 72, 285)
    rug_macro = kit.crop(rug_box).resize((96, 96), Image.Resampling.NEAREST)
    for py in range(3):
        for px in range(3):
            tile = rug_macro.crop((px * TILE, py * TILE, (px + 1) * TILE, (py + 1) * TILE))
            outputs.append((f"interior_rug_p{py}{px}", tile, {
                "source": "black_lantern", "crop": list(rug_box), "macroPatch": [px, py],
            }))

    # Preserve the approved dimensional cobble as a coherent 3x3 stone-floor
    # macro rather than falling back to the flat v1.6.13 gray line pattern.
    box = (753, 542, 929, 718)
    macro = ground.crop(box).resize((96, 96), Image.Resampling.NEAREST)
    for py in range(3):
        for px in range(3):
            tile = macro.crop((px * TILE, py * TILE, (px + 1) * TILE, (py + 1) * TILE))
            outputs.append((f"interior_stone_p{py}{px}", tile, {
                "source": "haven_ground", "crop": list(box), "macroPatch": [px, py],
            }))

    atlas = Image.new("RGBA", (256, 128), (0, 0, 0, 0))
    tiles = {}
    for index, (asset_id, tile, provenance) in enumerate(outputs):
        x, y = (index % 8) * TILE, (index // 8) * TILE
        atlas.alpha_composite(tile, (x, y))
        tiles[asset_id] = {"x": x, "y": y, "w": TILE, "h": TILE, **provenance}
    atlas.save(ATLAS, optimize=False, compress_level=9)
    MANIFEST.write_text(json.dumps({
        "version": "1.6.14-dev", "atlas": {"width": 256, "height": 128}, "tiles": tiles,
        "sources": {"blackLanternSha256": KIT_SHA, "havenGroundSha256": GROUND_SHA},
    }, indent=2) + "\n", encoding="utf-8")
    print(f"Built {len(outputs)} approved starter-interior tiles: 256x128")


if __name__ == "__main__":
    main()
