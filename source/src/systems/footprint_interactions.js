/* Thousandfold Realms v1.6.1-dev — footprint-aware movement and world-object interactions. */
(() => {
  'use strict';
  if(!window.AO||!AO.Pathfinder||!AO.WorldSystem||!AO.EntityGeometry)return;

  const G=AO.EntityGeometry;
  const terrainBlocked=new Set(['tree','stonewall','water','lilywater','roof','woodwall','bar','cliff_face','waterfall','rocks','shrub','fence','reeds']);

  AO.Pathfinder.isWalkable=function(world,x,y,ignoreEntityId=null){
    if(x<0||y<0||x>=AO.CONFIG.mapWidth||y>=AO.CONFIG.mapHeight)return false;
    if(terrainBlocked.has(world.grid[y]?.[x]))return false;
    return !world.entities.some(entity=>entity.id!==ignoreEntityId&&entity.blocking!==false&&!entity.hidden&&G.contains(entity,x,y));
  };
  AO.Pathfinder.nearestAdjacent=function(world,start,target,ignoreEntityId=null){
    const range=Math.max(1,Number(target.interactionRange)||1),spots=G.adjacentCells(world,target,range,ignoreEntityId);
    let best=null;for(const spot of spots){const path=this.path(world,start,spot,ignoreEntityId);if(path.length&&(!best||path.length<best.length))best=path;}return best||[];
  };

  const hash=value=>{let out=2166136261;for(const char of String(value)){out^=char.charCodeAt(0);out=Math.imul(out,16777619);}return out>>>0;};
  const normalizeLoot=loot=>(loot||[]).map(entry=>typeof entry==='string'?{id:entry,qty:1}:{id:entry.id,qty:entry.qty||1}).filter(entry=>AO.ITEMS[entry.id]);

  const BaseWorld=AO.WorldSystem;
  AO.WorldSystem=class extends BaseWorld{
    load(mapId,x=null,y=null){
      super.load(mapId,x,y);
      const state=this.game.state.world;state.searchedDecor||={};state.usedDecor||={};
    }
    entityAt(x,y,interaction=false){
      return this.entities.find(entity=>!entity.hidden&&!(entity.type==='door'&&entity.open&&!entity.to)&&G.contains(entity,x,y,interaction));
    }
    click(x,y){
      if(this.game.state.mode!=='explore')return;
      const entity=this.entityAt(x,y,true);if(entity){this.approachAndInteract(entity);return;}
      const path=AO.Pathfinder.path(this,this.playerPos(),{x,y},'player');if(path.length)this.setPath(path);
    }
    approachAndInteract(entity){
      const range=Math.max(1,Number(entity.interactionRange)||1),distance=G.distance(this.playerPos(),entity,true);
      if(distance<=range||(entity.type==='portal'&&distance===0)){this.interact(entity);return;}
      const path=AO.Pathfinder.nearestAdjacent(this,this.playerPos(),entity,'player');if(path.length)this.setPath(path,()=>this.interact(entity));else this.game.toast('No clear path.');
    }
    keyboardMove(dx,dy){
      if(this.game.state.mode!=='explore')return;this.path=[];this.afterPath=null;
      const nx=this.game.state.world.x+dx,ny=this.game.state.world.y+dy,entity=this.entityAt(nx,ny,false);
      if(entity){this.interact(entity);return;}
      if(AO.Pathfinder.isWalkable(this,nx,ny,'player')){this.markMotion(dx,dy);this.game.state.world.x=nx;this.game.state.world.y=ny;this.closeDistantDoors();this.checkPortal();AO.events.emit('worldChanged');}
    }
    reachableTiles(start){
      const out=new Set(),queue=[start],key=AO.Util.key;out.add(key(start.x,start.y));
      while(queue.length){
        const current=queue.shift();
        for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
          const x=current.x+dx,y=current.y+dy,k=key(x,y);if(out.has(k)||!this.isTerrainWalkable(x,y))continue;
          if(this.entities.some(entity=>entity.type!=='door'&&entity.blocking!==false&&!entity.hidden&&G.contains(entity,x,y)))continue;
          out.add(k);queue.push({x,y});
        }
      }
      return out;
    }
    safeEnemySpawn(spawn,playerPos,reachable){
      const key=AO.Util.key,isFree=(x,y)=>reachable.has(key(x,y))&&this.isTerrainWalkable(x,y)&&!(x===playerPos.x&&y===playerPos.y)&&!this.entities.some(entity=>entity.blocking!==false&&!entity.hidden&&G.contains(entity,x,y));
      const hasApproach=(x,y)=>[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>reachable.has(key(x+dx,y+dy)));
      if(isFree(spawn.x,spawn.y)&&hasApproach(spawn.x,spawn.y))return{x:spawn.x,y:spawn.y};
      const candidates=[];for(const entry of reachable){const [x,y]=entry.split(',').map(Number);if(!isFree(x,y)||!hasApproach(x,y))continue;candidates.push({x,y,distance:Math.abs(x-spawn.x)+Math.abs(y-spawn.y),playerDistance:Math.abs(x-playerPos.x)+Math.abs(y-playerPos.y)});}
      candidates.sort((a,b)=>a.distance-b.distance||b.playerDistance-a.playerDistance||a.y-b.y||a.x-b.x);return candidates[0]||null;
    }
    closeDistantDoors(){
      let changed=false;const position=this.playerPos();
      for(const door of this.entities.filter(entity=>entity.type==='door'&&entity.open&&entity.autoClose!==false))if(G.distance(position,door)>1)changed=this.closeDoor(door,true)||changed;
      if(changed)AO.events.emit('worldChanged');
    }
    interact(entity){
      if(entity?.type!=='decor'&&entity?.type!=='sign')return super.interact(entity);
      if(this.game.state.mode!=='explore')return;
      if(entity.type==='sign'&&!entity.searchable&&!entity.useAction&&!entity.artInteractive)return super.interact(entity);
      this.offerObjectInteraction(entity);
    }
    offerObjectInteraction(entity){
      const title=entity.name||AO.Util.title(entity.kind||entity.type||'Object'),description=entity.description||entity.text||this.decorText(entity.kind),choices=[];
      const state=this.game.state.world;
      if(entity.searchable){
        const searched=state.searchedDecor[entity.id];
        choices.push({
          label:searched?(entity.searchAgainLabel||'Search again.'):(entity.searchLabel||'Search carefully.'),
          action:()=>searched?this.showObjectResult(title,entity.searchable.emptyText||'You find nothing else of use.'):this.searchObject(entity)
        });
      }
      if(entity.useAction){
        const action=entity.useAction,used=state.usedDecor[entity.id],blocked=action.oncePerDay&&used===this.game.state.rest?.day;
        choices.push({
          label:blocked?(action.usedLabel||'You have already used this today.'):(action.label||'Use it.'),
          action:()=>blocked?this.showObjectResult(title,action.usedText||'Nothing more happens today.'):this.useObject(entity),
          disabled:blocked
        });
      }
      choices.push({label:'Leave it.',action:()=>this.game.ui.closeDialogue()});
      this.game.state.mode='dialogue';this.game.ui.dialogue(title,description,choices,null,entity.subtitle||'World Detail');
    }
    showObjectResult(title,text){
      this.game.state.mode='dialogue';this.game.ui.dialogue(title,text,[{label:'Continue',action:()=>this.game.ui.closeDialogue()}],null,'Discovery');
    }
    searchObject(entity){
      const spec=entity.searchable===true?{}:entity.searchable,state=this.game.state.world,seed=hash(`${this.game.state.player.name||'hero'}:${state.mapId}:${entity.id}`),roll=(seed%10000)/10000,found=roll<(spec.chance??0.45);
      let text=spec.emptyText||'Dust, old scraps, and nothing worth carrying.';
      if(found){
        const loot=normalizeLoot(spec.loot),rewards=[];
        if(loot.length){const selected=loot[seed%loot.length];this.game.inventory.add(selected.id,selected.qty);rewards.push(`${AO.ITEMS[selected.id].name}${selected.qty>1?` ×${selected.qty}`:''}`);}
        if(spec.gold){const range=Array.isArray(spec.gold)?spec.gold:[spec.gold,spec.gold],gold=Math.max(0,range[0]+(seed%Math.max(1,range[1]-range[0]+1)));if(gold){this.game.state.player.gold+=gold;rewards.push(`${gold} gold`);}}
        text=spec.foundText||`You uncover ${rewards.join(' and ')||'something useful'}.`;
        if(spec.xp)this.game.progression.grantXp(spec.xp);
      }
      state.searchedDecor[entity.id]={found,day:this.game.state.rest?.day||1};AO.events.emit('playerChanged');this.showObjectResult(entity.name||AO.Util.title(entity.kind||'Object'),text);
    }
    useObject(entity){
      const action=entity.useAction,p=this.game.state.player,rewards=[];
      if(action.hp){const gain=Math.max(0,Math.min(action.hp,p.maxHp-p.hp));p.hp+=gain;if(gain)rewards.push(`${gain} health`);}
      if(action.mana){const gain=Math.max(0,Math.min(action.mana,p.maxMana-p.mana));p.mana+=gain;if(gain)rewards.push(`${gain} mana`);}
      if(action.stamina){const gain=Math.max(0,Math.min(action.stamina,p.maxStamina-p.stamina));p.stamina+=gain;if(gain)rewards.push(`${gain} stamina`);}
      if(action.item&&AO.ITEMS[action.item]){this.game.inventory.add(action.item,action.qty||1);rewards.push(AO.ITEMS[action.item].name);}
      if(action.xp)this.game.progression.grantXp(action.xp);
      this.game.state.world.usedDecor[entity.id]=action.oncePerDay?(this.game.state.rest?.day||1):true;AO.events.emit('playerChanged');
      const text=action.text||(rewards.length?`You recover ${rewards.join(', ')}.`:'You take a quiet moment with it.');this.showObjectResult(entity.name||AO.Util.title(entity.kind||'Object'),text);
    }
  };
})();
