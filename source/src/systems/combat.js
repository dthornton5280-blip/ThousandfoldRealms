AO.CombatSystem = class {
  constructor(game){this.game=game;this.current=null;}
  start(spawn){
    if(this.current)return;const def=AO.ENEMIES[spawn.enemyType],p=this.game.state.player,playerInit=AO.Util.d20()+AO.Util.statMod(this.game.stat('dex')),enemyInit=AO.Util.d20()+def.level;
    this.current={spawnId:spawn.id,enemyType:spawn.enemyType,enemy:AO.Util.deepCopy(def),enemyHp:def.hp,enemyMaxHp:def.hp,enemyGuard:0,playerGuard:0,enemyStatuses:[],playerStatuses:[],advantage:false,empowered:false,raging:false,luckUsed:false,relentlessUsed:false,phaseTwo:false,log:[],busy:false,round:1,turn:playerInit>=enemyInit?'player':'enemy',cooldowns:{},hasPlayerActed:false,intent:'Assessing the battlefield…'};
    this.game.state.mode='combat';this.game.world.path=[];this.addLog(`${def.name} blocks your path.`);this.addLog(`Initiative: You ${playerInit} • ${def.name} ${enemyInit}.`);this.game.ui.openCombat(this.current);this.refresh();
    if(this.current.turn==='enemy'){this.current.busy=true;this.addLog(`${def.name} acts first.`);this.refresh();setTimeout(()=>this.enemyTurn(),650);}
  }
  addLog(text){if(!this.current)return;this.current.log.unshift(text);this.current.log=this.current.log.slice(0,16);}
  refresh(){if(this.current)this.game.ui.renderCombat(this.current,this.game.progression.unlockedAbilities());}
  resourceValue(name){const p=this.game.state.player;return name==='mana'?p.mana:name==='stamina'?p.stamina:0;}
  spend(name,cost){const p=this.game.state.player;if(!name||cost<=0)return true;if(this.resourceValue(name)<cost)return false;if(name==='mana')p.mana-=cost;else p.stamina-=cost;return true;}
  cooldown(id){return this.current?.cooldowns?.[id]||0;}
  playerAction(abilityId){
    const c=this.current;if(!c||c.busy||c.turn!=='player')return;const a=AO.ABILITIES[abilityId];if(!a)return;
    if(this.cooldown(abilityId)>0){this.game.toast(`${a.name} is ready in ${this.cooldown(abilityId)} turn(s).`);return;}if(!this.spend(a.resource,a.cost)){this.game.toast(`Not enough ${a.resource}.`);return;}
    c.busy=true;c.hasPlayerActed=true;if(a.cooldown)c.cooldowns[abilityId]=a.cooldown;
    if(a.kind==='heal'){
      this.healPlayer(a.amount+(a.stat?Math.max(0,AO.Util.statMod(this.game.stat(a.stat))):0));
      const guard={unyielding:4,last_bastion:18,oath_unbroken:12,immortal_fury:10}[abilityId]||0;if(guard)c.playerGuard+=guard;
      if(abilityId==='blood_roar')c.enemyStatuses.push({id:'frightened',turns:1});if(abilityId==='immortal_fury')c.raging=true;
    }else if(a.kind==='defend'){
      c.playerGuard+=a.amount;if(['smoke_step','void_step','abyssal_gate'].includes(abilityId)){c.advantage=true;c.empowered=true;}if(a.id==='barkskin')c.playerStatuses=[];this.addLog(`${a.name} grants ${a.amount} guard.`);
    }else if(a.kind==='transform'){this.healPlayer(a.amount);c.empowered=true;c.playerGuard+=abilityId==='elder_beast'?10:4;this.addLog('Primal power reshapes your body.');}
    else if(a.kind==='rage'){c.raging=true;c.playerGuard=Math.max(0,c.playerGuard-2);this.addLog('Rage floods your muscles.');}
    else this.attack(a);
    AO.events.emit('playerChanged');this.refresh();if(c.enemyHp<=0){setTimeout(()=>this.victory(),350);return;}c.turn='enemy';setTimeout(()=>this.enemyTurn(),520);
  }
  healPlayer(amount){const p=this.game.state.player,before=p.hp;p.hp=Math.min(p.maxHp,p.hp+amount);this.addLog(`You recover ${p.hp-before} health.`);}
  attack(a){
    const c=this.current,p=this.game.state.player,weapon=AO.ITEMS[p.equipment.weapon]||{damage:[1,4],stat:AO.CLASSES[p.classId].primary},stat=a.stat||weapon.stat||AO.CLASSES[p.classId].primary;
    const rm=AO.RACES[p.raceId]?.mechanics||{};let natural=AO.Util.d20();if(natural===1&&rm.rerollNaturalOne&&!c.luckUsed){c.luckUsed=true;natural=AO.Util.d20();this.addLog(`${AO.RACES[p.raceId].name} fortune twists a disastrous miss.`);}if(c.advantage){natural=Math.max(natural,AO.Util.d20());c.advantage=false;}
    const proficiency=2+Math.floor((p.level-1)/3),accuracy=natural+proficiency+AO.Util.statMod(this.game.stat(stat))+(a.accuracy||0)+(weapon.accuracy||0),critThreshold=20-(p.gearBonuses?.crit||0)-(a.critBonus||0);
    if(natural!==20&&accuracy<c.enemy.ac){this.addLog(`${a.name} misses (${accuracy} vs AC ${c.enemy.ac}).`);return;}
    let base=AO.Util.roll(weapon.damage[0],weapon.damage[1],Math.max(0,AO.Util.statMod(this.game.stat(stat))));if(a.kind==='spell')base=AO.Util.roll(1,8,Math.max(0,AO.Util.statMod(this.game.stat(stat)))+p.level);
    let damage=Math.max(1,Math.round(base*(a.power||1))+(p.gearBonuses?.bonusDamage||0));if(c.raging)damage+=3;if(c.empowered){damage+=5;c.empowered=false;}if(c.enemyStatuses.some(s=>s.id==='hexed'))damage+=3;damage+=(rm.elementBonus?.[a.element]||0);if(a.kind==='execute'&&c.enemyHp<c.enemyMaxHp*.45)damage=Math.round(damage*1.6);
    if(natural>=critThreshold){damage+=base;this.addLog('Critical hit!');}damage=this.applyGuard('enemy',damage);c.enemyHp=Math.max(0,c.enemyHp-damage);this.addLog(`${a.name} deals ${damage} damage.`);
    if(a.status&&!c.enemyStatuses.some(s=>s.id===a.status))c.enemyStatuses.push({id:a.status,turns:['poisoned','burning','hexed'].includes(a.status)?3:1});if(a.kind==='drain')this.healPlayer(Math.max(1,Math.floor(damage*.4)));if(a.bonusHits){const splash=Math.max(1,Math.floor(damage*.35));c.enemyHp=Math.max(0,c.enemyHp-splash);this.addLog(`The follow-through deals ${splash} more damage.`);}
  }
  applyGuard(side,damage){const c=this.current,key=side==='enemy'?'enemyGuard':'playerGuard',absorbed=Math.min(c[key],damage);c[key]-=absorbed;if(absorbed)this.addLog(`${side==='enemy'?'Enemy':'Your'} guard absorbs ${absorbed}.`);return damage-absorbed;}
  tickStatuses(side){
    const c=this.current,list=side==='enemy'?c.enemyStatuses:c.playerStatuses;
    for(const s of [...list]){if(['poisoned','burning'].includes(s.id)){const dmg=s.id==='burning'?5:3;if(side==='enemy'){c.enemyHp=Math.max(0,c.enemyHp-dmg);this.addLog(`${c.enemy.name} suffers ${dmg} ${s.id} damage.`);}else this.damagePlayer(dmg,`${s.id} damage`);}s.turns--;if(s.turns<=0)list.splice(list.indexOf(s),1);}
  }
  enemyAttack({name=null,bonus=0,damageBonus=0,status=null,statusTurns=2,drainMana=0}={}){
    const c=this.current,p=this.game.state.player;let attackPenalty=0,damagePenalty=0;if(c.enemyStatuses.some(s=>s.id==='snared'))attackPenalty-=3;if(c.enemyStatuses.some(s=>s.id==='weakened'))damagePenalty-=3;if(c.enemyStatuses.some(s=>s.id==='frightened'))attackPenalty-=4;
    const natural=AO.Util.d20(),total=natural+3+c.enemy.level+attackPenalty+bonus;if(natural===20||total>=p.ac){let dmg=Math.max(1,AO.Util.roll(c.enemy.attack[0],c.enemy.attack[1],c.enemy.attack[2]+damagePenalty+damageBonus));dmg=this.applyGuard('player',dmg);this.damagePlayer(dmg,`${name||c.enemy.name} hits`);if(status&&!c.playerStatuses.some(s=>s.id===status))c.playerStatuses.push({id:status,turns:statusTurns});if(drainMana){const lost=Math.min(p.mana,drainMana);p.mana-=lost;this.addLog(`${lost} mana is drained.`);}}else this.addLog(`${name||c.enemy.name} misses (${total} vs AC ${p.ac}).`);
  }
  chooseIntent(){
    const c=this.current,hp=c.enemyHp/c.enemyMaxHp,type=c.enemyType;
    if(['mireling','cellar_rat'].includes(type)&&c.round%3===0)return'Venom Bite';if(type==='rat_king')return c.round%2===0?'Call the Swarm':'Gnawing Charge';
    if(type==='bandit'&&hp<.5&&c.enemyGuard===0)return'Defensive Feint';if(type==='restless_guest')return c.round%2===0?'Memory Drain':'Cold Grasp';
    if(type==='skeleton'&&c.round%3===0)return'Bone Brace';if(type==='ember_adept')return c.round%2===0?'Cinder Bolt':'Staff Strike';
    if(type==='mine_stalker')return c.round%3===0?'Crystal Web':'Rending Claws';if(type==='crystal_wisp')return c.round%2===0?'Prismatic Lance':'Static Pulse';
    if(type==='stone_troll')return c.round%3===0?'Cave-In':'Star-Iron Fist';if(type==='ember_warden')return hp<=.5?'Inferno Phase':'Molten Fist';return'Attack';
  }
  enemyTurn(){
    const c=this.current;if(!c)return;c.turn='enemy';c.busy=true;this.tickStatuses('enemy');if(c.enemyHp<=0){this.victory();return;}c.intent=this.chooseIntent();this.refresh();const hp=c.enemyHp/c.enemyMaxHp,type=c.enemyType;
    if(['mireling','cellar_rat'].includes(type)&&c.round%3===0){this.addLog(`${c.enemy.name} lunges with a venomous bite.`);this.enemyAttack({name:'Venom Bite',bonus:1,damageBonus:-1,status:'poisoned',statusTurns:2});}
    else if(type==='rat_king'&&c.round%2===0){c.enemyGuard+=5;this.addLog('The Cellar King calls a chittering swarm and gains 5 guard.');this.enemyAttack({name:'Swarming Bites',damageBonus:1});}
    else if(type==='bandit'&&hp<.5&&c.enemyGuard===0){c.enemyGuard+=6;this.addLog('The bandit feints and raises 6 guard.');}
    else if(type==='restless_guest'&&c.round%2===0){this.addLog('The ghost tears at a memory of safety.');this.enemyAttack({name:'Memory Drain',bonus:2,damageBonus:2,status:'weakened',drainMana:4});}
    else if(type==='skeleton'&&c.round%3===0){c.enemyGuard+=5;this.addLog('The skeleton braces behind ancient bone, gaining 5 guard.');}
    else if(type==='ember_adept'&&c.round%2===0){this.addLog('The adept hurls a cinder bolt.');this.enemyAttack({name:'Cinder Bolt',bonus:2,damageBonus:2,status:'burning',statusTurns:2});}
    else if(type==='mine_stalker'&&c.round%3===0){this.addLog('The stalker casts a web of crystal filament.');this.enemyAttack({name:'Crystal Web',bonus:2,status:'snared'});}
    else if(type==='crystal_wisp'&&c.round%2===0){this.addLog('The wisp condenses into a prismatic lance.');this.enemyAttack({name:'Prismatic Lance',bonus:3,damageBonus:4,drainMana:2});}
    else if(type==='stone_troll'&&c.round%3===0){c.enemyGuard+=10;this.addLog('The troll tears down the ceiling, gaining 10 guard behind falling stone.');this.enemyAttack({name:'Cave-In',damageBonus:5,status:'weakened'});}
    else if(type==='ember_warden'&&hp<=.5){if(!c.phaseTwo){c.phaseTwo=true;c.enemyGuard+=12;this.addLog('The Ember Warden enters its inferno phase and gains 12 guard!');}if(c.round%2===0){this.addLog('A furnace wave rolls across the chamber.');this.enemyAttack({name:'Furnace Wave',bonus:2,damageBonus:6,status:'burning'});}else this.enemyAttack({name:'Molten Fist',damageBonus:4});}
    else this.enemyAttack();
    this.tickStatuses('player');const p=this.game.state.player;p.stamina=Math.min(p.maxStamina,p.stamina+2);p.mana=Math.min(p.maxMana,p.mana+1);AO.events.emit('playerChanged');if(p.hp<=0){this.defeat();return;}this.beginPlayerTurn();
  }
  beginPlayerTurn(){const c=this.current;if(!c)return;if(c.hasPlayerActed)c.round++;c.hasPlayerActed=false;c.turn='player';c.busy=false;c.intent=this.chooseIntent();for(const id of Object.keys(c.cooldowns))if(c.cooldowns[id]>0)c.cooldowns[id]--;this.addLog(`Round ${c.round}: your turn.`);this.refresh();}
  damagePlayer(amount,label){const p=this.game.state.player;p.hp=Math.max(0,p.hp-amount);this.addLog(`${label} for ${amount} damage.`);if(p.hp<=0&&(AO.RACES[p.raceId]?.mechanics?.surviveLethal)&&!this.current.relentlessUsed){this.current.relentlessUsed=true;p.hp=1;this.addLog(`${AO.RACES[p.raceId].name} resolve keeps you standing at 1 HP.`);}}
  useItem(uid){const c=this.current;if(!c||c.busy||c.turn!=='player')return;const ok=this.game.inventory.use(uid,true);if(!ok)return;if(c.enemyHp<=0){c.busy=true;this.refresh();setTimeout(()=>this.victory(),300);return;}c.busy=true;c.turn='enemy';this.refresh();setTimeout(()=>this.enemyTurn(),420);}
  flee(){const c=this.current;if(!c||c.busy||c.turn!=='player')return;c.busy=true;const chance=.45+AO.Util.statMod(this.game.stat('dex'))*.05;if(!c.enemy.boss&&Math.random()<chance){this.addLog('You escape the battle.');setTimeout(()=>this.end(),300);}else{this.addLog(c.enemy.boss?'There is no escape from this foe.':'You fail to escape.');c.turn='enemy';this.refresh();setTimeout(()=>this.enemyTurn(),450);}}
  victory(){
    const c=this.current;if(!c)return;const def=c.enemy,p=this.game.state.player;this.addLog(`${def.name} is defeated.`);const gold=AO.Util.rand(def.gold[0],def.gold[1]);p.gold+=gold;for(const drop of def.loot||[])if(Math.random()<=drop.chance)this.game.inventory.add(drop.id,1);this.game.world.defeat(c.spawnId);this.game.quests.onKill(c.enemyType);this.game.progression.grantXp(def.xp);const afterHeal=AO.RACES[p.raceId]?.mechanics?.postBattleHeal||0;if(afterHeal)p.hp=Math.min(p.maxHp,p.hp+afterHeal);this.game.consumeRestedBattle();this.game.toast(`Victory: +${gold} gold`);setTimeout(()=>this.end(),650);
  }
  defeat(){this.game.ui.showDefeat(()=>this.game.loadGame());}
  end(){this.current=null;this.game.state.mode='explore';this.game.ui.closeCombat();AO.events.emit('playerChanged');}
};
