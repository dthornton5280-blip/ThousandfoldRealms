const fs=require('fs');
const vm=require('vm');

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

const newMaps=['lantern_road','aurelia_gate','aurelia_market','aurelia_river','aurelia_citadel'];
for(const mapId of newMaps){
  const def=AO.MAP_DEFS[mapId];
  if(!def)throw new Error(`Missing map definition: ${mapId}`);
  const grid=AO.MapBuilders[def.builder]();
  if(grid.length!==18||grid.some(row=>row.length!==30))throw new Error(`Invalid map dimensions: ${mapId}`);
}

const wilds=AO.MapBuilders.wilds();
for(let y=10;y<18;y++)if(wilds[y][24]!=='path')throw new Error(`Whisperwood southern trail is broken at 24,${y}.`);

const game=new AO.Game();
game.ui={closePanel(){if(game.state?.mode==='panel')game.state.mode='explore';},closeDialogue(){},dialogue(){},openPanel(){}};
game.world=new AO.WorldSystem(game);
game.newGame();
game.world.load('haven',14,15);

if(!game.state.atlas?.visitedLocations?.haven)throw new Error('Haven was not registered as visited.');
if(!game.state.atlas?.knownLocations?.whisperwood)throw new Error('The road from Haven did not reveal Whisperwood as known.');
if(game.state.atlas?.visitedLocations?.whisperwood)throw new Error('Whisperwood should not begin as visited.');

/* Known is not the same as visited: the atlas must refuse first-time teleportation. */
game.state.mode='panel';
if(game.atlasTravel('whisperwood'))throw new Error('Fast travel incorrectly allowed an unvisited destination.');
if(game.state.world.mapId!=='haven')throw new Error('Rejected fast travel changed the active map.');
if(!/physically reach/.test(game.lastToast))throw new Error('Rejected travel did not explain the visited requirement.');

/* Simulate physical exploration along the authored road to Aurelia. */
game.state.mode='explore';
game.world.load('wilds',2,9);
game.world.load('lantern_road',1,9);
game.world.load('aurelia_gate',2,9);
if(!game.state.atlas.visitedLocations.aurelia)throw new Error('Physical arrival did not unlock Aurelia.');
if(game.state.atlas.revealedMapAreas.regions.last_lantern_vale.length<4)throw new Error('Regional fog reveal points were not persisted.');
if(!game.state.atlas.revealedMapAreas.world.some(point=>point.id==='last_lantern_vale'))throw new Error('World fog reveal was not persisted.');

/* A visited destination with a fully explored route may now be used. */
game.state.mode='panel';
if(!game.atlasTravel('haven'))throw new Error('Fast travel to a previously visited destination failed.');
if(game.state.mode!=='explore')throw new Error('Atlas travel did not return the game to exploration mode.');
if(game.state.world.mapId!=='haven')throw new Error('Return travel did not arrive in Haven.');
if(game.state.atlas.travelHistory[0]?.hours!==30)throw new Error('Aurelia-to-Haven route should require 30 hours.');
if(game.state.rest.day!==2||game.state.atlas.hourRemainder!==6)throw new Error('Regional travel time did not advance correctly.');

const atlasUI=new AO.UI(game);
atlasUI.atlasSelectedLocation='ashen_crypt';
atlasUI.renderRegionAtlas();
const regionMarkup=atlasUI.e.panelBody.innerHTML;
if(!regionMarkup.includes('atlas-pixel-grid')||!regionMarkup.includes('atlas-fog-layer'))throw new Error('Regional pixel terrain or fog layer is missing.');
if(!regionMarkup.includes('Regional Map Key'))throw new Error('Regional legend is missing.');
if(regionMarkup.includes('data-atlas-travel="ashen_crypt"'))throw new Error('An unvisited dungeon exposed a fast-travel action.');

atlasUI.renderWorldAtlas();
const worldMarkup=atlasUI.e.panelBody.innerHTML;
if(!worldMarkup.includes('atlas-pixel-grid')||!worldMarkup.includes('atlas-fog-layer'))throw new Error('World pixel terrain or fog layer is missing.');
if(!worldMarkup.includes('World Map Key'))throw new Error('World legend is missing.');

console.log(`Living Atlas harness passed: ${newMaps.length} new maps, visited-only travel, persistent fog, pixel terrain, and legends verified.`);
