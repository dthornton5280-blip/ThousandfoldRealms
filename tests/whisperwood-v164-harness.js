const fs=require('fs');
const vm=require('vm');
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
const read=path=>fs.readFileSync(path,'utf8');
const run=path=>vm.runInThisContext(read(path),{filename:path});

global.window=global;
global.performance={now:()=>1000};
global.AO={CONFIG:{mapWidth:30,mapHeight:18,tile:32},NPCS:{},ITEMS:{}};
run('source/src/data/maps.js');
run('source/src/data/immersive_world.js');
run('source/src/data/whisperwood_composition.js');

const version=JSON.parse(read('version.json'));
assert(version.version==='1.6.4-dev','Expected v1.6.4-dev.');
assert(version.buildName==='Whisperwood Living Wilderness','Unexpected v1.6.4 build name.');

const map=AO.MAP_DEFS.wilds;
assert(map.composition?.version==='v164','Whisperwood composition metadata is missing.');
assert(map.visualProfile?.palette==='lantern-forest','Whisperwood visual profile is missing.');
assert(AO.WhisperwoodComposition?.version==='v164','Whisperwood composition registry is missing.');

const grid=AO.MapBuilders[map.builder]();
const blockedTerrain=new Set(['tree','stonewall','water','lilywater','roof','woodwall','bar','cliff_face','waterfall','rocks','shrub','fence','reeds']);
const offsets=entity=>Array.isArray(entity.collisionFootprint)?entity.collisionFootprint:[{x:0,y:0}];
const cells=entity=>offsets(entity).map(offset=>({x:entity.x+(offset.x||0),y:entity.y+(offset.y||0)}));
const key=point=>`${point.x},${point.y}`;
const blockers=map.objects.filter(entity=>entity.blocking!==false&&entity.type!=='resource'&&entity.type!=='sign');
const occupied=new Map();
for(const entity of blockers){
  for(const cell of cells(entity)){
    assert(grid[cell.y]?.[cell.x]!=null,`${entity.id} leaves the map at ${key(cell)}.`);
    assert(!blockedTerrain.has(grid[cell.y][cell.x]),`${entity.id} sits on blocked terrain ${grid[cell.y][cell.x]} at ${key(cell)}.`);
    assert(!occupied.has(key(cell)),`${entity.id} overlaps ${occupied.get(key(cell))} at ${key(cell)}.`);
    occupied.set(key(cell),entity.id);
  }
}

/* Main travel and map exits remain unobstructed by authored objects. */
for(let x=0;x<30;x++)assert(!occupied.has(`${x},9`),`Main Lantern Road is obstructed at ${x},9 by ${occupied.get(`${x},9`)}.`);
for(const portal of map.portals){
  assert(!occupied.has(`${portal.x},${portal.y}`),`${portal.id} is obstructed by ${occupied.get(`${portal.x},${portal.y}`)}.`);
  assert(!blockedTerrain.has(grid[portal.y][portal.x]),`${portal.id} is on blocked terrain.`);
}

/* Visible enemies and authored patrol targets must not begin inside a new prop. */
for(const enemy of map.enemies)assert(!occupied.has(`${enemy.x},${enemy.y}`),`${enemy.id} starts inside ${occupied.get(`${enemy.x},${enemy.y}`)}.`);
for(const routes of [AO.WhisperwoodComposition.protectedRoutes.mirelings,AO.WhisperwoodComposition.protectedRoutes.bandits])for(const route of routes)for(const [x,y] of route){
  assert(!occupied.has(`${x},${y}`),`Authored patrol route crosses ${occupied.get(`${x},${y}`)} at ${x},${y}.`);
}
for(const [x,y] of AO.WhisperwoodComposition.protectedRoutes.deer)assert(!occupied.has(`${x},${y}`),`Deer routine crosses ${occupied.get(`${x},${y}`)} at ${x},${y}.`);

/* Existing gameplay identities remain intact. */
const by=id=>map.objects.find(entity=>entity.id===id);
assert(by('wild_camp')?.type==='camp','The established wilderness camp changed type.');
assert(by('shipment_chest')?.type==='chest'&&by('wild_chest')?.type==='chest','Existing Whisperwood chests changed type.');
assert(map.portals.find(entity=>entity.id==='wilds_to_haven')?.to==='haven','Haven return portal changed.');
assert(map.portals.find(entity=>entity.id==='wilds_to_crypt')?.to==='crypt','Ashen Crypt portal changed.');
assert(map.portals.find(entity=>entity.id==='wilds_to_mine')?.to==='lantern_mine','Lantern Mine portal changed.');

/* Living details expose descriptions and persistent interactions. */
for(const id of ['fallen_cart','whisper_fallen_log','whisper_mushroom_ring','whisper_root_hollow','whisper_pond_offering']){
  const entity=by(id);assert(entity?.description,`${id} is missing a description.`);assert(entity.searchable,`${id} is not searchable.`);
}
for(const id of ['whisper_wardstone','whisper_overlook_cairn']){
  const entity=by(id);assert(entity?.description,`${id} is missing a description.`);assert(entity.useAction?.oncePerDay,`${id} lacks its persistent daily use.`);
}
assert(by('wild_camp').collisionFootprint.length===2,'Old Road Camp collision must match its two-cell body.');
assert(by('fallen_cart').collisionFootprint.length===2,'Wrecked cart collision must match its two-cell body.');
assert(by('whisper_fallen_log').collisionFootprint.length===2,'Fallen log collision must match its two-cell body.');
for(const id of ['herb_1','herb_2','herb_3','herb_4','bloom_1','bloom_2','bloom_3','bloom_4','bloom_5'])assert(by(id)?.blocking===false,`${id} should not obstruct movement after gathering art is applied.`);

/* The map is still connected from Haven to both eastern and northern exits. */
function reachable(start){
  const queue=[start],seen=new Set([key(start)]);
  while(queue.length){
    const current=queue.shift();
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const next={x:current.x+dx,y:current.y+dy},id=key(next);
      if(seen.has(id)||next.x<0||next.y<0||next.x>=30||next.y>=18||blockedTerrain.has(grid[next.y][next.x])||occupied.has(id))continue;
      seen.add(id);queue.push(next);
    }
  }
  return seen;
}
const access=reachable({x:1,y:9});
for(const portal of map.portals)assert(access.has(`${portal.x},${portal.y}`),`${portal.id} is no longer reachable from Haven.`);
assert(access.has('13,8'),'Old Road Camp no longer has a usable approach.');
assert(access.has('22,3'),'Eastern Overlook no longer has a usable approach.');

/* Project-owned renderer handles every wilderness tile and object without external sheets. */
AO.ThousandfoldArt={drawTile(){return false;},drawEntity(){return false;}};
run('source/src/render/whisperwood_art.js');
assert(AO.WhisperwoodArt?.source==='project-owned-whisperwood-v164','Whisperwood art registry is missing.');
const gradient={addColorStop(){}};
const ctx={save(){},restore(){},fillRect(){},strokeRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){},stroke(){},arc(){},ellipse(){},createRadialGradient(){return gradient;},set fillStyle(v){},set strokeStyle(v){},set lineWidth(v){},imageSmoothingEnabled:false};
for(const tile of AO.WhisperwoodArt.tiles)assert(AO.ThousandfoldArt.drawTile(ctx,tile,3,4,'wilds'),`Whisperwood tile ${tile} did not render.`);
for(const artId of AO.WhisperwoodArt.objects)assert(AO.ThousandfoldArt.drawEntity(ctx,{id:`test_${artId}`,artId,artW:80,artH:68,artAnchor:'topLeft',x:2,y:2},'wilds',0),`Whisperwood object ${artId} did not render.`);
assert(!AO.ThousandfoldArt.drawTile(ctx,'grass',1,1,'haven'),'Whisperwood renderer incorrectly claimed Haven terrain from the base stub.');

const artSource=read('source/src/render/whisperwood_art.js');
assert(!artSource.includes('Pixel Crawler'),'Whisperwood runtime art must not depend on the third-party pack.');
assert(!artSource.includes('drawImage('),'Whisperwood art unexpectedly slices a presentation sheet.');

const index=read('source/index.html');
const order=['src/data/haven_detail_content.js','src/data/whisperwood_composition.js','src/systems/audio.js','src/render/thousandfold_art.js','src/render/haven_detail_art.js','src/render/whisperwood_art.js','src/render/sprites.js','src/main.js'];
for(let i=1;i<order.length;i++)assert(index.indexOf(order[i])>index.indexOf(order[i-1]),`Canonical runtime order is wrong around ${order[i]}.`);

console.log('Whisperwood v1.6.4 harness passed: route-safe wilderness composition, reachable exits, persistent discoveries, exact collision, project-owned terrain, and canonical loading are intact.');
