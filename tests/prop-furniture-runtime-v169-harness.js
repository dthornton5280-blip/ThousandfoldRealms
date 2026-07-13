/* Thousandfold Realms v1.6.12+ exact prop/furniture compatibility validation. */
'use strict';
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const exists=relative=>fs.existsSync(path.join(root,relative));
const check=(value,message)=>{if(!value)throw new Error(message);};
const atLeast=(actual,minimum)=>{
  const parse=value=>String(value).replace(/-dev$/,'').split('.').map(Number);
  const a=parse(actual),b=parse(minimum);
  for(let i=0;i<3;i++){if((a[i]||0)!==(b[i]||0))return(a[i]||0)>(b[i]||0);}
  return true;
};

const runtime=read('source/src/render/prop_furniture_runtime_v1612.js');
const composition=read('source/src/data/tavern_composition.js');
const main=read('source/src/main.js');
const version=JSON.parse(read('version.json'));

check(atLeast(version.version,'1.6.12'),'version must identify v1.6.12-dev or later');
check(main.includes("prop_furniture_runtime_v1612.js?v=1612"),'main must continue loading the exact v1.6.12 prop runtime');
check(main.includes('AO.PropFurnitureArtV1612'),'initial game construction must still observe exact prop readiness');
check(composition.includes("runtime_repairs_v167.js?v=167"),'v1.6.7 collision and tactical repairs must remain loaded');
check(!composition.includes('prop_furniture_runtime_v169.js'),'obsolete early prop runtime injection must remain removed');
check(!composition.includes('visible_generated_assets_v168.js'),'mistaken v1.6.8 nature showcase bootstrap must remain removed');
check(!exists('source/src/render/visible_generated_assets_v168.js'),'mistaken v1.6.8 nature showcase runtime must remain deleted');

for(const id of ['haven_generated_oak_north','haven_generated_evergreen_north','haven_generated_autumn_south','haven_generated_bush_south']){
  check(runtime.includes(id),`${id} must be explicitly removed from definitions and existing saves`);
}
check(runtime.includes('haven.objects=haven.objects.filter'),'Haven definitions must remove mistaken showcase nature');
check(runtime.includes('world.entities=world.entities.filter'),'an already-loaded Haven save must remove mistaken showcase nature');

const requiredBindings=[
  "haven_delivery_cart:'haven_cart_wood_sacks'",
  "bench_1:'haven_bench_wood_backrest'","bench_2:'haven_bench_wood_backrest'",
  "haven_east_sign:'haven_signpost_wood_dual'",
  "tavern_shelf_mugs:'tavern_shelf_bottles'","tavern_keg_2:'tavern_barrel_oak'",
  "tavern_supply_crates:'haven_crate_wood'",
  "tavern_table_1:'tavern_table_square'","tavern_table_2:'tavern_table_square'","tavern_table_3:'tavern_table_square'",
  "tavern_stage_lamp_1:'tavern_hanging_lantern'","tavern_stage_lamp_2:'tavern_hanging_lantern'",
  "cellar_keg_1:'tavern_barrel_oak'","cellar_keg_2:'tavern_barrel_oak'","cellar_crates:'haven_crate_wood'",
  "inn_table_1:'tavern_table_square'","inn_table_2:'tavern_table_square'","upper_hall_table:'tavern_table_square'",
  "inn_shelf_guestbook:'tavern_shelf_bottles'","upper_shelf_1:'tavern_shelf_bottles'","upper_shelf_2:'tavern_shelf_bottles'"
];
for(const binding of requiredBindings)check(runtime.includes(binding),`missing required exact prop binding ${binding}`);
check(!runtime.includes("tavern_keg_1:'tavern_barrel_oak'"),'single barrel must not replace the established multi-cask stack');

for(const id of ['tavern_bar_stool_1','tavern_bar_stool_2','tavern_dining_chair_1','tavern_dining_chair_2','inn_guest_chair_1','inn_guest_chair_2','upper_hall_stool']){
  check(runtime.includes(id),`missing logical authored seating ${id}`);
}
for(const position of ['x:4,y:4','x:6,y:4','x:8,y:8','x:19,y:8','x:4,y:9','x:24,y:9','x:15,y:11'])check(runtime.includes(position),`logical seating position ${position} is missing`);

check(runtime.includes('generated-props-atlas-v1612.png?v=1612'),'exact atlas must retain its binary PNG path and cache key');
check(!runtime.includes('generated-props-atlas-v1612.b64'),'runtime must not use the corrupted text atlas');
check(runtime.includes('image.src=new URL(ATLAS_URL,document.baseURI).href'),'exact runtime must load the PNG directly');
check(runtime.includes('imageSmoothingEnabled=false'),'prop sprites must render nearest-neighbor');
check(runtime.includes('tfrExactPropsV1612'),'prop renderer and load hook must remain idempotent');
check(runtime.includes('if(Art.drawEntity(ctx,x,y,entity,mapId))return'),'exact prop art must draw before every prior icon fallback');
check(runtime.includes('syncWorld(window.game?.world)'),'already-loaded saves must receive exact prop bindings after atlas decode');
check(runtime.includes('proto.load=wrapped'),'future map loads must be patched');
check(runtime.includes("assetId==='tavern_barrel_oak'||assetId==='haven_crate_wood'"),'single barrels and crates must normalize to one-cell geometry');
check(runtime.includes('entity.collisionFootprint=[{x:0,y:0}]'),'single barrels and crates must use one-cell collision');
check(runtime.includes("setStatus('ready')"),'runtime readiness must be observable');
check(runtime.includes("setStatus('failed'"),'runtime failure must be observable');
check(!runtime.includes('ChatGPT Image Jul'),'uploaded preview filenames must not be runtime dependencies');
check(!runtime.includes('contact-sheet'),'contact sheets must never load at runtime');

console.log(`Exact prop/furniture compatibility preserved by ${version.version}: binary atlas, bindings, save sync, collision, and renderer fallback protection passed.`);