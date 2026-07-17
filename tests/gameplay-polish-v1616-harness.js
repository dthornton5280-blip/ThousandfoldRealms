/* Thousandfold Realms v1.6.16 systemic entrance, interaction, HUD, and portal validation. */
const fs=require('fs'),vm=require('vm'),assert=(value,message)=>{if(!value)throw new Error(message);};
const read=path=>fs.readFileSync(path,'utf8');

/* Building-body clicks route to the real door while the facade remains solid. */
global.window=global;
global.AO={
  CONFIG:{mapWidth:30,mapHeight:18},ITEMS:{},Util:{key:(x,y)=>`${x},${y}`,title:value=>value},Pathfinder:{
    path(){return[];},isWalkable(){return true;}
  },WorldSystem:class{
    constructor(game){this.game=game;this.entities=[];this.map=null;this.grid=Array.from({length:18},()=>Array(30).fill('grass'));}
    playerPos(){return{x:10,y:10};}isTerrainWalkable(){return true;}approachAndInteract(entity){this.approached=entity;}
    entityAt(){return null;}click(){}load(){}interact(){}closeDistantDoors(){}
  }
};
vm.runInThisContext(read('source/src/systems/entity_geometry.js'));
vm.runInThisContext(read('source/src/systems/footprint_interactions.js'));
const game={state:{mode:'explore',world:{searchedDecor:{},usedDecor:{}}},toast(){},ui:{}};
const world=new AO.WorldSystem(game),door={id:'door_test',type:'door',x:6,y:6,blocking:true,interactionFootprint:{left:1,right:1,up:1,down:0}};
world.map={id:'haven',buildings:[{id:'building',x:2,y:2,w:8,h:5,doorId:'door_test'}]};world.entities=[door];
world.approachAndInteract=entity=>{world.approached=entity;};
world.click(3,3);
assert(world.approached===door,'clicking a painted building body must route to its real door');
assert(AO.Pathfinder.isWalkable(world,3,3,'player')===false,'painted building walls must remain unwalkable');

/* Destination doors transition on one activation and close behind the player. */
global.AO={CONFIG:{mapWidth:30,mapHeight:18,tickMs:150},MAP_DEFS:{},ITEMS:{},ENEMIES:{},Util:{dist:(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y),key:(x,y)=>`${x},${y}`,deepCopy:value=>JSON.parse(JSON.stringify(value)),title:value=>value},Pathfinder:{},events:{emit(){}}};
vm.runInThisContext(read('source/src/systems/world.js'));
const doorGame={state:{mode:'explore',world:{x:4,y:5,doors:{},opened:{},gathered:{},defeated:{}}},inventory:{count(){return 0;}},toast(){},ui:{}};
const doorWorld=new AO.WorldSystem(doorGame);let loaded=null;doorWorld.load=(...args)=>{loaded=args;};
const travelDoor={id:'travel',type:'door',x:5,y:5,to:'inn',toX:14,toY:15,blocking:true,open:false};
doorWorld.useDoor(travelDoor);
assert(loaded?.[0]==='inn','destination door should enter on the first activation');
assert(travelDoor.open===false&&doorGame.state.world.doors.travel===false,'destination door should close behind the player');
const roomDoor={id:'room',type:'door',x:5,y:5,blocking:true,open:false};doorWorld.useDoor(roomDoor);
assert(roomDoor.open===true,'non-destination room door should still toggle open');

const renderer=read('source/src/render/renderer.js'),ui=read('source/src/ui/ui.js'),core=read('source/src/core/game.js'),prompt=read('source/src/core/expansion_game.js'),doors=read('source/src/render/haven_interior_door_runtime_v1616.js'),repairs=read('source/src/render/runtime_repairs_v167.js'),main=read('source/src/main.js');
assert(renderer.includes("edge=e.x===0?'west'")&&renderer.includes("if(!edge){AO.SpriteFactory.icon"),'edge portals must use restrained directional markers while non-edge portals retain fallback art');
assert(ui.includes("wilds:'Follow the eastern road through Whisperwood"),'Whisperwood must not display the stale Haven objective');
assert(core.includes("entity.type==='door'?0")&&prompt.includes("entity.type==='door'?0"),'door interaction must outrank overlapping decoration in input and prompts');
assert(doors.includes("MAP_VARIANT={inn:0,inn_upper:0,tavern:0,tavern_cellar:0,general_store:2,arcane_shop:1,chapel:3,forge:4}"),'approved interior door map binding is incomplete');
assert(doors.includes('ctx.imageSmoothingEnabled=false'),'interior door rendering must remain nearest-neighbor');
assert(repairs.includes("door&&AO.EntityGeometry?.contains(door,x,y)"),'late collision repair must preserve the real integrated doorway opening');
assert(main.includes("haven_interior_door_runtime_v1616.js?v=1616")&&main.includes('interiorDoorsDone'),'game startup must load and await the approved interior door family');

console.log('v1.6.16 gameplay polish passed: facade clicks route to aligned doors, buildings remain solid, travel doors enter once, door input wins, objectives follow the map, edge portals are logical markers, and approved interior doors load before play.');
