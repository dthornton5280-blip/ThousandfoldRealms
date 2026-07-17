#!/usr/bin/env python3
"""Build explicit natural water/shore topology from approved material sources."""

from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "reference/candidates/shared_natural_water_shore_source_v1617.png"
GRASS_SOURCE = ROOT / "reference/candidates/whisperwood_grass_road_material_source_v1615.png"
ATLAS = ROOT / "source/assets/thousandfold/tiles/shared-natural-water-shore-v1617.png"
MANIFEST = ROOT / "source/assets/thousandfold/tiles/shared-natural-water-shore-v1617.json"
EXPECTED_SHA256 = "add7f22afab6a9020a8b5a2ee2e3277c7cfeb9aae2444e1e1430902f39d60704"
EXPECTED_GRASS_SHA256 = "56006f52465fd7bdc4c7bfe6aad70ff2ccb3c1aacc7699642901deda74201823"
TILE = 32
MACRO = 96
TOPOLOGY = {
    0: "isolated", 1: "end_n", 2: "end_e", 4: "end_s", 8: "end_w",
    5: "straight_ns", 10: "straight_ew", 3: "corner_ne", 6: "corner_se",
    12: "corner_sw", 9: "corner_nw", 7: "tee_nes", 14: "tee_esw",
    13: "tee_nsw", 11: "tee_new", 15: "open",
}


def is_key(pixel: tuple[int, int, int, int]) -> bool:
    r, g, b, _ = pixel
    return r > 220 and b > 220 and g < 70


def runs(values: list[bool], minimum: int) -> list[tuple[int, int]]:
    output, start = [], None
    for index, value in enumerate(values + [False]):
        if value and start is None:
            start = index
        elif not value and start is not None:
            if index - start >= minimum:
                output.append((start, index))
            start = None
    return output


def material_panels(image: Image.Image, expected: int) -> tuple[Image.Image, ...]:
    pixels = image.load()
    solid_x = [sum(is_key(pixels[x, y]) for y in range(image.height)) > image.height * .82 for x in range(image.width)]
    solid_y = [sum(is_key(pixels[x, y]) for x in range(image.width)) > image.width * .82 for y in range(image.height)]
    material_x = runs([not value for value in solid_x], 250)
    material_y = runs([not value for value in solid_y], 250)
    if len(material_x) != expected or len(material_y) != 1:
        raise SystemExit(f"could not identify {expected} material panels: x={material_x}, y={material_y}")
    y0, y1 = material_y[0]
    return tuple(image.crop((x0, y0, x1, y1)) for x0, x1 in material_x)


def tileable_macro(panel: Image.Image) -> Image.Image:
    side = min(panel.size)
    left, top = (panel.width - side) // 2, (panel.height - side) // 2
    base = panel.crop((left, top, left + side, top + side)).resize((48, 48), Image.Resampling.NEAREST)
    macro = Image.new("RGBA", (MACRO, MACRO))
    macro.paste(base, (0, 0))
    macro.paste(base.transpose(Image.Transpose.FLIP_LEFT_RIGHT), (48, 0))
    vertical = base.transpose(Image.Transpose.FLIP_TOP_BOTTOM)
    macro.paste(vertical, (0, 48))
    macro.paste(vertical.transpose(Image.Transpose.FLIP_LEFT_RIGHT), (48, 48))
    return macro


def water_mask(bits: int) -> Image.Image:
    mask = Image.new("L", (TILE, TILE), 0)
    px = mask.load()
    for y in range(TILE):
        for x in range(TILE):
            dx, dy = x - 15.5, y - 15.5
            inside = dx * dx + dy * dy <= 12.5 * 12.5
            if bits & 1 and y <= 16 and abs(dx) <= 11.5:
                inside = True
            if bits & 2 and x >= 15 and abs(dy) <= 11.5:
                inside = True
            if bits & 4 and y >= 15 and abs(dx) <= 11.5:
                inside = True
            if bits & 8 and x <= 16 and abs(dy) <= 11.5:
                inside = True
            if bits & 1 and bits & 2 and x >= 16 and y <= 15:
                inside = True
            if bits & 2 and bits & 4 and x >= 16 and y >= 16:
                inside = True
            if bits & 4 and bits & 8 and x <= 15 and y >= 16:
                inside = True
            if bits & 8 and bits & 1 and x <= 15 and y <= 15:
                inside = True
            if inside:
                px[x, y] = 255
    return mask


def patch(macro: Image.Image, phase: int) -> Image.Image:
    x, y = phase % 3, phase // 3
    return macro.crop((x * TILE, y * TILE, (x + 1) * TILE, (y + 1) * TILE))


def main() -> None:
    if hashlib.sha256(SOURCE.read_bytes()).hexdigest() != EXPECTED_SHA256:
        raise SystemExit("shared natural water/shore source is missing or changed")
    if hashlib.sha256(GRASS_SOURCE.read_bytes()).hexdigest() != EXPECTED_GRASS_SHA256:
        raise SystemExit("Whisperwood grass material source is missing or changed")
    deep_panel, shallow_panel, bank_panel = material_panels(Image.open(SOURCE).convert("RGBA"), 3)
    grass_panel = material_panels(Image.open(GRASS_SOURCE).convert("RGBA"), 2)[0]
    deep_macro, shallow_macro = tileable_macro(deep_panel), tileable_macro(shallow_panel)
    bank_macro, grass_macro = tileable_macro(bank_panel), tileable_macro(grass_panel)

    outputs: list[tuple[str, Image.Image, dict]] = []
    for bits, name in TOPOLOGY.items():
        water = water_mask(bits)
        shore = water.filter(ImageFilter.MaxFilter(7))
        deep = water.filter(ImageFilter.MinFilter(7))
        for phase in range(9):
            grass, bank = patch(grass_macro, phase), patch(bank_macro, phase)
            shallow, deep_water = patch(shallow_macro, phase), patch(deep_macro, phase)
            tile = grass.copy()
            tile.paste(bank, (0, 0), shore)
            tile.paste(shallow, (0, 0), water)
            tile.paste(deep_water, (0, 0), deep)
            asset_id = f"natural_water_{name}_p{phase // 3}{phase % 3}"
            outputs.append((asset_id, tile, {"topologyBits": bits, "phase": [phase % 3, phase // 3]}))
            shallow_tile = grass.copy()
            shallow_tile.paste(bank, (0, 0), shore)
            shallow_tile.paste(shallow, (0, 0), water)
            shallow_id = f"natural_shallow_{name}_p{phase // 3}{phase % 3}"
            outputs.append((shallow_id, shallow_tile, {"material": "shallow", "topologyBits": bits, "phase": [phase % 3, phase // 3]}))

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
        "version": "1.6.17-candidate", "status": "candidate-live-review",
        "source": str(SOURCE.relative_to(ROOT)).replace("\\", "/"),
        "sourceSha256": EXPECTED_SHA256,
        "grassSource": str(GRASS_SOURCE.relative_to(ROOT)).replace("\\", "/"),
        "atlas": {"width": atlas.width, "height": atlas.height, "tileSize": TILE},
        "topologyBits": {name: bits for bits, name in TOPOLOGY.items()}, "tiles": tiles,
    }, indent=2) + "\n", encoding="utf-8")
    print(f"Built {len(outputs)} shared natural water/shore candidate tiles: {atlas.width}x{atlas.height}")


if __name__ == "__main__":
    main()
