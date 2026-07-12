/* Thousandfold Realms v1.4.1 — fixed, no-scroll tactical action bar. */
const TacticalBaseUI = AO.UI;
AO.UI = class extends TacticalBaseUI {
  constructor(game){super(game);this.tacticalAbilityId=null;this.tacticalItemsOpen=false;this.tacticalLogOpen=false;}

  init(){super.init();this.createTacticalPanel();if(this.e.flee)this.e.flee.onclick=()=>this.game.combat.attemptRetreat?.();}

  createTacticalPanel(){
    if(document.getElementById('tacticalPanel'))return;
    const panel=document.createElement('section');panel.id='tacticalPanel';panel.className='tactical-panel hidden';panel.setAttribute('aria-live','polite');
    panel.innerHTML=`
      <div class="tactical-topbar">
        <div class="tactical-scene"><span id="tacticalThreat" class="threat-pill">EVEN</span><div><strong id="tacticalTitle">Encounter</strong><small id="tacticalSceneName">Local Battlefield</small></div></div>
        <div id="tacticalInitiative" class="tactical-initiative" aria-label="Initiative order"></div>
        <div id="tacticalTurn" class="tactical-turn"></div>
        <div class="camera-controls" aria-label="Tactical camera"><button id="cameraOut" title="Zoom out">−</button><button id="cameraCenter" title="Center on active unit">◎</button><button id="cameraIn" title="Zoom in">+</button></div>
      </div>
      <div class="tactical-sidehud">
        <div id="tacticalResources" class="tactical-resources"></div>
        <div id="tacticalTarget" class="tactical-target"></div>
        <div id="tacticalEnemies" class="tactical-enemies"></div>
      </div>
      <div class="tactical-actiondock">
        <div id="tacticalActions" class="tactical-actions"></div>
        <div class="tactical-utility-actions">
          <button id="tacticalItemsToggle" class="dock-utility" title="Open combat consumables">Potion <kbd>Q</kbd></button>
          <button id="tacticalBrace" class="dock-utility" title="Spend your action to gain guard">Brace</button>
          <button id="tacticalEndTurn" class="dock-utility primary-dock">End Turn <kbd>Enter</kbd></button>
          <button id="tacticalRetreat" class="dock-utility" title="Reach the amber boundary before retreating">Retreat</button>
          <button id="tacticalLogToggle" class="dock-utility" title="Open or close the combat log">Log</button>
        </div>
        <div id="tacticalItemsPopover" class="tactical-popover hidden"><header><strong>Consumables</strong><button data-close-popover="items">×</button></header><div id="tacticalItems" class="tactical-items"></div></div>
        <div id="tacticalLogDrawer" class="tactical-log-drawer hidden"><header><strong>Combat Log</strong><button data-close-popover="log">×</button></header><div id="tacticalLog" class="tactical-log"></div></div>
      </div>`;
    const frame=document.querySelector('.canvas-frame'),help=frame?.querySelector('.canvas-help');if(frame)frame.insertBefore(panel,help||null);else this.e.gameScreen?.append(panel);
    Object.assign(this.e,{tacticalPanel:panel,tacticalTitle:panel.querySelector('#tacticalTitle'),tacticalSceneName:panel.querySelector('#tacticalSceneName'),tacticalThreat:panel.querySelector('#tacticalThreat'),tacticalTurn:panel.querySelector('#tacticalTurn'),tacticalInitiative:panel.querySelector('#tacticalInitiative'),tacticalResources:panel.querySelector('#tacticalResources'),tacticalTarget:panel.querySelector('#tacticalTarget'),tacticalEnemies:panel.querySelector('#tacticalEnemies'),tacticalActions:panel.querySelector('#tacticalActions'),tacticalItems:panel.querySelector('#tacticalItems'),tacticalLog:panel.querySelector('#tacticalLog'),tacticalEndTurn:panel.querySelector('#tacticalEndTurn'),tacticalRetreat:panel.querySelector('#tacticalRetreat'),tacticalBrace:panel.querySelector('#tacticalBrace'),tacticalItemsToggle:panel.querySelector('#tacticalItemsToggle'),tacticalLogToggle:panel.querySelector('#tacticalLogToggle'),tacticalItemsPopover:panel.querySelector('#tacticalItemsPopover'),tacticalLogDrawer:panel.querySelector('#tacticalLogDrawer')});
    this.e.tacticalEndTurn.onclick=()=>this.game.combat.endPlayerTurn();this.e.tacticalRetreat.onclick=()=>this.game.combat.attemptRetreat();this.e.tacticalBrace.onclick=()=>this.game.combat.bracePlayer();
    this.e.tacticalItemsToggle.onclick=()=>{this.tacticalItemsOpen=!this.tacticalItemsOpen;this.tacticalLogOpen=false;this.updateTacticalPopovers();};
    this.e.tacticalLogToggle.onclick=()=>{this.tacticalLogOpen=!this.tacticalLogOpen;this.tacticalItemsOpen=false;this.updateTacticalPopovers();};
    panel.querySelector('[data-close-popover="items"]').onclick=()=>{this.tacticalItemsOpen=false;this.updateTacticalPopovers();};panel.querySelector('[data-close-popover="log"]').onclick=()=>{this.tacticalLogOpen=false;this.updateTacticalPopovers();};
    panel.querySelector('#cameraOut').onclick=()=>this.game.renderer.zoomCamera(-.12);panel.querySelector('#cameraIn').onclick=()=>this.game.renderer.zoomCamera(.12);panel.querySelector('#cameraCenter').onclick=()=>this.game.renderer.centerOnActor(this.game.combat.activeActor()||this.game.combat.playerActor(),true);
  }
  updateTacticalPopovers(){this.e.tacticalItemsPopover?.classList.toggle('hidden',!this.tacticalItemsOpen);this.e.tacticalLogDrawer?.classList.toggle('hidden',!this.tacticalLogOpen);}

  openTacticalCombat(){
    this.createTacticalPanel();this.e.combat?.classList.add('hidden');this.e.tacticalPanel?.classList.remove('hidden');document.body.classList.add('combat-running');document.querySelector('.game-layout')?.classList.add('combat-active');
    const help=document.querySelector('.canvas-help');if(help)help.textContent='TACTICAL • Click blue tiles to move • Click/Tab targets • Arrow keys move • WASD pans • Wheel zooms • F recenters';
    this.game.audio?.update(true);
  }
  closeTacticalCombat(){
    this.e.tacticalPanel?.classList.add('hidden');this.tacticalAbilityId=null;this.tacticalItemsOpen=false;this.tacticalLogOpen=false;this.updateTacticalPopovers();document.body.classList.remove('combat-running');document.querySelector('.game-layout')?.classList.remove('combat-active');
    const help=document.querySelector('.canvas-help');if(help)help.textContent='Click to move or interact • WASD / Arrow keys • E interacts • R camps outdoors • Doors close behind you';this.game.audio?.update(true);
  }

  renderTacticalCombat(c,abilities){
    if(!c)return;this.openTacticalCombat();const combat=this.game.combat,p=this.game.state.player,active=combat.activeActor(),playerTurn=combat.isPlayerTurn(),enemies=combat.livingEnemies(),selected=combat.actor(c.selectedTargetId),pending=AO.ABILITIES[c.pendingAbilityId]||null,threat=c.threat?.label||'Even';
    this.e.tacticalTitle.textContent=`Round ${c.round} • ${enemies.length} Hostile${enemies.length===1?'':'s'}`;this.e.tacticalSceneName.textContent=c.battlefield?.name||this.game.world.map.name;this.e.tacticalThreat.textContent=threat.toUpperCase();this.e.tacticalThreat.dataset.threat=threat.toLowerCase();
    this.e.tacticalTurn.innerHTML=`<strong>${active?.name||'Resolving'}</strong><span>${playerTurn?'YOUR TURN':active?.side==='enemy'?'ENEMY TURN':'RESOLVING'}</span>`;
    this.e.tacticalInitiative.innerHTML=c.turnOrder.map((id,index)=>{const a=combat.actor(id),alive=combat.actorAlive(a);return`<button data-initiative-actor="${id}" class="initiative-chip ${index===c.turnIndex?'active':''} ${alive?'':'fallen'} ${a?.side||''}" title="Center camera on ${a?.name||id}">${a?.side==='player'?'◆':'◇'} ${a?.name||id}</button>`;}).join('');
    for(const b of this.e.tacticalInitiative.querySelectorAll('[data-initiative-actor]'))b.onclick=()=>this.game.renderer.centerOnActor(combat.actor(b.dataset.initiativeActor),true);
    const movement=c.movementRemaining||0,action=c.actionRemaining||0,reaction=combat.playerActor()?.reaction?'Ready':'Spent';this.e.tacticalResources.innerHTML=`<div><span>Move</span><strong>${movement}</strong></div><div><span>Action</span><strong>${action}</strong></div><div><span>Reaction</span><strong>${reaction}</strong></div><div><span>Guard</span><strong>${c.playerGuard||0}</strong></div><div><span>HP</span><strong>${p.hp}/${p.maxHp}</strong></div><div><span>${AO.CLASSES[p.classId].resource}</span><strong>${AO.CLASSES[p.classId].resource==='mana'?p.mana:p.stamina}</strong></div>`;
    if(selected&&selected.hp>0){const preview=combat.validTarget(selected,pending||AO.ABILITIES.basic_attack),terrain=AO.TacticalRules.tileInfo(combat.tileAt(selected.x,selected.y));this.e.tacticalTarget.innerHTML=`<strong>${selected.name}</strong><span>${selected.hp}/${selected.maxHp} HP • AC ${selected.ac}</span><small>${preview.ok?`${preview.distance}/${preview.range} range • ${preview.cover?'cover':'open'} • ${preview.elevation>0?'high ground':preview.elevation<0?'low ground':'level'}`:preview.reason}</small><small>${terrain.label}${terrain.hazard?` • ${AO.Util.title(terrain.hazard)}`:''}</small>`;}else this.e.tacticalTarget.innerHTML='<strong>No target</strong><small>Click an enemy or press Tab.</small>';
    this.e.tacticalEnemies.innerHTML=enemies.map(enemy=>`<button data-tactical-target="${enemy.id}" class="enemy-chip ${enemy.id===c.selectedTargetId?'selected':''}" title="${enemy.intent||'Assessing'}"><span>${enemy.name}</span><strong>${enemy.hp}/${enemy.maxHp}</strong></button>`).join('');
    for(const b of this.e.tacticalEnemies.querySelectorAll('[data-tactical-target]'))b.onclick=()=>{c.selectedTargetId=b.dataset.tacticalTarget;combat.refresh();this.game.renderer.centerOnActor(combat.actor(c.selectedTargetId),false);};
    const actionList=[AO.ABILITIES.basic_attack,...abilities.filter(a=>a.id!=='basic_attack')].slice(0,7);this.e.tacticalActions.innerHTML=actionList.map((a,index)=>{const cd=combat.cooldown(a.id),resourceOk=!a.resource||combat.resourceValue(a.resource)>=a.cost,targetOk=a.target==='self'||(selected&&combat.validTarget(selected,a).ok),available=playerTurn&&action>0&&resourceOk&&cd<=0&&targetOk,range=combat.abilityRange(a),hotkey=index===0?'':index<=6?String(index):'';const tooltip=`${a.description} • ${cd?`Cooldown ${cd}`:a.cost?`${a.cost} ${a.resource}`:'No resource cost'} • ${a.target==='self'?'Self':`Range ${range}`}`;return`<button data-tactical-ability="${a.id}" class="action-slot ${c.pendingAbilityId===a.id?'selected':''}" ${available?'':'disabled'} title="${tooltip.replace(/"/g,'&quot;')}"><span class="slot-key">${hotkey||'ATK'}</span><span class="slot-icon">${a.icon||'◆'}</span><strong>${a.name}</strong><small>${cd?`CD ${cd}`:a.cost?`${a.cost} ${a.resource}`:`R ${range}`}</small></button>`;}).join('');
    for(const b of this.e.tacticalActions.querySelectorAll('[data-tactical-ability]'))b.onclick=()=>{const id=b.dataset.tacticalAbility,a=AO.ABILITIES[id];if(a.target==='self')combat.playerAction(id);else{c.pendingAbilityId=id;if(selected&&combat.validTarget(selected,a).ok)combat.playerAction(id);else{this.game.toast('Ability readied. Choose a valid target.');combat.refresh();}}};
    const consumables=p.inventory.filter(e=>AO.ITEMS[e.itemId]?.type==='consumable');this.e.tacticalItems.innerHTML=consumables.length?consumables.map(entry=>{const item=AO.ITEMS[entry.itemId];return`<button data-tactical-item="${entry.uid}" ${playerTurn&&action>0?'':'disabled'} title="${item.description||item.name}">${item.icon||'◆'} <span>${item.name}</span><strong>×${entry.qty}</strong></button>`;}).join(''):'<span class="muted">No consumables prepared.</span>';
    for(const b of this.e.tacticalItems.querySelectorAll('[data-tactical-item]'))b.onclick=()=>{combat.useItem(b.dataset.tacticalItem);this.tacticalItemsOpen=false;this.updateTacticalPopovers();};
    this.e.tacticalLog.innerHTML=c.log.slice(0,18).map(line=>`<div>${line}</div>`).join('');this.e.tacticalEndTurn.disabled=!playerTurn;this.e.tacticalBrace.disabled=!playerTurn||action<1;this.e.tacticalRetreat.disabled=!playerTurn||!combat.atBoundaryEdge(combat.playerActor().x,combat.playerActor().y);this.updateTacticalPopovers();this.updateHud();
  }
};
