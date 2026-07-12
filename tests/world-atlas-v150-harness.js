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
    wilds(){return this.border(this.grid('grass'),'tree');}
  },
  MAP_DEFS:{haven:{},wilds:{portals:[]},lantern_mine:{},crypt:{}},
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
vm.runInThisContext(fs.readFileSync('live-overrides/zz-world-atlas-v150-fixes.js','utf8'));

const validateMaps=()=>{
  const newMaps=['lantern_road','aurelia_gate','aurelia_market','aurelia_river','aurelia_citadel'];
  for(const mapId of newMaps){
    const def=AO.MAP_DEFS[mapId];
    assert(def,`Missing map definition: ${mapId}`);
    const grid=AO.MapBuilders[def.builder]();
    assert(grid.length===18&&!grid.some(row=>row.length!==30),`Invalid map dimensions: ${mapId}`);
  }
  const wilds=AO.MapBuilders.wilds();
  for(let y=10;y<18;y++)assert(wilds[y][24]==='path',`Whisperwood southern trail is broken at 24,${y}.`);
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
  game.world.load('wilds',2,9);
  game.world.load('lantern_road',1,9);
  game.world.load('aurelia_gate',2,9);
  assert(game.state.atlas.visitedLocations.aurelia,'Physical arrival did not unlock Aurelia.');
  assert(game.state.atlas.revealedMapAreas.regions.last_lantern_vale.length>=4,'Regional fog reveal points were not persisted.');
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
  atlasUI.atlasSelectedLocation='ashen_crypt';
  atlasUI.renderRegionAtlas();
  const regionMarkup=atlasUI.e.panelBody.innerHTML;
  assert(regionMarkup.includes('atlas-pixel-grid')&&regionMarkup.includes('atlas-fog-layer'),'Regional pixel terrain or fog layer is missing.');
  assert(regionMarkup.includes('Regional Map Key'),'Regional legend is missing.');
  assert(!regionMarkup.includes('data-atlas-travel="ashen_crypt"'),'An unvisited dungeon exposed a fast-travel action.');
  atlasUI.renderWorldAtlas();
  const worldMarkup=atlasUI.e.panelBody.innerHTML;
  assert(worldMarkup.includes('atlas-pixel-grid')&&worldMarkup.includes('atlas-fog-layer'),'World pixel terrain or fog layer is missing.');
  assert(worldMarkup.includes('World Map Key'),'World legend is missing.');
};

validateMaps();
const game=createGame();
verifyInitialProgression(game);

if(mode==='initial'){
  console.log('Atlas initial-progression stage passed.');
  process.exit(0);
}

physicallyReachAurelia(game);

if(mode==='render'){
  verifyRendering(game);
  console.log('Atlas rendering stage passed.');
  process.exit(0);
}

verifyReturnTravel(game);
if(mode==='travel'){
  console.log('Atlas travel stage passed.');
  process.exit(0);
}

verifyRendering(game);
console.log('Living Atlas harness passed: map definitions, visited-only travel, persistent fog, pixel terrain, and legends verified.');
