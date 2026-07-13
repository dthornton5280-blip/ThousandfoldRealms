/* Thousandfold Realms v1.6.6+ hybrid props and furniture validation. */
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
check(manifest.version==='1.6.6-dev','manifest must retain the v1.6.6 asset checkpoint');
check(manifest.atlas.encoding==='base64-png-chunks','v1.6.6 atlas must declare chunked PNG encoding');
check(manifest.atlas.chunks.length===1,'v1.6.6 atlas should remain one compact repository payload');
check(atlas.slice(1,4).toString()==='PNG','decoded v1.6.6 atlas must be a PNG');
const width=atlas.readUInt32BE(16),height=atlas.readUInt32BE(20);
check(width===512&&height===192,'v1.6.6 atlas must be exactly 512x192');
check(width===manifest.atlas.width&&height===manifest.atlas.height,'v1.6.6 atlas dimensions must match the manifest');
check(atlas.length===manifest.atlas.decodedBytes,`decoded byte count ${atlas.length} must match manifest ${manifest.atlas.decodedBytes}`);
check(atlas.length<100000,'v1.6.6 runtime atlas must remain compact');

const required=[
  'haven_cart_wood_sacks','haven_bench_wood_backrest','haven_signpost_wood_dual',
  'tavern_barrel_oak','haven_crate_wood','tavern_table_square',
  'tavern_chair_wood','tavern_stool_wood','tavern_hanging_lantern',
  'tavern_shelf_bottles'
];
for(const id of required){
  const asset=manifest.assets[id];
  check(asset,`missing manifest asset ${id}`);
  const r=asset.sourceRect;
  check(r.x>0&&r.y>0&&r.w>0&&r.h>0,`${id} has an invalid source rectangle`);
  check(r.x+r.w<width&&r.y+r.h<height,`${id} crop leaves safe atlas bounds`);
  check(asset.renderDimensions?.w>0&&asset.renderDimensions?.h>0,`${id} lacks render dimensions`);
  check(typeof asset.anchor==='string'&&asset.anchor.length>0,`${id} lacks an anchor`);
  check(Array.isArray(asset.collisionFootprint),`${id} lacks collision metadata`);
  check(Array.isArray(asset.interactionFootprint),`${id} lacks interaction metadata`);
  check(asset.fallback==='existing Thousandfold procedural renderer',`${id} lacks fallback metadata`);
}
check(manifest.assets.haven_cart_wood_sacks.collisionFootprint.length===2,'Haven cart must preserve two-cell collision');
check(manifest.assets.haven_bench_wood_backrest.collisionFootprint.length===2,'Haven bench must preserve two-cell collision');
check(manifest.assets.haven_signpost_wood_dual.collisionFootprint.length===0,'Haven signpost must remain nonblocking');
check(manifest.assets.tavern_hanging_lantern.collisionFootprint.length===0,'Hanging lantern must remain nonblocking');
check(manifest.assets.tavern_shelf_bottles.collisionFootprint.length===3,'Tavern shelf must preserve its three-cell footprint');

const runtime=read('source/src/render/runtime_repairs_v167.js');
for(const id of required)check(runtime.includes(id),`${id} is not registered by the live runtime`);
check(runtime.includes("generated-props-atlas-v166.b64?v=167"),'live runtime must bypass the stale Pages atlas cache');
check(runtime.includes('imageSmoothingEnabled=false'),'sprites must render nearest-neighbor');
check(runtime.includes('established fallback art remains active'),'atlas failure must preserve fallback art');
check(runtime.includes("haven_delivery_cart:'haven_cart_wood_sacks'"),'Haven delivery cart mapping is missing');
check(runtime.includes("bench_1:'haven_bench_wood_backrest'"),'Haven bench mapping is missing');
check(runtime.includes("haven_east_sign:'haven_signpost_wood_dual'"),'Haven sign mapping is missing');
check(runtime.includes("tavern_table_1:'tavern_table_square'"),'Tavern table mapping is missing');
check(runtime.includes("tavern_shelf_mugs:'tavern_shelf_bottles'"),'Tavern shelf mapping is missing');
check(runtime.includes("tavern_stage_lamp_1:'tavern_hanging_lantern'"),'Tavern lantern mapping is missing');
check(runtime.includes("cellar_keg_1:'tavern_barrel_oak'"),'Cellar barrel mapping is missing');
check(runtime.includes("cellar_crates:'haven_crate_wood'"),'Cellar crate mapping is missing');
check(!runtime.includes("tavern_keg_1:'tavern_barrel_oak'"),'The multi-barrel stack must not stretch one barrel sprite');
check(runtime.includes('copyDefinitionArt'),'current-world entities must lazily inherit art metadata');
check(runtime.includes('tfrGeneratedPropsV167'),'generated props must install after the canonical render chain');
check(!runtime.includes('ChatGPT Image Jul'),'presentation sheets must never load at runtime');
check(!runtime.includes('contact-sheet'),'contact sheets must never load at runtime');

const composition=read('source/src/data/tavern_composition.js');
check(composition.includes("script.src='src/render/runtime_repairs_v167.js?v=167'"),'canonical data load must bootstrap the cache-busted live runtime');
const version=JSON.parse(read('version.json'));
const match=String(version.version||'').match(/^(\d+)\.(\d+)\.(\d+)-dev$/);
check(match,'version must be a development checkpoint');
const [,major,minor,patch]=match.map(Number);
check(major>1||(major===1&&(minor>6||(minor===6&&patch>=6))),'version must identify v1.6.6-dev or later');
console.log(`Hybrid prop atlas validated: ${required.length} assets, ${width}x${height}, ${atlas.length} bytes.`);
