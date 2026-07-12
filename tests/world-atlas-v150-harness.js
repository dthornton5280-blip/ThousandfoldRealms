const fs=require('fs');
const vm=require('vm');

const mode=process.argv[2]||'all';
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

global.window=global;
global.document={activeElement:null};
global.performance={now:()=>0};
global.addEventListener=()=>{};

const panelBody=()=>({
  querySelectorAll:()=>[],querySelector:()=>null,insertAdjacentHTML(){},
  set innerHTML(value){this.value=value;},get innerHTML(){return this.value||'';}
});

const AO=global.AO={
  CONFIG:{mapWidth:30,mapHeight:18},
  MapBuilders:{
    grid(fill='grass'){return Array.from({length:18},()=>Array(30).fill(fill));},
    border(grid,tile='wall'){
      for(let x=0;x<30;x++){grid[0][x]=tile;grid[17][x]=tile;}
      for(let y=0;y<18;y++){grid[y][0]=tile;grid[y][29]=tile;}
      return grid;
    },
    rect(grid,x,y,w,h,tile){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)if(grid[yy]?.[xx]!=null)grid[yy][xx]=tile;},
    wilds(){
      const grid=this.border(this.grid('grass'),'tree');
      for(let x=0;x<30;x++)grid[9][x]='path';
      for(let y=0;y<=9;y++)grid[y][24]='path';
      return grid;
    }
  },
  MAP_DEFS:{
    haven:{id:'haven',portals:[{id:'haven_to_wilds',x:29,y:8,to:'wilds',toX:1,toY:9,label:'Whisperwood Road'}],objects:[]},
    wilds:{id:'wilds',portals:[
      {id:'wilds_to_haven',x:0,y:9,to:'haven',toX:28,toY:8,label:'Haven'},
      {id:'wilds_to_crypt',x:29,y:9,to:'crypt',toX:1,toY:9,label:'Ashen Crypt'},
      {id:'wilds_to_mine',x:24,y:0,to:'lantern_mine',toX:1,toY:9,label:'Lantern Mine'}
    ],objects:[]},
    lantern_mine:{id:'lantern_mine',portals:[],objects:[]},
    crypt:{id:'crypt',portals:[],objects:[]}
  },
  NPCS:{},
  MAP_LANDMARKS:{wilds:[]},
  UI:class{
    constructor(game){this.game=game;this.e={panelBody:panelBody(),panelTitle:{}};}
    renderMap(){}
    closePanel(){if(this.game.state?.mode==='panel')this.game.state.mode='explore';}
  },
  WorldSystem:class{
    constructor(game){this.game=game;}
    load(mapId,x,y){this.game.state.world={...this.game.state.world,mapId,x:x??0,y:y??0};}
  },
  Game:class{
    newGame(){this.state={mode:'explore',world:{mapId:'haven',x:0,y:0},rest:{day:1},log:[]};}
    migrateState(){}
    dialogue(){}
    saveGame(){}
    toast(text){this.lastToast=text;}
    log(text){this.state.log.unshift(text);}
  }
};

vm.runInThisContext(fs.readFileSync('live-overrides/world-atlas-v150.js','utf8'));
vm.runInThisContext(fs.readFileSync('live-overrides/world-atlas-v152-exploration.js','utf8'));
vm.runInThisContext(fs.readFileSync('live-overrides/world-atlas-v152-travel-copy.js','utf8'));
vm.runInThisContext(fs.readFileSync('live-overrides/world-travel-network-v153.js','utf8'));
vm.runInThisContext(fs.readFileSync('live-overrides/zz-world-atlas-v150-fixes.js','utf8'));

const blocked=new Set(['tree','stonewall','water','lilywater','roof','woodwall','bar','cliff_face','waterfall','rocks','shrub','fence','reeds','wall']);
const walkable=(grid,x,y)=>x>=0&&y>=0&&x<30&&y<18&&!blocked.has(grid[y]?.[x]);
const connected=(grid,start,end)=>{
  const key=point=>`${point.x},${point.y}`;
  const queue=[start],seen=new Set([key(start)]);
  while(queue.length){
    const point=queue.shift();
    if(point.x===end.x&&point.y===end.y)return true;
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const next={x:point.x+dx,y:point.y+dy},id=key(next);
      if(seen.has(id)||!walkable(grid,next.x,next.y))continue;
      seen.add(id);queue.push(next);
    }
  }
  return false;
};

const routeMaps=['wilds','southwood_trail','mosswater_crossing','ambermeadow','eastwatch_approach','lantern_road'];
const validateMaps=()=>{
  const allMaps=['lantern_road','aurelia_gate','aurelia_market','aurelia_river','aurelia_citadel','southwood_trail','mosswater_crossing','ambermeadow','eastwatch_approach'];
  for(const mapId of allMaps){
    const def=AO.MAP_DEFS[mapId];
    assert(def,`Missing map definition: ${mapId}`);
    const grid=AO.MapBuilders[def.builder]();
    assert(grid.length===18&&!grid.some(row=>row.length!==30),`Invalid map dimensions: ${mapId}`);
    for(const portal of def.portals||[])assert(walkable(grid,portal.x,portal.y),`Portal ${mapId}/${portal.id} is on blocked terrain.`);
  }

  const wilds=AO.MapBuilders.wilds();
  for(let y=10;y<18;y++)assert(wilds[y][24]==='path',`Whisperwood southern trail is broken at 24,${y}.`);
  assert(!AO.MAP_DEFS.wilds.portals.some(portal=>portal.to==='lantern_road'),'Whisperwood still bypasses the wilderness route.');

  const crossings={
    wilds:[{x:0,y:9},{x:24,y:17}],
    southwood_trail:[{x:15,y:0},{x:15,y:17}],
    mosswater_crossing:[{x:15,y:0},{x:15,y:17}],
    ambermeadow:[{x:15,y:0},{x:15,y:17}],
    eastwatch_approach:[{x:15,y:0},{x:29,y:9}],
    lantern_road:[{x:0,y:9},{x:29,y:9}]
  };
  for(const [mapId,[start,end]] of Object.entries(crossings)){
    const def=AO.MAP_DEFS[mapId],grid=AO.MapBuilders[def.builder]();
    assert(connected(grid,start,end),`${mapId} does not contain a continuous walkable road between its exits.`);
  }

  const chain=[
    ['haven','haven_to_wilds','wilds'],
    ['wilds','wilds_to_southwood','southwood_trail'],
    ['southwood_trail','southwood_to_mosswater','mosswater_crossing'],
    ['mosswater_crossing','mosswater_to_ambermeadow','ambermeadow'],
    ['ambermeadow','ambermeadow_to_eastwatch','eastwatch_approach'],
    ['eastwatch_approach','eastwatch_to_lantern_road','lantern_road'],
    ['lantern_road','lantern_road_to_aurelia','aurelia_gate']
  ];
  for(const [mapId,portalId,target] of chain){
    const portal=AO.MAP_DEFS[mapId]?.portals?.find(item=>item.id===portalId);
    assert(portal&&portal.to===target,`Missing physical route ${mapId}/${portalId} → ${target}.`);
  }
};

const createGame=()=>{
  const game=new AO.Game();
  game.ui={closePanel(){if(game.state?.mode==='panel')game.state.mode='explore';},closeDialogue(){},dialogue(){},openPanel(){}};
  game.world=new AO.WorldSystem(game);
  game.newGame();
  game.world.load('haven',14,15);
  return game;
};

const verifyInitialProgression=game=>{
  assert(game.state.atlas?.visitedLocations?.haven,'Haven was not registered as visited.');
  assert(game.state.atlas?.knownLocations?.whisperwood,'The road from Haven did not reveal Whisperwood as known.');
  assert(!game.state.atlas?.visitedLocations?.whisperwood,'Whisperwood should not begin as visited.');
  game.state.mode='panel';
  assert(!game.atlasTravel('whisperwood'),'Fast travel incorrectly allowed an unvisited destination.');
  assert(game.state.world.mapId==='haven','Rejected fast travel changed the active map.');
  assert(/physically reach/.test(game.lastToast),'Rejected travel did not explain the visited requirement.');
};

const physicallyReachAurelia=game=>{
  game.state.mode='explore';
  const journey=['wilds','southwood_trail','mosswater_crossing','ambermeadow','eastwatch_approach','lantern_road','aurelia_gate'];
  const entries={wilds:[1,9],southwood_trail:[15,1],mosswater_crossing:[15,1],ambermeadow:[15,1],eastwatch_approach:[15,1],lantern_road:[1,9],aurelia_gate:[2,9]};
  for(const mapId of journey){const [x,y]=entries[mapId];game.world.load(mapId,x,y);}
  const visited=['whisperwood','southwood_trail','mosswater_crossing','ambermeadow','eastwatch_approach','lantern_road','aurelia'];
  for(const locationId of visited)assert(game.state.atlas.visitedLocations[locationId],`Physical arrival did not unlock ${locationId}.`);
  assert(game.state.atlas.revealedMapAreas.regions.last_lantern_vale.length>=8,'Regional fog reveal points were not persisted across the road journey.');
  assert(game.state.atlas.revealedMapAreas.world.some(point=>point.id==='last_lantern_vale'),'World fog reveal was not persisted.');
};

const verifyReturnTravel=game=>{
  game.state.mode='panel';
  assert(game.atlasTravel('haven'),'Fast travel to a previously visited destination failed.');
  assert(game.state.mode==='explore','Atlas travel did not return the game to exploration mode.');
  assert(game.state.world.mapId==='haven','Return travel did not arrive in Haven.');
  assert(game.state.atlas.travelHistory[0]?.hours===30,'Aurelia-to-Haven route should require 30 hours.');
  assert(game.state.rest.day===2&&game.state.atlas.hourRemainder===6,'Regional travel time did not advance correctly.');
};

const verifyRendering=game=>{
  const atlasUI=new AO.UI(game);
  atlasUI.atlasSelectedLocation='southwood_trail';
  atlasUI.renderRegionAtlas();
  const regionMarkup=atlasUI.e.panelBody.innerHTML;
  assert(regionMarkup.includes('atlas-pixel-grid')&&regionMarkup.includes('atlas-fog-layer'),'Regional pixel terrain or fog layer is missing.');
  assert(regionMarkup.includes('Regional Map Key'),'Regional legend is missing.');
  for(const name of ['Southwood Trail','Mosswater Crossing','Ambermeadow','Eastwatch Approach'])assert(regionMarkup.includes(name),`Regional atlas is missing ${name}.`);
  atlasUI.renderWorldAtlas();
  const worldMarkup=atlasUI.e.panelBody.innerHTML;
  assert(worldMarkup.includes('atlas-pixel-grid')&&worldMarkup.includes('atlas-fog-layer'),'World pixel terrain or fog layer is missing.');
  assert(worldMarkup.includes('World Map Key'),'World legend is missing.');
};

validateMaps();
const game=createGame();
verifyInitialProgression(game);
if(mode==='initial'){console.log('Atlas initial-progression stage passed.');process.exit(0);}
physicallyReachAurelia(game);
if(mode==='render'){verifyRendering(game);console.log('Atlas rendering stage passed.');process.exit(0);}
verifyReturnTravel(game);
if(mode==='travel'){console.log('Atlas physical-route and fast-travel stage passed.');process.exit(0);}
verifyRendering(game);
console.log(`Living Atlas harness passed: ${routeMaps.length} connected road maps, physical travel, visited-only fast travel, fog, terrain, and legends verified.`);
