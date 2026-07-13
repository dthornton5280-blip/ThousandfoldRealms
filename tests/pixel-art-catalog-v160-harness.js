const fs=require('fs');
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const renderer=fs.readFileSync('source/src/render/renderer.js','utf8');
const assets=fs.readFileSync('source/src/render/assets.js','utf8');
const guide=fs.readFileSync('docs/PIXEL_CRAWLER_ART_DIRECTION.md','utf8');
const manifest=JSON.parse(fs.readFileSync('docs/pixel-crawler/asset_manifest.json','utf8'));
const tool=fs.readFileSync('tools/catalog_pixel_crawler.py','utf8');
const notice=fs.readFileSync('source/assets/third-party/pixel-crawler/NOTICE.txt','utf8');
const version=JSON.parse(fs.readFileSync('version.json','utf8'));

assert(version.version==='1.6.0-dev','Pixel art correction version was not bumped to 1.6.0-dev.');
assert(version.buildName==='Asset Catalog + Stable Tavern Rollback','Unexpected v1.6.0 build name.');

assert(assets.includes('AO.PixelCrawlerArt'),'The v1.5.9 runtime proof was removed instead of safely feature-gated.');
assert(renderer.includes('AO.PixelCrawlerArt?.enabled&&AO.PixelCrawlerArt.drawTile'),'Tile pilot is not behind the explicit enabled flag.');
assert(renderer.includes('AO.PixelCrawlerArt?.enabled&&AO.PixelCrawlerArt.drawEntity'),'Entity pilot is not behind the explicit enabled flag.');
assert(!renderer.includes('AO.PixelCrawlerArt?.drawTile(ctx'),'Ungated Pixel Crawler tile rendering remains active.');
assert(!renderer.includes('AO.PixelCrawlerArt?.drawEntity(ctx'),'Ungated Pixel Crawler entity rendering remains active.');

assert(manifest.reviewed_png_count===181,'Reviewed pack count changed unexpectedly.');
assert(manifest.source_grid===16,'The source-grid interpretation is missing.');
assert(manifest.game_grid===32,'The game-grid interpretation is missing.');
assert(manifest.decision==='hybrid-purpose-built-atlas','The approved hybrid art decision is missing.');
assert(manifest.categories.autotile.count===5,'Autotile inventory is incomplete.');
assert(manifest.categories.player.count===42,'Player animation inventory is incomplete.');
assert(manifest.categories.npc.count===19,'NPC animation inventory is incomplete.');
assert(manifest.categories.enemy.count===24,'Enemy animation inventory is incomplete.');

for(const phrase of [
  'hybrid, purpose-built art pipeline',
  '16px source grid',
  'visual footprint',
  'collision footprint',
  'generated artwork',
  'MockUps/Tavern.png',
]) assert(guide.includes(phrase),`Art-direction guide is missing: ${phrase}`);

for(const token of ['PACK_ROOT','PREVIEW_TARGETS','asset_manifest.json','labeled_preview','source_grid']){
  assert(tool.includes(token),`Catalog tool is missing ${token}.`);
}
assert(notice.includes('Anokolisa'),'Third-party creator notice is missing.');
assert(!tool.includes('extractall('),'Catalog tool must not unpack the complete pack into the repository.');

console.log('Pixel art v1.6.0 harness passed: bad tavern pilot disabled, stable fallback restored, pack cataloged correctly, and hybrid atlas rules documented.');
