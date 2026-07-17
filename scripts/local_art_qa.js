/* Local preview helper; copied only into deployment-shaped developer builds. */
(() => {
  'use strict';
  if(!['127.0.0.1','localhost'].includes(location.hostname))return;
  const params=new URLSearchParams(location.search),mapId=params.get('artqaMap');
  if(!mapId)return;
  const destinations={wilds:{x:2,y:9},haven:{x:14,y:15}};
  const timer=setInterval(()=>{
    const game=window.game,definition=window.AO?.MAP_DEFS?.[mapId],fallback=definition?.start,destination={x:Number(params.get('artqaX')??destinations[mapId]?.x??fallback?.x),y:Number(params.get('artqaY')??destinations[mapId]?.y??fallback?.y)};
    if(!game?.state?.world||!game.world||!window.AO?.MAP_DEFS?.[mapId])return;
    if(!Number.isFinite(destination.x)||!Number.isFinite(destination.y))return;
    if(game.state.mode!=='explore')return;
    clearInterval(timer);
    game.world.load(mapId,destination.x,destination.y);
    game.ui?.showGame?.();game.ui?.updateHud?.();
    document.documentElement.dataset.tfrLocalArtQa=mapId;
    if(mapId==='haven'){
      const origin={x:14,y:8},doors=game.world.entities.filter(entity=>entity.type==='door'&&entity.integratedBuildingDoor),results={};
      for(const door of doors)results[door.id]=AO.Pathfinder.nearestAdjacent(game.world,origin,door,'player').length;
      const failed=Object.entries(results).filter(([,length])=>!length).map(([id])=>id);
      document.documentElement.dataset.tfrEntranceQa=failed.length?`failed:${failed.join(',')}`:'passed';
      document.documentElement.dataset.tfrEntrancePaths=JSON.stringify(results);
      if(failed.length){
        const door=doors.find(entry=>entry.id===failed[0]),spots=AO.EntityGeometry.adjacentCells(game.world,door,Math.max(1,Number(door.interactionRange)||1),'player');
        document.documentElement.dataset.tfrEntranceDebug=JSON.stringify({door:{id:door.id,x:door.x,y:door.y},origin,spots,spotPaths:spots.map(spot=>({spot,length:AO.Pathfinder.path(game.world,origin,spot,'player').length})),blockers:game.world.entities.filter(entity=>entity.blocking!==false&&!entity.hidden&&entity.type!=='door').map(entity=>({id:entity.id,x:entity.x,y:entity.y,footprint:entity.collisionFootprint}))});
      }
    }
  },100);
})();
