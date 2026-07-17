#!/usr/bin/env python3
"""Build explicit Whisperwood grass/road topology from a generated material board."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "reference/candidates/whisperwood_grass_road_material_source_v1615.png"
ATLAS = ROOT / "source/assets/thousandfold/tiles/whisperwood-ground-v1615.png"
MANIFEST = ROOT / "source/assets/thousandfold/tiles/whisperwood-ground-v1615.json"
EXPECTED_SHA256 = "56006f52465fd7bdc4c7bfe6aad70ff2ccb3c1aacc7699642901deda74201823"
TILE = 32
MACRO = 96
TOPOLOGY = {
    0: "isolated", 1: "end_n", 2: "end_e", 4: "end_s", 8: "end_w",
    5: "straight_ns", 10: "straight_ew", 3: "corner_ne", 6: "corner_se",
    12: "corner_sw", 9: "corner_nw", 7: "tee_nes", 14: "tee_esw",
    13: "tee_nsw", 11: "tee_new", 15: "cross",
}


def is_key(pixel: tuple[int, int, int, int]) -> bool:
    r, g, b, _ = pixel
    return r > 220 and b > 220 and g < 70


def runs(values: list[bool], minimum: int) -> list[tuple[int, int]]:
    output = []
    start = None
    for index, value in enumerate(values + [False]):
        if value and start is None:
            start = index
        elif not value and start is not None:
            if index - start >= minimum:
                output.append((start, index))
            start = None
    return output


def material_panels(image: Image.Image) -> tuple[Image.Image, Image.Image]:
    pixels = image.load()
    solid_x = [sum(is_key(pixels[x, y]) for y in range(image.height)) > image.height * .82 for x in range(image.width)]
    solid_y = [sum(is_key(pixels[x, y]) for x in range(image.width)) > image.width * .82 for y in range(image.height)]
    material_x = runs([not value for value in solid_x], 300)
    material_y = runs([not value for value in solid_y], 300)
    if len(material_x) != 2 or len(material_y) != 1:
        raise SystemExit(f"could not identify two material panels: x={material_x}, y={material_y}")
    y0, y1 = material_y[0]
    return tuple(image.crop((x0, y0, x1, y1)) for x0, x1 in material_x)  # type: ignore[return-value]


def tileable_macro(panel: Image.Image) -> Image.Image:
    side = min(panel.size)
    left = (panel.width - side) // 2
    top = (panel.height - side) // 2
    base = panel.crop((left, top, left + side, top + side)).resize((48, 48), Image.Resampling.NEAREST)
    macro = Image.new("RGBA", (MACRO, MACRO))
    macro.paste(base, (0, 0))
    macro.paste(base.transpose(Image.Transpose.FLIP_LEFT_RIGHT), (48, 0))
    vertical = base.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
    macro.paste(vertical, (0, 48))
    macro.paste(vertical.transpose(Image.Transpose.FLIP_LEFT_RIGHT), (48, 48))
    return macro


def road_mask(bits: int) -> Image.Image:
    mask = Image.new("L", (TILE, TILE), 0)
    px = mask.load()
    jitter = (0, 1, 0, -1, 0, 1, 0, 0)
    for y in range(TILE):
        for x in range(TILE):
            dx, dy = x - 15.5, y - 15.5
            inside = (dx * dx + dy * dy) <= 11.5 * 11.5
            if bits & 1 and y <= 16 and abs(dx) <= 9.5 + (0 if y < 3 else jitter[y % len(jitter)]):
                inside = True
            if bits & 2 and x >= 15 and abs(dy) <= 9.5 + (0 if x > 28 else jitter[x % len(jitter)]):
                inside = True
            if bits & 4 and y >= 15 and abs(dx) <= 9.5 + (0 if y > 28 else jitter[y % len(jitter)]):
                inside = True
            if bits & 8 and x <= 16 and abs(dy) <= 9.5 + (0 if x < 3 else jitter[x % len(jitter)]):
                inside = True
            if inside:
                px[x, y] = 255
    return mask


def patch(macro: Image.Image, phase: int) -> Image.Image:
    x, y = phase % 3, phase // 3
    return macro.crop((x * TILE, y * TILE, (x + 1) * TILE, (y + 1) * TILE))


def main() -> None:
    if hashlib.sha256(SOURCE.read_bytes()).hexdigest() != EXPECTED_SHA256:
        raise SystemExit("Whisperwood candidate material source is missing or changed")
    source = Image.open(SOURCE).convert("RGBA")
    grass_panel, road_panel = material_panels(source)
    grass_macro, road_macro = tileable_macro(grass_panel), tileable_macro(road_panel)

    outputs: list[tuple[str, Image.Image, dict]] = []
    for phase in range(9):
        asset_id = f"whisper_grass_p{phase // 3}{phase % 3}"
        outputs.append((asset_id, patch(grass_macro, phase), {"material": "grass", "phase": [phase % 3, phase // 3]}))
    for bits, name in TOPOLOGY.items():
        mask = road_mask(bits)
        fringe = mask.filter(ImageFilter.MaxFilter(5))
        for phase in range(9):
            grass, road = patch(grass_macro, phase), patch(road_macro, phase)
            tile = grass.copy()
            transition = Image.blend(grass, road, .36)
            tile.paste(transition, (0, 0), fringe)
            tile.paste(road, (0, 0), mask)
            asset_id = f"whisper_road_{name}_p{phase // 3}{phase % 3}"
            outputs.append((asset_id, tile, {"material": "road", "topologyBits": bits, "phase": [phase % 3, phase // 3]}))

    columns = 16
    rows = (len(outputs) + columns - 1) // columns
    atlas = Image.new("RGBA", (columns * TILE, rows * TILE), (0, 0, 0, 0))
    tiles = {}
    for index, (asset_id, tile, metadata) in enumerate(outputs):
        x, y = (index % columns) * TILE, (index // columns) * TILE
        atlas.paste(tile, (x, y))
        tiles[asset_id] = {"x": x, "y": y, "w": TILE, "h": TILE, **metadata}
    ATLAS.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(ATLAS, optimize=False, compress_level=9)
    MANIFEST.write_text(json.dumps({
        "version": "1.6.15-candidate", "status": "candidate-live-review",
        "source": str(SOURCE.relative_to(ROOT)).replace("\\", "/"), "sourceSha256": EXPECTED_SHA256,
        "atlas": {"width": atlas.width, "height": atlas.height, "tileSize": TILE},
        "topologyBits": {name: bits for bits, name in TOPOLOGY.items()}, "tiles": tiles,
    }, indent=2) + "\n", encoding="utf-8")
    print(f"Built {len(outputs)} Whisperwood candidate tiles: {atlas.width}x{atlas.height}")


if __name__ == "__main__":
    main()
