const fs=require('fs');
const vm=require('vm');
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
const files={
  art:'source/src/render/thousandfold_art.js',renderer:'source/src/render/thousandfold_renderer.js',
  content:'source/src/data/haven_art_content.js',geometry:'source/src/systems/entity_geometry.js',
  interactions:'source/src/systems/footprint_interactions.js',index:'source/index.html'
};
const read=path=>fs.readFileSync(path,'utf8');
const version=JSON.parse(read('version.json'));
assert(version.version==='1.6.1-dev','Expected v1.6.1-dev.');
assert(version.buildName==='Haven Art + Living Interiors','Unexpected build name.');
for(const path of Object.values(files))assert(fs.existsSync(path),`Missing ${path}`);

global.window=global;
global.performance={now:()=>1000};
global.AO={events:{emit(){}},SpriteFactory:{icon(){},npc(){}},Renderer:class{tile(){return false;}render(){}}};
vm.runInThisContext(read(files.art),{filename:files.art});
assert(AO.ThousandfoldArt?.ready,'Canonical art runtime was not registered.');
assert(AO.ThousandfoldArt.source==='procedural-project-atlas-v161','Art runtime is not the project-owned canonical atlas.');
assert(AO.ThousandfoldArt.handlesTile('grass','haven'),'Haven terrain is not handled.');
assert(AO.ThousandfoldArt.handlesTile('woodfloor','tavern'),'Tavern floors are not handled.');
const gradient={addColorStop(){}};
const ctx=new Proxy({canvas:{width:960,height:576},measureText:()=>({width:20}),createRadialGradient:()=>gradient,createLinearGradient:()=>gradient}, {get(target,key){if(key in target)return target[key];return()=>{};},set(target,key,value){target[key]=value;return true;}});
assert(AO.ThousandfoldArt.drawTile(ctx,'grass',2,3,'haven')===true,'Haven grass did not render.');
assert(AO.ThousandfoldArt.drawBuilding(ctx,{x:2,y:2,w:8,h:5,style:'tavern',doorId:'door_tavern',accent:'#e7af62'},{entities:[{id:'door_tavern',open:false}]})===true,'Building renderer did not draw a tavern.');
assert(AO.ThousandfoldArt.drawEntity(ctx,{x:3,y:3,artId:'counter_tap',artW:128,artH:64,artAnchor:'topLeft'},'tavern',1000)===true,'Tavern counter did not draw.');
assert(AO.ThousandfoldArt.drawNpc(ctx,0,0,{skin:'#aaa',hair:'#222',artFrames:['char_tavernkeeper_1']},1,{idleFrame:1})===true,'Canonical NPC sprite did not draw.');

const door=id=>({id,type:'door',x:14,y:17,to:id==='tavern_exit'?'haven':null});
const mk=(id,ids=[])=>({id,objects:[door(`${id}_exit`),...ids.map(entry=>typeof entry==='string'?{id:entry,type:'decor',kind:'object',x:3,y:3,blocking:true}:entry)]});
AO.MapBuilders={room(){return Array.from({length:18},()=>Array(30).fill('woodfloor'));},rect(grid,x,y,w,h,tile){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)grid[yy][xx]=tile;}};
AO.MAP_DEFS={
  haven:{id:'haven',objects:['door_inn','door_arcane','door_tavern','door_store','door_chapel','door_forge'].map((id,i)=>({id,type:'door',x:i,y:6,integratedBuildingDoor:true})).concat([
    {id:'town_fountain',type:'decor'},{id:'market_stall_1',type:'decor'},{id:'market_stall_2',type:'decor'},{id:'bench_1',type:'decor'},{id:'bench_2',type:'decor'},
    {id:'lamp_1',type:'decor'},{id:'lamp_2',type:'decor'},{id:'lamp_3',type:'decor'},{id:'lamp_4',type:'decor'},{id:'flowers_1',type:'decor'},{id:'flowers_2',type:'decor'},{id:'town_board',type:'sign'}])},
  tavern:mk('tavern',['tavern_bar','tavern_shelf_mugs','tavern_fire','tavern_stage','tavern_table_1','tavern_table_2','tavern_table_3','tavern_keg_1','tavern_keg_2','job_board','tavern_bench_1','tavern_bench_2','tavern_bench_3','tavern_stage_lamp_1','tavern_stage_lamp_2','tavern_supply_crates',{id:'cellar_door',type:'door',x:27,y:14,to:'tavern_cellar'}]),
  tavern_cellar:mk('tavern_cellar',['cellar_keg_1','cellar_keg_2','cellar_crates']),
  inn:mk('inn',['inn_desk','inn_fire','inn_table_1','inn_table_2','inn_bed_1','inn_bed_2','inn_shelf_guestbook','inn_chair_hearth_1','inn_chair_hearth_2','inn_lamp_front_1','inn_lamp_front_2','inn_crates_linen']),
  inn_upper:mk('inn_upper',['upper_bed_1','upper_bed_2','upper_bed_3','upper_bed_4','upper_lamp_1','upper_lamp_2','upper_lamp_3']),
  general_store:mk('general_store',['store_counter','shelf_1','shelf_2','shelf_3','shelf_4','store_shelf_remedy_1','store_shelf_remedy_2','store_shelf_supply_1','store_shelf_supply_2','herb_rack','store_herbs_2','store_herbs_3','store_crates']),
  forge:mk('forge',['forge_fire','ore_crates','forge_crates_ore','forge_cart_scrap','forge_brazier_1','forge_brazier_2']),
  arcane_shop:mk('arcane_shop',['arcane_counter','arcane_shelf_1','arcane_shelf_2','arcane_shelf_3','arcane_shelf_4','arcane_lamp_1','arcane_lamp_2','arcane_crates_relics','arcane_orb']),
  chapel:mk('chapel',['chapel_altar','pew_1','pew_2','pew_3','pew_4','chapel_pew_1','chapel_pew_2','chapel_pew_3','chapel_pew_4','chapel_lamp_1','chapel_lamp_2','chapel_brazier_1','chapel_brazier_2'])
};
AO.NPCS={bran:{visual:{}},lys:{visual:{}},elowen:{visual:{}},mara:{visual:{}},borin:{visual:{}}};
AO.AMBIENT_ACTORS={tavern_patron_1:{visual:{}},tavern_patron_2:{visual:{}},inn_guest:{visual:{}},inn_attendant:{visual:{}}};
AO.MAP_LANDMARKS={tavern:[{kind:'service'},{kind:'stage'}]};
vm.runInThisContext(read(files.content),{filename:files.content});
const allObjects=Object.values(AO.MAP_DEFS).flatMap(map=>map.objects||[]);
assert(AO.MapBuilders.tavern().flat().every(tile=>tile!=='bar'),'Tavern still uses solid bar terrain collision.');
assert(AO.MAP_DEFS.haven.objects.find(o=>o.id==='haven_well')?.useAction,'Haven well interaction missing.');
assert(AO.MAP_DEFS.tavern.objects.find(o=>o.id==='tavern_long_table')?.collisionFootprint.length===6,'Long table collision footprint missing.');
assert(AO.MAP_DEFS.tavern.objects.find(o=>o.id==='tavern_shelf_mugs')?.searchable,'Tavern search discovery missing.');
for(const mapId of ['tavern','tavern_cellar','inn','inn_upper','general_store','forge','arcane_shop','chapel'])assert(AO.MAP_DEFS[mapId].objects.some(o=>o.artId),`${mapId} was not furnished with canonical art.`);
for(const object of allObjects.filter(o=>o.type==='door'&&!o.integratedBuildingDoor)){
  assert(object.artW===32&&object.artH===48,`Door ${object.id} does not use the standard 32×48 visual size.`);
  assert(object.interactionFootprint?.up===1,`Door ${object.id} lacks its upper interaction cell.`);
}
assert(AO.NPCS.bran.visual.artFrames?.[0].includes('tavernkeeper'),'Bran did not receive canonical tavernkeeper art.');
assert(AO.NPCS.lys.visual.artFrames?.[0].includes('bard'),'Lys did not receive canonical bard art.');

AO.CONFIG={mapWidth:30,mapHeight:18,tile:32};AO.ITEMS={travel_ration:{name:'Travel Ration'}};AO.Util={key:(x,y)=>`${x},${y}`,title:value=>value,dist:(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y)};
AO.Pathfinder={path(world,start,goal){return start.x===goal.x&&start.y===goal.y?[]:[goal];}};
AO.WorldSystem=class{constructor(game){this.game=game;this.entities=[];this.grid=Array.from({length:18},()=>Array(30).fill('grass'));this.path=[];}load(){}isTerrainWalkable(x,y){return x>=0&&y>=0&&x<30&&y<18;}playerPos(){return{x:this.game.state.world.x,y:this.game.state.world.y};}setPath(path,after){this.path=path;this.afterPath=after;}markMotion(){}closeDistantDoors(){}checkPortal(){}interact(){}closeDoor(){return false;}decorText(){return 'detail';}};
vm.runInThisContext(read(files.geometry),{filename:files.geometry});
vm.runInThisContext(read(files.interactions),{filename:files.interactions});
const game={state:{mode:'explore',rest:{day:1},world:{x:1,y:1,searchedDecor:{},usedDecor:{}},player:{name:'Alden',gold:0,hp:5,maxHp:10,mana:3,maxMana:10,stamina:4,maxStamina:10}},inventory:{added:[],add(id,qty){this.added.push([id,qty]);}},progression:{grantXp(){}},ui:{dialogue(){},closeDialogue(){}},toast(){}};
const world=new AO.WorldSystem(game);world.entities=[{id:'wide',type:'decor',kind:'table',x:4,y:4,blocking:true,collisionFootprint:[{x:0,y:0},{x:1,y:0}],interactionFootprint:[{x:0,y:0},{x:1,y:0}],searchable:{chance:1,loot:['travel_ration']}}];
assert(AO.Pathfinder.isWalkable(world,4,4,'player')===false&&AO.Pathfinder.isWalkable(world,5,4,'player')===false,'Multi-tile collision does not block every covered cell.');
assert(world.entityAt(5,4,true)?.id==='wide','Secondary footprint cell does not resolve to its entity.');
world.searchObject(world.entities[0]);world.searchObject(world.entities[0]);
assert(game.inventory.added.length===1,'A searchable prop awarded loot more than once.');

const index=read(files.index);
const order=['src/data/immersive_world.js','src/data/haven_art_content.js','src/systems/immersive_world.js','src/systems/entity_geometry.js','src/systems/footprint_interactions.js','src/render/assets.js','src/render/thousandfold_art.js','src/render/world_polish.js','src/render/thousandfold_renderer.js','src/main.js'];
for(let i=1;i<order.length;i++)assert(index.indexOf(order[i-1])>=0&&index.indexOf(order[i])>index.indexOf(order[i-1]),`Runtime order is wrong around ${order[i]}.`);
const provenance=read('source/assets/generated/README.md');
assert(provenance.includes('project-specific runtime')&&provenance.includes('not a redistributed copy'),'Generated-art provenance is incomplete.');
console.log('v1.6.1 Haven art harness passed: canonical pixel renderer, furnished interiors, multi-tile collision, reliable doors, persistent searches, and runtime order.');
