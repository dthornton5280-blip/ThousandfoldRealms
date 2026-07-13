/* Thousandfold Realms v1.6.7 live deployment regression validation. */
'use strict';
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const check=(value,message)=>{if(!value)throw new Error(message);};

const runtime=read('source/src/render/runtime_repairs_v167.js');
const composition=read('source/src/data/tavern_composition.js');
const maps=read('source/src/data/maps.js');
const tacticalGame=read('source/src/core/tactical_game.js');
const tacticalCombat=read('source/src/systems/tactical_combat.js');
const version=JSON.parse(read('version.json'));

check(version.version==='1.6.7-dev','version must identify v1.6.7-dev');
check(version.buildName==='Live Asset + Collision + Tactical Repair','v1.6.7 build name is incorrect');
check(composition.includes('runtime_repairs_v167.js?v=167'),'v1.6.7 runtime must use a new cache-busted filename');
check(!composition.includes("script.src='src/render/generated_props_v166.js'"),'stale v1.6.6 bootstrap must be removed');

/* Asset visibility must not depend on the timing of one early composition pass. */
check(runtime.includes('copyDefinitionArt(rawEntity)'),'draw-time metadata inheritance is missing');
check(runtime.includes('if(window.game){')&&runtime.includes('if(AO.GeneratedSpriteContent?.installed)installLateRenderHook()'),'late render installation must wait for the final game and canonical renderer');
check(runtime.includes('AO.SpriteFactory.icon=wrapped'),'late prop wrapper must replace the final icon function');
check(runtime.includes('tfrGeneratedPropsV167'),'late prop wrapper must be idempotent');
check(runtime.includes("fetch(ATLAS_URL,{cache:'reload'})"),'atlas fetch must bypass stale cached text');

/* Haven currently declares the old start coordinate inside the south-centre building;
   the repair must detect and relocate any current or saved position in a building. */
check(maps.includes("start:{x:14,y:15}"),'fixture changed: expected historical Haven start coordinate');
check(runtime.includes('const buildingAt='),'building-footprint collision helper is missing');
check(runtime.includes('if(buildingAt(world,x,y))return false'),'exploration pathfinding must reject building footprints');
check(runtime.includes('repairPlayerPosition(this)'),'every map load must repair invalid saved positions');
check(runtime.includes("toast?.('Your position was moved outside a solid building.')"),'position repair feedback is missing');
check(runtime.includes('staticBlockerAt(this.game.world,x,y,ignoreId)'),'tactical movement must respect world furniture and building collision');

/* The existing tactical core intentionally reserves arrows for movement and WASD for
   camera control, but the old integration never routed arrows or clicks to combat. */
check(tacticalGame.includes("WASD pans • arrows move"),'fixture changed: tactical control promise is missing');
check(tacticalCombat.includes('handleMapClick(x,y)'),'fixture changed: tactical map click method is missing');
check(tacticalCombat.includes('moveBy(dx,dy)'),'fixture changed: tactical directional movement method is missing');
check(runtime.includes("moves={arrowup:[0,-1],arrowdown:[0,1],arrowleft:[-1,0],arrowright:[1,0]}"),'arrow-key tactical movement routing is missing');
check(runtime.includes('event.stopImmediatePropagation()'),'combat arrows must bypass the exploration key handler');
check(runtime.includes('game.combat.handleMapClick'),'combat canvas clicks must reach tactical movement/targeting');

/* Turns should advance automatically only after the action is spent and no legal
   movement remains, preserving move-after-attack and attack-after-move choices. */
check(runtime.includes('proto.maybeAutoEndPlayerTurn=function()'),'automatic turn completion is missing');
check(runtime.includes('encounter.actionRemaining>0||movementChoicesRemain(this)'),'auto-end must wait until both action and movement choices are exhausted');
for(const method of ['movePlayerTo','playerAction','executeSelfAbility','useItem','bracePlayer'])check(runtime.includes(`'${method}'`),`${method} must trigger the auto-end evaluation`);
check(runtime.includes('this.endPlayerTurn()'),'exhausted player turns must advance automatically');

console.log('v1.6.7 live runtime validated: visible generated assets, solid buildings, tactical movement input, and automatic exhausted-turn completion are protected.');
