/* Thousandfold Realms v1.5.6-dev — visible patrol encounters and living wildlife. */
(() => {
  'use strict';
  if (!window.AO || !AO.WorldSystem || !AO.SpriteFactory || !AO.Pathfinder) return;

  const BaseWorld = AO.WorldSystem;
  const baseDecor = AO.SpriteFactory.decor.bind(AO.SpriteFactory);
  const MOVE_CHECK_MS = 120;

  const hash = value => {
    let out = 2166136261;
    for (const char of String(value)) { out ^= char.charCodeAt(0); out = Math.imul(out, 16777619); }
    return out >>> 0;
  };
  const now = () => typeof performance !== 'undefined' ? performance.now() : Date.now();
  const dayOf = game => Math.max(1, game.state?.rest?.day || 1);
  const copyPoint = point => ({x:point.x,y:point.y});

  AO.ITEMS.wild_game_meat ||= {
    id:'wild_game_meat',name:'Wild Game Meat',type:'material',value:7,icon:'🥩',
    description:'Fresh game suitable for cooking, trade, or camp provisions.'
  };
  AO.ITEMS.animal_hide ||= {
    id:'animal_hide',name:'Animal Hide',type:'material',value:11,icon:'◇',
    description:'A workable hide used by leatherworkers and wilderness crafters.'
  };
  AO.ITEMS.wild_feathers ||= {
    id:'wild_feathers',name:'Wild Feathers',type:'material',value:6,icon:'➶',
    description:'Clean feathers useful for fletching, charms, and trade.'
  };

  AO.ANIMALS = Object.assign({}, AO.ANIMALS, {
    cat:{name:'Town Cat',kind:'cat',description:'A small cat keeping watch over warm stones and busier doorways.',pace:2100,dc:99,respawnDays:1,loot:[]},
    dog:{name:'Market Dog',kind:'dog',description:'A well-fed dog making a familiar circuit between merchants and guards.',pace:1850,dc:99,respawnDays:1,loot:[]},
    gull:{name:'River Gull',kind:'gull',description:'A sharp-eyed river gull stalking scraps along the quay.',pace:1700,dc:99,respawnDays:1,loot:[]},
    deer:{name:'Whitetail Deer',kind:'deer',description:'A wary deer pauses between cover and open grazing ground.',pace:1550,dc:12,respawnDays:4,loot:[['wild_game_meat',2],['animal_hide',1]]},
    rabbit:{name:'Meadow Hare',kind:'rabbit',description:'A quick hare follows a repeated feeding trail through the grass.',pace:1250,dc:10,respawnDays:3,loot:[['wild_game_meat',1]]},
    fox:{name:'Red Fox',kind:'fox',description:'A lean fox traces the same careful route between stones and brush.',pace:1450,dc:13,respawnDays:4,loot:[['animal_hide',1]]},
    marsh_bird:{name:'Mosswater Heron',kind:'marsh_bird',description:'A tall marsh bird steps patiently between the shallows and reeds.',pace:1900,dc:11,respawnDays:3,loot:[['wild_feathers',2],['wild_game_meat',1]]}
  });

  const MAP_ANIMALS = {
    haven:[{id:'haven_inn_cat',animal:'cat',x:7,y:9,route:[[7,9],[8,9],[8,10],[7,10]],chance:100,town:true}],
    aurelia_market:[{id:'aurelia_market_dog',animal:'dog',x:16,y:10,route:[[16,10],[18,10],[18,11],[16,11]],chance:100,town:true}],
    aurelia_river:[{id:'aurelia_river_gull',animal:'gull',x:12,y:7,route:[[12,7],[14,7],[14,8],[12,8]],chance:100,town:true}],
    wilds:[{id:'whisperwood_deer',animal:'deer',x:19,y:5,route:[[19,5],[22,5],[22,7],[19,7]],chance:62}],
    southwood_trail:[{id:'southwood_deer',animal:'deer',x:20,y:10,route:[[20,10],[23,10],[23,13],[20,13]],chance:65}],
    mosswater_crossing:[{id:'mosswater_heron',animal:'marsh_bird',x:22,y:6,route:[[22,6],[25,6],[25,11],[22,11]],chance:72}],
    ambermeadow:[{id:'ambermeadow_hare',animal:'rabbit',x:7,y:12,route:[[7,12],[10,12],[10,14],[7,14]],chance:76}],
    eastwatch_approach:[{id:'eastwatch_fox',animal:'fox',x:20,y:12,route:[[20,12],[24,12],[24,15],[20,15]],chance:58}],
    lantern_road:[{id:'lantern_road_deer',animal:'deer',x:22,y:13,route:[[22,13],[25,13],[25,15],[22,15]],chance:54}]
  };

  const ROUTINE_OVERRIDES = {
    southwood_bandit_1:[[8,6],[11,6],[11,8],[8,8]],
    southwood_mire_1:[[22,12],[25,12],[25,14],[22,14]],
    mosswater_mire_1:[[7,6],[10,6],[10,5],[7,5]],
    mosswater_mire_2:[[24,12],[27,12],[27,14],[24,14]],
    amber_bandit_1:[[8,5],[11,5],[11,7],[8,7]],
    amber_bandit_2:[[23,13],[26,13],[26,15],[23,15]],
    eastwatch_bandit_1:[[7,10],[10,10],[10,12],[7,12]],
    eastwatch_bandit_2:[[22,6],[25,6],[25,8],[22,8]]
  };

  const isOpenElement = element => !!element && !element.classList.contains('hidden') && element.getClientRects().length > 0;
  const examining = game => {
    if (!game?.state || game.state.mode !== 'explore') return true;
    if (typeof document !== 'undefined') {
      if (document.hidden) return true;
      if (typeof document.hasFocus === 'function' && !document.hasFocus()) return true;
      if (document.body?.classList.contains('rpg-menu-open')) return true;
      if (isOpenElement(document.querySelector('.hud-control-menu:not(.hidden)'))) return true;
      for (const id of ['panelOverlay','dialogueOverlay','combatOverlay','levelOverlay','defeatOverlay']) {
        if (isOpenElement(document.getElementById(id))) return true;
      }
    }
    return false;
  };

  const ensureState = game => {
    const world = game.state?.world;
    if (!world) return null;
    world.movers ||= {};
    world.huntedAnimals ||= {};
    world.observedAnimals ||= {};
    return world;
  };

  const activeHunt = (game,id) => Number(ensureState(game)?.huntedAnimals?.[id] || 0) > dayOf(game);

  const availablePoint = (world,point,ignoreId=null,allowPlayer=false) => {
    if (!point || !world.isTerrainWalkable(point.x,point.y)) return false;
    const occupied = world.entities.some(entity => entity.id !== ignoreId && !entity.hidden && entity.blocking !== false && entity.x === point.x && entity.y === point.y);
    const player = world.playerPos();
    return !occupied && (allowPlayer || !(player.x === point.x && player.y === point.y));
  };

  const nearestSafe = (world,desired,ignoreId=null) => {
    if (availablePoint(world,desired,ignoreId)) return copyPoint(desired);
    for (let radius=1;radius<=5;radius++) {
      for (let dy=-radius;dy<=radius;dy++) for (let dx=-radius;dx<=radius;dx++) {
        if (Math.abs(dx)+Math.abs(dy)!==radius) continue;
        const point={x:desired.x+dx,y:desired.y+dy};
        if (availablePoint(world,point,ignoreId)) return point;
      }
    }
    return null;
  };

  const routeFromPoints = (world,points,ignoreId) => {
    const route=[];
    for (const desired of points || []) {
      const safe=nearestSafe(world,desired,ignoreId);
      if (safe && !route.some(point=>point.x===safe.x&&point.y===safe.y)) route.push(safe);
    }
    return route;
  };

  const derivedRoutine = (world,entity) => {
    const origin={x:entity.x,y:entity.y};
    const directions=[[1,0],[0,1],[-1,0],[0,-1]];
    const offset=hash(`${world.map?.id}:${entity.id}`)%directions.length;
    for (let turn=0;turn<directions.length;turn++) {
      const [dx,dy]=directions[(offset+turn)%directions.length];
      for (const distance of [3,2,1]) {
        const target={x:origin.x+dx*distance,y:origin.y+dy*distance};
        if (!world.isTerrainWalkable(target.x,target.y)) continue;
        const path=AO.Pathfinder.path(world,origin,target,entity.id);
        if (path.length) return [origin,target];
      }
    }
    return [origin];
  };

  const persistedMover = (world,entity) => {
    const state=ensureState(world.game);
    state.movers[world.map.id] ||= {};
    return state.movers[world.map.id][entity.id] ||= {};
  };

  const persistMover = (world,entity) => {
    const saved=persistedMover(world,entity);
    Object.assign(saved,{x:entity.x,y:entity.y,routineIndex:entity.routineIndex||0,updatedDay:dayOf(world.game)});
  };

  const configureMover = (world,entity,route=null,pace=null) => {
    const saved=persistedMover(world,entity);
    if (Number.isInteger(saved.x) && Number.isInteger(saved.y) && availablePoint(world,{x:saved.x,y:saved.y},entity.id)) {
      entity.x=saved.x;entity.y=saved.y;
    }
    const requested=route || entity.patrol || ROUTINE_OVERRIDES[entity.id];
    entity.routine=routeFromPoints(world,requested,entity.id);
    if (!entity.routine.length) entity.routine=derivedRoutine(world,entity);
    if (entity.routine.length===1 && (entity.routine[0].x!==entity.x || entity.routine[0].y!==entity.y)) entity.routine.unshift({x:entity.x,y:entity.y});
    entity.routineIndex=Math.max(0,Math.min(entity.routine.length-1,Number(saved.routineIndex)||0));
    entity.routinePace=pace || entity.routinePace || (entity.animalKind ? AO.ANIMALS[entity.animalKind]?.pace : 1050+(hash(entity.id)%350));
    entity.nextRoutineAt=now()+250+(hash(entity.id)%Math.max(400,entity.routinePace));
    entity.routineBlocked=0;
    persistMover(world,entity);
  };

  const animalAppears = (game,spec) => spec.town || hash(`${spec.id}:day:${dayOf(game)}`)%100 < (spec.chance ?? 60);

  const addAnimals = world => {
    for (const spec of MAP_ANIMALS[world.map?.id] || []) {
      if (!animalAppears(world.game,spec) || activeHunt(world.game,spec.id)) continue;
      const definition=AO.ANIMALS[spec.animal];
      if (!definition) continue;
      const desired=nearestSafe(world,{x:spec.x,y:spec.y});
      if (!desired) continue;
      const animal={
        id:spec.id,type:'decor',kind:`animal_${definition.kind}`,animalKind:spec.animal,
        name:definition.name,x:desired.x,y:desired.y,blocking:true,huntable:!spec.town,
        routinePace:definition.pace,description:definition.description,ambientAnimal:true
      };
      world.entities.push(animal);
      configureMover(world,animal,spec.route,definition.pace);
    }
  };

  const moveAway = (world,entity,steps=2) => {
    const player=world.playerPos();
    for (let count=0;count<steps;count++) {
      const candidates=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({x:entity.x+dx,y:entity.y+dy}))
        .filter(point=>availablePoint(world,point,entity.id))
        .sort((a,b)=>(Math.abs(b.x-player.x)+Math.abs(b.y-player.y))-(Math.abs(a.x-player.x)+Math.abs(a.y-player.y)));
      if (!candidates.length) break;
      entity.x=candidates[0].x;entity.y=candidates[0].y;
    }
    entity.nextRoutineAt=now()+2200;
    persistMover(world,entity);
    AO.events.emit('worldChanged');
  };

  const moveRoutine = (world,entity,currentTime) => {
    if (!entity.routine?.length || currentTime < (entity.nextRoutineAt||0)) return;
    entity.nextRoutineAt=currentTime+entity.routinePace;
    if (entity.routine.length<2) return;

    let target=entity.routine[entity.routineIndex] || entity.routine[0];
    if (entity.x===target.x && entity.y===target.y) {
      entity.routineIndex=(entity.routineIndex+1)%entity.routine.length;
      target=entity.routine[entity.routineIndex];
    }
    const path=AO.Pathfinder.path(world,{x:entity.x,y:entity.y},target,entity.id);
    const step=path[0];
    if (!step || !availablePoint(world,step,entity.id,entity.type==='enemy')) {
      entity.routineBlocked=(entity.routineBlocked||0)+1;
      if (entity.routineBlocked>=3) {
        entity.routineIndex=(entity.routineIndex+1)%entity.routine.length;
        entity.routineBlocked=0;
      }
      return;
    }
    entity.routineBlocked=0;
    entity.x=step.x;entity.y=step.y;
    persistMover(world,entity);
    AO.events.emit('worldChanged');

    if (entity.type==='enemy') {
      const player=world.playerPos();
      if (player.x===entity.x && player.y===entity.y && world.game.state.mode==='explore') world.game.combat.start(entity);
    }
  };

  AO.SpriteFactory.animal = function animal(ctx,x,y,kind,scale=1) {
    const S=scale,R=(xx,yy,w,h,color)=>this.rect(ctx,x+xx*S,y+yy*S,w*S,h*S,color),bob=Math.floor(now()/450)%2;
    ctx.save();ctx.imageSmoothingEnabled=false;
    R(5,27,22,3,'rgba(0,0,0,.35)');
    const ink='#17191b';
    if (kind==='cat' || kind==='fox' || kind==='dog') {
      const body=kind==='fox'?'#a85d35':kind==='dog'?'#745438':'#6a5a50',accent=kind==='fox'?'#e4b27b':'#b99b72';
      R(7,15-bob,18,10,ink);R(8,16-bob,16,8,body);R(19,9-bob,10,11,ink);R(20,10-bob,8,9,body);
      R(21,6-bob,3,5,ink);R(26,7-bob,3,5,ink);R(22,13-bob,2,2,'#e8cf7c');R(27,13-bob,2,2,'#e8cf7c');
      R(9,23-bob,3,6,ink);R(21,23-bob,3,6,ink);R(8,18-bob,3,3,accent);
      if (kind==='cat') {R(4,13-bob,3,13,ink);R(2,10-bob,4,5,body);} else {R(3,13-bob,8,5,ink);R(2,12-bob,8,4,body);}
    } else if (kind==='deer') {
      R(7,14-bob,18,11,ink);R(8,15-bob,16,9,'#986f48');R(20,8-bob,9,10,ink);R(21,9-bob,7,8,'#ad8054');
      R(10,23-bob,3,7,ink);R(20,23-bob,3,7,ink);R(24,5-bob,2,5,'#725839');R(28,4-bob,2,6,'#725839');
      R(22,11-bob,2,2,'#e9d58a');R(27,11-bob,2,2,'#e9d58a');R(5,16-bob,5,3,'#dbc39a');
    } else if (kind==='rabbit') {
      R(8,17-bob,17,9,ink);R(9,18-bob,15,7,'#8b7866');R(18,11-bob,10,10,ink);R(19,12-bob,8,8,'#9a8774');
      R(20,4-bob,3,9,ink);R(25,3-bob,3,10,ink);R(21,5-bob,1,7,'#c8aa9a');R(26,4-bob,1,8,'#c8aa9a');R(25,15-bob,2,2,'#eee0aa');R(6,19-bob,5,5,'#d8d0bf');
    } else if (kind==='marsh_bird' || kind==='gull') {
      const body=kind==='gull'?'#d8d5c8':'#82908a',wing=kind==='gull'?'#8d9395':'#566b66';
      R(11,13-bob,14,12,ink);R(12,14-bob,12,10,body);R(17,7-bob,9,10,ink);R(18,8-bob,7,8,body);R(24,11-bob,6,3,'#d7aa55');
      R(13,16-bob,9,5,wing);R(15,24-bob,2,6,'#bb9c59');R(21,24-bob,2,6,'#bb9c59');R(22,10-bob,2,2,'#e9d277');
    }
    ctx.restore();
  };

  AO.SpriteFactory.decor = function livingDecor(ctx,x,y,kind) {
    if (typeof kind==='string' && kind.startsWith('animal_')) {
      this.animal(ctx,x,y,kind.slice(7),1);
      return;
    }
    return baseDecor(ctx,x,y,kind);
  };

  AO.WorldSystem = class extends BaseWorld {
    load(mapId,x=null,y=null) {
      super.load(mapId,x,y);
      ensureState(this.game);
      for (const entity of this.entities.filter(item=>item.type==='enemy')) {
        const definition=AO.ENEMIES[entity.enemyType];
        if (definition?.boss || entity.requiresQuest || entity.guard===true) {
          entity.routine=[{x:entity.x,y:entity.y}];
          configureMover(this,entity,entity.routine,1500);
        } else configureMover(this,entity);
      }
      addAnimals(this);
      this.routineAccum=0;
      AO.events.emit('worldChanged');
    }

    maybeEncounter() {
      /* Standard encounters are represented by visible map entities only. */
      return false;
    }

    update(dt) {
      super.update(dt);
      if (examining(this.game)) return;
      this.routineAccum=(this.routineAccum||0)+dt;
      if (this.routineAccum<MOVE_CHECK_MS) return;
      this.routineAccum=0;
      const currentTime=now();
      for (const entity of this.entities.filter(item=>!item.hidden && (item.type==='enemy' || item.ambientAnimal))) {
        moveRoutine(this,entity,currentTime);
        if (this.game.state.mode!=='explore') break;
      }
    }

    interact(entity) {
      if (entity?.animalKind) {
        this.offerAnimal(entity);
        return;
      }
      super.interact(entity);
    }

    offerAnimal(animal) {
      const definition=AO.ANIMALS[animal.animalKind];
      if (!definition) return;
      this.game.state.mode='dialogue';
      const choices=[{
        label:'Observe its routine.',
        action:()=>{
          const state=ensureState(this.game);
          const first=!state.observedAnimals[animal.id];
          state.observedAnimals[animal.id]=true;
          if (first) this.game.progression.grantXp(3);
          this.game.ui.dialogue(definition.name,`${definition.description} Its repeated route can be watched and timed.`,[{label:'Continue',action:()=>this.game.ui.closeDialogue()}],null,'Wildlife');
        }
      }];
      if (animal.huntable) choices.push({
        check:`[SURVIVAL • DC ${definition.dc}]`,
        label:'Track and hunt it.',
        action:()=>this.huntAnimal(animal)
      });
      choices.push({label:'Leave it undisturbed.',action:()=>this.game.ui.closeDialogue()});
      this.game.ui.dialogue(definition.name,definition.description,choices,null,animal.huntable?'Wildlife Encounter':'Local Wildlife');
    }

    huntAnimal(animal) {
      const definition=AO.ANIMALS[animal.animalKind];
      this.game.ui.closeDialogue();
      if (!definition || !animal.huntable || animal.hidden) return;
      const result=this.game.check('dex',definition.dc,'survival');
      if (!result.success) {
        moveAway(this,animal,3);
        this.game.toast(`${definition.name} slips away from the attempt.`);
        return;
      }
      const state=ensureState(this.game);
      state.huntedAnimals[animal.id]=dayOf(this.game)+(definition.respawnDays||3);
      for (const [itemId,quantity] of definition.loot || []) this.game.inventory.add(itemId,quantity);
      animal.hidden=true;
      delete state.movers[this.map.id]?.[animal.id];
      this.game.progression.grantXp(8);
      const rewards=(definition.loot||[]).map(([itemId,quantity])=>`${AO.ITEMS[itemId]?.name||itemId} ×${quantity}`).join(', ');
      this.game.log(`Hunted ${definition.name}${rewards?`: ${rewards}`:''}.`);
      this.game.toast(rewards?`Successful hunt • ${rewards}`:'Successful hunt.');
      AO.events.emit('worldChanged');
    }
  };
})();
