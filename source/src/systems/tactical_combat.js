/* Thousandfold Realms v1.4.0 — map-based tactical combat foundation.
   This layer preserves all v1.3 content IDs and replaces the isolated duel flow
   with serializable multi-actor encounters on the existing world grid. */

AO.TACTICAL_TERRAIN = {
  shallow_water:{cost:2,hazard:'wet',label:'Shallow water'},
  waterfall_pool:{cost:2,hazard:'wet',label:'Waterfall pool'},
  reeds:{cost:2,cover:1,label:'Dense reeds'},
  shrub:{cost:2,cover:1,label:'Dense brush'},
  flower_patch:{cost:1,label:'Flowers'},
  stairs:{cost:1,elevation:1,label:'Stairs'},
  moss_stone:{cost:1,elevation:1,cover:1,label:'Raised stone'},
  rune:{cost:1,hazard:'arcane',label:'Unstable rune'},
  forgefloor:{cost:1,hazard:'heat',label:'Hot forge floor'},
  bridge:{cost:1,elevation:1,label:'Bridge'},
  path:{cost:1,label:'Road'},
  cobble:{cost:1,label:'Cobble'},
  grass:{cost:1,label:'Grass'}
};

AO.TacticalRules = {
  blockingTiles:new Set(['tree','stonewall','water','lilywater','roof','woodwall','bar','cliff_face','waterfall','rocks','fence']),
  rangedEnemyTypes:new Set(['marsh_witch','bone_mage','ember_adept','crystal_wisp','star_spawn','void_eye','cinder_drake','ash_crowned']),
  rangedAbilityPattern:/(shot|arrow|volley|lance|sunlance|hurl|stormtrap|roots|gravity|glacier|starfall|verdict|voidbrand|soulchain|clause|spore|worldroot|judgment|mark|trap)/,
  tileInfo(tile){return AO.TACTICAL_TERRAIN[tile]||{cost:1,label:AO.Util.title(tile||'terrain')};},
  weaponRange(game){
    const weapon=AO.ITEMS[game.state.player.equipment.weapon];
    const name=(weapon?.name||'').toLowerCase(),icon=weapon?.icon||'';
    return /bow|crossbow|staff|wand|sling/.test(name)||['🏹','🌌'].includes(icon)?6:1;
  },
  abilityRange(game,a){
    if(!a||a.target==='self')return 0;
    if(typeof a.range==='number')return a.range;
    if(a.kind==='spell'||a.kind==='drain')return 6;
    if(this.rangedAbilityPattern.test(a.id)||this.rangedAbilityPattern.test((a.name||'').toLowerCase()))return 7;
    if(a.range==='weapon'||a.id==='basic_attack')return this.weaponRange(game);
    return 1;
  },
  elevation(world,x,y){return this.tileInfo(world.grid?.[y]?.[x]).elevation||0;},
  terrainCost(world,x,y){return this.tileInfo(world.grid?.[y]?.[x]).cost||1;},
  hazard(world,x,y){return this.tileInfo(world.grid?.[y]?.[x]).hazard||null;}
};

const ExpandedDuelCombat = AO.CombatSystem;
AO.CombatSystem = class extends ExpandedDuelCombat {
  constructor(game){super(game);this.current=null;this.aiTimer=null;}

  actor(id){return this.current?.actors?.[id]||null;}
  livingEnemies(){return Object.values(this.current?.actors||{}).filter(a=>a.side==='enemy'&&a.hp>0);}
  playerActor(){return this.actor('player');}
  activeActor(){return this.actor(this.current?.turnOrder?.[this.current?.turnIndex||0]);}
  isPlayerTurn(){return this.activeActor()?.id==='player'&&this.current?.phase==='player';}
  distance(a,b){return Math.abs(a.x-b.x)+Math.abs(a.y-b.y);}
  key(x,y){return AO.Util.key(x,y);}
  grid(){return this.current?.battlefield?.grid||this.game.world.grid;}
  tileAt(x,y){return this.grid()?.[y]?.[x];}
  terrainWorld(){return{grid:this.grid()};}
  regionProfile(){const mapId=this.game.world.map?.id;return AO.TACTICAL_REGION_PROFILES?.[mapId]||{minLevel:1,maxLevel:20,baseBudget:2,maxGroup:3};}
  enemyThreat(type){const e=AO.ENEMIES[type];if(!e)return 99;const avg=(e.attack?.[0]||1)*((e.attack?.[1]||4)+1)/2+(e.attack?.[2]||0);return Math.max(.55,(e.level||1)*.55+(e.hp||10)/35+avg/12+(AO.TacticalRules.rangedEnemyTypes.has(type)?.3:0)+(e.boss?3:0));}
  encounterBudget(){const p=this.game.state.player,profile=this.regionProfile(),gear=(p.ac-10)*.06+(p.gearBonuses?.bonusDamage||0)*.05;return profile.baseBudget+Math.max(0,p.level-profile.minLevel)*.48+gear;}
  threatAssessment(enemies){const cost=enemies.reduce((n,e)=>n+this.enemyThreat(e.enemyType),0),budget=this.encounterBudget(),ratio=cost/Math.max(.1,budget);return{cost,budget,ratio,label:ratio<=.72?'Favorable':ratio<=1.08?'Even':ratio<=1.42?'Dangerous':'Deadly'};}

  start(spawn){
    if(this.current||!spawn)return;
    const enemies=this.collectEncounterEnemies(spawn);
    if(!enemies.length)return;
    const pos=this.game.world.playerPos(),actors={
      player:{id:'player',side:'player',name:this.game.state.player.name,x:pos.x,y:pos.y,reaction:true,statuses:[]}
    };
    for(const entity of enemies){
      const actor=this.createEnemyActor(entity);
      if(actor)actors[actor.id]=actor;
    }
    this.applyGroupBudget(actors);
    const boundary=this.makeBoundary(Object.values(actors)),seed=`${this.game.state.world.mapId}:${spawn.id}:${Date.now()}:${Math.random()}`,battlefield=AO.TacticalBattlefields.build(this.game.world.map,this.game.world.grid,boundary,Object.values(actors),seed),assessment=this.threatAssessment(Object.values(actors).filter(a=>a.side==='enemy'));
    const initiative=Object.values(actors).map(actor=>({
      id:actor.id,
      score:AO.Util.d20()+(actor.side==='player'?AO.Util.statMod(this.game.stat('dex')):actor.level)
    })).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
    this.current={
      schema:2,id:AO.Util.id('encounter'),mapId:this.game.state.world.mapId,round:1,
      phase:'starting',turnOrder:initiative.map(x=>x.id),turnIndex:0,actors,boundary,battlefield,threat:assessment,
      camera:{x:(boundary.minX+boundary.maxX+1)*AO.CONFIG.tile/2,y:(boundary.minY+boundary.maxY+1)*AO.CONFIG.tile/2,zoom:1.34},
      selectedTargetId:Object.keys(actors).find(id=>id!=='player')||null,pendingAbilityId:null,
      movementRemaining:0,actionRemaining:0,playerGuard:0,playerStatuses:[],cooldowns:{},
      advantage:false,empowered:false,raging:false,luckUsed:false,combo:0,reactions:[],
      retreatAvailable:false,log:[],createdAt:Date.now()
    };
    this.game.state.encounter=this.current;
    this.game.state.mode='combat';
    this.game.world.path=[];
    this.game.ui.closeCombat();
    this.syncWorldActors();
    this.addLog(`${this.livingEnemies().length} enem${this.livingEnemies().length===1?'y':'ies'} close in at ${battlefield.name}. Threat: ${assessment.label}.`);
    this.addLog(`Initiative: ${initiative.map(x=>`${this.actor(x.id).name} ${x.score}`).join(' • ')}`);
    this.game.ui.openTacticalCombat?.();
    this.beginTurn();
  }

  resume(saved){
    if(!saved||saved.mapId!==this.game.state.world.mapId)return false;
    this.current=saved;
    this.game.state.encounter=this.current;
    this.game.state.mode='combat';
    this.current.schema||=1;this.current.battlefield||=AO.TacticalBattlefields.build(this.game.world.map,this.game.world.grid,this.current.boundary,Object.values(this.current.actors),this.current.id);this.current.threat||=this.threatAssessment(Object.values(this.current.actors).filter(a=>a.side==='enemy'));this.current.camera||={x:(this.current.boundary.minX+this.current.boundary.maxX+1)*AO.CONFIG.tile/2,y:(this.current.boundary.minY+this.current.boundary.maxY+1)*AO.CONFIG.tile/2,zoom:1.34};
    this.current.playerStatuses||=[];
    this.current.cooldowns||={};
    this.current.log||=[];
    this.current.actors.player||={id:'player',side:'player',name:this.game.state.player.name,x:this.game.state.world.x,y:this.game.state.world.y,reaction:true,statuses:[]};
    this.syncWorldActors();
    this.game.ui.openTacticalCombat?.();
    this.refresh();
    if(this.activeActor()?.side==='enemy')this.scheduleEnemyTurn();
    return true;
  }

  collectEncounterEnemies(spawn){
    const world=this.game.world,origin={x:spawn.x??this.game.state.world.x,y:spawn.y??this.game.state.world.y},playerLevel=this.game.state.player.level,profile=this.regionProfile(),maxGroup=Math.min(profile.maxGroup,playerLevel<=1?2:playerLevel<=3?3:profile.maxGroup),budget=this.encounterBudget(),eligibleType=type=>{const level=AO.ENEMIES[type]?.level||99;return level>=profile.minLevel-1&&level<=Math.min(profile.maxLevel,playerLevel<=1?1:playerLevel+1);};
    if(spawn.random){
      const table=AO.ENCOUNTER_TABLES[world.map?.id]||[spawn.enemyType],pool=table.filter(eligibleType),safePool=pool.length?pool:[spawn.enemyType].filter(eligibleType);
      if(!safePool.length)return[];
      /* Ambient encounters may only select a primary enemy that fits the current regional threat budget.
         This prevents a level-two or level-three roster entry from bypassing the budget simply because
         it was randomly chosen before the rest of the squad was assembled. */
      const affordable=safePool.filter(type=>this.enemyThreat(type)<=budget*1.08),primaryPool=affordable.length?affordable:[...safePool].sort((a,b)=>this.enemyThreat(a)-this.enemyThreat(b)).slice(0,1);
      const types=[],requested=primaryPool.includes(spawn.enemyType)?spawn.enemyType:null,primary=requested||primaryPool[AO.Util.rand(0,primaryPool.length-1)];let spent=0;
      for(const type of [primary,...Array.from({length:maxGroup*3},()=>primaryPool[AO.Util.rand(0,primaryPool.length-1)])]){const cost=this.enemyThreat(type);if(types.length&&spent+cost>budget)continue;types.push(type);spent+=cost;if(types.length>=maxGroup)break;}
      const spots=this.openSpotsAround(this.game.world.playerPos(),7,types.length);
      return types.map((type,i)=>({id:i===0?spawn.id:`${spawn.id}_${i+1}`,enemyType:type,type:'enemy',x:spots[i]?.x??origin.x,y:spots[i]?.y??origin.y,random:true}));
    }
    const all=world.entities.filter(e=>!e.hidden&&e.type==='enemy').sort((a,b)=>this.distance(a,origin)-this.distance(b,origin)),chosen=[];let spent=0;
    for(const entity of all){
      if(entity.id!==spawn.id&&this.distance(entity,origin)>6)continue;
      const level=AO.ENEMIES[entity.enemyType]?.level||99;if(entity.id!==spawn.id&&!eligibleType(entity.enemyType))continue;
      const cost=this.enemyThreat(entity.enemyType);
      if(entity.id!==spawn.id&&(chosen.length>=maxGroup||spent+cost>budget))continue;
      if(entity.id===spawn.id||level<=playerLevel+1||AO.ENEMIES[entity.enemyType]?.boss){chosen.push(entity);spent+=cost;}
    }
    if(!chosen.some(e=>e.id===spawn.id))chosen.unshift(spawn);
    return chosen.slice(0,maxGroup);
  }

  openSpotsAround(center,radius,count){
    const out=[];
    for(let r=2;r<=radius&&out.length<count;r++){
      const candidates=[];
      for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
        if(Math.abs(dx)+Math.abs(dy)!==r)continue;
        const x=center.x+dx,y=center.y+dy;
        if(!AO.TacticalRules.blockingTiles.has(this.game.world.grid?.[y]?.[x])&&!this.game.world.entityAt(x,y))candidates.push({x,y});
      }
      candidates.sort((a,b)=>a.y-b.y||a.x-b.x);
      for(const c of candidates){out.push(c);if(out.length>=count)break;}
    }
    return out;
  }

  createEnemyActor(entity){
    const def=AO.ENEMIES[entity.enemyType];if(!def)return null;
    const p=this.game.state.player,diff=AO.DIFFICULTIES[this.game.state.settings?.difficulty||'adventurer']||AO.DIFFICULTIES.adventurer;
    const copy=AO.Util.deepCopy(def),delta=entity.random?Math.max(0,Math.min(2,p.level-copy.level)):0;let scale=(1+delta*.08)*diff.enemyHp;
    copy.level+=delta;copy.ac=Math.max(8,copy.ac+Math.floor(delta/2)+diff.enemyAc);copy.attack=[copy.attack[0],copy.attack[1],Math.round(copy.attack[2]+delta*1.2)];
    const openingTier=!!(entity.random&&p.level===1&&this.game.world.map?.id==='wilds'&&copy.level===1);
    if(openingTier){
      /* Opening-road enemies are intentionally weaker variants, not player-stat inflation.
         They teach movement, range, guard, and terrain before the full regional roster appears. */
      copy.name=`${copy.name} Scout`;copy.attack=[1,4,0];copy.ac=Math.min(copy.ac,10);scale*=.76;
    }
    let maxHp=Math.round(copy.hp*scale),elite=!openingTier&&!copy.boss&&p.level>=4&&Math.random()<.12,affix=null;
    if(elite){const affixes=['Frenzied','Ironhide','Venomous','Arcane'];affix=affixes[AO.Util.rand(0,affixes.length-1)];maxHp=Math.round(maxHp*1.25);if(affix==='Ironhide')copy.ac+=2;copy.name=`${affix} ${copy.name}`;}
    this.game.state.bestiary||={};this.game.state.bestiary[entity.enemyType]=(this.game.state.bestiary[entity.enemyType]||0)+1;
    return {id:entity.id,spawnId:entity.id,side:'enemy',enemyType:entity.enemyType,name:copy.name,x:entity.x,y:entity.y,level:copy.level,hp:maxHp,maxHp,ac:copy.ac,attack:copy.attack,damageScale:diff.enemyDamage*(openingTier?.78:1),weakness:copy.weakness,resist:copy.resist,xp:Math.max(1,Math.round(copy.xp*(openingTier?.82:1))),gold:copy.gold,loot:copy.loot||[],visual:copy.visual,boss:!!copy.boss,elite,affix,openingTier,guard:0,statuses:[],stagger:0,staggerMax:Math.round(30+maxHp*.22),reaction:true,move:AO.TacticalRules.rangedEnemyTypes.has(entity.enemyType)?4:5,intent:'Assessing',random:!!entity.random};
  }

  applyGroupBudget(actors){
    const enemies=Object.values(actors).filter(a=>a.side==='enemy');if(enemies.length<2)return;
    const hpFactor=enemies.length===2?.94:enemies.length===3?.86:enemies.length===4?.80:.76;
    const damageFactor=enemies.length===2?.84:enemies.length===3?.72:enemies.length===4?.65:.60;
    const rewardFactor=enemies.length===2?.90:enemies.length===3?.82:enemies.length===4?.76:.70;
    enemies.forEach((actor,index)=>{
      if(actor.boss)return;actor.groupIndex=index;actor.threatScale=hpFactor;actor.maxHp=Math.max(6,Math.round(actor.maxHp*hpFactor));actor.hp=actor.maxHp;
      actor.damageScale=Math.max(.48,actor.damageScale*damageFactor*(index?0.94:1));actor.xp=Math.max(1,Math.round(actor.xp*rewardFactor));
      actor.gold=[Math.max(0,Math.round((actor.gold?.[0]||0)*rewardFactor)),Math.max(1,Math.round((actor.gold?.[1]||1)*rewardFactor))];actor.staggerMax=Math.max(16,Math.round(26+actor.maxHp*.22));
    });
  }

  makeBoundary(actors){
    const xs=actors.map(a=>a.x),ys=actors.map(a=>a.y),pad=5;
    return {minX:Math.max(0,Math.min(...xs)-pad),maxX:Math.min(AO.CONFIG.mapWidth-1,Math.max(...xs)+pad),minY:Math.max(0,Math.min(...ys)-pad),maxY:Math.min(AO.CONFIG.mapHeight-1,Math.max(...ys)+pad)};
  }

  inBoundary(x,y){const b=this.current.boundary;return x>=b.minX&&x<=b.maxX&&y>=b.minY&&y<=b.maxY;}
  occupied(x,y,ignoreId=null){return Object.values(this.current.actors).some(a=>a.id!==ignoreId&&this.actorAlive(a)&&a.x===x&&a.y===y);}
  actorAlive(actor){return actor&&((actor.side==='player'&&this.game.state.player.hp>0)||(actor.side==='enemy'&&actor.hp>0));}
  tileWalkable(x,y,ignoreId=null){const tile=this.tileAt(x,y);return this.inBoundary(x,y)&&tile!=null&&!AO.TacticalRules.blockingTiles.has(tile)&&!this.occupied(x,y,ignoreId);}

  movementMap(actorId,maxCost=null){
    const actor=this.actor(actorId);if(!actor)return new Map();
    const limit=maxCost??(actor.side==='player'?this.current.movementRemaining:actor.move),dist=new Map([[this.key(actor.x,actor.y),0]]),prev=new Map(),open=[{x:actor.x,y:actor.y,cost:0}];
    while(open.length){
      open.sort((a,b)=>a.cost-b.cost);const cur=open.shift(),ck=this.key(cur.x,cur.y);if(cur.cost!==dist.get(ck))continue;
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const x=cur.x+dx,y=cur.y+dy;if(!this.tileWalkable(x,y,actorId))continue;
        const next=cur.cost+AO.TacticalRules.terrainCost(this.terrainWorld(),x,y);if(next>limit)continue;const k=this.key(x,y);
        if(next<(dist.get(k)??Infinity)){dist.set(k,next);prev.set(k,ck);open.push({x,y,cost:next});}
      }
    }
    dist.prev=prev;return dist;
  }

  pathFromMap(actor,map,x,y){
    const target=this.key(x,y);if(!map.has(target))return[];const path=[];let k=target,start=this.key(actor.x,actor.y);
    while(k&&k!==start){const [px,py]=k.split(',').map(Number);path.unshift({x:px,y:py});k=map.prev.get(k);}return path;
  }

  lineTiles(a,b){
    const points=[];let x0=a.x,y0=a.y,x1=b.x,y1=b.y,dx=Math.abs(x1-x0),dy=Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1,err=dx-dy;
    while(!(x0===x1&&y0===y1)){const e2=2*err;if(e2>-dy){err-=dy;x0+=sx;}if(e2<dx){err+=dx;y0+=sy;}if(!(x0===x1&&y0===y1))points.push({x:x0,y:y0});}
    return points;
  }

  hasLineOfSight(a,b){
    return !this.lineTiles(a,b).some(p=>AO.TacticalRules.blockingTiles.has(this.tileAt(p.x,p.y))||this.game.world.entities.some(e=>e.blocking!==false&&!e.hidden&&e.type!=='enemy'&&e.x===p.x&&e.y===p.y));
  }

  coverBonus(attacker,target){
    const line=this.lineTiles(attacker,target),last=line[line.length-1];if(!last)return 0;
    const dx=Math.sign(attacker.x-target.x),dy=Math.sign(attacker.y-target.y),behind={x:target.x+dx,y:target.y+dy};
    const tile=this.tileAt(behind.x,behind.y),info=AO.TacticalRules.tileInfo(tile);
    const object=this.game.world.entities.find(e=>e.blocking!==false&&!e.hidden&&e.type!=='enemy'&&e.x===behind.x&&e.y===behind.y);
    return info.cover||object?2:0;
  }

  elevationModifier(attacker,target){
    const a=AO.TacticalRules.elevation(this.terrainWorld(),attacker.x,attacker.y),b=AO.TacticalRules.elevation(this.terrainWorld(),target.x,target.y);return a>b?1:a<b?-1:0;
  }

  abilityRange(a){return AO.TacticalRules.abilityRange(this.game,a);}
  validTarget(target,a){
    const player=this.playerActor();if(!target||target.side!=='enemy'||target.hp<=0)return{ok:false,reason:'Choose a living enemy.'};
    const range=this.abilityRange(a),distance=this.distance(player,target);if(distance>range)return{ok:false,reason:`Out of range (${distance}/${range}).`};
    if(range>1&&!this.hasLineOfSight(player,target))return{ok:false,reason:'Line of sight is blocked.'};
    return{ok:true,distance,range,cover:this.coverBonus(player,target),elevation:this.elevationModifier(player,target)};
  }

  reachableTiles(){return this.isPlayerTurn()?this.movementMap('player',this.current.movementRemaining):new Map();}
  targetableEnemies(a=AO.ABILITIES[this.current?.pendingAbilityId]){return this.livingEnemies().filter(e=>this.validTarget(e,a||AO.ABILITIES.basic_attack).ok);}

  handleMapClick(x,y){
    if(!this.isPlayerTurn())return;
    const enemy=this.livingEnemies().find(a=>a.x===x&&a.y===y);
    if(enemy){this.current.selectedTargetId=enemy.id;this.addLog(`Target selected: ${enemy.name}.`);const pending=this.current.pendingAbilityId;if(pending)this.playerAction(pending);else this.refresh();return;}
    const map=this.reachableTiles();if(map.has(this.key(x,y)))this.movePlayerTo(x,y,map);else this.game.toast('That tile is not reachable this turn.');
  }

  moveBy(dx,dy){if(!this.isPlayerTurn())return;const p=this.playerActor(),map=this.reachableTiles(),x=p.x+dx,y=p.y+dy;if(map.has(this.key(x,y)))this.movePlayerTo(x,y,map);}

  movePlayerTo(x,y,map=this.reachableTiles()){
    const player=this.playerActor(),path=this.pathFromMap(player,map,x,y);if(!path.length)return false;
    let spent=0;
    for(const step of path){
      const before={x:player.x,y:player.y},adjacentBefore=this.livingEnemies().filter(e=>this.distance(before,e)===1&&e.reaction);
      spent+=AO.TacticalRules.terrainCost(this.terrainWorld(),step.x,step.y);player.x=step.x;player.y=step.y;this.game.state.world.x=step.x;this.game.state.world.y=step.y;
      for(const enemy of adjacentBefore)if(this.distance(player,enemy)>1&&enemy.hp>0){enemy.reaction=false;this.addLog(`${enemy.name} makes an opportunity attack.`);this.resolveEnemyAttack(enemy,{name:'Opportunity Attack',damageScale:.8});if(this.game.state.player.hp<=0)break;}
      this.applyTerrainHazard(player);
      if(this.game.state.player.hp<=0)break;
    }
    this.current.movementRemaining=Math.max(0,this.current.movementRemaining-spent);this.current.retreatAvailable=this.atBoundaryEdge(player.x,player.y);this.syncWorldActors();this.refresh();if(this.game.state.player.hp<=0)this.defeat();return true;
  }

  atBoundaryEdge(x,y){const b=this.current.boundary;return x===b.minX||x===b.maxX||y===b.minY||y===b.maxY;}

  playerAction(abilityId){
    const c=this.current,a=AO.ABILITIES[abilityId];if(!c||!a||!this.isPlayerTurn())return;
    if(c.actionRemaining<1){this.game.toast('No action remains this turn.');return;}
    const cd=this.cooldown(abilityId);if(cd>0){this.game.toast(`${a.name} is ready in ${cd} turn(s).`);return;}
    if(a.target==='self')return this.executeSelfAbility(a);
    const target=this.actor(c.selectedTargetId),check=this.validTarget(target,a);
    if(!check.ok){c.pendingAbilityId=abilityId;this.game.toast(`${a.name}: ${check.reason} Select a valid target.`);this.refresh();return;}
    if(!this.spend(a.resource,a.cost)){this.game.toast(`Not enough ${a.resource}.`);return;}
    c.pendingAbilityId=null;c.actionRemaining=0;if(a.cooldown)c.cooldowns[abilityId]=a.cooldown;
    this.resolvePlayerAttack(a,target,check);AO.events.emit('playerChanged');this.checkEncounterEnd();if(this.current)this.refresh();
  }

  executeSelfAbility(a){
    const c=this.current,p=this.game.state.player;if(!this.spend(a.resource,a.cost)){this.game.toast(`Not enough ${a.resource}.`);return;}
    c.actionRemaining=0;if(a.cooldown)c.cooldowns[a.id]=a.cooldown;
    if(a.kind==='heal'){
      let amount=a.amount+(a.stat?Math.max(0,AO.Util.statMod(this.game.stat(a.stat))):0);amount=Math.round(amount*this.game.talents.bonus('healing',1));if(this.game.talents.flag('bloodHealing')&&p.hp<p.maxHp*.5)amount=Math.round(amount*1.25);this.healPlayer(amount);
      const guard={unyielding:4,last_bastion:18,oath_unbroken:12,immortal_fury:10,vanguard_immovable:22,oathkeeper_martyr:12,shadow_false_death:8}[a.id]||0;if(guard)c.playerGuard+=guard;
      if(a.id==='blood_roar')for(const enemy of this.livingEnemies().filter(e=>this.distance(e,this.playerActor())<=2))this.addStatus(enemy,'frightened',1);if(a.id==='immortal_fury')c.raging=true;
    }else if(a.kind==='defend'){
      const guard=(a.amount||0)+this.game.talents.bonus('wardBonus');c.playerGuard+=guard;if(['smoke_step','void_step','abyssal_gate','ranger_packless','hexblade_blackmirror'].includes(a.id)){c.advantage=true;c.empowered=true;}if(a.id==='barkskin'||this.game.talents.flag('cleanseDefend'))c.playerStatuses=[];this.addLog(`${a.name} grants ${guard} guard.`);
    }else if(a.kind==='transform'){this.healPlayer(a.amount||0);c.empowered=true;c.playerGuard+=a.id==='elder_beast'||a.id==='warden_wildgod'?14:6;this.addLog('Primal power reshapes your body.');}
    else if(a.kind==='rage'){c.raging=true;c.playerGuard=Math.max(0,c.playerGuard-2);this.addLog('Rage floods your muscles.');}
    else this.addLog(`${a.name} takes effect.`);
    AO.events.emit('playerChanged');this.refresh();
  }

  addStatus(actor,id,turns){if(!actor.statuses.some(s=>s.id===id))actor.statuses.push({id,turns});}
  status(actor,id){return actor.statuses.some(s=>s.id===id);}
  removeStatus(actor,id){actor.statuses=actor.statuses.filter(s=>s.id!==id);}

  talentDamage(a,target){let mult=1;if(this.game.talents.flag('predator')&&target.hp<target.maxHp*.5)mult*=1.2;if(this.game.talents.flag('opportunist')&&this.status(target,'weakened'))mult*=1.25;if(this.game.talents.flag('hexMaster')&&this.status(target,'hexed'))mult*=1.25;return mult;}

  applyReactionToTarget(a,target){
    let bonus=0,label='';
    if(a.element==='frost'&&this.status(target,'burning')){this.removeStatus(target,'burning');bonus=10+this.game.state.player.level;label='Steam Shatter';}
    else if(a.element==='fire'&&this.status(target,'poisoned')){this.removeStatus(target,'poisoned');bonus=8+Math.floor(this.game.state.player.level*.75);label='Toxic Ignition';}
    else if(a.element==='storm'&&(this.status(target,'snared')||this.status(target,'frozen'))){this.removeStatus(target,'snared');this.removeStatus(target,'frozen');bonus=12;label='Overload';}
    if(bonus){this.addLog(`${label} reaction deals ${bonus} bonus damage!`);this.current.reactions.unshift(label);}return bonus;
  }

  resolvePlayerAttack(a,target,preview=this.validTarget(target,a),options={}){
    const c=this.current,p=this.game.state.player,weapon=AO.ITEMS[p.equipment.weapon]||{damage:[1,4],stat:AO.CLASSES[p.classId].primary},stat=a.stat||weapon.stat||AO.CLASSES[p.classId].primary;
    let natural=AO.Util.d20();if(natural===1&&p.raceId==='duskling'&&!c.luckUsed){c.luckUsed=true;natural=AO.Util.d20();this.addLog('Duskling fortune twists a disastrous miss.');}if(c.advantage){natural=Math.max(natural,AO.Util.d20());c.advantage=false;}
    const proficiency=2+Math.floor((p.level-1)/3),accuracy=natural+proficiency+AO.Util.statMod(this.game.stat(stat))+(a.accuracy||0)+(weapon.accuracy||0)+(preview.elevation||0),critThreshold=20-(p.gearBonuses?.crit||0)-this.game.talents.bonus('crit')-(a.critBonus||0),defense=target.ac+(preview.cover||0);
    if(natural!==20&&accuracy<defense){c.combo=0;this.addLog(`${a.name} misses ${target.name} (${accuracy} vs AC ${defense}${preview.cover?' with cover':''}).`);return 0;}
    let base=AO.Util.roll(weapon.damage[0],weapon.damage[1],Math.max(0,AO.Util.statMod(this.game.stat(stat))));if(a.kind==='spell')base=AO.Util.roll(1,8,Math.max(0,AO.Util.statMod(this.game.stat(stat)))+p.level);
    let damage=Math.max(1,Math.round(base*(a.power||1)*this.talentDamage(a,target))+(p.gearBonuses?.bonusDamage||0)+this.game.talents.bonus('bonusDamage'));
    if(c.raging)damage+=3;if(c.empowered){damage+=5;c.empowered=false;}if(this.status(target,'hexed'))damage+=3;if(p.raceId==='ashborn'&&a.element==='fire')damage+=1;if(a.kind==='execute'&&target.hp<target.maxHp*.45)damage=Math.round(damage*1.6);
    const element=a.element||weapon.element||'physical';if(target.weakness===element)damage=Math.round(damage*(this.game.talents.flag('elementalist')?1.45:1.25));if(target.resist===element)damage=Math.max(1,Math.round(damage*.72));damage+=this.applyReactionToTarget(a,target);damage=Math.round(damage*(1+Math.min(10,c.combo)*.02));if(natural>=critThreshold){damage+=base;this.addLog('Critical hit!');}
    const absorbed=Math.min(target.guard,damage);target.guard-=absorbed;damage-=absorbed;if(absorbed)this.addLog(`${target.name}'s guard absorbs ${absorbed}.`);target.hp=Math.max(0,target.hp-damage);c.combo=Math.min(10,c.combo+1);this.addLog(`${a.name} deals ${damage} ${element} damage to ${target.name}.`);
    let staggerGain=Math.max(3,Math.round(damage*.55*(this.game.talents.bonus('stagger',1)||1)));if(a.status==='staggered')staggerGain+=15;target.stagger+=staggerGain;if(target.stagger>=target.staggerMax){target.stagger=0;target.guard=0;this.addStatus(target,'weakened',2);const burst=8+Math.floor(p.level/2);target.hp=Math.max(0,target.hp-burst);this.addLog(`STAGGER BREAK! ${target.name} takes ${burst} damage and loses guard.`);}
    if(a.status)this.addStatus(target,a.status,['poisoned','burning','hexed'].includes(a.status)?(this.game.talents.flag('poisoner')&&a.status==='poisoned'?5:3):2);if(a.kind==='drain')this.healPlayer(Math.max(1,Math.floor(damage*(.4+this.game.talents.bonus('drainBonus')))));
    if(a.bonusHits&&!options.noSplash){const others=this.livingEnemies().filter(e=>e.id!==target.id&&this.distance(e,target)<=1).slice(0,a.bonusHits);for(const other of others){const splash=Math.max(1,Math.floor(damage*.28));other.hp=Math.max(0,other.hp-splash);this.addLog(`${a.name} splashes ${splash} damage onto ${other.name}.`);}}
    if(a.id==='basic_attack'&&!options.reaction){const cls=AO.CLASSES[p.classId],restore=this.game.talents.bonus('basicResource',1);if(cls.resource==='mana')p.mana=Math.min(p.maxMana,p.mana+restore);else p.stamina=Math.min(p.maxStamina,p.stamina+restore);}
    this.resolveFallenEnemies();return damage;
  }

  applyTerrainHazard(actor){
    const hazard=AO.TacticalRules.hazard(this.terrainWorld(),actor.x,actor.y);if(!hazard)return;
    if(actor.side==='player'){
      if(hazard==='arcane'){const dmg=Math.max(1,2+Math.floor(this.current.round/2));this.damagePlayer(dmg,'unstable rune');}
      else if(hazard==='heat'){this.damagePlayer(2,'scorching ground');this.addPlayerStatus('burning',2);}
      else if(hazard==='wet')this.addPlayerStatus('wet',1);
    }else{
      if(hazard==='arcane'){actor.hp=Math.max(0,actor.hp-3);this.addLog(`${actor.name} takes 3 arcane terrain damage.`);}else if(hazard==='heat'){actor.hp=Math.max(0,actor.hp-2);this.addStatus(actor,'burning',2);}else if(hazard==='wet')this.addStatus(actor,'wet',1);
    }
  }

  addPlayerStatus(id,turns){if(!this.current.playerStatuses.some(s=>s.id===id))this.current.playerStatuses.push({id,turns});}
  healPlayer(amount){const p=this.game.state.player,before=p.hp;p.hp=Math.min(p.maxHp,p.hp+amount);this.addLog(`You recover ${p.hp-before} health.`);}
  damagePlayer(amount,label){const c=this.current,absorbed=Math.min(c.playerGuard,amount);c.playerGuard-=absorbed;amount-=absorbed;if(absorbed)this.addLog(`Your guard absorbs ${absorbed}.`);this.game.state.player.hp=Math.max(0,this.game.state.player.hp-amount);this.addLog(`${label}: ${amount} damage.`);}

  chooseIntent(actor){
    const hp=actor.hp/actor.maxHp,t=actor.enemyType;if(this.status(actor,'frozen'))return'Shatter Free';if(actor.openingTier)return'Gnaw';if(['mireling','cellar_rat','bog_leech'].includes(t))return this.current.round%3===0?'Venom Bite':'Gnaw';if(['dire_wolf','ash_hound'].includes(t))return this.current.round%3===0?'Pack Lunge':'Fang Strike';if(['bandit','highway_captain'].includes(t))return hp<.45?'Defensive Feint':this.current.round%3===0?'Brutal Flourish':'Weapon Strike';if(['marsh_witch','bone_mage','ember_adept'].includes(t))return this.current.round%2===0?'Hexing Bolt':'Spell Lash';if(['thornback','stone_troll','reed_guardian'].includes(t))return this.current.round%3===0?'Crushing Charge':'Heavy Blow';if(['crystal_wisp','star_spawn','void_eye'].includes(t))return this.current.round%2===0?'Prismatic Lance':'Static Pulse';if(['ruin_sentinel','skeleton','drowned_knight'].includes(t))return this.current.round%3===0?'Brace':'Ancient Strike';if(t==='cinder_drake')return hp<.5?'Skyfire Phase':'Cinder Breath';if(t==='ash_crowned')return hp<.5?'Crown of Flame':'Ashen Decree';return'Attack';
  }

  resolveEnemyAttack(actor,opts={}){
    if(!actor||actor.hp<=0)return;const p=this.game.state.player,player=this.playerActor();let attackPenalty=0,damagePenalty=0;if(this.status(actor,'snared')||this.status(actor,'frozen'))attackPenalty-=3;if(this.status(actor,'weakened'))damagePenalty-=3;if(this.status(actor,'frightened'))attackPenalty-=4;
    const cover=this.coverBonus(actor,player),elevation=this.elevationModifier(actor,player),pack=this.livingEnemies().filter(e=>e.id!==actor.id&&this.distance(e,player)===1).length?1:0,natural=AO.Util.d20(),total=natural+3+actor.level+attackPenalty+(opts.bonus||0)+elevation+pack,defense=p.ac+cover;
    if(natural===20||total>=defense){let dmg=Math.max(1,Math.round(AO.Util.roll(actor.attack[0],actor.attack[1],actor.attack[2]+damagePenalty+(opts.damageBonus||0))*(actor.damageScale||1)*(opts.damageScale||1)));if(actor.affix==='Frenzied')dmg=Math.round(dmg*1.15);this.damagePlayer(dmg,`${opts.name||actor.name} hits`);if(opts.status)this.addPlayerStatus(opts.status,opts.statusTurns||2);if(actor.affix==='Venomous')this.addPlayerStatus('poisoned',2);if(actor.affix==='Arcane'){const drained=Math.min(p.mana,2);p.mana-=drained;if(drained)this.addLog(`Arcane elite drains ${drained} mana.`);}if(opts.drainMana){const lost=Math.min(p.mana,opts.drainMana);p.mana-=lost;this.addLog(`${lost} mana is drained.`);}}
    else this.addLog(`${opts.name||actor.name} misses (${total} vs AC ${defense}${cover?' with cover':''}).`);
  }

  beginTurn(){
    if(!this.current)return;this.resolveFallenEnemies();if(this.checkEncounterEnd())return;
    let actor=this.activeActor();let guard=0;while(actor&&!this.actorAlive(actor)&&guard++<this.current.turnOrder.length){this.current.turnIndex=(this.current.turnIndex+1)%this.current.turnOrder.length;actor=this.activeActor();}
    if(!actor)return;
    this.tickActorStatuses(actor);if(!this.actorAlive(actor)){this.advanceTurn();return;}
    if(actor.side==='player'){
      this.current.phase='player';this.game.renderer?.centerOnActor?.(actor,false);this.current.movementRemaining=Math.max(3,5+Math.max(0,AO.Util.statMod(this.game.stat('dex'))));this.current.actionRemaining=1;this.current.pendingAbilityId=null;this.current.retreatAvailable=this.atBoundaryEdge(actor.x,actor.y);for(const id of Object.keys(this.current.cooldowns))if(this.current.cooldowns[id]>0)this.current.cooldowns[id]--;this.addLog(`Round ${this.current.round}: your turn.`);this.refresh();
    }else{
      this.current.phase='enemy';this.game.renderer?.centerOnActor?.(actor,false);actor.intent=this.chooseIntent(actor);this.refresh();this.scheduleEnemyTurn();
    }
  }

  scheduleEnemyTurn(){clearTimeout(this.aiTimer);this.aiTimer=setTimeout(()=>this.runEnemyTurn(),this.game.state.settings?.reducedMotion?80:320);}

  runEnemyTurn(){
    const actor=this.activeActor();if(!this.current||!actor||actor.side!=='enemy'||actor.hp<=0){this.advanceTurn();return;}
    actor.intent=this.chooseIntent(actor);
    if(actor.intent==='Shatter Free'){this.removeStatus(actor,'frozen');this.addLog(`${actor.name} spends its turn breaking free.`);this.advanceTurn();return;}
    if(actor.intent==='Brace'||actor.intent==='Defensive Feint'){actor.guard+=actor.intent==='Brace'?8:6;this.addLog(`${actor.name} gains guard.`);this.advanceTurn();return;}
    const player=this.playerActor(),ranged=AO.TacticalRules.rangedEnemyTypes.has(actor.enemyType),desiredRange=ranged?5:1;
    if(this.distance(actor,player)>desiredRange||!this.hasLineOfSight(actor,player))this.moveEnemyToward(actor,player,desiredRange);
    if(this.game.state.player.hp<=0){this.defeat();return;}
    const d=this.distance(actor,player),canAttack=d<=desiredRange&&(desiredRange===1||this.hasLineOfSight(actor,player));
    if(canAttack){const intent=actor.intent;if(intent==='Venom Bite')this.resolveEnemyAttack(actor,{name:intent,bonus:1,status:'poisoned'});else if(intent==='Pack Lunge')this.resolveEnemyAttack(actor,{name:intent,bonus:2,damageBonus:3,status:'weakened'});else if(intent==='Brutal Flourish')this.resolveEnemyAttack(actor,{name:intent,bonus:2,damageBonus:5});else if(intent==='Hexing Bolt')this.resolveEnemyAttack(actor,{name:intent,bonus:3,damageBonus:3,status:'weakened',drainMana:3});else if(intent==='Crushing Charge')this.resolveEnemyAttack(actor,{name:intent,damageBonus:6,status:'staggered'});else if(intent==='Prismatic Lance')this.resolveEnemyAttack(actor,{name:intent,bonus:3,damageBonus:5,drainMana:2});else if(intent==='Cinder Breath')this.resolveEnemyAttack(actor,{name:intent,bonus:2,damageBonus:6,status:'burning',statusTurns:3});else this.resolveEnemyAttack(actor,{name:intent});}else this.addLog(`${actor.name} cannot find a clear attack lane.`);
    this.applyTerrainHazard(actor);this.resolveFallenEnemies();if(this.game.state.player.hp<=0){this.defeat();return;}this.advanceTurn();
  }

  moveEnemyToward(actor,target,desiredRange){
    const max=actor.move||4,map=this.movementMap(actor.id,max);let best=null;
    for(const [k,cost] of map){const [x,y]=k.split(',').map(Number),candidate={x,y},distance=this.distance(candidate,target),los=desiredRange===1||this.hasLineOfSight(candidate,target),score=Math.abs(distance-desiredRange)*10+(los?0:8)+cost;
      if(distance<1)continue;if(!best||score<best.score)best={x,y,cost,score};}
    if(!best||best.x===actor.x&&best.y===actor.y)return;
    const path=this.pathFromMap(actor,map,best.x,best.y);for(const step of path){const before={x:actor.x,y:actor.y},wasAdjacent=this.distance(before,this.playerActor())===1&&this.playerActor().reaction;actor.x=step.x;actor.y=step.y;if(wasAdjacent&&this.distance(actor,this.playerActor())>1){this.playerActor().reaction=false;this.addLog(`You make an opportunity attack against ${actor.name}.`);const basic={...AO.ABILITIES.basic_attack,name:'Opportunity Attack',power:.8};this.resolvePlayerAttack(basic,actor,this.validTarget(actor,{...basic,range:1}),{reaction:true,noSplash:true});if(actor.hp<=0)break;}}
    this.syncWorldActors();
  }

  tickActorStatuses(actor){
    const list=actor.side==='player'?this.current.playerStatuses:actor.statuses;
    for(const s of [...list]){if(['poisoned','burning','shocked'].includes(s.id)){let dmg=s.id==='burning'?5:s.id==='shocked'?4:3;if(actor.side==='player')this.damagePlayer(dmg,`${s.id} damage`);else{actor.hp=Math.max(0,actor.hp-dmg);this.addLog(`${actor.name} suffers ${dmg} ${s.id} damage.`);}}s.turns--;if(s.turns<=0)list.splice(list.indexOf(s),1);}
  }

  advanceTurn(){
    if(!this.current)return;if(this.checkEncounterEnd())return;this.current.turnIndex++;
    if(this.current.turnIndex>=this.current.turnOrder.length){this.current.turnIndex=0;this.current.round++;for(const actor of Object.values(this.current.actors))if(this.actorAlive(actor))actor.reaction=true;this.game.state.player.stamina=Math.min(this.game.state.player.maxStamina,this.game.state.player.stamina+2);this.game.state.player.mana=Math.min(this.game.state.player.maxMana,this.game.state.player.mana+1);}
    this.beginTurn();
  }

  endPlayerTurn(){if(!this.isPlayerTurn())return;this.current.actionRemaining=0;this.current.movementRemaining=0;this.advanceTurn();}

  useItem(uid){
    if(!this.isPlayerTurn()||this.current.actionRemaining<1)return;const p=this.game.state.player,entry=p.inventory.find(i=>i.uid===uid),item=AO.ITEMS[entry?.itemId];if(!entry||item?.type!=='consumable')return;
    let applied=false,target=this.actor(this.current.selectedTargetId);
    if(item.combatDamage){if(!target||target.hp<=0){this.game.toast('Choose a living enemy first.');return;}target.hp=Math.max(0,target.hp-item.combatDamage);this.addLog(`${item.name} deals ${item.combatDamage} damage to ${target.name}.`);if(item.status)this.addStatus(target,item.status,2);applied=true;}
    if(item.heal){const before=p.hp;p.hp=Math.min(p.maxHp,p.hp+item.heal);this.addLog(`${item.name} restores ${p.hp-before} health.`);applied=true;}
    if(item.manaRestore){p.mana=Math.min(p.maxMana,p.mana+item.manaRestore);applied=true;}if(item.staminaRestore){p.stamina=Math.min(p.maxStamina,p.stamina+item.staminaRestore);applied=true;}if(item.guard){this.current.playerGuard+=item.guard;applied=true;}if(item.cleanse){this.current.playerStatuses=[];applied=true;}
    if(!applied)return;entry.qty--;if(entry.qty<=0)this.game.inventory.removeUid(uid);this.current.actionRemaining=0;AO.events.emit('playerChanged');this.resolveFallenEnemies();this.checkEncounterEnd();if(this.current)this.refresh();
  }

  bracePlayer(){
    if(!this.isPlayerTurn()||this.current.actionRemaining<1)return;const guard=4+Math.floor(this.game.state.player.level/2);this.current.playerGuard+=guard;this.current.actionRemaining=0;this.addLog(`You brace and gain ${guard} guard.`);this.refresh();
  }
  cycleTarget(direction=1){
    if(!this.current)return;const enemies=this.livingEnemies();if(!enemies.length)return;let index=enemies.findIndex(e=>e.id===this.current.selectedTargetId);index=(index+direction+enemies.length)%enemies.length;this.current.selectedTargetId=enemies[index].id;this.refresh();this.game.renderer?.centerOnActor?.(enemies[index],false);
  }

  attemptRetreat(){
    if(!this.isPlayerTurn())return;const p=this.playerActor();if(!this.atBoundaryEdge(p.x,p.y)){this.game.toast('Reach the amber encounter boundary before retreating.');return;}
    this.addLog('You break contact and retreat from the encounter.');this.game.log(`Retreated from combat in ${this.game.world.map.name}.`);this.endEncounter(false,true);
  }

  resolveFallenEnemies(){
    if(!this.current)return;
    for(const actor of Object.values(this.current.actors).filter(a=>a.side==='enemy'&&a.hp<=0&&!a.resolved)){
      actor.resolved=true;const def=AO.ENEMIES[actor.enemyType],p=this.game.state.player,gold=AO.Util.rand(actor.gold?.[0]??0,actor.gold?.[1]??0);p.gold+=gold;
      for(const drop of actor.loot||[])if(Math.random()<=drop.chance)this.game.inventory.add(drop.id,1);if(!actor.random)this.game.world.defeat(actor.spawnId);this.game.quests.onKill(actor.enemyType);this.game.progression.grantXp(Math.round((actor.xp||def?.xp||1)*(actor.elite?1.45:1)));if(actor.elite)p.gold+=20+p.level*2;this.addLog(`${actor.name} is defeated. +${gold} gold.`);
      const entity=this.game.world.entities.find(e=>e.id===actor.spawnId);if(entity)entity.hidden=true;
    }
  }

  checkEncounterEnd(){
    if(!this.current)return true;if(this.game.state.player.hp<=0){this.defeat();return true;}if(!this.livingEnemies().length){this.victory();return true;}return false;
  }

  victory(){
    if(!this.current)return;const afterHeal=AO.RACES[this.game.state.player.raceId]?.mechanics?.postBattleHeal||0;if(afterHeal)this.game.state.player.hp=Math.min(this.game.state.player.maxHp,this.game.state.player.hp+afterHeal);this.game.consumeRestedBattle();this.game.toast('Tactical victory.');this.game.log(`Victory on ${this.game.world.map.name}: ${Object.values(this.current.actors).filter(a=>a.side==='enemy').length} enemies defeated.`);this.endEncounter(true,false);
  }

  defeat(){clearTimeout(this.aiTimer);this.current&&this.addLog('The oath is broken.');this.game.ui.showDefeat(()=>this.game.loadGame());this.refresh();}

  endEncounter(victory=false,retreated=false){
    clearTimeout(this.aiTimer);const c=this.current;if(!c)return;this.current=null;this.game.state.encounter=null;this.game.state.mode='explore';this.game.ui.closeTacticalCombat?.();this.game.ui.closeCombat();this.game.world.path=[];this.game.updateNearbyPrompt?.();AO.events.emit('playerChanged');AO.events.emit('worldChanged');if(victory&&this.game.state.settings?.autosave)setTimeout(()=>this.game.saveGame(true),120);
  }

  syncWorldActors(){
    if(!this.current)return;const p=this.playerActor();if(p){this.game.state.world.x=p.x;this.game.state.world.y=p.y;}
    for(const actor of Object.values(this.current.actors).filter(a=>a.side==='enemy')){const entity=this.game.world.entities.find(e=>e.id===actor.spawnId);if(entity){entity.x=actor.x;entity.y=actor.y;entity.hidden=actor.hp<=0;}}
    AO.events.emit('worldChanged');
  }

  cooldown(id){return this.current?.cooldowns?.[id]||0;}
  resourceValue(name){const p=this.game.state.player;return name==='mana'?p.mana:name==='stamina'?p.stamina:0;}
  spend(name,cost){if(!name||cost<=0)return true;const p=this.game.state.player;if(this.resourceValue(name)<cost)return false;if(name==='mana')p.mana-=cost;else p.stamina-=cost;return true;}
  addLog(text){if(!this.current)return;this.current.log.unshift(text);this.current.log=this.current.log.slice(0,40);}
  refresh(){if(!this.current)return;this.game.state.encounter=this.current;this.syncWorldActors();this.game.ui.renderTacticalCombat?.(this.current,this.game.progression.combatAbilities());}
};
