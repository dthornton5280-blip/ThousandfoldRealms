const fs=require('fs');
const vm=require('vm');
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

global.window=global;
global.document={activeElement:null};
global.performance={now:()=>0};
global.addEventListener=()=>{};

const panelBody=()=>({querySelectorAll:()=>[],querySelector:()=>null,insertAdjacentHTML(){},set innerHTML(value){this.value=value;},get innerHTML(){return this.value||'';}});
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
  NPCS:{},MAP_LANDMARKS:{wilds:[]},
  UI:class{constructor(game){this.game=game;this.e={panelBody:panelBody(),panelTitle:{}};}renderMap(){}closePanel(){}},
  WorldSystem:class{constructor(game){this.game=game;}load(mapId,x,y){this.game.state.world={...this.game.state.world,mapId,x:x??0,y:y??0};}},
  Game:class{newGame(){this.state={mode:'explore',world:{mapId:'haven',x:0,y:0},rest:{day:1},log:[]};}migrateState(){}dialogue(){}saveGame(){}toast(){}log(){}}
};

for(const file of [
  'live-overrides/world-atlas-v150.js',
  'live-overrides/world-atlas-v152-exploration.js',
  'live-overrides/world-atlas-v152-travel-copy.js',
  'live-overrides/world-travel-network-v153.js',
  'live-overrides/world-travel-network-v153a-tiles.js',
  'live-overrides/world-travel-network-v154-directional.js',
  'live-overrides/zz-world-atlas-v150-fixes.js',
  'live-overrides/zzz-world-directional-v154.js'
])vm.runInThisContext(fs.readFileSync(file,'utf8'),{filename:file});

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

const eastbound=['haven','whisperwood','southwood_trail','mosswater_crossing','ambermeadow','eastwatch_approach','lantern_road','aurelia'];
for(let i=1;i<eastbound.length;i++){
  const previous=AO.ATLAS_LOCATIONS[eastbound[i-1]],current=AO.ATLAS_LOCATIONS[eastbound[i]];
  assert(previous&&current,`Missing atlas location in eastbound chain: ${eastbound[i]}`);
  assert(current.x>previous.x,`${current.name} must plot east of ${previous.name}.`);
}

const forwardPortals=[
  ['haven','haven_to_wilds','wilds',29],
  ['wilds','wilds_to_southwood','southwood_trail',29],
  ['southwood_trail','southwood_to_mosswater','mosswater_crossing',29],
  ['mosswater_crossing','mosswater_to_ambermeadow','ambermeadow',29],
  ['ambermeadow','ambermeadow_to_eastwatch','eastwatch_approach',29],
  ['eastwatch_approach','eastwatch_to_lantern_road','lantern_road',29],
  ['lantern_road','lantern_road_to_aurelia','aurelia_gate',29]
];
for(const [mapId,portalId,target,edgeX] of forwardPortals){
  const portal=AO.MAP_DEFS[mapId]?.portals?.find(item=>item.id===portalId);
  assert(portal&&portal.to===target,`Missing eastbound portal ${mapId}/${portalId} → ${target}.`);
  assert(portal.x===edgeX,`${mapId}/${portalId} must leave from the east edge.`);
}

const crossings={
  southwood_trail:[{x:0,y:9},{x:29,y:9}],
  mosswater_crossing:[{x:0,y:9},{x:29,y:9}],
  ambermeadow:[{x:0,y:9},{x:29,y:9}],
  eastwatch_approach:[{x:0,y:9},{x:29,y:9}],
  lantern_road:[{x:0,y:9},{x:29,y:9}]
};
for(const [mapId,[west,east]] of Object.entries(crossings)){
  const def=AO.MAP_DEFS[mapId],builder=AO.MapBuilders[def.builder];
  assert(typeof builder==='function',`Missing builder for ${mapId}.`);
  const grid=builder.call(AO.MapBuilders);
  assert(grid.length===18&&!grid.some(row=>row.length!==30),`${mapId} is not 30×18.`);
  assert(walkable(grid,west.x,west.y)&&walkable(grid,east.x,east.y),`${mapId} has a blocked road edge.`);
  assert(connected(grid,west,east),`${mapId} lacks a continuous west-to-east road.`);
}

const wilds=AO.MapBuilders.wilds.call(AO.MapBuilders);
assert(connected(wilds,{x:0,y:9},{x:29,y:14}),'Whisperwood does not connect Haven to the east-southeast Southwood exit.');
assert(AO.MAP_DEFS.wilds.portals.find(portal=>portal.id==='wilds_to_southwood')?.x===29,'Whisperwood Southwood portal is not on the east edge.');

const css=fs.readFileSync('live-overrides/world-atlas-v154-directional.css','utf8');
for(const token of ['calc(100dvh - 300px)','overflow:auto','atlas-compass::before','atlas-compass::after'])assert(css.includes(token),`Directional Atlas CSS is missing ${token}.`);

console.log('Directional Atlas harness passed: map coordinates, east/west exits, continuous roads, and fitted layout verified.');
