/* Thousandfold Realms v1.6.5 generated sprite atlas validation. */
'use strict';
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const manifest=JSON.parse(read('source/assets/thousandfold/generated/atlas-manifest.json'));
const atlasPath=path.join(root,'source/assets/thousandfold/generated',manifest.atlas.file);
const atlas=fs.readFileSync(atlasPath);
const fail=message=>{throw new Error(message);};
const check=(value,message)=>{if(!value)fail(message);};

check(atlas.slice(1,4).toString()==='PNG','generated atlas must be a PNG');
const width=atlas.readUInt32BE(16),height=atlas.readUInt32BE(20);
check(width===manifest.atlas.width&&height===manifest.atlas.height,'atlas dimensions must match manifest');
check(atlas.length<300000,'runtime atlas must remain compact');

const required=[
  'haven_tree_deciduous_green','haven_tree_evergreen','haven_tree_autumn',
  'haven_bush_round_green','haven_lamppost_hanging_lantern',
  'haven_well_stone_roofed','haven_market_stall_green_awning',
  'haven_tavern_exterior','tavern_fireplace_stone'
];
for(const id of required){
  const asset=manifest.assets[id];
  check(asset,`missing manifest asset ${id}`);
  const r=asset.sourceRect;
  check(r.x>=0&&r.y>=0&&r.w>0&&r.h>0,`${id} has invalid source rectangle`);
  check(r.x+r.w<=width&&r.y+r.h<=height,`${id} crop leaves atlas bounds`);
  check(r.x>0&&r.y>0&&r.x+r.w<width&&r.y+r.h<height,`${id} unexpectedly touches atlas boundary`);
}
const renderer=read('source/src/render/thousandfold_renderer.js');
for(const id of required)check(renderer.includes(id),`${id} is not registered by the runtime`);
check(renderer.includes("imageSmoothingEnabled=false"),'generated sprites must render nearest-neighbor');
check(renderer.includes('procedural fallback remains active'),'atlas load failure must retain fallback');
check(renderer.indexOf('GeneratedSpriteArt?.drawEntity')<renderer.indexOf('ThousandfoldArt?.drawEntity'),'generated entity art must run before procedural fallback');
check(renderer.indexOf('GeneratedSpriteArt?.drawBuilding')<renderer.indexOf('ThousandfoldArt?.drawBuilding'),'generated building art must run before procedural fallback');
check(renderer.includes("patch('tavern','tavern_fire','tavern_fireplace_stone')"),'Black Lantern hearth must use generated fireplace');
check(renderer.includes("tavern.generatedArtId='haven_tavern_exterior'"),'Black Lantern exterior must use generated landmark');
check(renderer.includes("grid[y][x]='grass'"),'large scenery must replace the underlying small procedural tile');
check(renderer.includes("collisionFootprint:[{x:0,y:0}]"),'large scenery must retain a deliberate one-cell physical base');
check(!renderer.includes('ChatGPT Image Jul'), 'presentation sheets must not be referenced at runtime');

const version=JSON.parse(read('version.json'));
check(version.version==='1.6.5-dev','version must identify the v1.6.5 checkpoint');
console.log(`v1.6.5 generated sprite atlas validated: ${required.length} assets, ${width}x${height}, ${atlas.length} bytes.`);
