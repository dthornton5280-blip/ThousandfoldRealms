/* Thousandfold Realms v1.6.7-dev — live asset, collision, and tactical-turn repairs.
   This module is loaded under a new filename so GitHub Pages cannot reuse the
   stale v1.6.6 runtime. It installs only after the canonical renderer and game
   instance exist, then preserves every established fallback and gameplay ID. */
(() => {
  'use strict';
  if(typeof window==='undefined'||!window.AO)return;

  const TILE=32;
  const ATLAS_URL='assets/thousandfold/generated/generated-props-atlas-v166.b64?v=167';
  const SPRITES={
    haven_cart_wood_sacks:{x:4,y:4,w:128,h:96,anchor:'topLeft'},
    haven_bench_wood_backrest:{x:136,y:4,w:64,h:48,anchor:'topLeft'},
    haven_signpost_wood_dual:{x:204,y:4,w:48,h:96,anchor:'bottomCenter'},
    tavern_barrel_oak:{x:256,y:4,w:32,h:40,anchor:'topLeft'},
    haven_crate_wood:{x:292,y:4,w:32,h:32,anchor:'topLeft'},
    tavern_table_square:{x:328,y:4,w:64,h:48,anchor:'topLeft'},
    tavern_chair_wood:{x:396,y:4,w:32,h:48,anchor:'topLeft'},
    tavern_stool_wood:{x:432,y:4,w:32,h:32,anchor:'topLeft'},
    tavern_hanging_lantern:{x:468,y:4,w:32,h:48,anchor:'topLeft'},
    tavern_shelf_bottles:{x:4,y:104,w:96,h:64,anchor:'topLeft'}
  };

  const DIMENSIONS=Object.fromEntries(Object.entries(SPRITES).map(([id,s])=>[id,{w:s.w,h:s.h,anchor:s.anchor}]));
  const MAP_BINDINGS={
    haven:{haven_delivery_cart:'haven_cart_wood_sacks',bench_1:'haven_bench_wood_backrest',bench_2:'haven_bench_wood_backrest',haven_east_sign:'haven_signpost_wood_dual'},
    tavern:{tavern_keg_2:'tavern_barrel_oak',tavern_supply_crates:'haven_crate_wood',tavern_table_1:'tavern_table_square',tavern_table_2:'tavern_table_square',tavern_table_3:'tavern_table_square',tavern_shelf_mugs:'tavern_shelf_bottles',tavern_stage_lamp_1:'tavern_hanging_lantern',tavern_stage_lamp_2:'tavern_hanging_lantern'},
    tavern_cellar:{cellar_keg_1:'tavern_barrel_oak',cellar_keg_2:'tavern_barrel_oak',cellar_crates:'haven_crate_wood'},
    inn:{inn_table_1:'tavern_table_square',inn_table_2:'tavern_table_square'},
    inn_upper:{upper_hall_table:'tavern_table_square'}
  };

  const applyArt=(entity,id,override={})=>{
    if(!entity||!DIMENSIONS[id])return false;
    const d=DIMENSIONS[id];
    entity.generatedArtId=id;
    entity.generatedArtW=override.w||d.w;
    entity.generatedArtH=override.h||d.h;
    entity.generatedArtAnchor=override.anchor||d.anchor;
    if(id==='tavern_hanging_lantern')entity.artLight=override.light??46;
    return true;
  };

  const patchDefinitions=()=>{
    for(const [mapId,bindings] of Object.entries(MAP_BINDINGS)){
      const objects=AO.MAP_DEFS?.[mapId]?.objects||[];
      for(const [entityId,assetId] of Object.entries(bindings))applyArt(objects.find(entity=>entity.id===entityId),assetId);
    }
    for(const mapId of ['inn','inn_upper','tavern']){
      for(const entity of AO.MAP_DEFS?.[mapId]?.objects||[]){
        if(entity.kind==='chair')applyArt(entity,'tavern_chair_wood');
        if(entity.kind==='stool')applyArt(entity,'tavern_stool_wood');
      }
    }
    for(const mapId of ['general_store','forge'])for(const entity of AO.MAP_DEFS?.[mapId]?.objects||[])if(entity.kind==='crates')applyArt(entity,'haven_crate_wood');
  };

  const copyDefinitionArt=(entity,mapId=window.game?.world?.map?.id)=>{
    if(!entity||!mapId)return entity;
    const definition=AO.MAP_DEFS?.[mapId]?.objects?.find(entry=>entry.id===entity.id);
    if(definition?.generatedArtId)Object.assign(entity,{
      generatedArtId:definition.generatedArtId,
      generatedArtW:definition.generatedArtW,
      generatedArtH:definition.generatedArtH,
      generatedArtAnchor:definition.generatedArtAnchor,
      artLight:definition.artLight
    });
    return entity;
  };

  const patchCurrentWorld=()=>{
    patchDefinitions();
    const mapId=window.game?.world?.map?.id,entities=window.game?.world?.entities;
    if(!mapId||!Array.isArray(entities))return;
    for(const entity of entities)copyDefinitionArt(entity,mapId);
  };

  const PropArt={
    image:null,ready:false,loading:false,failed:false,
    async init(){
      if(this.ready||this.loading)return;
      this.loading=true;
      try{
        const response=await fetch(ATLAS_URL,{cache:'reload'});
        if(!response.ok)throw new Error(`v1.6.7 prop atlas ${response.status}`);
        const base64=(await response.text()).replace(/\s+/g,'');
        const image=new Image();image.decoding='async';
        image.onload=()=>{
          this.image=image;this.ready=true;this.failed=false;this.loading=false;
          patchCurrentWorld();AO.events?.emit?.('assetsReady');AO.events?.emit?.('worldChanged');
        };
        image.onerror=()=>this.fail(new Error('decoded atlas image failed'));
        image.src=`data:image/png;base64,${base64}`;
      }catch(error){this.fail(error);}
    },
    fail(error){this.failed=true;this.loading=false;console.warn('Thousandfold Realms v1.6.7 prop atlas failed; established fallback art remains active.',error||'');},
    drawEntity(ctx,rawEntity){
      const entity=copyDefinitionArt(rawEntity),id=entity?.generatedArtId,sprite=SPRITES[id];
      if(!ctx||!entity||!id||!sprite||!this.ready||!this.image)return false;
      const w=entity.generatedArtW||sprite.w,h=entity.generatedArtH||sprite.h,anchor=entity.generatedArtAnchor||entity.artAnchor||sprite.anchor;
      const x=anchor==='topLeft'?entity.x*TILE:entity.x*TILE+TILE/2-w/2;
      const y=anchor==='topLeft'?entity.y*TILE:entity.y*TILE+TILE-h;
      ctx.save();ctx.imageSmoothingEnabled=false;
      if(entity.artLight&&ctx.createRadialGradient){const cx=x+w/2,cy=y+h*.52,r=entity.artLight,g=ctx.createRadialGradient(cx,cy,2,cx,cy,r);g.addColorStop(0,'rgba(255,207,104,.28)');g.addColorStop(1,'rgba(255,178,55,0)');ctx.fillStyle=g;ctx.fillRect(cx-r,cy-r,r*2,r*2);}
      ctx.drawImage(this.image,sprite.x,sprite.y,sprite.w,sprite.h,Math.round(x),Math.round(y),Math.round(w),Math.round(h));
      ctx.restore();return true;
    }
  };

  const buildingAt=(world,x,y)=>{
    const building=(world?.map?.buildings||[]).find(entry=>x>=entry.x&&x<entry.x+entry.w&&y>=entry.y&&y<entry.y+entry.h);
    if(!building)return null;
    const door=world.entities?.find(entity=>entity.id===building.doorId);
    if(door&&door.x===x&&door.y===y)return null;
    return building;
  };

  const staticBlockerAt=(world,x,y,ignoreId=null)=>{
    const geometry=AO.EntityGeometry;
    return world?.entities?.find(entity=>entity.id!==ignoreId&&entity.type!=='enemy'&&entity.blocking!==false&&!entity.hidden&&(geometry?.contains?geometry.contains(entity,x,y):entity.x===x&&entity.y===y));
  };

  const nearestSafeCell=(world,start)=>{
    const queue=[start],seen=new Set([`${start.x},${start.y}`]);
    while(queue.length){
      const current=queue.shift();
      if(!buildingAt(world,current.x,current.y)&&world.isTerrainWalkable(current.x,current.y)&&!staticBlockerAt(world,current.x,current.y,'player'))return current;
      for(const [dx,dy] of [[0,1],[1,0],[-1,0],[0,-1]]){
        const next={x:current.x+dx,y:current.y+dy},key=`${next.x},${next.y}`;
        if(seen.has(key)||next.x<0||next.y<0||next.x>=AO.CONFIG.mapWidth||next.y>=AO.CONFIG.mapHeight)continue;
        seen.add(key);queue.push(next);
      }
    }
    return world.map?.start||{x:14,y:15};
  };

  const repairPlayerPosition=world=>{
    if(!world||!window.game?.state)return false;
    const position=world.playerPos();
    if(!buildingAt(world,position.x,position.y))return false;
    const safe=nearestSafeCell(world,position);window.game.state.world.x=safe.x;window.game.state.world.y=safe.y;world.path=[];world.afterPath=null;
    window.game.toast?.('Your position was moved outside a solid building.');AO.events?.emit?.('worldChanged');return true;
  };

  const installWorldCollision=()=>{
    if(AO.LiveRuntimeV167?.worldCollisionInstalled||!AO.Pathfinder||!AO.WorldSystem)return false;
    const priorWalkable=AO.Pathfinder.isWalkable.bind(AO.Pathfinder);
    /* The footprint interaction runtime deliberately restores the integrated
       doorway cell as the one traversable opening in each painted facade.
       Preserve that exception when this late safety wrapper is installed;
       otherwise the visual door is recognized but every route to it is
       rejected as solid building geometry. */
    AO.Pathfinder.isWalkable=function(world,x,y,ignoreEntityId=null){
      const building=buildingAt(world,x,y),door=building&&world?.entities?.find(entity=>entity.id===building.doorId&&!entity.hidden);
      if(building&&!(door&&AO.EntityGeometry?.contains(door,x,y)))return false;
      return priorWalkable(world,x,y,ignoreEntityId);
    };
    const priorLoad=AO.WorldSystem.prototype.load;
    AO.WorldSystem.prototype.load=function(...args){const result=priorLoad.apply(this,args);patchCurrentWorld();repairPlayerPosition(this);return result;};
    AO.LiveRuntimeV167.worldCollisionInstalled=true;return true;
  };

  const movementChoicesRemain=combat=>{
    const current=combat?.current,player=combat?.playerActor?.();if(!current||!player||current.movementRemaining<=0)return false;
    const here=`${player.x},${player.y}`,map=combat.movementMap('player',current.movementRemaining);
    return [...map.keys()].some(key=>key!==here);
  };

  const installCombatRepairs=()=>{
    const proto=AO.CombatSystem?.prototype;if(!proto||typeof proto.movePlayerTo!=='function'||AO.LiveRuntimeV167?.combatInstalled)return false;
    proto.maybeAutoEndPlayerTurn=function(){
      const encounter=this.current;if(!encounter||!this.isPlayerTurn()||encounter.actionRemaining>0||movementChoicesRemain(this))return false;
      const token=`${encounter.id}:${encounter.round}:${encounter.turnIndex}`;
      clearTimeout(this.autoEndTimer);this.autoEndTimer=setTimeout(()=>{
        const current=this.current,currentToken=current&&`${current.id}:${current.round}:${current.turnIndex}`;
        if(currentToken===token&&this.isPlayerTurn()&&current.actionRemaining<=0&&!movementChoicesRemain(this))this.endPlayerTurn();
      },this.game.state.settings?.reducedMotion?30:180);return true;
    };
    for(const method of ['movePlayerTo','playerAction','executeSelfAbility','useItem','bracePlayer']){
      const prior=proto[method];if(typeof prior!=='function'||prior.tfrV167Wrapped)continue;
      const wrapped=function(...args){const result=prior.apply(this,args);if(this.current)this.maybeAutoEndPlayerTurn();return result;};wrapped.tfrV167Wrapped=true;proto[method]=wrapped;
    }
    const priorTileWalkable=proto.tileWalkable;
    proto.tileWalkable=function(x,y,ignoreId=null){if(buildingAt(this.game.world,x,y)||staticBlockerAt(this.game.world,x,y,ignoreId))return false;return priorTileWalkable.call(this,x,y,ignoreId);};
    AO.LiveRuntimeV167.combatInstalled=true;return true;
  };

  const installCombatInput=()=>{
    const game=window.game;if(!game?.canvas||game.canvas.dataset.tfrCombatInputV167)return false;
    game.canvas.dataset.tfrCombatInputV167='true';
    window.addEventListener('keydown',event=>{
      if(window.game?.state?.mode!=='combat')return;
      const key=event.key.toLowerCase(),moves={arrowup:[0,-1],arrowdown:[0,1],arrowleft:[-1,0],arrowright:[1,0]};
      if(!moves[key])return;event.preventDefault();event.stopImmediatePropagation();window.game.combat.moveBy(...moves[key]);
    },true);
    game.canvas.addEventListener('click',event=>{
      if(window.game?.state?.mode!=='combat'||performance.now()<(window.game.suppressCanvasClickUntil||0))return;
      const rect=game.canvas.getBoundingClientRect(),sx=game.canvas.width/rect.width,sy=game.canvas.height/rect.height,px=(event.clientX-rect.left)*sx,py=(event.clientY-rect.top)*sy,point=game.renderer.screenToWorld(px,py);
      game.combat.handleMapClick(Math.floor(point.x/TILE),Math.floor(point.y/TILE));
    });
    return true;
  };

  const installLateRenderHook=()=>{
    if(!AO.SpriteFactory?.icon||AO.SpriteFactory.icon.tfrGeneratedPropsV167)return false;
    const prior=AO.SpriteFactory.icon.bind(AO.SpriteFactory);
    const wrapped=function(ctx,x,y,type,entity={}){if(PropArt.drawEntity(ctx,entity))return;return prior(ctx,x,y,type,entity);};
    wrapped.tfrGeneratedPropsV167=true;AO.SpriteFactory.icon=wrapped;return true;
  };

  AO.LiveRuntimeV167={version:'1.6.7-dev',buildingAt,staticBlockerAt,repairPlayerPosition,patchDefinitions,patchCurrentWorld,movementChoicesRemain,worldCollisionInstalled:false,combatInstalled:false};
  AO.GeneratedPropArt=PropArt;
  patchDefinitions();PropArt.init();

  let attempts=0;
  const timer=setInterval(()=>{
    patchCurrentWorld();
    if(window.game){
      installWorldCollision();installCombatRepairs();installCombatInput();
      if(AO.GeneratedSpriteContent?.installed)installLateRenderHook();
    }
    if(window.game&&PropArt.ready&&AO.LiveRuntimeV167.worldCollisionInstalled&&AO.LiveRuntimeV167.combatInstalled&&AO.SpriteFactory?.icon?.tfrGeneratedPropsV167){repairPlayerPosition(window.game.world);clearInterval(timer);}
    else if(++attempts>400)clearInterval(timer);
  },25);
})();
