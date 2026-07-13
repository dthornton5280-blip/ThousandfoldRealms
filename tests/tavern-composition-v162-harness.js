const fs=require('fs');
const vm=require('vm');
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
const read=path=>fs.readFileSync(path,'utf8');

const version=JSON.parse(read('version.json'));
const versionMatch=/^(\d+)\.(\d+)\.(\d+)-dev$/.exec(version.version||'');
assert(versionMatch,'Expected a semantic development checkpoint.');
const numericVersion=Number(versionMatch[1])*10000+Number(versionMatch[2])*100+Number(versionMatch[3]);
assert(numericVersion>=10602,'Tavern composition requires v1.6.2-dev or later.');
assert(version.buildName,'Current build name is missing.');

global.window=global;
const object=(id,type='decor',blocking=true)=>({id,type,kind:type==='door'?'door':'object',x:1,y:1,blocking});
const ids=['tavern_bar','tavern_fire','tavern_stage','tavern_table_1','tavern_table_2','tavern_table_3','tavern_keg_1','tavern_keg_2','job_board','tavern_cache','tavern_bench_1','tavern_bench_2','tavern_bench_3','tavern_shelf_mugs','tavern_stage_lamp_1','tavern_stage_lamp_2','tavern_supply_crates','tavern_serving_counter','tavern_long_table','tavern_prep_table','tavern_cookpot','tavern_wall_sign','tavern_table_candles','tavern_herbs'];
global.AO={
  MapBuilders:{
    room(fill='woodfloor'){const grid=Array.from({length:18},()=>Array(30).fill(fill));for(let x=0;x<30;x++){grid[0][x]='stonewall';grid[17][x]='stonewall';}for(let y=0;y<18;y++){grid[y][0]='stonewall';grid[y][29]='stonewall';}grid[17][14]=fill;grid[17][15]=fill;return grid;},
    rect(grid,x,y,w,h,tile){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)grid[yy][xx]=tile;}
  },
  MAP_DEFS:{tavern:{objects:[object('tavern_exit','door'),object('cellar_door','door'),...ids.map(id=>object(id,id.includes('board')?'sign':id.includes('cache')?'chest':'decor'))]}},
  NPCS:{bran:{x:8,y:5},lys:{x:18,y:7}},
  AMBIENT_ACTORS:{tavern_patron_1:{x:7,y:8,route:[]},tavern_patron_2:{x:23,y:6,route:[]}},
  MAP_LANDMARKS:{tavern:[]}
};

const compositionPath='source/src/data/tavern_composition.js';
vm.runInThisContext(read(compositionPath),{filename:compositionPath});
const tavern=AO.MAP_DEFS.tavern;
const by=id=>tavern.objects.find(entry=>entry.id===id);
const cells=entity=>(entity.collisionFootprint||[{x:0,y:0}]).map(offset=>({x:entity.x+(offset.x||0),y:entity.y+(offset.y||0)}));
const key=cell=>`${cell.x},${cell.y}`;
const blocked=new Map();
for(const entity of tavern.objects.filter(entry=>entry.blocking!==false)){
  for(const cell of cells(entity)){
    const k=key(cell);assert(!blocked.has(k),`Blocking objects overlap at ${k}: ${blocked.get(k)} and ${entity.id}`);blocked.set(k,entity.id);
  }
}

assert(tavern.composition?.version==='v162','Composition metadata missing.');
assert(by('tavern_stage').collisionFootprint.length===6,'Stage collision must cover 3×2 cells.');
assert(by('tavern_long_table').collisionFootprint.length===12,'Common table collision must cover its 6×2 visible body.');
assert(by('tavern_table_1').artAnchor==='topLeft'&&by('tavern_table_2').artAnchor==='topLeft','Dining tables are not grid-aligned.');
assert(by('job_board').blocking===false,'Wall-mounted job board should not obstruct walking.');
assert(by('tavern_supply_crates').artW===32,'Cellar supply crate should align to one gameplay cell.');

for(let y=7;y<=16;y++)for(let x=12;x<=16;x++)assert(!blocked.has(`${x},${y}`),`Entrance aisle blocked at ${x},${y} by ${blocked.get(`${x},${y}`)}`);
for(const actor of [AO.NPCS.bran,AO.NPCS.lys,AO.AMBIENT_ACTORS.tavern_patron_1,AO.AMBIENT_ACTORS.tavern_patron_2]){
  assert(!blocked.has(`${actor.x},${actor.y}`),`Actor starts inside furniture at ${actor.x},${actor.y}.`);
  for(const point of actor.route||[])assert(!blocked.has(`${point[0]},${point[1]}`),`Ambient route crosses furniture at ${point[0]},${point[1]}.`);
}
const grid=AO.MapBuilders.tavern();
assert(grid.flat().every(tile=>tile!=='bar'),'Tavern reverted to solid bar terrain.');
assert(grid[2][22]==='stage'&&grid[12][6]==='rug','Stage or common-table floor zoning is missing.');

/* Dialogue portrait regression: render a bounded bust and wrap the normal UI dialogue method. */
let baseDialogueCalls=0;
AO.UI=class{};
AO.UI.prototype.dialogue=function(){baseDialogueCalls++;};
const portraitPath='source/src/ui/dialogue_portraits.js';
const portraitSource=read(portraitPath);
vm.runInThisContext(portraitSource,{filename:portraitPath});
assert(AO.ThousandfoldPortraits?.source==='dialogue-bust-v162','Dedicated portrait renderer was not registered.');
assert(!portraitSource.includes('SpriteFactory.npc'),'Dialogue portraits must not scale the top-down world sprite.');
const rects=[];
const ctx={
  canvas:{width:160,height:220},save(){},restore(){},clearRect(){},fillRect(x,y,w,h){rects.push({x,y,w,h});},beginPath(){},moveTo(){},lineTo(){},stroke(){},ellipse(){},strokeRect(){},
  set fillStyle(value){this._fillStyle=value;},get fillStyle(){return this._fillStyle;},set strokeStyle(value){this._strokeStyle=value;},set lineWidth(value){this._lineWidth=value;},set imageSmoothingEnabled(value){this._smoothing=value;}
};
assert(AO.ThousandfoldPortraits.draw(ctx,{skin:'#aa91c5',hair:'#e4dded',outfit:'#5b536d',accent:'#87a7c0',ears:'long',artFrames:['char_bard_1']})===true,'Lys portrait did not render.');
assert(rects.length>35,'Portrait renderer produced too little visual structure.');
assert(rects.every(r=>[r.x,r.y,r.w,r.h].every(Number.isFinite)&&Math.abs(r.x)<300&&Math.abs(r.y)<300&&r.w<300&&r.h<300),'Portrait geometry escaped the dialogue canvas scale.');
const ui=new AO.UI();ui.e={dialoguePortrait:{getContext:()=>ctx}};
ui.dialogue('Lys','Rumors.',[],{skin:'#aa91c5',hair:'#e4dded',accent:'#87a7c0',ears:'long',artFrames:['char_bard_1']},'Wayfarer');
assert(baseDialogueCalls===1,'Portrait wrapper did not preserve the base dialogue flow.');

const index=read('source/index.html');
assert(index.indexOf('src/data/tavern_composition.js')>index.indexOf('src/data/haven_art_content.js'),'Tavern composition loads before Haven art content.');
assert(index.indexOf('src/ui/dialogue_portraits.js')>index.indexOf('src/ui/ui.js'),'Portrait wrapper loads before AO.UI exists.');
assert(index.indexOf('src/ui/dialogue_portraits.js')<index.indexOf('src/main.js'),'Portrait wrapper loads after game startup.');
assert(read('source/src/systems/immersive_world.js').includes('AO.EntityGeometry?.contains'),'Ambient movement is not footprint-aware.');

console.log(`Tavern v1.6.2 regression passed at ${version.version}: coherent zones, clear aisle, full collisions, safe ambient routes, and bounded dialogue busts.`);
