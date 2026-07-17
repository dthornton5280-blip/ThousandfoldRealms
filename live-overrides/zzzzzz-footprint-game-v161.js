/* Thousandfold Realms v1.6.1-dev — temporary Game bridge for multi-tile E interactions.
   Fold this into source/src/core/game.js when the remaining live overrides are consolidated. */
(() => {
  'use strict';
  if(!window.AO||!AO.Game||!AO.EntityGeometry)return;
  AO.Game.prototype.interactNearest=function(){
    if(this.state?.mode!=='explore')return;
    const position=this.world.playerPos(),priority=entity=>entity.type==='door'?0:entity.type==='npc'?1:entity.type==='enemy'?2:3,targets=this.world.entities
      .filter(entity=>!entity.hidden&&entity.type!=='portal'&&AO.EntityGeometry.distance(position,entity,true)<=1)
      .sort((a,b)=>priority(a)-priority(b)||AO.EntityGeometry.distance(position,a,true)-AO.EntityGeometry.distance(position,b,true));
    if(targets[0])this.world.interact(targets[0]);
    else this.toast('Nothing nearby to interact with.');
  };
})();
