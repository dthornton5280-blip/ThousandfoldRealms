/* Thousandfold Realms v1.5.4-dev — directional atlas and eastbound road alignment. */
(() => {
  'use strict';
  if (!window.AO || !AO.MapBuilders || !AO.MAP_DEFS || !AO.ATLAS_LOCATIONS) return;

  const W=()=>AO.CONFIG.mapWidth;
  const H=()=>AO.CONFIG.mapHeight;
  const replacePortal=(mapId,ids,portal)=>{
    const def=AO.MAP_DEFS[mapId];
    if(!def)return;
    def.portals ||= [];
    const candidates=Array.isArray(ids)?ids:[ids];
    const index=def.portals.findIndex(item=>candidates.includes(item.id)||item.id===portal.id);
    if(index>=0)def.portals[index]=portal;else def.portals.push(portal);
  };

  /* The regional atlas now follows the same west-to-east progression used by the local maps. */
  const positions={
    haven:[13,55],
    whisperwood:[25,50],
    lantern_mine:[28,24],
    ashen_crypt:[39,43],
    southwood_trail:[37,55],
    mosswater_crossing:[49,58],
    ambermeadow:[60,57],
    eastwatch_approach:[70,53],
    lantern_road:[79,50],
    aurelia:[87,46]
  };
  for(const [id,[x,y]] of Object.entries(positions)){
    const location=AO.ATLAS_LOCATIONS[id];
    if(location){location.x=x;location.y=y;}
  }

  /* Whisperwood branches east toward the crypt and southeast toward Aurelia. */
  const previousWilds=AO.MapBuilders.wilds;
  AO.MapBuilders.wilds=function directionalWhisperwood(){
    const g=previousWilds.call(this);
    for(let y=9;y<=14;y++)g[y][24]='path';
    for(let x=24;x<W();x++)g[14][x]='path';
    g[14][W()-1]='path';
    return g;
  };
  replacePortal('wilds',['wilds_to_southwood'],{id:'wilds_to_southwood',x:29,y:14,to:'southwood_trail',toX:1,toY:9,label:'Southwood Trail'});

  AO.MapBuilders.southwoodTrail=function directionalSouthwood(){
    const g=this.border(this.grid('grass'),'tree');
    for(let x=0;x<W();x++)for(let y=8;y<=10;y++)g[y][x]='path';
    [[3,2],[6,4],[9,3],[21,2],[25,4],[4,13],[8,15],[22,13],[26,15],[12,5],[18,5]].forEach(([x,y])=>g[y][x]='tree');
    [[5,6],[10,13],[20,13],[24,6],[7,11],[22,11]].forEach(([x,y])=>g[y][x]='shrub');
    [[11,4],[18,14],[6,14],[24,3]].forEach(([x,y])=>g[y][x]='flower_patch');
    g[9][0]='path';g[9][W()-1]='path';
    return g;
  };

  AO.MapBuilders.mosswaterCrossing=function directionalMosswater(){
    const g=this.border(this.grid('grass'),'tree');
    for(let y=1;y<H()-1;y++)for(let x=13;x<=17;x++)g[y][x]='water';
    for(let x=0;x<W();x++)for(let y=8;y<=10;y++)g[y][x]='path';
    for(let x=13;x<=17;x++)for(let y=8;y<=10;y++)g[y][x]='bridge';
    for(let y=2;y<H()-2;y+=4){g[y][12]='reeds';g[Math.min(H()-2,y+1)][18]='reeds';}
    [[4,3],[8,5],[22,3],[26,5],[5,14],[9,12],[22,13],[26,15]].forEach(([x,y])=>g[y][x]='tree');
    [[10,5],[20,5],[9,14],[21,13]].forEach(([x,y])=>g[y][x]='rocks');
    g[9][0]='path';g[9][W()-1]='path';
    return g;
  };

  AO.MapBuilders.ambermeadow=function directionalAmbermeadow(){
    const g=this.border(this.grid('grass'),'tree');
    for(let x=0;x<W();x++)for(let y=8;y<=10;y++)g[y][x]='path';
    this.rect(g,2,2,9,5,'flower_patch');
    this.rect(g,19,2,9,5,'grass');
    this.rect(g,2,12,9,4,'grass');
    this.rect(g,19,12,9,4,'flower_patch');
    for(let y=2;y<=6;y++){g[y][12]='fence';g[y][17]='fence';}
    for(let y=12;y<=15;y++){g[y][12]='fence';g[y][17]='fence';}
    [[3,3],[9,5],[20,4],[27,3],[4,13],[10,14],[20,13],[27,15]].forEach(([x,y])=>g[y][x]='tree');
    [[7,7],[22,7],[7,12],[22,12]].forEach(([x,y])=>g[y][x]='shrub');
    g[9][0]='path';g[9][W()-1]='path';
    return g;
  };

  AO.MapBuilders.eastwatchApproach=function directionalEastwatch(){
    const g=this.border(this.grid('grass'),'rocks');
    for(let x=0;x<W();x++)for(let y=8;y<=10;y++)g[y][x]='path';
    this.rect(g,3,3,8,4,'moss_stone');
    this.rect(g,19,2,8,5,'moss_stone');
    this.rect(g,4,12,9,4,'grass');
    this.rect(g,19,12,8,4,'flower_patch');
    [[5,2],[9,6],[4,11],[11,14],[20,3],[25,5],[21,13],[26,14],[12,4],[18,6]].forEach(([x,y])=>g[y][x]='rocks');
    [[6,7],[10,11],[20,11],[24,7]].forEach(([x,y])=>g[y][x]='shrub');
    g[9][0]='path';g[9][W()-1]='path';
    return g;
  };

  replacePortal('southwood_trail',['southwood_to_whisperwood'],{id:'southwood_to_whisperwood',x:0,y:9,to:'wilds',toX:28,toY:14,label:'Whisperwood'});
  replacePortal('southwood_trail',['southwood_to_mosswater'],{id:'southwood_to_mosswater',x:29,y:9,to:'mosswater_crossing',toX:1,toY:9,label:'Mosswater Crossing'});
  replacePortal('mosswater_crossing',['mosswater_to_southwood'],{id:'mosswater_to_southwood',x:0,y:9,to:'southwood_trail',toX:28,toY:9,label:'Southwood Trail'});
  replacePortal('mosswater_crossing',['mosswater_to_ambermeadow'],{id:'mosswater_to_ambermeadow',x:29,y:9,to:'ambermeadow',toX:1,toY:9,label:'Ambermeadow'});
  replacePortal('ambermeadow',['ambermeadow_to_mosswater'],{id:'ambermeadow_to_mosswater',x:0,y:9,to:'mosswater_crossing',toX:28,toY:9,label:'Mosswater Crossing'});
  replacePortal('ambermeadow',['ambermeadow_to_eastwatch'],{id:'ambermeadow_to_eastwatch',x:29,y:9,to:'eastwatch_approach',toX:1,toY:9,label:'Eastwatch Approach'});
  replacePortal('eastwatch_approach',['eastwatch_to_ambermeadow'],{id:'eastwatch_to_ambermeadow',x:0,y:9,to:'ambermeadow',toX:28,toY:9,label:'Ambermeadow'});
  replacePortal('eastwatch_approach',['eastwatch_to_lantern_road'],{id:'eastwatch_to_lantern_road',x:29,y:9,to:'lantern_road',toX:1,toY:9,label:'Lantern Road'});
  replacePortal('lantern_road',['lantern_road_to_eastwatch'],{id:'lantern_road_to_eastwatch',x:0,y:9,to:'eastwatch_approach',toX:28,toY:9,label:'Eastwatch Approach'});

  const entries={
    southwood_trail:{x:1,y:9},mosswater_crossing:{x:1,y:9},ambermeadow:{x:1,y:9},eastwatch_approach:{x:1,y:9},lantern_road:{x:1,y:9},aurelia:{x:2,y:9}
  };
  for(const [id,entry] of Object.entries(entries))if(AO.ATLAS_LOCATIONS[id])AO.ATLAS_LOCATIONS[id].entry=entry;

  AO.MAP_LANDMARKS ||= {};
  AO.MAP_LANDMARKS.wilds=(AO.MAP_LANDMARKS.wilds||[]).filter(item=>item.id!=='landmark_southwood');
  AO.MAP_LANDMARKS.wilds.push({id:'landmark_southwood',x:28,y:14,label:'Southwood Trail',kind:'exit'});
  AO.MAP_LANDMARKS.southwood_trail=[{x:1,y:9,label:'Whisperwood',kind:'exit'},{x:11,y:12,label:'Travelers’ Camp',kind:'hearth'},{x:28,y:9,label:'Mosswater Crossing',kind:'exit'}];
  AO.MAP_LANDMARKS.mosswater_crossing=[{x:1,y:9,label:'Southwood Trail',kind:'exit'},{x:15,y:9,label:'Mosswater Bridge',kind:'bridge'},{x:28,y:9,label:'Ambermeadow',kind:'exit'}];
  AO.MAP_LANDMARKS.ambermeadow=[{x:1,y:9,label:'Mosswater Crossing',kind:'exit'},{x:10,y:12,label:'Meadow Camp',kind:'hearth'},{x:28,y:9,label:'Eastwatch Approach',kind:'exit'}];
  AO.MAP_LANDMARKS.eastwatch_approach=[{x:1,y:9,label:'Ambermeadow',kind:'exit'},{x:9,y:6,label:'Eastwatch Ruin',kind:'ruin'},{x:28,y:9,label:'Lantern Road',kind:'exit'}];
})();
