AO.QuestSystem = class {
  constructor(game){this.game=game;}
  ensureHistory(){
    const s=this.game.state;if(!s)return;
    s.history ||= {kills:{},items:{},gathers:{},talked:{},opened:{}};
    for(const k of ['kills','items','gathers','talked','opened'])s.history[k] ||= {};
    const defeated=s.world?.defeated||{},killTotals={};
    for(const map of Object.values(AO.MAP_DEFS||{}))for(const spawn of map.enemies||[])if(defeated[spawn.id])killTotals[spawn.type]=(killTotals[spawn.type]||0)+1;
    for(const [type,total] of Object.entries(killTotals))s.history.kills[type]=Math.max(s.history.kills[type]||0,total);
    const gathered=s.world?.gathered||{},gatherTotals={};
    for(const map of Object.values(AO.MAP_DEFS||{}))for(const obj of map.objects||[])if(gathered[obj.id]&&obj.resource)gatherTotals[obj.resource]=(gatherTotals[obj.resource]||0)+1;
    for(const [item,total] of Object.entries(gatherTotals)){s.history.gathers[item]=Math.max(s.history.gathers[item]||0,total);s.history.items[item]=Math.max(s.history.items[item]||0,total);}
    for(const entry of s.player?.inventory||[])s.history.items[entry.itemId]=Math.max(s.history.items[entry.itemId]||0,entry.qty||1);
  }
  state(id){return this.game.state.quests[id]||null;}
  prerequisitesMet(def){return (def.prerequisites||[]).every(id=>this.state(id)?.status==='complete');}
  canStart(id){const d=AO.QUESTS[id],p=this.game.state.player;return !!d&&p.level>=d.minLevel&&this.prerequisitesMet(d)&&!this.state(id);}
  start(id){
    if(!this.canStart(id))return false;
    this.ensureHistory();
    this.game.state.quests[id]={status:'active',stage:0,progress:0};
    this.game.state.trackedQuestId=id;
    const first=this.currentStage(id);
    if(first?.type==='talk'&&first.target===this.game.state.dialogueNpc)this.advance(id,'The conversation sets your task in motion.');
    this.reconcile(id);
    this.game.toast(`Quest started: ${AO.QUESTS[id].name}`);AO.events.emit('questsChanged');return true;
  }
  track(id){if(!this.state(id))return;this.game.state.trackedQuestId=id;AO.events.emit('questsChanged');this.game.ui.updateHud();}
  defeatedCount(enemyType){this.ensureHistory();return this.game.state.history.kills[enemyType]||0;}
  acquiredCount(itemId){
    this.ensureHistory();const s=this.game.state;
    let inferred=this.game.inventory.count(itemId);
    for(const map of Object.values(AO.MAP_DEFS||{}))for(const obj of map.objects||[]){
      if(obj.resource===itemId&&s.world.gathered?.[obj.id])inferred++;
      if((obj.loot||[]).includes(itemId)&&s.world.opened?.[obj.id])inferred++;
    }
    return Math.max(s.history.items[itemId]||0,inferred);
  }
  advance(id,message=''){
    const q=this.state(id),d=AO.QUESTS[id];if(!q||!d)return;
    const old=this.currentStage(id);q.stage++;q.progress=0;
    if(q.stage>=d.stages.length)q.status='ready';
    if(message||old?.text)this.game.toast(message||`Objective complete: ${old.text}`);
    AO.events.emit('questsChanged');
  }
  reconcile(id){
    const q=this.state(id);if(!q||q.status!=='active')return;
    let safety=0;
    while(q.status==='active'&&safety++<12){
      const stage=this.currentStage(id);if(!stage)break;
      let total=null;
      if(stage.type==='collect')total=this.acquiredCount(stage.target);
      else if(stage.type==='kill')total=this.defeatedCount(stage.target);
      else break;
      q.progress=Math.min(stage.count,total);
      if(q.progress<stage.count)break;
      this.advance(id);
    }
    AO.events.emit('questsChanged');
  }
  reconcileAll(){this.ensureHistory();for(const id of Object.keys(this.game.state.quests||{}))this.reconcile(id);}
  currentStage(id){const q=this.state(id),d=AO.QUESTS[id];return q&&d?d.stages[q.stage]:null;}
  onTalk(npcId){
    this.ensureHistory();this.game.state.history.talked[npcId]=(this.game.state.history.talked[npcId]||0)+1;
    for(const [id,q] of Object.entries(this.game.state.quests)){
      if(q.status!=='active'&&q.status!=='ready')continue;const stage=this.currentStage(id);if(!stage)continue;
      if(stage.type==='talk'&&stage.target===npcId)this.advance(id);
      else if(stage.type==='return'&&stage.target===npcId){q.status='ready';AO.events.emit('questsChanged');}
    }
  }
  onKill(enemyType){
    this.ensureHistory();
    let persisted=0;for(const map of Object.values(AO.MAP_DEFS||{}))for(const spawn of map.enemies||[])if(spawn.type===enemyType&&this.game.state.world.defeated?.[spawn.id])persisted++;
    this.game.state.history.kills[enemyType]=Math.max((this.game.state.history.kills[enemyType]||0)+(!persisted?1:0),persisted);
    for(const [id,q] of Object.entries(this.game.state.quests))if(q.status==='active'){const stage=this.currentStage(id);if(stage?.type==='kill'&&stage.target===enemyType)this.reconcile(id);}
  }
  onCollect(itemId,total){
    this.ensureHistory();this.game.state.history.items[itemId]=Math.max(this.game.state.history.items[itemId]||0,total||0);
    for(const [id,q] of Object.entries(this.game.state.quests))if(q.status==='active'){const stage=this.currentStage(id);if(stage?.type==='collect'&&stage.target===itemId)this.reconcile(id);}
  }
  advanceTalkStage(id,npcId){const stage=this.currentStage(id);if(stage?.type==='talk'&&stage.target===npcId)this.advance(id);}
  complete(id){
    const q=this.state(id),d=AO.QUESTS[id];if(!q||q.status!=='ready'||!d)return false;
    const finalStage=d.stages[d.stages.length-1];if(finalStage.type==='return'&&finalStage.target!==this.game.state.dialogueNpc)return false;
    for(const req of d.consume||[])if(this.game.inventory.count(req.id)<req.count){this.game.toast(`You need ${req.count} ${AO.ITEMS[req.id]?.name||req.id}.`);return false;}
    for(const req of d.consume||[])this.game.inventory.remove(req.id,req.count);
    q.status='complete';this.game.state.player.gold+=d.reward.gold||0;this.game.progression.grantXp(d.reward.xp||0);
    for(const item of d.reward.items||[])this.game.inventory.add(item,1);
    if(this.game.state.trackedQuestId===id){const next=this.journal().find(x=>x.state.status!=='complete');this.game.state.trackedQuestId=next?.id||null;}
    this.game.toast(`Quest complete: ${d.name}`);AO.events.emit('questsChanged');return true;
  }
  journal(){return Object.entries(this.game.state.quests).map(([id,q])=>({id,def:AO.QUESTS[id],state:q,stage:this.currentStage(id)}));}
};
