#!/usr/bin/env python3
"""Create a local catalog for Pixel Crawler - Free Pack.

The pack itself is never copied into the repository. This script reads a user-owned
ZIP, writes a JSON manifest, and creates labeled reference previews for art-direction.

Usage:
    python tools/catalog_pixel_crawler.py \
        "/path/to/Pixel Crawler - Free Pack 2.11.zip" \
        --output build/pixel-crawler-catalog

Requires Pillow: `python -m pip install pillow`.
"""
from __future__ import annotations

import argparse
import json
import zipfile
from dataclasses import asdict, dataclass
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

PACK_ROOT = "Pixel Crawler - Free Pack/"
PREVIEW_TARGETS = (
    "Environment/Tilesets/Floors_Tiles.png",
    "Environment/Tilesets/Wall_Tiles.png",
    "Environment/Tilesets/Wall_Variations.png",
    "Environment/Tilesets/Dungeon_Tiles.png",
    "Environment/Tilesets/Water_tiles.png",
    "Environment/Structures/Buildings/Interior/Interior_Walls_01.png",
    "Environment/Structures/Buildings/Interior/Interior_Props_01.png",
    "Environment/Props/Static/Furniture.png",
    "Environment/Props/Static/Vegetation.png",
    "Environment/Props/Static/Rocks.png",
    "Environment/Props/Static/Dungeon_Props.png",
    "Environment/Structures/Stations/Anvil/Anvil.png",
    "Environment/Structures/Stations/Furnace/Furnace.png",
    "Environment/Structures/Stations/Workbench/Workbench.png",
    "MockUps/Tavern.png",
)


@dataclass(frozen=True)
class AssetRecord:
    path: str
    category: str
    animated: bool
    width: int
    height: int
    source_grid: int | None
    frame_width_guess: int | None
    frame_count_guess: int | None
    role: str
    integration: str


def category_for(lower: str) -> tuple[str, str, str, int | None]:
    if "entities/characters/" in lower:
        return (
            "player",
            "layered player animation source",
            "define body/equipment layers, 64px frame anchors, facing, and timing before use",
            64,
        )
    if "entities/npc's/" in lower:
        return (
            "npc",
            "NPC animation source",
            "map each animation and direction explicitly; do not assume every NPC supports four directions",
            64,
        )
    if "entities/mobs/" in lower:
        return (
            "enemy",
            "enemy animation source",
            "map idle/run/death frame sizes and review exploration versus tactical scale",
            32,
        )
    if "environment/tilesets/" in lower:
        return (
            "autotile",
            "16px terrain/autotile source sheet",
            "do not slice into independent 32px cells; decode connected masks or compose a project atlas",
            16,
        )
    if "interior_walls" in lower:
        return (
            "structure",
            "modular walls, corners, doors, supports, and floor sections",
            "assemble rooms on a 16px subgrid with named crops and separate collision footprints",
            16,
        )
    if "interior_props" in lower:
        return (
            "interior-props",
            "irregular packed interior components",
            "extract named rectangles with explicit anchors; this is not a uniform tileset",
            16,
        )
    if "furniture.png" in lower:
        return (
            "furniture",
            "irregular packed furniture source sheet",
            "catalog each object crop, visual footprint, collision footprint, anchor, and layer",
            16,
        )
    if "environment/props/static/trees/" in lower:
        return (
            "tree",
            "large transparent vegetation sprite",
            "use trunk-only collision and a canopy foreground layer",
            16,
        )
    if "environment/props/static/" in lower:
        return (
            "static-props",
            "irregular packed prop source sheet",
            "extract selected objects into a purpose-built runtime atlas",
            16,
        )
    if "environment/structures/stations/" in lower:
        return (
            "station",
            "large crafting/station source",
            "define crop, footprint, anchor, interaction point, layer, and animation metadata",
            16,
        )
    if "environment/structures/buildings/" in lower:
        return (
            "building",
            "modular building source sheet",
            "compose structures from named pieces instead of treating cells as standalone tiles",
            16,
        )
    if "weapons/" in lower:
        return (
            "weapon",
            "weapon/equipment source",
            "map to character animation anchors before use",
            16,
        )
    if "mockups/" in lower:
        return (
            "mockup",
            "visual reference composition",
            "never crop the mockup as production art; use it to understand intended assembly",
            None,
        )
    return ("other", "unclassified source image", "inspect manually", None)


def classify(path: str, width: int, height: int) -> AssetRecord:
    clean = path.removeprefix(PACK_ROOT)
    lower = clean.lower()
    category, role, integration, source_grid = category_for(lower)
    animated = "/animations/" in lower or lower.endswith("-sheet.png")

    frame_width_guess = None
    frame_count_guess = None
    if animated:
        if category in {"player", "npc"}:
            frame_width_guess = 64
        elif category == "enemy":
            frame_width_guess = 32 if height <= 32 else 64
        elif height in {32, 48, 64, 80, 96, 128}:
            frame_width_guess = 32 if height <= 48 else 64
        if frame_width_guess and width % frame_width_guess == 0:
            frame_count_guess = width // frame_width_guess

    return AssetRecord(
        clean,
        category,
        animated,
        width,
        height,
        source_grid,
        frame_width_guess,
        frame_count_guess,
        role,
        integration,
    )


def load_font(size: int) -> ImageFont.ImageFont:
    for candidate in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationMono-Regular.ttf",
    ):
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            continue
    return ImageFont.load_default()


def labeled_preview(image: Image.Image, title: str, grid: int = 16, max_width: int = 1600) -> Image.Image:
    image = image.convert("RGBA")
    scale = max(1, min(3, max_width // max(1, image.width)))
    overlay = image.copy()
    draw = ImageDraw.Draw(overlay)
    for x in range(0, image.width + 1, grid):
        draw.line(((x, 0), (x, image.height)), fill=(255, 0, 255, 95), width=1)
    for y in range(0, image.height + 1, grid):
        draw.line(((0, y), (image.width, y)), fill=(0, 255, 255, 95), width=1)
    upscaled = overlay.resize((image.width * scale, image.height * scale), Image.Resampling.NEAREST)
    header = 44
    result = Image.new("RGBA", (upscaled.width, upscaled.height + header), (22, 22, 24, 255))
    result.alpha_composite(upscaled, (0, header))
    ImageDraw.Draw(result).text(
        (12, 12),
        f"{title} • native {image.width}×{image.height} • grid {grid}px",
        font=load_font(13),
        fill=(245, 241, 228, 255),
    )
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("zip_path", type=Path)
    parser.add_argument("--output", type=Path, default=Path("build/pixel-crawler-catalog"))
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)

    records: list[AssetRecord] = []
    with zipfile.ZipFile(args.zip_path) as archive:
        names = set(archive.namelist())
        for name in sorted(item for item in names if item.lower().endswith(".png")):
            with Image.open(BytesIO(archive.read(name))) as image:
                records.append(classify(name, image.width, image.height))

        preview_dir = args.output / "previews"
        preview_dir.mkdir(exist_ok=True)
        for relative in PREVIEW_TARGETS:
            name = PACK_ROOT + relative
            if name not in names:
                continue
            with Image.open(BytesIO(archive.read(name))) as image:
                labeled_preview(image, Path(relative).name).save(
                    preview_dir / f"{Path(relative).stem}_labeled.png"
                )

    (args.output / "asset_manifest.json").write_text(
        json.dumps([asdict(record) for record in records], indent=2),
        encoding="utf-8",
    )

    counts: dict[str, int] = {}
    animated = 0
    for record in records:
        counts[record.category] = counts.get(record.category, 0) + 1
        animated += int(record.animated)

    summary = [
        "# Pixel Crawler local catalog",
        "",
        f"PNG files: **{len(records)}**",
        f"Animation sheets: **{animated}**",
        "",
        "## Categories",
        "",
    ]
    summary.extend(f"- {name}: {count}" for name, count in sorted(counts.items()))
    summary.extend(
        [
            "",
            "## Critical interpretation rules",
            "",
            "- Environment tilesets use a 16px source grid and contain connected/autotile shapes.",
            "- Furniture and prop sheets are irregular packed source sheets, not uniform 32px atlases.",
            "- Player and most NPC animation sheets use 64px-wide frame lanes.",
            "- Many enemy idle sheets use 32px frames, while run/death sheets may use 64px frames.",
            "- Mockups are reference compositions, not production sprite sheets.",
            "- Runtime art must be repacked into a project-specific atlas with named crops, anchors, visual footprints, collision footprints, and layers.",
        ]
    )
    (args.output / "README.md").write_text("\n".join(summary) + "\n", encoding="utf-8")
    print(f"Cataloged {len(records)} PNG files into {args.output}")


if __name__ == "__main__":
    main()
