AO.WorldSystem = class {
  constructor(game){this.game=game;this.grid=[];this.entities=[];this.map=null;this.path=[];this.afterPath=null;this.accum=0;this.facing='down';this.movingUntil=0;}
  load(mapId,x=null,y=null){
    const def=AO.MAP_DEFS[mapId];if(!def)throw new Error(`Unknown map ${mapId}`);
    this.map=def;this.grid=AO.MapBuilders[def.builder]();this.entities=[];
    const ws=this.game.state.world;ws.opened ||= {};ws.gathered ||= {};ws.defeated ||= {};ws.doors ||= {};
    let pos={x:x??def.start.x,y:y??def.start.y};
    if(!this.isTerrainWalkable(pos.x,pos.y))pos={...def.start};
    for(const npcId of def.npcs||[]){const n=AO.NPCS[npcId];if(n)this.entities.push({...AO.Util.deepCopy(n),type:'npc',blocking:true});}
    for(const obj of def.objects||[]){
      if(obj.type==='chest'&&ws.opened[obj.id])continue;if(obj.type==='resource'&&ws.gathered[obj.id])continue;
      const e={...AO.Util.deepCopy(obj)};
      if(e.type==='door'){e.open=!!ws.doors[e.id]&&AO.Util.dist(pos,e)<=1;e.blocking=!e.open;if(e.autoClose!==false&&!e.open)ws.doors[e.id]=false;}
      else e.blocking=e.blocking??!['sign'].includes(e.type);
      this.entities.push(e);
    }
    for(const portal of def.portals||[])this.entities.push({...AO.Util.deepCopy(portal),type:'portal',blocking:false});
    const reachable=this.reachableTiles(pos);
    for(const spawn of def.enemies||[]){
      if(ws.defeated[spawn.id])continue;if(spawn.requiresQuest&&!this.game.state.quests[spawn.requiresQuest])continue;
      const enemy=AO.ENEMIES[spawn.type];if(!enemy)continue;
      const safe=this.safeEnemySpawn(spawn,pos,reachable);if(!safe){console.warn(`Skipped unreachable enemy spawn ${mapId}/${spawn.id}.`);continue;}
      this.entities.push({...AO.Util.deepCopy(spawn),x:safe.x,y:safe.y,originalX:spawn.x,originalY:spawn.y,spawnAdjusted:safe.x!==spawn.x||safe.y!==spawn.y,name:enemy.name,type:'enemy',enemyType:spawn.type,blocking:true,visual:enemy.visual});
    }
    ws.mapId=mapId;ws.x=pos.x;ws.y=pos.y;this.path=[];this.afterPath=null;this.game.ui.setLocation(def.name);this.game.toast(def.name);AO.events.emit('worldChanged');
  }
  isTerrainWalkable(x,y){
    if(x<0||y<0||x>=AO.CONFIG.mapWidth||y>=AO.CONFIG.mapHeight)return false;
    return !['tree','stonewall','water','lilywater','roof','woodwall','bar','cliff_face','waterfall','rocks','shrub','fence','reeds'].includes(this.grid[y]?.[x]);
  }
  reachableTiles(start){
    const out=new Set(),queue=[start],key=AO.Util.key;out.add(key(start.x,start.y));
    while(queue.length){const cur=queue.shift();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=cur.x+dx,ny=cur.y+dy,k=key(nx,ny);if(out.has(k)||!this.isTerrainWalkable(nx,ny))continue;const blocked=this.entities.some(e=>e.type!=='door'&&e.blocking!==false&&!e.hidden&&e.x===nx&&e.y===ny);if(blocked)continue;out.add(k);queue.push({x:nx,y:ny});}}
    return out;
  }
  safeEnemySpawn(spawn,playerPos,reachable){
    const key=AO.Util.key,isFree=(x,y)=>reachable.has(key(x,y))&&this.isTerrainWalkable(x,y)&&!(x===playerPos.x&&y===playerPos.y)&&!this.entities.some(e=>e.blocking!==false&&!e.hidden&&e.x===x&&e.y===y),hasApproach=(x,y)=>[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>reachable.has(key(x+dx,y+dy)));
    if(isFree(spawn.x,spawn.y)&&hasApproach(spawn.x,spawn.y))return{x:spawn.x,y:spawn.y};
    const candidates=[];for(const k of reachable){const [x,y]=k.split(',').map(Number);if(!isFree(x,y)||!hasApproach(x,y))continue;const distance=Math.abs(x-spawn.x)+Math.abs(y-spawn.y),playerDistance=Math.abs(x-playerPos.x)+Math.abs(y-playerPos.y);candidates.push({x,y,distance,playerDistance});}
    candidates.sort((a,b)=>a.distance-b.distance||b.playerDistance-a.playerDistance||a.y-b.y||a.x-b.x);return candidates[0]||null;
  }
  playerPos(){return{x:this.game.state.world.x,y:this.game.state.world.y};}
  entityAt(x,y){return this.entities.find(e=>e.x===x&&e.y===y&&!e.hidden&&!(e.type==='door'&&e.open&&!e.to));}
  click(x,y){if(this.game.state.mode!=='explore')return;const entity=this.entityAt(x,y);if(entity){this.approachAndInteract(entity);return;}const path=AO.Pathfinder.path(this,this.playerPos(),{x,y},'player');if(path.length)this.setPath(path);}
  setPath(path,after=null){this.path=path;this.afterPath=after;}
  approachAndInteract(entity){
    const distance=AO.Util.dist(this.playerPos(),entity);if(distance<=1||(entity.type==='portal'&&distance===0)){this.interact(entity);return;}
    const path=AO.Pathfinder.nearestAdjacent(this,this.playerPos(),entity,'player');if(path.length)this.setPath(path,()=>this.interact(entity));else this.game.toast('No clear path.');
  }
  markMotion(dx,dy){if(Math.abs(dx)>Math.abs(dy))this.facing=dx<0?'left':'right';else if(dy)this.facing=dy<0?'up':'down';this.movingUntil=performance.now()+180;}
  keyboardMove(dx,dy){
    if(this.game.state.mode!=='explore')return;this.path=[];this.afterPath=null;const nx=this.game.state.world.x+dx,ny=this.game.state.world.y+dy,e=this.entityAt(nx,ny);
    if(e){this.interact(e);return;}if(AO.Pathfinder.isWalkable(this,nx,ny,'player')){this.markMotion(dx,dy);this.game.state.world.x=nx;this.game.state.world.y=ny;this.closeDistantDoors();this.checkPortal();AO.events.emit('worldChanged');}
  }
  update(dt){
    if(this.game.state.mode!=='explore'||!this.path.length)return;this.accum+=dt;if(this.accum<AO.CONFIG.tickMs)return;this.accum=0;
    const step=this.path.shift();if(step&&AO.Pathfinder.isWalkable(this,step.x,step.y,'player')){const ox=this.game.state.world.x,oy=this.game.state.world.y;this.markMotion(step.x-ox,step.y-oy);this.game.state.world.x=step.x;this.game.state.world.y=step.y;this.closeDistantDoors();this.checkPortal();AO.events.emit('worldChanged');}else{this.path=[];this.afterPath=null;}
    if(!this.path.length&&this.afterPath){const fn=this.afterPath;this.afterPath=null;setTimeout(fn,20);}
  }
  checkPortal(){const p=this.entities.find(e=>e.type==='portal'&&e.x===this.game.state.world.x&&e.y===this.game.state.world.y);if(p)this.load(p.to,p.toX,p.toY);}
  interact(entity){
    if(this.game.state.mode!=='explore')return;
    if(entity.type==='npc')this.game.dialogue(entity);
    else if(entity.type==='enemy')this.game.combat.start(entity);
    else if(entity.type==='portal')this.load(entity.to,entity.toX,entity.toY);
    else if(entity.type==='door')this.useDoor(entity);
    else if(entity.type==='chest')this.openChest(entity);
    else if(entity.type==='resource')this.gather(entity);
    else if(entity.type==='camp')this.game.offerCamp();
    else if(entity.type==='sign')this.game.ui.dialogue('Inscription',entity.text,[{label:'Continue',action:()=>this.game.ui.closeDialogue()}]);
    else if(entity.type==='decor')this.game.ui.dialogue(AO.Util.title(entity.kind||'Object'),entity.text||this.decorText(entity.kind),[{label:'Continue',action:()=>this.game.ui.closeDialogue()}]);
  }
  closeDoor(door,silent=true){
    if(!door||door.type!=='door'||!door.open)return false;
    door.open=false;door.blocking=true;this.game.state.world.doors[door.id]=false;
    if(!silent)this.game.toast(`${door.label||'Door'} closed.`);
    return true;
  }
  closeDistantDoors(){
    let changed=false;const pos=this.playerPos();
    for(const door of this.entities.filter(e=>e.type==='door'&&e.open&&e.autoClose!==false))if(AO.Util.dist(pos,door)>1)changed=this.closeDoor(door,true)||changed;
    if(changed)AO.events.emit('worldChanged');
  }
  useDoor(door){
    const ws=this.game.state.world;
    if(door.lockedBy&&this.game.inventory.count(door.lockedBy)<1){this.game.toast(`Locked: requires ${AO.ITEMS[door.lockedBy]?.name||'a key'}.`);return;}
    if(!door.open){door.open=true;door.blocking=false;ws.doors[door.id]=true;this.game.toast(`${door.label||'Door'} opened.`);AO.events.emit('worldChanged');return;}
    if(door.to){
      /* Open doors are a transient interaction state. They close behind the player
         during a map transition so exterior and interior door art never remains ajar. */
      this.closeDoor(door,true);this.load(door.to,door.toX,door.toY);return;
    }
    if(AO.Util.dist(this.playerPos(),door)<=1){this.closeDoor(door,false);AO.events.emit('worldChanged');}
  }
  decorText(kind){const text={table:'A sturdy table marked by years of use.',bench:'A place to rest beneath Haven’s lanterns.',lamp:'A warded lantern burns without smoke.',shelf:'Shelves packed with goods and local curiosities.',keg:'A heavy keg stamped with the Black Lantern mark.',crates:'Crates labeled for roads east and north.',bed:'A neatly made bed.',statue:'A weathered guardian watches in silence.',brazier:'Ash glows beneath a low blue flame.'};return text[kind]||'It adds another small detail to the life of this place.';}
  openChest(entity){
    this.game.state.world.opened[entity.id]=true;for(const item of entity.loot||[])this.game.inventory.add(item,1);this.game.state.player.gold+=entity.gold||0;entity.hidden=true;this.game.toast(`Chest opened: +${entity.gold||0} gold`);AO.events.emit('worldChanged');
  }
  gather(entity){this.game.state.world.gathered[entity.id]=true;this.game.inventory.add(entity.resource,1);entity.hidden=true;this.game.toast(`Gathered ${AO.ITEMS[entity.resource].name}.`);AO.events.emit('worldChanged');}
  defeat(id){this.game.state.world.defeated[id]=true;const e=this.entities.find(x=>x.id===id);if(e)e.hidden=true;AO.events.emit('worldChanged');}
};
