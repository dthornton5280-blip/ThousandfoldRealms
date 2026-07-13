const fs=require('fs');
const vm=require('vm');
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
const read=path=>fs.readFileSync(path,'utf8');
const run=path=>vm.runInThisContext(read(path),{filename:path});

global.window=global;
global.performance={now:()=>0};
global.AO={CONFIG:{mapWidth:30,mapHeight:18},NPCS:{}};

for(const path of [
  'source/src/data/actors.js',
  'source/src/data/maps.js',
  'source/src/data/world_visuals.js',
  'source/src/data/immersive_world.js',
  'source/src/data/haven_art_content.js',
  'source/src/data/tavern_composition.js',
  'source/src/data/haven_composition.js',
  'source/src/data/haven_detail_content.js'
])run(path);

const version=JSON.parse(read('version.json'));
assert(version.version==='1.6.3-dev','Expected v1.6.3-dev.');
assert(version.buildName==='Haven Square + Starter Interiors','Unexpected v1.6.3 build name.');
assert(AO.HavenComposition?.version==='v163','Haven composition runtime did not install.');

const solidTiles=new Set(['tree','roof','stonewall','woodwall']);
const buildGrid=mapId=>{
  const def=AO.MAP_DEFS[mapId],builder=AO.MapBuilders[def.builder];
  assert(typeof builder==='function',`Missing builder for ${mapId}.`);
  return builder.call(AO.MapBuilders);
};
const offsets=entity=>{
  const value=entity.collisionFootprint||entity.footprint;
  if(Array.isArray(value))return value.map(cell=>Array.isArray(cell)?{x:cell[0],y:cell[1]}:cell);
  if(value&&typeof value==='object'&&['left','right','up','down'].some(key=>key in value)){
    const out=[];for(let y=-(value.up||0);y<=(value.down||0);y++)for(let x=-(value.left||0);x<=(value.right||0);x++)out.push({x,y});return out;
  }
  return[{x:0,y:0}];
};
const cells=entity=>offsets(entity).map(offset=>({x:entity.x+offset.x,y:entity.y+offset.y}));
const visibleBlockers=mapId=>(AO.MAP_DEFS[mapId].objects||[]).filter(entity=>!entity.hidden&&entity.blocking!==false&&entity.type!=='door');
const key=cell=>`${cell.x},${cell.y}`;

function assertNoBlockingOverlap(mapId){
  const occupied=new Map();
  for(const entity of visibleBlockers(mapId))for(const cell of cells(entity)){
    const prior=occupied.get(key(cell));
    assert(!prior,`${mapId}: ${entity.id} overlaps ${prior} at ${key(cell)}.`);
    occupied.set(key(cell),entity.id);
  }
}
function assertObjectCellsWalkable(mapId){
  const grid=buildGrid(mapId);
  for(const entity of visibleBlockers(mapId))for(const cell of cells(entity)){
    assert(grid[cell.y]?.[cell.x]!=null,`${mapId}: ${entity.id} footprint leaves the map at ${key(cell)}.`);
    assert(!solidTiles.has(grid[cell.y][cell.x]),`${mapId}: ${entity.id} sits on solid ${grid[cell.y][cell.x]} at ${key(cell)}.`);
  }
}
function assertClearCells(mapId,points,label){
  const grid=buildGrid(mapId),blocked=new Set(visibleBlockers(mapId).flatMap(cells).map(key));
  for(const point of points){
    assert(!solidTiles.has(grid[point.y]?.[point.x]),`${mapId}: ${label} crosses solid terrain at ${key(point)}.`);
    assert(!blocked.has(key(point)),`${mapId}: ${label} is blocked at ${key(point)}.`);
  }
}
function entityAtActor(actor){
  return visibleBlockers(actor.map).find(entity=>cells(entity).some(cell=>cell.x===actor.x&&cell.y===actor.y));
}
function assertActorClear(id){
  const actor=AO.NPCS[id];assert(actor,`Missing actor ${id}.`);
  const blocker=entityAtActor(actor);assert(!blocker,`${id} begins inside ${blocker?.id}.`);
  const grid=buildGrid(actor.map);assert(!solidTiles.has(grid[actor.y]?.[actor.x]),`${id} begins on solid terrain.`);
}
function assertRouteClear(id){
  const actor=AO.AMBIENT_ACTORS[id];assert(actor,`Missing ambient actor ${id}.`);
  const grid=buildGrid(actor.map),blocked=new Set(visibleBlockers(actor.map).flatMap(cells).map(key));
  for(const [x,y] of actor.route||[]){
    assert(!solidTiles.has(grid[y]?.[x]),`${id} route crosses solid terrain at ${x},${y}.`);
    assert(!blocked.has(`${x},${y}`),`${id} route crosses furniture at ${x},${y}.`);
  }
}

const composed=['haven','inn','inn_upper','general_store','forge','arcane_shop','chapel'];
for(const mapId of composed){assertNoBlockingOverlap(mapId);assertObjectCellsWalkable(mapId);}

/* Exterior storefront and road approaches. */
for(const point of [{x:6,y:6},{x:15,y:6},{x:24,y:6},{x:6,y:15},{x:15,y:15},{x:24,y:15},{x:29,y:8}]){
  const grid=buildGrid('haven');assert(!solidTiles.has(grid[point.y][point.x]),`Haven door/road approach is blocked at ${key(point)}.`);
}
assertClearCells('haven',Array.from({length:18},(_,i)=>({x:10+i,y:8})),'east-west market road');
assertClearCells('haven',Array.from({length:4},(_,i)=>({x:14,y:7+i})),'central square walk');
assertClearCells('haven',[{x:15,y:15},{x:15,y:16}],'south chapel approach');

/* Interior entrance and service aisles. */
assertClearCells('inn',Array.from({length:11},(_,i)=>({x:14,y:6+i})),'inn entrance aisle');
assertClearCells('general_store',Array.from({length:10},(_,i)=>({x:14,y:7+i})),'store entrance aisle');
assertClearCells('forge',Array.from({length:6},(_,i)=>({x:14,y:11+i})),'forge customer aisle');
assertClearCells('arcane_shop',Array.from({length:8},(_,i)=>({x:14,y:9+i})),'arcane entrance aisle');
assertClearCells('chapel',Array.from({length:11},(_,i)=>({x:14,y:6+i})),'chapel nave');

for(const id of ['mira','nessa','jory','elowen','mara','borin','selene','odo','town_courier','town_sweeper','inn_guest','inn_attendant','store_shopper','forge_apprentice','arcane_scholar','chapel_pilgrim'])assertActorClear(id);
for(const id of ['town_courier','town_sweeper','inn_guest','inn_attendant','store_shopper','forge_apprentice','arcane_scholar','chapel_pilgrim'])assertRouteClear(id);

/* Duplicate additive furniture must be disabled rather than stacked. */
for(const id of ['inn_bed_1','inn_bed_2'])assert(AO.MAP_DEFS.inn.objects.find(entity=>entity.id===id)?.hidden,`${id} should be hidden from the public inn lobby.`);
for(const id of ['anvil_2','forge_anvil_small','forge_weaponrack_2'])assert(AO.MAP_DEFS.forge.objects.find(entity=>entity.id===id)?.hidden,`${id} duplicate forge furniture remains active.`);
for(const id of ['chapel_pew_1','chapel_pew_2','chapel_pew_3','chapel_pew_4'])assert(AO.MAP_DEFS.chapel.objects.find(entity=>entity.id===id)?.hidden,`${id} duplicate chapel pew remains active.`);

/* Existing door identity and destinations stay stable. */
const expectedDoors={door_inn:'inn',door_arcane:'arcane_shop',door_tavern:'tavern',door_store:'general_store',door_chapel:'chapel',door_forge:'forge'};
for(const [id,to] of Object.entries(expectedDoors)){
  const door=AO.MAP_DEFS.haven.objects.find(entity=>entity.id===id);
  assert(door?.to===to,`${id} no longer reaches ${to}.`);
}
for(const mapId of ['inn','inn_upper','general_store','forge','arcane_shop','chapel']){
  const exit=AO.MAP_DEFS[mapId].objects.find(entity=>entity.type==='door'&&entity.to==='haven')||AO.MAP_DEFS[mapId].objects.find(entity=>entity.id==='upper_exit');
  assert(exit,`${mapId} lost its established exit door.`);
}

/* Detail renderer must own every newly introduced art ID. */
AO.ThousandfoldArt={drawEntity(){return false;}};
run('source/src/render/haven_detail_art.js');
const expectedArt=['road_signpost','town_gate_post','street_banner','luggage_rack','breakfast_sideboard','remedy_display','supply_baskets','quench_trough','anvil','weaponrack','relic_pedestal','reading_table','lantern_statue','lectern','offering_table'];
for(const id of expectedArt)assert(AO.HavenDetailArt.handled.includes(id),`Detail renderer does not handle ${id}.`);
const gradient={addColorStop(){}};
const ctx={save(){},restore(){},fillRect(){},strokeRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},stroke(){},arc(){},ellipse(){},createRadialGradient(){return gradient;},set fillStyle(v){},set strokeStyle(v){},set lineWidth(v){},imageSmoothingEnabled:false};
for(const id of expectedArt)assert(AO.ThousandfoldArt.drawEntity(ctx,{id:`test_${id}`,artId:id,artW:80,artH:64,artAnchor:'topLeft',x:1,y:1},'haven',0),`Detail art ${id} failed to render.`);

const index=read('source/index.html');
const order=['src/data/haven_art_content.js','src/data/tavern_composition.js','src/data/haven_composition.js','src/data/haven_detail_content.js','src/systems/audio.js','src/render/thousandfold_art.js','src/render/haven_detail_art.js','src/render/sprites.js','src/ui/dialogue_portraits.js','src/main.js'];
for(let i=1;i<order.length;i++)assert(index.indexOf(order[i])>index.indexOf(order[i-1]),`Canonical runtime order is wrong around ${order[i]}.`);

console.log('Haven v1.6.3 harness passed: square roads, storefront approaches, interior aisles, blockers, NPCs, routines, doors, detail art, and canonical script order are coherent.');
