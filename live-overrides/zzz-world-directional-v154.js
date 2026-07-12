/* Thousandfold Realms v1.5.4-dev — final directional route corrections. */
(() => {
  'use strict';
  if (!window.AO || !AO.MapBuilders || !AO.MAP_DEFS) return;

  /* The older Atlas compatibility layer extends a southbound trail after the
     physical road network loads. Remove that obsolete tail so the visible road
     now exits east-southeast exactly where its Southwood portal is located. */
  const wrappedWilds=AO.MapBuilders.wilds;
  if(typeof wrappedWilds==='function'){
    AO.MapBuilders.wilds=function finalDirectionalWhisperwood(){
      const grid=wrappedWilds.call(this);
      for(let y=15;y<AO.CONFIG.mapHeight;y++)if(grid[y]?.[24]==='path')grid[y][24]='grass';
      for(let y=9;y<=14;y++)grid[y][24]='path';
      for(let x=24;x<AO.CONFIG.mapWidth;x++)grid[14][x]='path';
      grid[14][AO.CONFIG.mapWidth-1]='path';
      return grid;
    };
  }

  const southwood=AO.MAP_DEFS.wilds?.portals?.find(portal=>portal.id==='wilds_to_southwood');
  if(southwood)Object.assign(southwood,{x:29,y:14,to:'southwood_trail',toX:1,toY:9,label:'Southwood Trail'});
})();
