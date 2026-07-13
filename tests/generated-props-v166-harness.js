/* Thousandfold Realms v1.6.6 hybrid props and furniture validation. */
'use strict';
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const check=(value,message)=>{if(!value)throw new Error(message);};

const manifest=JSON.parse(read('source/assets/thousandfold/generated/atlas-manifest-v166.json'));
const assetRoot=path.join(root,'source/assets/thousandfold/generated');
const encoded=manifest.atlas.chunks.map(file=>fs.readFileSync(path.join(assetRoot,file),'utf8').trim()).join('');
const atlas=Buffer.from(encoded,'base64');
check(manifest.version==='1.6.6-dev','manifest must identify v1.6.6-dev');
check(manifest.atlas.encoding==='base64-png-chunks','v1.6.6 atlas must declare chunked PNG encoding');
check(manifest.atlas.chunks.length===1,'v1.6.6 atlas should remain one compact repository payload');
check(atlas.slice(1,4).toString()==='PNG','decoded v1.6.6 atlas must be a PNG');
const width=atlas.readUInt32BE(16),height=atlas.readUInt32BE(20);
check(width===512&&height===192,'v1.6.6 atlas must be exactly 512x192');
check(width===manifest.atlas.width&&height===manifest.atlas.height,'v1.6.6 atlas dimensions must match the manifest');
check(atlas.length===manifest.atlas.decodedBytes,`v1.6.6 decoded byte count ${atlas.length} must match manifest ${manifest.atlas.decodedBytes}`);
check(atlas.length<100000,'v1.6.6 runtime atlas must remain compact');

const required=[
  'haven_cart_wood_sacks','haven_bench_wood_backrest','haven_signpost_wood_dual',
  'tavern_barrel_oak','haven_crate_wood','tavern_table_square',
  'tavern_chair_wood','tavern_stool_wood','tavern_hanging_lantern',
  'tavern_shelf_bottles'
];
for(const id of required){
  const asset=manifest.assets[id];
  check(asset,`missing v1.6.6 manifest asset ${id}`);
  const r=asset.sourceRect;
  check(r.x>0&&r.y>0&&r.w>0&&r.h>0,`${id} has an invalid source rectangle`);
  check(r.x+r.w<width&&r.y+r.h<height,`${id} crop leaves safe atlas bounds`);
  check(asset.renderDimensions?.w>0&&asset.renderDimensions?.h>0,`${id} lacks render dimensions`);
  check(typeof asset.anchor==='string'&&asset.anchor.length>0,`${id} lacks an anchor`);
  check(Array.isArray(asset.collisionFootprint),`${id} lacks explicit collision metadata`);
  check(Array.isArray(asset.interactionFootprint),`${id} lacks explicit interaction metadata`);
  check(asset.fallback==='existing Thousandfold procedural renderer',`${id} lacks the established fallback`);
}
check(manifest.assets.haven_cart_wood_sacks.collisionFootprint.length===2,'Haven cart must preserve its established two-cell collision');
check(manifest.assets.haven_bench_wood_backrest.collisionFootprint.length===2,'Haven bench must preserve two-cell collision');
check(manifest.assets.haven_signpost_wood_dual.collisionFootprint.length===0,'Haven signpost must remain nonblocking');
check(manifest.assets.tavern_hanging_lantern.collisionFootprint.length===0,'Hanging lantern must remain nonblocking');
check(manifest.assets.tavern_shelf_bottles.collisionFootprint.length===3,'Tavern shelf must preserve its three-cell footprint');

const propRuntime=read('source/src/render/generated_props_v166.js');
for(const id of required)check(propRuntime.includes(id),`${id} is not registered by the v1.6.6 runtime`);
check(propRuntime.includes('imageSmoothingEnabled=false'),'v1.6.6 sprites must render nearest-neighbor');
check(propRuntime.includes("data:image/png;base64"),'v1.6.6 runtime must decode the repository payload into a PNG');
check(propRuntime.includes("cache:'no-cache'"),'v1.6.6 atlas must bypass stale browser cache after deployment fixes');
check(propRuntime.includes('procedural fallback remains active'),'v1.6.6 atlas failure must preserve the procedural renderer');
check(propRuntime.includes("patchIds('haven',['haven_delivery_cart'],'haven_cart_wood_sacks')"),'Haven delivery cart must use the new cart asset');
check(propRuntime.includes("patchIds('haven',['bench_1','bench_2'],'haven_bench_wood_backrest')"),'Both Haven benches must use the new bench asset');
check(propRuntime.includes("patchIds('haven',['haven_east_sign'],'haven_signpost_wood_dual')"),'Haven road sign must use the new signpost asset');
check(propRuntime.includes("patchIds('tavern',['tavern_table_1','tavern_table_2','tavern_table_3'],'tavern_table_square')"),'All three tavern dining tables must use the new table asset');
check(propRuntime.includes("patchIds('tavern',['tavern_shelf_mugs'],'tavern_shelf_bottles')"),'Tavern service shelf must use the new shelf asset');
check(propRuntime.includes("patchIds('tavern',['tavern_stage_lamp_1','tavern_stage_lamp_2'],'tavern_hanging_lantern"),'Tavern stage lamps must use the new lantern asset');
check(propRuntime.includes("patchIds('tavern_cellar',['cellar_keg_1','cellar_keg_2'],'tavern_barrel_oak')"),'Cellar barrels must use the new oak barrel asset');
check(propRuntime.includes("patchIds('tavern_cellar',['cellar_crates'],'haven_crate_wood')"),'Cellar storage must use the new crate asset');
check(!propRuntime.includes("patchIds('tavern',['tavern_keg_1']"),'The established multi-barrel stack must not be stretched from one barrel sprite');
check(propRuntime.includes('patchCurrentWorld'),'already-constructed worlds must receive the approved art IDs');
check(propRuntime.includes('definitionsReady'),'late-authored Haven and interior entities must be repatched after data composition completes');
check(!propRuntime.includes('GeneratedPropContent?.installed)return'),'metadata patching must not stop before later composition files create their objects');
check(!propRuntime.includes('AO.SpriteFactory.icon=function'),'the v1.6.6 module must not install a nested icon hook before the canonical renderer');
check(!propRuntime.includes('ChatGPT Image Jul'),'presentation sheets must never be loaded by the runtime');
check(!propRuntime.includes('contact-sheet'),'contact sheets must never be loaded by the runtime');

const canonicalRenderer=read('source/src/render/thousandfold_renderer.js');
const propIndex=canonicalRenderer.indexOf('GeneratedPropArt?.drawEntity');
const v165Index=canonicalRenderer.indexOf('GeneratedSpriteArt?.drawEntity');
const proceduralIndex=canonicalRenderer.indexOf('ThousandfoldArt?.drawEntity');
check(propIndex>=0,'canonical renderer must call the v1.6.6 prop atlas');
check(propIndex<v165Index&&v165Index<proceduralIndex,'v1.6.6 props must render before v1.6.5 and procedural fallbacks');

const composition=read('source/src/data/tavern_composition.js');
check(composition.includes("script.src='src/render/generated_props_v166.js'"),'canonical source must load the v1.6.6 prop renderer');
check(composition.includes("script.async=false"),'v1.6.6 prop module must retain deterministic script execution');

const version=JSON.parse(read('version.json'));
check(version.version==='1.6.6-dev','version must identify the v1.6.6 checkpoint');
check(version.buildName==='Hybrid Props + Tavern Furnishings','v1.6.6 build name is incorrect');
console.log(`v1.6.6 hybrid props validated: ${required.length} assets, ${width}x${height}, ${atlas.length} bytes, canonical render order confirmed.`);