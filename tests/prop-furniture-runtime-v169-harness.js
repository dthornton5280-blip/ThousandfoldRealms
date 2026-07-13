/* Thousandfold Realms v1.6.9 authoritative prop/furniture validation. */
'use strict';
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const exists=relative=>fs.existsSync(path.join(root,relative));
const check=(value,message)=>{if(!value)throw new Error(message);};

const runtime=read('source/src/render/prop_furniture_runtime_v169.js');
const composition=read('source/src/data/tavern_composition.js');
const version=JSON.parse(read('version.json'));

check(version.version==='1.6.9-dev','version must identify v1.6.9-dev');
check(version.buildName==='Authoritative Prop + Furniture Integration','v1.6.9 build name is incorrect');
check(composition.includes("prop_furniture_runtime_v169.js?v=169"),'composition must load the cache-busted v1.6.9 prop runtime');
check(composition.includes("runtime_repairs_v167.js?v=167"),'v1.6.7 collision and tactical repairs must remain loaded');
check(!composition.includes('visible_generated_assets_v168.js'),'mistaken v1.6.8 nature showcase bootstrap must be removed');
check(!exists('source/src/render/visible_generated_assets_v168.js'),'mistaken v1.6.8 nature showcase runtime must be deleted');
check(!exists('tests/visible-generated-assets-v168-harness.js'),'obsolete v1.6.8 nature test must be deleted');

for(const id of ['haven_generated_oak_north','haven_generated_evergreen_north','haven_generated_autumn_south','haven_generated_bush_south']){
  check(runtime.includes(id),`${id} must be explicitly removed from definitions and existing saves`);
}
check(runtime.includes("haven.objects=haven.objects.filter"),'Haven definitions must remove mistaken showcase nature');
check(runtime.includes("world.entities=world.entities.filter"),'an already-loaded Haven save must remove mistaken showcase nature');

const requiredBindings=[
  "haven_delivery_cart:'haven_cart_wood_sacks'",
  "bench_1:'haven_bench_wood_backrest'","bench_2:'haven_bench_wood_backrest'",
  "haven_east_sign:'haven_signpost_wood_dual'",
  "tavern_shelf_mugs:'tavern_shelf_bottles'","tavern_keg_2:'tavern_barrel_oak'",
  "tavern_supply_crates:'haven_crate_wood'",
  "tavern_table_1:'tavern_table_square'","tavern_table_2:'tavern_table_square'","tavern_table_3:'tavern_table_square'",
  "tavern_stage_lamp_1:'tavern_hanging_lantern'","tavern_stage_lamp_2:'tavern_hanging_lantern'",
  "cellar_keg_1:'tavern_barrel_oak'","cellar_keg_2:'tavern_barrel_oak'","cellar_crates:'haven_crate_wood'",
  "inn_table_1:'tavern_table_square'","inn_table_2:'tavern_table_square'","upper_hall_table:'tavern_table_square'"
];
for(const binding of requiredBindings)check(runtime.includes(binding),`missing required prop binding ${binding}`);
check(!runtime.includes("tavern_keg_1:'tavern_barrel_oak'"),'single barrel must not replace the established multi-cask stack');

for(const id of ['tavern_bar_stool_1','tavern_bar_stool_2','tavern_dining_chair_1','tavern_dining_chair_2','inn_guest_chair_1','inn_guest_chair_2','upper_hall_stool']){
  check(runtime.includes(id),`missing logical authored seating ${id}`);
}
for(const position of ['x:4,y:4','x:6,y:4','x:8,y:8','x:19,y:8','x:4,y:9','x:24,y:9','x:15,y:11'])check(runtime.includes(position),`logical seating position ${position} is missing`);

check(runtime.includes("fetch(ATLAS_URL,{cache:'reload'})"),'v1.6.9 must bypass stale atlas cache');
check(runtime.includes("generated-props-atlas-v166.b64?v=169"),'v1.6.9 must use a new cache key for the approved atlas');
check(runtime.includes('imageSmoothingEnabled=false'),'prop sprites must render nearest-neighbor');
check(runtime.includes('AO.SpriteFactory.icon=wrapped'),'prop runtime must wrap the final icon renderer');
check(runtime.includes('tfrPropFurnitureV169'),'prop renderer and load hook must be idempotent');
check(runtime.includes('if(Art.drawEntity(ctx,x,y,entity,mapId))return'),'approved prop art must draw before every prior fallback');
check(runtime.includes('syncWorld(window.game?.world)'),'already-loaded saves must receive prop bindings after atlas decode');
check(runtime.includes('proto.load=wrapped'),'future map loads must be patched');
check(runtime.includes("['cellar_keg_1','cellar_keg_2','cellar_crates']"),'cellar single-object footprints must be normalized');
check(runtime.includes("entity.collisionFootprint=[{x:0,y:0}]"),'single barrels and crate must use one-cell collision');
check(runtime.includes('established fallback art remains active'),'atlas failure must preserve fallback art');
check(!runtime.includes('ChatGPT Image Jul'),'presentation sheets must never load at runtime');
check(!runtime.includes('contact-sheet'),'contact sheets must never load at runtime');

console.log('v1.6.9 prop/furniture integration validated: mistaken town nature removed; exterior, tavern, cellar, inn, seating, existing-save sync, render priority, and fallback behavior are protected.');
