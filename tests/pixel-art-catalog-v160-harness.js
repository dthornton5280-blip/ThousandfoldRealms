const fs=require('fs');
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const renderer=fs.readFileSync('source/src/render/renderer.js','utf8');
const assets=fs.readFileSync('source/src/render/assets.js','utf8');
const guide=fs.readFileSync('docs/PIXEL_CRAWLER_ART_DIRECTION.md','utf8');
const manifest=JSON.parse(fs.readFileSync('docs/pixel-crawler/asset_manifest.json','utf8'));
const tool=fs.readFileSync('tools/catalog_pixel_crawler.py','utf8');
const notice=fs.readFileSync('source/assets/third-party/pixel-crawler/NOTICE.txt','utf8');
const version=JSON.parse(fs.readFileSync('version.json','utf8'));

const match=/^(\d+)\.(\d+)\.(\d+)-dev$/.exec(version.version||'');
assert(match,'Current development version is not a semantic dev checkpoint.');
const numeric=Number(match[1])*10000+Number(match[2])*100+Number(match[3]);
assert(numeric>=10600,'Pixel-art catalog rules require v1.6.0-dev or later.');
assert(version.buildName,'Current build name is missing.');

assert(assets.includes('AO.PixelCrawlerArt'),'The v1.5.9 runtime proof was removed instead of safely feature-gated.');
assert(/AO\.PixelCrawlerArt\?\.enabled\s*&&\s*AO\.PixelCrawlerArt\.drawTile/.test(renderer),'Tile pilot is not behind the explicit enabled flag.');
assert(/AO\.PixelCrawlerArt\?\.enabled\s*&&\s*AO\.PixelCrawlerArt\.drawEntity/.test(renderer),'Entity pilot is not behind the explicit enabled flag.');
assert(!/AO\.PixelCrawlerArt\?\.drawTile\s*\(/.test(renderer),'Ungated Pixel Crawler tile rendering remains active.');
assert(!/AO\.PixelCrawlerArt\?\.drawEntity\s*\(/.test(renderer),'Ungated Pixel Crawler entity rendering remains active.');

assert(manifest.reviewed_png_count===181,'Reviewed pack count changed unexpectedly.');
assert(manifest.animation_sheet_count===127,'Animation sheet count changed unexpectedly.');
assert(manifest.source_grid===16&&manifest.game_grid===32,'The reviewed 16px-source/32px-game grid relationship is missing.');
assert(manifest.decision==='hybrid-purpose-built-atlas','The approved hybrid art decision is missing.');
assert(manifest.categories?.autotile?.count===5,'Autotile inventory is incomplete.');
assert(manifest.categories?.player?.count===42,'Player animation inventory is incomplete.');
assert(manifest.categories?.npc?.count===19,'NPC animation inventory is incomplete.');
assert(manifest.categories?.enemy?.count===24,'Enemy animation inventory is incomplete.');

assert(guide.length>5000,'Art-direction guide is unexpectedly incomplete.');
assert(guide.includes('purpose-built art pipeline'),'Hybrid art decision is absent from the guide.');
assert(guide.includes('16px source grid'),'Source-grid rule is absent from the guide.');
assert(guide.includes('Visual footprint')&&guide.includes('Collision footprint'),'Footprint metadata rules are absent from the guide.');
assert(guide.includes('MockUps/Tavern.png'),'Mockup reference rule is absent from the guide.');
assert(guide.includes('generated art'),'Generated-art policy is absent from the guide.');

for(const token of ['PACK_ROOT','PREVIEW_TARGETS','asset_manifest.json','labeled_preview','source_grid']){
  assert(tool.includes(token),`Catalog tool is missing ${token}.`);
}
assert(notice.includes('Anokolisa'),'Third-party creator notice is missing.');
assert(!tool.includes('extractall('),'Catalog tool must not unpack the complete pack into the repository.');

console.log(`Pixel art catalog harness passed at ${version.version}: bad pilot disabled, catalog preserved, and hybrid atlas rules documented.`);
