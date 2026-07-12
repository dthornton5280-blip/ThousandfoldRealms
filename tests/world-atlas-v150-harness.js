const fs=require('fs');
const vm=require('vm');

global.window=global;
global.document={activeElement:null};
global.performance={now:()=>0};
global.addEventListener=()=>{};

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
    constructor(game){this.game=game;this.e={panelBody:{querySelectorAll:()=>[],querySelector:()=>null,insertAdjacentHTML(){},set innerHTML(value){this.value=value;},get innerHTML(){return this.value||'';}},panelTitle:{}};}
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

if(!game.state.atlas?.visitedLocations?.haven)throw new Error('Haven was not registered in the atlas.');
if(!game.state.atlas?.knownLocations?.aurelia)throw new Error('Aurelia was not seeded as a known destination.');

game.state.mode='panel';
if(!game.atlasTravel('aurelia'))throw new Error('Regional travel from the open atlas panel failed.');
if(game.state.mode!=='explore')throw new Error('Atlas travel did not return the game to exploration mode.');
if(game.state.world.mapId!=='aurelia_gate')throw new Error('Aurelia travel did not arrive at the Golden Gate.');
if(game.state.atlas.travelHistory[0]?.hours!==30)throw new Error('Haven-to-Aurelia route should require 30 hours.');
if(game.state.rest.day!==2||game.state.atlas.hourRemainder!==6)throw new Error('Regional travel time did not advance correctly.');

console.log(`Living Atlas harness passed: ${newMaps.length} new maps, ${Object.keys(AO.ATLAS_LOCATIONS).length} regional locations, panel travel and Aurelia arrival verified.`);
