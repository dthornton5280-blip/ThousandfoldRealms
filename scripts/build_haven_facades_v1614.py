#!/usr/bin/env python3
"""Compose Haven storefront facades from the approved exterior master kit."""

from __future__ import annotations

import hashlib
import json
from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "reference/approved/haven_exterior_master_kit.png"
ATLAS = ROOT / "source/assets/thousandfold/generated/haven-facades-v1614.png"
MANIFEST = ROOT / "source/assets/thousandfold/generated/haven-facades-v1614.json"
EXPECTED_SHA256 = "1132bdf1530e7f3ba8a17d9811080429d24161aaf3ec2bfcad89afbacd5cd52f"
FACADE = (256, 160)


def source_crop(image: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    """Crop a module and remove only edge-connected presentation background."""
    piece = image.crop(box).convert("RGBA")
    pixels = piece.load()
    width, height = piece.size
    seen: set[tuple[int, int]] = set()
    queue: deque[tuple[int, int]] = deque()
    for x in range(width):
        queue.extend(((x, 0), (x, height - 1)))
    for y in range(height):
        queue.extend(((0, y), (width - 1, y)))
    while queue:
        x, y = queue.popleft()
        if (x, y) in seen:
            continue
        seen.add((x, y))
        r, g, b, _ = pixels[x, y]
        # Presentation background and grid are blue-black. Closed black pixel
        # outlines remain protected because the flood cannot cross the sprite.
        if max(r, g, b) > 47 or b + 4 < r:
            continue
        pixels[x, y] = (0, 0, 0, 0)
        if x:
            queue.append((x - 1, y))
        if x + 1 < width:
            queue.append((x + 1, y))
        if y:
            queue.append((x, y - 1))
        if y + 1 < height:
            queue.append((x, y + 1))
    return piece


def paste_clipped(canvas: Image.Image, piece: Image.Image, xy: tuple[int, int]) -> None:
    canvas.alpha_composite(piece, xy)


def compose(modules: dict[str, list[Image.Image]], spec: dict) -> Image.Image:
    facade = Image.new("RGBA", FACADE, (0, 0, 0, 0))
    # A continuous architecture silhouette built only from approved modules.
    for x in range(0, 256, 58):
        paste_clipped(facade, modules["roof_" + spec["roof"]][0], (x, 5))
    for index, x in enumerate((7, 67, 127, 187)):
        wall = modules["walls"][(spec["wall"] + index) % len(modules["walls"])]
        paste_clipped(facade, wall, (x, 53))
    for index, x in enumerate((7, 90, 173)):
        stone = modules["stone"][(spec["stone"] + index) % len(modules["stone"])]
        paste_clipped(facade, stone, (x, 113))
    paste_clipped(facade, modules["gable_" + spec["roof"]][spec["gable"]], (91, 4))
    paste_clipped(facade, modules["windows"][spec["windows"][0]], (29, 77))
    paste_clipped(facade, modules["windows"][spec["windows"][1]], (180, 77))
    door = modules["doors"][spec["door"]]
    paste_clipped(facade, door, (128 - door.width // 2, 101))
    return facade


def main() -> None:
    if not SOURCE.is_file():
        raise SystemExit(f"missing approved exterior kit: {SOURCE}")
    if hashlib.sha256(SOURCE.read_bytes()).hexdigest() != EXPECTED_SHA256:
        raise SystemExit("approved exterior kit checksum changed")
    source = Image.open(SOURCE).convert("RGBA")
    if source.size != (1448, 1086):
        raise SystemExit(f"unexpected exterior kit size: {source.size}")

    # Exact label-free module rectangles measured from the Architecture panel.
    crop = lambda box: source_crop(source, box)
    modules = {
        "walls": [crop(box) for box in [
            (986, 95, 1072, 160), (1078, 95, 1138, 160), (1140, 95, 1198, 160),
            (1205, 95, 1273, 160), (1280, 95, 1356, 160), (1365, 95, 1420, 160),
        ]],
        "stone": [crop(box) for box in [
            (988, 168, 1072, 216), (1080, 168, 1138, 216), (1142, 168, 1195, 216),
            (1206, 168, 1274, 216), (1282, 168, 1354, 216), (1368, 168, 1420, 216),
        ]],
        "roof_red": [crop((988, 225, 1057, 283))],
        "roof_green": [crop((988, 282, 1057, 340))],
        "gable_red": [crop((1158, 222, 1235, 283)), crop((1280, 222, 1356, 283))],
        "gable_green": [crop((1158, 279, 1235, 341)), crop((1280, 279, 1356, 341))],
        "doors": [crop(box) for box in [
            (991, 347, 1035, 405), (1041, 347, 1090, 405), (1098, 347, 1142, 405),
            (1150, 347, 1192, 405), (1202, 347, 1238, 405), (1249, 347, 1292, 405),
            (1301, 347, 1344, 405),
        ]],
        "windows": [crop(box) for box in [
            (991, 410, 1034, 466), (1042, 410, 1084, 466), (1093, 410, 1136, 466),
            (1145, 410, 1188, 466), (1197, 410, 1240, 466), (1249, 410, 1292, 466),
            (1300, 410, 1343, 466), (1352, 410, 1397, 466),
        ]],
    }
    specs = [
        ("haven_inn_exterior", {"roof": "red", "wall": 0, "stone": 0, "gable": 0, "door": 0, "windows": (0, 1)}),
        ("haven_arcane_exterior", {"roof": "green", "wall": 3, "stone": 3, "gable": 1, "door": 5, "windows": (4, 7)}),
        ("haven_provisions_exterior", {"roof": "green", "wall": 1, "stone": 1, "gable": 0, "door": 1, "windows": (2, 3)}),
        ("haven_chapel_exterior", {"roof": "green", "wall": 4, "stone": 4, "gable": 1, "door": 6, "windows": (4, 6)}),
        ("haven_forge_exterior", {"roof": "red", "wall": 2, "stone": 5, "gable": 1, "door": 4, "windows": (1, 5)}),
    ]
    atlas = Image.new("RGBA", (FACADE[0] * len(specs), FACADE[1]), (0, 0, 0, 0))
    assets = {}
    for index, (asset_id, spec) in enumerate(specs):
        facade = compose(modules, spec)
        x = index * FACADE[0]
        atlas.alpha_composite(facade, (x, 0))
        assets[asset_id] = {"x": x, "y": 0, "w": FACADE[0], "h": FACADE[1], "anchor": "topLeft", "modules": spec}
    ATLAS.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(ATLAS, optimize=False, compress_level=9)
    MANIFEST.write_text(json.dumps({
        "version": "1.6.14-dev", "source": str(SOURCE.relative_to(ROOT)).replace("\\", "/"),
        "sourceSha256": EXPECTED_SHA256, "atlas": {"width": atlas.width, "height": atlas.height},
        "assets": assets,
    }, indent=2) + "\n", encoding="utf-8")
    print(f"Built {len(specs)} Haven facades: {atlas.width}x{atlas.height}")


if __name__ == "__main__":
    main()
