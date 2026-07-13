const fs=require('fs');
const vm=require('vm');
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
global.window=global;
global.AO={
  CONFIG:{mapWidth:30,mapHeight:18,tile:32},
  ITEMS:{travel_ration:{name:'Travel Ration'}},
  Util:{key:(x,y)=>`${x},${y}`,title:value=>value,dist:(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y)},
  events:{emit(){}},
  Pathfinder:{path(world,start,goal){return start.x===goal.x&&start.y===goal.y?[]:[goal];}},
  WorldSystem:class{
    constructor(game){this.game=game;this.entities=[];this.grid=Array.from({length:18},()=>Array(30).fill('grass'));this.path=[];}
    load(){}
    isTerrainWalkable(x,y){return x>=0&&y>=0&&x<30&&y<18;}
    playerPos(){return{x:this.game.state.world.x,y:this.game.state.world.y};}
    setPath(path,after){this.path=path;this.afterPath=after;}
    markMotion(){}
    closeDistantDoors(){}
    checkPortal(){}
    interact(){}
    closeDoor(){return false;}
    decorText(){return'detail';}
  }
};
for(const path of ['source/src/systems/entity_geometry.js','source/src/systems/footprint_interactions.js'])vm.runInThisContext(fs.readFileSync(path,'utf8'),{filename:path});
const game={state:{mode:'explore',rest:{day:1},world:{x:1,y:1,searchedDecor:{},usedDecor:{}},player:{name:'Alden',gold:0,hp:5,maxHp:10,mana:3,maxMana:10,stamina:4,maxStamina:10}},inventory:{added:[],add(id,qty){this.added.push([id,qty]);}},progression:{grantXp(){}},ui:{dialogue(){},closeDialogue(){}},toast(){}};
const world=new AO.WorldSystem(game);world.entities=[{id:'wide',type:'decor',kind:'table',x:4,y:4,blocking:true,collisionFootprint:[{x:0,y:0},{x:1,y:0}],interactionFootprint:[{x:0,y:0},{x:1,y:0}],searchable:{chance:1,loot:['travel_ration']}}];
assert(AO.Pathfinder.isWalkable(world,4,4,'player')===false&&AO.Pathfinder.isWalkable(world,5,4,'player')===false,'Multi-tile collision does not block every covered cell.');
assert(world.entityAt(5,4,true)?.id==='wide','Secondary footprint cell does not resolve to its entity.');
assert(AO.EntityGeometry.bounds(world.entities[0]).w===2,'Multi-tile bounds are incorrect.');
world.searchObject(world.entities[0]);world.searchObject(world.entities[0]);
assert(game.inventory.added.length===1,'A searchable prop awarded loot more than once.');
const daily={id:'daily',type:'decor',kind:'bench',x:8,y:8,blocking:false,useAction:{oncePerDay:true,stamina:2}};world.entities.push(daily);world.useObject(daily);world.useObject(daily);
assert(game.state.player.stamina===6,'Daily object use was not idempotent.');
console.log('Multi-tile geometry, persistent searches, and daily uses harness passed.');
