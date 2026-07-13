/* Thousandfold Realms v1.6.8 visible generated asset placement validation. */
'use strict';
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const check=(value,message)=>{if(!value)throw new Error(message);};

const runtime=read('source/src/render/visible_generated_assets_v168.js');
const composition=read('source/src/data/tavern_composition.js');
const renderer=read('source/src/render/thousandfold_renderer.js');
const version=JSON.parse(read('version.json'));

check(version.version==='1.6.8-dev','version must identify v1.6.8-dev');
check(version.buildName==='Visible Generated Asset Placement','v1.6.8 build name is incorrect');
check(composition.includes("visible_generated_assets_v168.js?v=168"),'composition must load the cache-busted v1.6.8 visual pass');
check(composition.includes("runtime_repairs_v167.js?v=167"),'v1.6.7 collision and tactical repairs must remain loaded');

const expected={
  haven_generated_oak_north:'haven_tree_deciduous_green',
  haven_generated_evergreen_north:'haven_tree_evergreen',
  haven_generated_autumn_south:'haven_tree_autumn',
  haven_generated_bush_south:'haven_bush_round_green'
};
for(const [entityId,assetId] of Object.entries(expected)){
  check(runtime.includes(entityId),`missing visible Haven entity ${entityId}`);
  check(runtime.includes(assetId),`missing generated art binding ${assetId}`);
  check(renderer.includes(assetId),`${assetId} is not available in the established v1.6.5 atlas`);
}

check(runtime.includes("x:10,y:6"),'north oak must occupy the western building gap');
check(runtime.includes("x:19,y:6"),'north evergreen must occupy the eastern building gap');
check(runtime.includes("x:10,y:16"),'autumn tree must be visible in the southern lane');
check(runtime.includes("x:19,y:16"),'generated bush must be visible in the southern lane');
check(runtime.includes('collisionFootprint:[{x:0,y:0}]'),'visible scenery must have explicit one-cell collision');
check(runtime.includes('syncWorld(window.game.world)'),'an already-loaded save must receive the new visible entities');
check(runtime.includes('tfrVisibleGeneratedAssetsV168'),'future map loads must be patched idempotently');
check(runtime.includes('AO.LiveRuntimeV167?.worldCollisionInstalled'),'visual placement must wait for the established building-collision repair');
check(!runtime.includes('ChatGPT Image Jul'),'presentation sheets must never be loaded at runtime');
check(!runtime.includes('contact-sheet'),'contact sheets must never be loaded at runtime');

console.log('v1.6.8 visible generated assets validated: four missing nature sprites are placed directly in Haven while v1.6.7 repairs remain active.');
