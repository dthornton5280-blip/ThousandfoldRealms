const fs=require('fs');
const vm=require('vm');
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
const phase=process.argv[2]||'all';
const contentPath='source/src/data/haven_art_content.js';
global.window=global;
global.AO={};
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
vm.runInThisContext(fs.readFileSync(contentPath,'utf8'),{filename:contentPath});
const allObjects=Object.values(AO.MAP_DEFS).flatMap(map=>map.objects||[]);

if(phase==='layout'||phase==='all'){
  assert(AO.MapBuilders.tavern().flat().every(tile=>tile!=='bar'),'Tavern still uses solid bar terrain collision.');
  assert(AO.MAP_DEFS.haven.objects.find(o=>o.id==='haven_well')?.useAction,'Haven well interaction missing.');
  assert(AO.MAP_DEFS.tavern.objects.find(o=>o.id==='tavern_long_table')?.collisionFootprint.length===6,'Long table collision footprint missing.');
  assert(AO.MAP_DEFS.tavern.objects.find(o=>o.id==='tavern_shelf_mugs')?.searchable,'Tavern search discovery missing.');
}
if(phase==='interiors'||phase==='all'){
  for(const mapId of ['tavern','tavern_cellar','inn','inn_upper','general_store','forge','arcane_shop','chapel'])assert(AO.MAP_DEFS[mapId].objects.some(o=>o.artId),`${mapId} was not furnished with canonical art.`);
}
if(phase==='doors'||phase==='all'){
  for(const object of allObjects.filter(o=>o.type==='door'&&!o.integratedBuildingDoor)){
    assert(object.artW===32&&object.artH===48,`Door ${object.id} does not use the standard 32×48 visual size.`);
    assert(object.interactionFootprint?.up===1,`Door ${object.id} lacks its upper interaction cell.`);
  }
}
if(phase==='characters'||phase==='all'){
  assert(AO.NPCS.bran.visual.artFrames?.[0].includes('tavernkeeper'),'Bran did not receive canonical tavernkeeper art.');
  assert(AO.NPCS.lys.visual.artFrames?.[0].includes('bard'),'Lys did not receive canonical bard art.');
}
console.log(`Haven content harness passed: ${phase}.`);
