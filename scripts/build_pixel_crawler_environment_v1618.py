#!/usr/bin/env python3
"""Build the compact Pixel Crawler environment subset used by TFR v1.6.18.

The user-owned archive remains outside the repository.  This builder reads it
in memory, verifies the reviewed source, recolors only selected derivatives,
and writes the exact runtime atlases plus manifests used by the game.
"""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import zipfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_ZIP = Path.home() / "Downloads" / "Pixel Crawler - Free Pack 2.11.zip"
SOURCE_SHA256 = "b7b228ca232da9958f191b01db87764dddb67610116151e06e8dd8ade6de94b8"
OUT = ROOT / "source/assets/third-party/pixel-crawler"
TERRAIN = OUT / "tfr-environment-terrain-v1618.png"
TERRAIN_JSON = OUT / "tfr-environment-terrain-v1618.json"
PROPS = OUT / "tfr-environment-props-v1618.png"
PROPS_JSON = OUT / "tfr-environment-props-v1618.json"
TILE = 32
TOPOLOGY = {
    0: "isolated", 1: "end_n", 2: "end_e", 3: "corner_ne",
    4: "end_s", 5: "straight_ns", 6: "corner_se", 7: "tee_nes",
    8: "end_w", 9: "corner_nw", 10: "straight_ew", 11: "tee_new",
    12: "corner_sw", 13: "tee_nsw", 14: "tee_esw", 15: "open",
}
FILES = {
    "water": "Pixel Crawler - Free Pack/Environment/Tilesets/Water_tiles.png",
    "vegetation": "Pixel Crawler - Free Pack/Environment/Props/Static/Vegetation.png",
    "rocks": "Pixel Crawler - Free Pack/Environment/Props/Static/Rocks.png",
    "bonfire": "Pixel Crawler - Free Pack/Environment/Structures/Stations/Bonfire/Bonfire.png",
    "tree": "Pixel Crawler - Free Pack/Environment/Props/Static/Trees/Model_01/Size_02.png",
}


def open_rgba(archive: zipfile.ZipFile, name: str) -> Image.Image:
    return Image.open(io.BytesIO(archive.read(FILES[name]))).convert("RGBA")


def hash2(x: int, y: int, salt: int = 0) -> int:
    value = (x * 374761393 + y * 668265263 + salt * 1442695041) & 0xFFFFFFFF
    value = ((value ^ (value >> 13)) * 1274126177) & 0xFFFFFFFF
    return value ^ (value >> 16)


def recolor_water_source(image: Image.Image, shallow: bool = False) -> Image.Image:
    """Map the pack's bright cyan/green sample into the Whisperwood palette."""
    out = Image.new("RGBA", image.size)
    target = out.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = image.getpixel((x, y))
            if not a:
                continue
            if b > r * 1.18 and b >= g:
                light = (r + g + b) / 765
                if shallow:
                    nr, ng, nb = int(34 + 50 * light), int(74 + 75 * light), int(79 + 75 * light)
                else:
                    nr, ng, nb = int(19 + 42 * light), int(47 + 58 * light), int(57 + 68 * light)
            elif g > r * 1.12 and g > b * 1.08:
                light = (r + g + b) / 765
                nr, ng, nb = int(45 + 42 * light), int(58 + 45 * light), int(26 + 31 * light)
            elif r > b * 1.22:
                light = (r + g + b) / 765
                nr, ng, nb = int(64 + 72 * light), int(45 + 55 * light), int(29 + 39 * light)
            else:
                light = (r + g + b) / 765
                nr, ng, nb = int(45 + 80 * light), int(73 + 89 * light), int(77 + 92 * light)
            target[x, y] = (min(nr, 170), min(ng, 178), min(nb, 184), a)
    return out


def recolor_forest(image: Image.Image, autumn: bool = False) -> Image.Image:
    """Temper saturation while retaining the pack's authored clusters."""
    out = Image.new("RGBA", image.size)
    pix = out.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = image.getpixel((x, y))
            if not a:
                continue
            if g > r * 1.08 and g > b * 1.12:
                lum = (r + g + b) / 765
                if autumn:
                    nr, ng, nb = 93 + int(75 * lum), 47 + int(58 * lum), 24 + int(27 * lum)
                else:
                    nr, ng, nb = 36 + int(58 * lum), 53 + int(70 * lum), 25 + int(40 * lum)
            elif r > g * 1.12:
                lum = (r + g + b) / 765
                nr, ng, nb = 72 + int(75 * lum), 43 + int(55 * lum), 27 + int(38 * lum)
            else:
                # Bark, stone, and flowers keep their hue with a small mute.
                mean = (r + g + b) // 3
                nr = int(mean * .20 + r * .72)
                ng = int(mean * .20 + g * .72)
                nb = int(mean * .20 + b * .72)
            pix[x, y] = (min(nr, 210), min(ng, 205), min(nb, 205), a)
    return out


def recolor_lily(image: Image.Image) -> Image.Image:
    """Keep water vegetation moss-green even when the source variant is autumnal."""
    out = Image.new("RGBA", image.size)
    pix = out.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = image.getpixel((x, y))
            if not a:
                continue
            light = (r + g + b) / 765
            pix[x, y] = (39 + int(45 * light), 61 + int(65 * light), 30 + int(37 * light), a)
    return out


def texture_patch(source: Image.Image, box: tuple[int, int, int, int], phase: int) -> Image.Image:
    sample = source.crop(box)
    if sample.width < TILE or sample.height < TILE:
        tiled = Image.new("RGBA", (TILE * 2, TILE * 2))
        for yy in range(0, tiled.height, sample.height):
            for xx in range(0, tiled.width, sample.width):
                tiled.paste(sample, (xx, yy))
        sample = tiled
    ox = (phase * 7) % max(1, sample.width - TILE + 1)
    oy = (phase * 11) % max(1, sample.height - TILE + 1)
    return sample.crop((ox, oy, ox + TILE, oy + TILE))


def opaque_texture(source: Image.Image, box: tuple[int, int, int, int], phase: int, fill: tuple[int, int, int, int]) -> Image.Image:
    """Flatten demo-sheet gaps so transparent catalog spacing never reaches a live map."""
    tile = Image.new("RGBA", (TILE, TILE), fill)
    tile.alpha_composite(texture_patch(source, box, phase))
    return tile


def land_mask(bits: int, phase: int) -> Image.Image:
    """Organic land intrusions for cardinal water topology.

    A missing cardinal connection means land occupies that edge.  The shore
    remains broad and irregular, while connected edges always remain open at
    their centre so adjacent water cells join without seams.
    """
    mask = Image.new("L", (TILE, TILE), 0)
    px = mask.load()
    for y in range(TILE):
        for x in range(TILE):
            north = not bits & 1
            east = not bits & 2
            south = not bits & 4
            west = not bits & 8
            # A one-cell stream should still read as a broad water course at
            # game scale; banks occupy only 3–5 pixels of each closed edge.
            ndepth = 3 + hash2(x, phase, 1) % 3
            sdepth = 3 + hash2(x, phase, 2) % 3
            wdepth = 3 + hash2(y, phase, 3) % 3
            edepth = 3 + hash2(y, phase, 4) % 3
            inside = (north and y < ndepth) or (south and y >= TILE - sdepth)
            inside = inside or (west and x < wdepth) or (east and x >= TILE - edepth)
            # Soften inside corners without turning streams into round tubes.
            if north and west and x + y < 15 + hash2(x, y, phase) % 5:
                inside = True
            if north and east and (TILE - 1 - x) + y < 15 + hash2(x, y, phase + 7) % 5:
                inside = True
            if south and west and x + (TILE - 1 - y) < 15 + hash2(x, y, phase + 11) % 5:
                inside = True
            if south and east and (TILE - 1 - x) + (TILE - 1 - y) < 15 + hash2(x, y, phase + 17) % 5:
                inside = True
            if inside:
                px[x, y] = 255
    return mask


def add_water_details(tile: Image.Image, family: str, phase: int, vegetation: Image.Image) -> None:
    draw = ImageDraw.Draw(tile)
    if family == "lilywater":
        leaves = recolor_lily(vegetation.crop((80, 144, 112, 176)))
        tile.alpha_composite(leaves, ((phase % 2) * 7 - 2, (phase // 2) * 5 + 7))
    elif family == "reeds":
        reeds = recolor_lily(vegetation.crop((112, 160, 144, 192)))
        tile.alpha_composite(reeds, ((phase % 2) * 6 - 2, 1))
    elif family == "water":
        # Sparse quiet highlights reinforce direction without animation noise.
        if phase in (1, 3):
            draw.line((8, 11 + phase, 15, 11 + phase), fill=(91, 133, 143, 130), width=1)
            draw.line((20, 23 - phase, 26, 23 - phase), fill=(79, 120, 131, 105), width=1)


def build_terrain(water_raw: Image.Image, vegetation: Image.Image) -> dict:
    deep = recolor_water_source(water_raw, shallow=False)
    shallow = recolor_water_source(water_raw, shallow=True)
    # Authored pack samples: lower water material, island grass, and brown bank.
    deep_box = (16, 96, 160, 240)
    grass_box = (18, 18, 78, 68)
    grass_source = recolor_forest(water_raw.crop(grass_box))
    bank_source = recolor_water_source(water_raw.crop((0, 0, 96, 80)), shallow=True)
    families = ("water", "shallow_water", "lilywater", "reeds")
    entries: list[tuple[str, Image.Image, dict]] = []
    for family in families:
        material = shallow if family in ("shallow_water", "reeds") else deep
        for bits in range(16):
            for phase in range(4):
                fill = (42, 88, 96, 255) if family in ("shallow_water", "reeds") else (27, 65, 78, 255)
                water_tile = opaque_texture(material, deep_box, phase, fill)
                grass = texture_patch(grass_source, (0, 0, grass_source.width, grass_source.height), phase)
                bank = texture_patch(bank_source, (0, 0, bank_source.width, bank_source.height), phase)
                land = land_mask(bits, phase)
                shore_outer = land.filter(ImageFilter.MaxFilter(7))
                foam_outer = land.filter(ImageFilter.MaxFilter(3))
                tile = water_tile.copy()
                tile.paste(bank, (0, 0), shore_outer)
                tile.paste(water_tile, (0, 0), foam_outer)
                tile.paste(grass, (0, 0), land)
                add_water_details(tile, family, phase, vegetation)
                asset_id = f"pc_{family}_{TOPOLOGY[bits]}_p{phase}"
                entries.append((asset_id, tile, {"family": family, "topologyBits": bits, "phase": phase}))

    for phase in range(4):
        tile = opaque_texture(deep, deep_box, phase, (27, 65, 78, 255))
        draw = ImageDraw.Draw(tile)
        for line_index, x in enumerate((7 + phase % 2, 16, 25 - phase % 2)):
            offset = (phase + line_index) % 4
            draw.line((x, -2, x + (offset % 2), 11), fill=(97, 148, 158, 190), width=2)
            draw.line((x + (offset % 2), 14, x - 1, 29), fill=(73, 125, 137, 170), width=1)
        draw.line((3, 30, 12, 30), fill=(106, 157, 165, 145), width=1)
        draw.line((20, 27, 29, 27), fill=(88, 140, 151, 125), width=1)
        entries.append((f"pc_waterfall_p{phase}", tile, {"family": "waterfall", "phase": phase}))

    columns = 16
    rows = (len(entries) + columns - 1) // columns
    atlas = Image.new("RGBA", (columns * TILE, rows * TILE), (0, 0, 0, 0))
    tiles = {}
    for index, (asset_id, tile, metadata) in enumerate(entries):
        x, y = (index % columns) * TILE, (index // columns) * TILE
        atlas.alpha_composite(tile, (x, y))
        tiles[asset_id] = {"x": x, "y": y, "w": TILE, "h": TILE, **metadata}
    TERRAIN.parent.mkdir(parents=True, exist_ok=True)
    atlas.save(TERRAIN, optimize=False, compress_level=9)
    payload = {
        "version": "1.6.18", "status": "integrated", "sourceArchiveSha256": SOURCE_SHA256,
        "atlas": {"file": TERRAIN.name, "width": atlas.width, "height": atlas.height, "tileSize": TILE},
        "topology": {name: bits for bits, name in TOPOLOGY.items()}, "tiles": tiles,
    }
    TERRAIN_JSON.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    return payload


def trim(image: Image.Image) -> Image.Image:
    box = image.getbbox()
    return image.crop(box) if box else image.crop((0, 0, 1, 1))


def build_props(vegetation: Image.Image, rocks: Image.Image, tree: Image.Image, bonfire: Image.Image) -> dict:
    specs = [
        ("pc_shrub_round_green", vegetation, (0, 0, 48, 48), False, "bottomCenter"),
        ("pc_shrub_round_olive", vegetation, (48, 0, 96, 48), False, "bottomCenter"),
        ("pc_shrub_low_green", vegetation, (0, 48, 48, 96), False, "bottomCenter"),
        ("pc_shrub_low_olive", vegetation, (48, 48, 96, 96), False, "bottomCenter"),
        ("pc_flower_wild_a", vegetation, (0, 144, 32, 192), False, "bottomCenter"),
        ("pc_flower_wild_b", vegetation, (32, 144, 64, 192), False, "bottomCenter"),
        ("pc_marsh_plants", vegetation, (96, 144, 144, 192), False, "bottomCenter"),
        ("pc_dead_tree", tree, (128, 0, 192, 64), False, "bottomCenter"),
        ("pc_rock_cluster_gray", rocks, (96, 16, 144, 64), False, "bottomCenter"),
        ("pc_rocks_gray_small", rocks, (144, 16, 192, 64), False, "bottomCenter"),
        ("pc_tree_green", tree, (0, 0, 64, 64), False, "bottomCenter"),
        ("pc_tree_olive", tree, (64, 0, 128, 64), False, "bottomCenter"),
        ("pc_tree_autumn", tree, (0, 64, 64, 128), True, "bottomCenter"),
        ("pc_fire_ring", bonfire, (0, 16, 32, 48), False, "bottomCenter"),
        ("pc_fire_ring_stone", bonfire, (32, 16, 64, 48), False, "bottomCenter"),
    ]
    prepared = []
    for asset_id, source, box, autumn, anchor in specs:
        sprite = trim(recolor_forest(source.crop(box), autumn=autumn))
        prepared.append((asset_id, sprite, anchor, box))

    padding, width = 4, 512
    x = y = padding
    row_h = 0
    placed = []
    for asset_id, sprite, anchor, source_box in prepared:
        if x + sprite.width + padding > width:
            x, y, row_h = padding, y + row_h + padding, 0
        placed.append((asset_id, sprite, anchor, source_box, x, y))
        x += sprite.width + padding
        row_h = max(row_h, sprite.height)
    height = y + row_h + padding
    atlas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    sprites = {}
    for asset_id, sprite, anchor, source_box, x, y in placed:
        atlas.alpha_composite(sprite, (x, y))
        sprites[asset_id] = {
            "x": x, "y": y, "w": sprite.width, "h": sprite.height,
            "anchor": anchor, "sourceCrop": list(source_box),
        }
    atlas.save(PROPS, optimize=False, compress_level=9)
    payload = {
        "version": "1.6.18", "status": "integrated", "sourceArchiveSha256": SOURCE_SHA256,
        "atlas": {"file": PROPS.name, "width": atlas.width, "height": atlas.height}, "sprites": sprites,
    }
    PROPS_JSON.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    return payload


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--zip", type=Path, default=DEFAULT_ZIP)
    args = parser.parse_args()
    source_hash = hashlib.sha256(args.zip.read_bytes()).hexdigest()
    if source_hash.lower() != SOURCE_SHA256:
        raise SystemExit(f"Pixel Crawler archive changed: expected {SOURCE_SHA256}, got {source_hash}")
    with zipfile.ZipFile(args.zip) as archive:
        terrain = build_terrain(open_rgba(archive, "water"), open_rgba(archive, "vegetation"))
        props = build_props(open_rgba(archive, "vegetation"), open_rgba(archive, "rocks"), open_rgba(archive, "tree"), open_rgba(archive, "bonfire"))
    print(f"Built {len(terrain['tiles'])} terrain tiles: {terrain['atlas']['width']}x{terrain['atlas']['height']}")
    print(f"Built {len(props['sprites'])} environment props: {props['atlas']['width']}x{props['atlas']['height']}")


if __name__ == "__main__":
    main()
