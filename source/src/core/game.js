AO.Game = class {
  constructor(){
    this.state=null;this.lastTime=performance.now();this.canvas=document.getElementById('gameCanvas');
    this.audio=new AO.AudioSystem(this);this.inventory=new AO.InventorySystem(this);this.progression=new AO.ProgressionSystem(this);this.quests=new AO.QuestSystem(this);this.world=new AO.WorldSystem(this);this.combat=new AO.CombatSystem(this);this.ui=new AO.UI(this);this.renderer=new AO.Renderer(this,this.canvas);this.bindEvents();
  }
  bindEvents(){
    for(const name of ['inventoryChanged','equipmentChanged','playerChanged','questsChanged','worldChanged'])AO.events.on(name,()=>{if(this.state)this.ui.updateHud();});
    this.canvas.addEventListener('click',ev=>{if(!this.state||performance.now()<(this.suppressCanvasClickUntil||0))return;const r=this.canvas.getBoundingClientRect(),sx=this.canvas.width/r.width,sy=this.canvas.height/r.height,px=(ev.clientX-r.left)*sx,py=(ev.clientY-r.top)*sy,point=this.renderer.screenToWorld?this.renderer.screenToWorld(px,py):{x:px,y:py},x=Math.floor(point.x/AO.CONFIG.tile),y=Math.floor(point.y/AO.CONFIG.tile);this.world.click(x,y);});
    this.canvas.addEventListener('pointermove',ev=>{if(!this.state)return;const r=this.canvas.getBoundingClientRect(),sx=this.canvas.width/r.width,sy=this.canvas.height/r.height,px=(ev.clientX-r.left)*sx,py=(ev.clientY-r.top)*sy,point=this.renderer.screenToWorld?this.renderer.screenToWorld(px,py):{x:px,y:py};this.world.hoveredTile={x:Math.floor(point.x/AO.CONFIG.tile),y:Math.floor(point.y/AO.CONFIG.tile)};});
    this.canvas.addEventListener('pointerleave',()=>{if(this.world)this.world.hoveredTile=null;});
    window.addEventListener('keydown',ev=>{
      if(!this.state)return;const tag=document.activeElement?.tagName;if(tag==='INPUT'||tag==='TEXTAREA')return;const key=ev.key.toLowerCase(),moves={w:[0,-1],arrowup:[0,-1],s:[0,1],arrowdown:[0,1],a:[-1,0],arrowleft:[-1,0],d:[1,0],arrowright:[1,0]};
      if(moves[key]){ev.preventDefault();if(this.state.mode==='combat'&&['w','a','s','d'].includes(key))this.renderer.panCamera?.(moves[key][0]*64,moves[key][1]*64);else this.world.keyboardMove(...moves[key]);}
      else if(key==='i')this.ui.openPanel('inventory');else if(key==='j')this.ui.openPanel('journal');else if(key==='c')this.ui.openPanel('character');
      else if(key==='r')this.offerCamp();else if(key==='escape'){this.ui.closePanel();this.ui.closeDialogue();}else if(key==='e')this.interactNearest();
    });
  }
  start(){this.ui.init();requestAnimationFrame(t=>this.loop(t));}
  loop(time){const dt=Math.min(100,time-this.lastTime);this.lastTime=time;if(this.state){this.world.update(dt);this.audio?.update();this.renderer.render();}requestAnimationFrame(t=>this.loop(t));}
  emptyEquipment(){return Object.fromEntries(AO.EQUIPMENT_SLOTS.map(slot=>[slot,null]));}
  raceDefinition(){return AO.RACES[this.state?.player?.raceId]||AO.RACES.human;}
  raceMechanics(){return this.raceDefinition()?.mechanics||{};}
  createPlayer(build){
    const race=AO.RACES[build.raceId],cls=AO.CLASSES[build.classId],stats=AO.Util.deepCopy(build.stats);for(const [s,b] of Object.entries(race.bonuses||{}))stats[s]=(stats[s]||8)+b;
    const bg=AO.BACKGROUNDS[build.backgroundId]||AO.BACKGROUNDS.outlander,equipment=this.emptyEquipment(),rm=race.mechanics||{};
    const p={name:build.name,raceId:build.raceId,classId:build.classId,backgroundId:bg.id,appearance:build.appearance||{hairColor:race.visual?.hair,eyeColor:race.visual?.eye,accentColor:race.visual?.accent,hairStyle:'natural',frame:'standard',mark:'none'},skills:[...(bg.skills||[])],level:1,xp:0,unspentPoints:0,stats,gold:30+(bg.gold||0),inventory:[],equipment,baseMaxHp:cls.hp+(rm.maxHp||0),baseMaxMana:Math.max(0,cls.mana+(rm.maxMana||0)),baseMaxStamina:Math.max(0,cls.stamina+(rm.maxStamina||0)),hp:1,mana:1,stamina:1,maxHp:1,maxMana:1,maxStamina:1,ac:10,effectiveStats:{...stats},gearBonuses:{}};
    for(const itemId of cls.startItems){const item=AO.ITEMS[itemId];if(item?.slot){let slot=item.slot==='ring'?(equipment.ring1?'ring2':'ring1'):item.slot;if(slot==='armor')slot='chest';if(slot==='trinket')slot='amulet';if(slot&&equipment[slot]==null)equipment[slot]=itemId;else p.inventory.push({uid:AO.Util.id('item'),itemId,qty:1});}else p.inventory.push({uid:AO.Util.id('item'),itemId,qty:1});}
    if(bg.item)p.inventory.push({uid:AO.Util.id('item'),itemId:bg.item,qty:1});
    p.inventory.push({uid:AO.Util.id('item'),itemId:'travel_ration',qty:2});return p;
  }
  newGame(build){
    this.state={mode:'explore',player:this.createPlayer(build),world:{mapId:'haven',x:14,y:15,opened:{},gathered:{},defeated:{},doors:{}},history:{kills:{},items:{},gathers:{},talked:{},opened:{}},quests:{},trackedQuestId:null,flags:{},rest:{day:1,wellRestedBattles:0},log:['The oath begins beneath Haven’s last lantern.'],dialogueNpc:null};
    this.recalculatePlayer();this.fullRestore();this.world.load('haven',14,15);this.ui.showGame();this.ui.updateHud();this.saveGame(true);this.toast('Welcome to Haven. Every door can be opened.');
  }
  migrateState(){
    const s=this.state,p=s.player;s.world||={mapId:'haven',x:14,y:15,opened:{},gathered:{},defeated:{},doors:{}};for(const key of ['opened','gathered','defeated','doors'])s.world[key]||={};s.quests||={};s.flags||={};s.log||=[];s.history||={kills:{},items:{},gathers:{},talked:{},opened:{}};s.rest||={day:1,wellRestedBattles:0};s.rest.day||=1;s.rest.wellRestedBattles||=0;s.trackedQuestId||=null;
    p.backgroundId||='outlander';p.appearance={hairColor:AO.RACES[p.raceId]?.visual?.hair||'#29252a',eyeColor:AO.RACES[p.raceId]?.visual?.eye||'#65a8cf',accentColor:AO.RACES[p.raceId]?.visual?.accent||'#557a96',hairStyle:'natural',frame:'standard',mark:'none',...(p.appearance||{})};p.skills||=[...(AO.BACKGROUNDS[p.backgroundId]?.skills||[])];p.equipment||={};
    if(p.equipment.armor&&!p.equipment.chest)p.equipment.chest=p.equipment.armor;if(p.equipment.trinket&&!p.equipment.amulet)p.equipment.amulet=p.equipment.trinket;delete p.equipment.armor;delete p.equipment.trinket;
    for(const slot of AO.EQUIPMENT_SLOTS)if(!(slot in p.equipment))p.equipment[slot]=null;p.inventory||=[];p.level=Math.min(p.level||1,AO.CONFIG.maxLevel);p.xp||=0;p.unspentPoints||=0;
    if(!AO.MAP_DEFS[s.world.mapId]){s.world.mapId='haven';s.world.x=14;s.world.y=15;}
  }
  stat(id){return this.state?.player?.effectiveStats?.[id]??this.state?.player?.stats?.[id]??10;}
  recalculatePlayer(){
    if(!this.state)return;const p=this.state.player,cls=AO.CLASSES[p.classId],rm=this.raceMechanics(),gear={ac:rm.ac||0,hp:0,mana:0,stamina:0,crit:rm.crit||0,bonusDamage:rm.bonusDamage||0,stats:{}};
    for(const id of Object.values(p.equipment||{})){const item=AO.ITEMS[id];if(!item)continue;for(const key of ['ac','hp','mana','stamina','crit','bonusDamage'])gear[key]+=item[key]||0;for(const [stat,val] of Object.entries(item.stats||{}))gear.stats[stat]=(gear.stats[stat]||0)+val;}
    p.gearBonuses=gear;p.effectiveStats={};for(const [id,value] of Object.entries(p.stats))p.effectiveStats[id]=value+(gear.stats[id]||0);
    const rested=this.state.rest?.wellRestedBattles>0;p.maxHp=Math.max(1,p.baseMaxHp+Math.max(0,AO.Util.statMod(this.stat('con')))*p.level+gear.hp+(rested?5:0));p.maxMana=Math.max(0,p.baseMaxMana+Math.max(0,AO.Util.statMod(this.stat('int')))+gear.mana+(rested?3:0));p.maxStamina=Math.max(0,p.baseMaxStamina+Math.max(0,AO.Util.statMod(this.stat('dex')))+gear.stamina+(rested?3:0));p.ac=cls.ac+gear.ac;p.hp=AO.Util.clamp(p.hp||p.maxHp,0,p.maxHp);p.mana=AO.Util.clamp(p.mana||p.maxMana,0,p.maxMana);p.stamina=AO.Util.clamp(p.stamina||p.maxStamina,0,p.maxStamina);
  }
  fullRestore(){const p=this.state.player;p.hp=p.maxHp;p.mana=p.maxMana;p.stamina=p.maxStamina;AO.events.emit('playerChanged');}
  saveGame(silent=false){if(!this.state)return;if(this.state.mode==='combat'){this.toast('Finish the encounter before saving.');return;}const old=this.state.mode;this.state.mode='explore';const ok=AO.SaveManager.save(this.state);this.state.mode=old;if(!silent)this.toast(ok?'Game saved.':'Save failed.');}
  loadGame(){
    const loaded=AO.SaveManager.load();if(!loaded){this.toast('No saved game found.');return;}this.state=loaded;this.state.mode='explore';this.migrateState();this.state.dialogueNpc=null;this.combat.current=null;this.recalculatePlayer();this.world.load(this.state.world.mapId,this.state.world.x,this.state.world.y);this.quests.reconcileAll();this.ui.e.defeat.classList.add('hidden');this.ui.closeCombat();this.ui.showGame();this.ui.updateHud();this.toast('Save loaded and upgraded to the current town build.');
  }
  toast(text){this.ui.toast(text);this.log(text);}
  log(text){if(!this.state)return;this.state.log.unshift(text);this.state.log=this.state.log.slice(0,60);this.ui.updateHud();}
  interactNearest(){if(this.state.mode!=='explore')return;const pos=this.world.playerPos(),targets=this.world.entities.filter(e=>!e.hidden&&AO.Util.dist(pos,e)<=1&&e.type!=='portal');if(targets[0])this.world.interact(targets[0]);else this.toast('Nothing nearby to interact with.');}
  check(stat,dc,skill=''){const p=this.state.player,rm=this.raceMechanics();let bonus=AO.Util.statMod(this.stat(stat)),proficient=(p.skills||[]).includes(skill);if(proficient)bonus+=2+Math.floor((p.level-1)/3);bonus+=rm.allChecks||0;bonus+=(rm.skillBonuses?.[skill]||0);const natural=AO.Util.d20(),total=natural+bonus;this.toast(`${AO.Util.title(skill||stat)} check: ${total} vs DC ${dc}${proficient?' • proficient':''}`);return{success:natural===20||total>=dc,natural,total,bonus,proficient};}
  offerCamp(){
    if(!this.state||this.state.mode!=='explore')return;if(!this.world.map?.allowCamp){this.toast('Camping is not allowed here. Use the Lantern Rest or find an outdoor campsite.');return;}
    this.state.mode='dialogue';this.ui.dialogue('Camp','Make camp for the night? Camping is free and fully restores health, mana, and stamina.',[{label:'Build a fire and rest.',action:()=>this.performRest('camp')},{label:'Keep moving.',action:()=>this.ui.closeDialogue()}],null,'Free Camping');
  }
  offerInnRest(npc){
    this.ui.dialogue(npc.name,'A private room costs 12 gold. A full night restores every resource and grants Well Rested for the next three battles.',[{label:'Rent a room for 12 gold.',action:()=>this.performRest('inn',12)},{label:'Maybe later.',action:()=>this.dialogue(npc)}],npc.visual,'A Room at the Lantern Rest');
  }
  performRest(kind,cost=0){
    const p=this.state.player;if(cost&&p.gold<cost){this.toast('Not enough gold for a room.');return;}p.gold-=cost;this.state.rest.day++;this.state.rest.wellRestedBattles=kind==='inn'?3:0;this.recalculatePlayer();this.fullRestore();this.ui.closeDialogue();this.log(kind==='inn'?`Day ${this.state.rest.day}: You wake well rested at the Lantern Rest.`:`Day ${this.state.rest.day}: You break camp restored.`);this.saveGame(true);this.toast(kind==='inn'?'Fully restored • Well Rested for 3 battles':'Camp complete • Resources fully restored');
  }
  consumeRestedBattle(){if(this.state.rest?.wellRestedBattles>0){this.state.rest.wellRestedBattles--;this.recalculatePlayer();this.log(`Well Rested remains for ${this.state.rest.wellRestedBattles} battle(s).`);}}
  dialogue(npc){
    this.state.mode='dialogue';this.state.dialogueNpc=npc.id;this.quests.onTalk(npc.id);const choices=[];
    for(const [qid,def] of Object.entries(AO.QUESTS)){if(def.giver!==npc.id)continue;const q=this.quests.state(qid);if(q?.status==='ready')choices.push({label:`Turn in: ${def.name}`,action:()=>{this.quests.complete(qid);this.ui.closeDialogue();}});else if(this.quests.canStart(qid))choices.push({label:`Ask about “${def.name}”`,action:()=>this.questOffer(npc,qid)});}
    if(npc.shop)choices.push({label:`Browse ${AO.SHOPS[npc.shop].name}`,action:()=>{this.ui.closeDialogue();this.ui.openShop(npc.shop);}});
    if(npc.id==='mara')choices.push({label:'Browse ordinary provisions.',action:()=>{this.ui.closeDialogue();this.ui.openShop('haven_general');}});
    if(npc.id==='elowen')choices.push({label:'Rent a room and rest.',action:()=>this.offerInnRest(npc)});
    if(npc.id==='mira')choices.push({label:'Ask about Haven and its buildings.',action:()=>this.ui.dialogue(npc.name,'The inn stands northwest, Selene’s shop north, the tavern northeast, Mara south-west, the chapel south, and Borin’s forge south-east. Open a door once, then use it again to enter.',[{label:'Back',action:()=>this.dialogue(npc)}],npc.visual,'Lantern Square')});
    if(npc.id==='bran')choices.push({label:'Ask for tavern rumors.',action:()=>this.ui.dialogue(npc.name,'Travelers whisper about a haunted room upstairs at the inn, blue crystals in the abandoned mine, and an old fire moving beneath the crypt.',[{label:'Back',action:()=>this.dialogue(npc)}],npc.visual,'Rumors by Firelight')});
    if(npc.id==='borin')choices.push({check:'[HISTORY • DC 11]',label:'Examine the forge mark above his anvil.',action:()=>{const r=this.check('int',11,'history');this.ui.dialogue(npc.name,r.success?'You recognize the mark of the ward-smiths who sealed the Ashen Crypt. Borin nods, impressed.':'The mark is ancient, but its meaning escapes you.',[{label:'Continue',action:()=>this.dialogue(npc)}],npc.visual,npc.title);}});
    if(npc.id==='mara')choices.push({check:'[PERSUASION • DC 12]',label:'Ask for a traveler’s sample.',action:()=>{const r=this.check('cha',12,'persuasion');if(r.success&&!this.state.flags.maraGift){this.state.flags.maraGift=true;this.inventory.add('healing_draught');}this.ui.dialogue(npc.name,r.success?'“One bottle. Return alive and buy the next one.”':'“Charm does not refill shelves,” Mara says.',[{label:'Continue',action:()=>this.dialogue(npc)}],npc.visual,npc.title);}});
    if(npc.id==='lys')choices.push({check:'[INSIGHT • DC 12]',label:'Ask why she watches every new traveler.',action:()=>{const r=this.check('wis',12,'insight');if(r.success&&!this.state.flags.lysInsight){this.state.flags.lysInsight=true;this.state.player.gold+=18;this.progression.grantXp(15);}this.ui.dialogue(npc.name,r.success?'Lys admits she is tracking whoever armed the eastern bandits. She shares recovered coins and a name written in code.':'Lys smiles, but reveals nothing.',[{label:'Continue',action:()=>this.dialogue(npc)}],npc.visual,npc.title);}});
    if(npc.id==='selene')choices.push({check:'[ARCANA • DC 13]',label:'Identify the star-map suspended above her counter.',action:()=>{const r=this.check('int',13,'arcana');if(r.success&&!this.state.flags.seleneGift){this.state.flags.seleneGift=true;this.inventory.add('scroll_sparks');this.progression.grantXp(20);}this.ui.dialogue(npc.name,r.success?'You identify a route through a sky that no longer exists. Selene rewards the insight with a scroll.':'The constellations rearrange before you can name them.',[{label:'Continue',action:()=>this.dialogue(npc)}],npc.visual,npc.title);}});
    if(npc.id==='odo')choices.push({label:'Receive the chapel’s blessing.',action:()=>{const day=this.state.rest.day;if(this.state.flags.odoBlessingDay===day)this.toast('You have already received today’s blessing.');else{this.state.flags.odoBlessingDay=day;this.state.player.hp=Math.min(this.state.player.maxHp,this.state.player.hp+15);this.state.player.mana=Math.min(this.state.player.maxMana,this.state.player.mana+8);this.toast('The Last Light restores some health and mana.');}this.dialogue(npc);}});
    choices.push({label:'Leave.',action:()=>this.ui.closeDialogue()});
    const greetings={mira:'“Haven has survived because every door opens for a neighbor—and closes against the dark.”',mara:'“Remedies to the left, road food to the right. Do not confuse them.”',borin:'“The mine is singing again. Stone should not sing.”',lys:'“Sit near the fire. The best rumors dislike cold rooms.”',bran:'“Food, ale, work, and regrettable stories. Which are you buying?”',elowen:'“A quiet room is worth more than armor after a long road.”',selene:'“Please do not touch anything that knows your true name.”',odo:'“No god claims this chapel. The light remains anyway.”',nessa:'“Armor keeps you alive. Good tailoring makes survival look intentional.”',jory:'“Every ring tells a story. The expensive ones tell it convincingly.”'};
    this.ui.dialogue(npc.name,greetings[npc.id]||'The stranger regards you carefully.',choices,npc.visual,npc.title);
  }
  questOffer(npc,qid){const q=AO.QUESTS[qid];this.ui.dialogue(npc.name,q.summary,[{label:'Accept the quest.',action:()=>{this.quests.start(qid);this.ui.closeDialogue();}},{label:'Not yet.',action:()=>this.dialogue(npc)}],npc.visual,q.name);}
};
