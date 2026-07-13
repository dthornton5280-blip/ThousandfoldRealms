/* Thousandfold Realms v1.5.7-dev — reliable real-time enemy patrol hotfix. */
(() => {
  'use strict';
  if (!window.AO || !AO.WorldSystem || !AO.Pathfinder) return;

  const BaseWorld = AO.WorldSystem;
  const STATIONARY_IDS = new Set(['stone_troll_1','ember_boss']);
  const PATROL_RADIUS = 6;

  /* Explicit routes make the currently playable enemies readable and intentional.
     Invalid points are automatically shifted to nearby walkable terrain at load time. */
  const PATROLS = {
    wilds: {
      mire_1:[[6,8],[8,8],[8,10],[5,10]],
      mire_2:[[13,10],[15,10],[15,12],[12,12]],
      mire_3:[[22,10],[24,10],[24,12],[21,12]],
      mire_4:[[25,15],[27,15],[27,13],[24,13]],
      bandit_1:[[17,4],[20,4],[20,6],[17,6]],
      bandit_2:[[26,5],[28,5],[28,3],[25,3]]
    },
    southwood_trail: {
      southwood_bandit_1:[[8,6],[11,6],[11,8],[8,8]],
      southwood_mire_1:[[22,12],[25,12],[25,14],[22,14]]
    },
    mosswater_crossing: {
      mosswater_mire_1:[[7,6],[10,6],[10,5],[7,5]],
      mosswater_mire_2:[[24,12],[27,12],[27,14],[24,14]]
    },
    ambermeadow: {
      amber_bandit_1:[[8,5],[11,5],[11,7],[8,7]],
      amber_bandit_2:[[23,13],[26,13],[26,15],[23,15]]
    },
    eastwatch_approach: {
      eastwatch_bandit_1:[[7,10],[10,10],[10,12],[7,12]],
      eastwatch_bandit_2:[[22,6],[25,6],[25,8],[22,8]]
    },
    lantern_mine: {
      stalker_1:[[9,6],[12,6],[12,9],[9,9]],
      stalker_2:[[17,7],[20,7],[20,10],[17,10]],
      stalker_3:[[23,11],[26,11],[26,14],[23,14]],
      wisp_1:[[15,4],[18,4],[18,6],[15,6]],
      wisp_2:[[25,6],[27,6],[27,9],[24,9]]
    },
    crypt: {
      skel_1:[[8,5],[10,5],[10,8],[8,8]],
      skel_2:[[13,4],[16,4],[16,7],[13,7]],
      skel_3:[[17,10],[20,10],[20,12],[17,12]],
      adept_1:[[22,11],[25,11],[25,9],[22,9]]
    }
  };

  const hash = value => {
    let out=2166136261;
    for(const char of String(value)){out^=char.charCodeAt(0);out=Math.imul(out,16777619);}
    return out>>>0;
  };

  let windowActive=true;
  if(typeof window.addEventListener==='function'){
    window.addEventListener('blur',()=>{windowActive=false;});
    window.addEventListener('focus',()=>{windowActive=true;});
  }
  if(typeof document!=='undefined'&&typeof document.addEventListener==='function'){
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)windowActive=true;});
  }

  const visibleElement = element => {
    if(!element||element.classList?.contains('hidden'))return false;
    if(typeof element.getClientRects==='function')return element.getClientRects().length>0;
    return true;
  };

  const worldPaused = game => {
    if(!game?.state||game.state.mode!=='explore')return true;
    if(!windowActive)return true;
    if(typeof document==='undefined')return false;
    if(document.hidden)return true;
    if(document.body?.classList?.contains('rpg-menu-open'))return true;
    if(visibleElement(document.querySelector?.('.hud-control-menu:not(.hidden)')))return true;
    for(const id of ['panelOverlay','dialogueOverlay','combatOverlay','levelOverlay','defeatOverlay']){
      if(visibleElement(document.getElementById?.(id)))return true;
    }
    return false;
  };

  const point = value => Array.isArray(value)?{x:value[0],y:value[1]}:{x:value.x,y:value.y};
  const key = value => `${value.x},${value.y}`;
  const playerAt = (world,value) => {
    const player=world.playerPos();
    return player.x===value.x&&player.y===value.y;
  };

  const freeTile = (world,value,entity,allowPlayer=false) => {
    if(!value||!world.isTerrainWalkable(value.x,value.y))return false;
    if(!allowPlayer&&playerAt(world,value))return false;
    return !world.entities.some(other=>other!==entity&&!other.hidden&&other.blocking!==false&&other.x===value.x&&other.y===value.y);
  };

  const nearestFree = (world,desired,entity) => {
    const origin=point(desired);
    if(freeTile(world,origin,entity))return origin;
    for(let radius=1;radius<=4;radius++){
      for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){
        if(Math.abs(dx)+Math.abs(dy)!==radius)continue;
        const candidate={x:origin.x+dx,y:origin.y+dy};
        if(freeTile(world,candidate,entity))return candidate;
      }
    }
    return null;
  };

  const routePath = (world,from,to,entity) => AO.Pathfinder.path(world,from,to,entity.id);

  const normalizeRoute = (world,entity,rawRoute) => {
    const route=[{x:entity.x,y:entity.y}];
    let cursor=route[0];
    for(const raw of rawRoute||[]){
      const candidate=nearestFree(world,raw,entity);
      if(!candidate||key(candidate)===key(cursor)||route.some(existing=>key(existing)===key(candidate)))continue;
      if(!routePath(world,cursor,candidate,entity).length)continue;
      route.push(candidate);cursor=candidate;
    }
    return route;
  };

  const deriveRoute = (world,entity) => {
    const start={x:entity.x,y:entity.y},queue=[start],distance=new Map([[key(start),0]]),tiles=[];
    while(queue.length){
      const current=queue.shift(),steps=distance.get(key(current));
      if(steps>=2)tiles.push(current);
      if(steps>=PATROL_RADIUS)continue;
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const next={x:current.x+dx,y:current.y+dy},id=key(next);
        if(distance.has(id)||!freeTile(world,next,entity))continue;
        distance.set(id,steps+1);queue.push(next);
      }
    }
    if(!tiles.length)return [start];
    tiles.sort((a,b)=>{
      const ah=hash(`${world.map?.id}:${entity.id}:${a.x}:${a.y}`),bh=hash(`${world.map?.id}:${entity.id}:${b.x}:${b.y}`);
      return bh-ah;
    });
    const first=tiles[0],second=tiles.find(tile=>Math.abs(tile.x-first.x)+Math.abs(tile.y-first.y)>=3);
    return [start,first,...(second?[second]:[])];
  };

  const moverState = (world,entity) => {
    const state=world.game.state.world;
    state.movers||={};state.movers[world.map.id]||={};
    return state.movers[world.map.id][entity.id]||={};
  };

  const saveMover = (world,entity) => {
    const state=moverState(world,entity);
    Object.assign(state,{x:entity.x,y:entity.y,patrolIndex:entity.patrolIndex||0,routineIndex:entity.patrolIndex||0,updatedDay:world.game.state.rest?.day||1});
  };

  const setupMover = (world,entity) => {
    const definition=entity.type==='enemy'?AO.ENEMIES?.[entity.enemyType]:null;
    entity.patrolStationary=!!(entity.stationary||entity.guard||definition?.boss||STATIONARY_IDS.has(entity.id));
    if(entity.patrolStationary){
      entity.patrolRoute=[{x:entity.x,y:entity.y}];entity.patrolIndex=0;entity.patrolCooldown=Infinity;return;
    }
    const authored=PATROLS[world.map?.id]?.[entity.id]||entity.patrol||(entity.routine?.length>1?entity.routine:null);
    let route=normalizeRoute(world,entity,authored);
    if(route.length<2)route=deriveRoute(world,entity);
    entity.patrolRoute=route;
    const saved=moverState(world,entity);
    const savedIndex=Number.isInteger(saved.patrolIndex)?saved.patrolIndex:Number(saved.routineIndex)||0;
    entity.patrolIndex=Math.max(0,Math.min(route.length-1,savedIndex));
    entity.patrolPace=entity.animalKind?(entity.routinePace||1450):(720+(hash(`${world.map?.id}:${entity.id}`)%330));
    entity.patrolCooldown=260+(hash(entity.id)%520);
    entity.patrolBlocked=0;
    saveMover(world,entity);
  };

  const advanceMover = (world,entity) => {
    const route=entity.patrolRoute;
    if(entity.patrolStationary||!route||route.length<2)return;
    let target=route[entity.patrolIndex]||route[0];
    if(entity.x===target.x&&entity.y===target.y){
      entity.patrolIndex=(entity.patrolIndex+1)%route.length;
      target=route[entity.patrolIndex];
    }
    const path=routePath(world,{x:entity.x,y:entity.y},target,entity),next=path[0];
    const allowPlayer=entity.type==='enemy';
    if(!next||!freeTile(world,next,entity,allowPlayer)){
      entity.patrolBlocked=(entity.patrolBlocked||0)+1;
      if(entity.patrolBlocked>=2){entity.patrolIndex=(entity.patrolIndex+1)%route.length;entity.patrolBlocked=0;}
      return;
    }
    entity.patrolBlocked=0;entity.x=next.x;entity.y=next.y;saveMover(world,entity);AO.events.emit('worldChanged');
    if(entity.type==='enemy'&&playerAt(world,entity)&&world.game.state.mode==='explore')world.game.combat.start(entity);
  };

  AO.WorldSystem=class extends BaseWorld{
    load(mapId,x=null,y=null){
      super.load(mapId,x,y);
      for(const entity of this.entities.filter(item=>!item.hidden&&(item.type==='enemy'||item.ambientAnimal)))setupMover(this,entity);
      AO.events.emit('worldChanged');
    }

    update(dt){
      /* v1.5.6 used an absolute-time/focus gate. Temporarily remove its private
         routines so the base player update still runs without double-moving entities. */
      const before=this.entities.filter(item=>!item.hidden&&(item.type==='enemy'||item.ambientAnimal)).map(entity=>[entity,entity.routine]);
      for(const [entity] of before)entity.routine=null;
      super.update(dt);
      for(const [entity,routine] of before)if(this.entities.includes(entity))entity.routine=routine;

      if(worldPaused(this.game))return;
      for(const entity of this.entities.filter(item=>!item.hidden&&(item.type==='enemy'||item.ambientAnimal))){
        if(!entity.patrolRoute)setupMover(this,entity);
        if(entity.patrolStationary)continue;
        entity.patrolCooldown-=Math.max(0,dt||0);
        if(entity.patrolCooldown>0)continue;
        entity.patrolCooldown+=entity.patrolPace;
        advanceMover(this,entity);
        if(this.game.state.mode!=='explore')break;
      }
    }
  };
})();
