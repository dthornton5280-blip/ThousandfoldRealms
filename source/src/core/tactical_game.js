/* Thousandfold Realms v1.4.1 — encounter persistence, tactical camera, and input integration. */
AO.VERSION='1.4.4-thousandfold-realms-brand-migration';
const TacticalBaseGame = AO.Game;
AO.Game = class extends TacticalBaseGame {
  constructor(){
    super();this.cameraDrag=null;
    window.addEventListener('keydown',ev=>{
      if(!this.state||this.state.mode!=='combat')return;const tag=document.activeElement?.tagName;if(['INPUT','TEXTAREA','SELECT'].includes(tag))return;const key=ev.key.toLowerCase();
      if(key==='enter'){ev.preventDefault();this.combat.endPlayerTurn();}
      else if(key==='escape'){this.combat.current.pendingAbilityId=null;this.combat.refresh();}
      else if(key==='tab'){ev.preventDefault();this.combat.cycleTarget(ev.shiftKey?-1:1);}
      else if(key==='f'||key==='home'){ev.preventDefault();this.renderer.centerOnActor(this.combat.activeActor()||this.combat.playerActor(),true);}
      else if(key==='q'){ev.preventDefault();this.ui.tacticalItemsOpen=!this.ui.tacticalItemsOpen;this.ui.tacticalLogOpen=false;this.ui.updateTacticalPopovers?.();}
      else if(key==='l'){ev.preventDefault();this.ui.tacticalLogOpen=!this.ui.tacticalLogOpen;this.ui.tacticalItemsOpen=false;this.ui.updateTacticalPopovers?.();}
      else if(key==='+'||key==='='){ev.preventDefault();this.renderer.zoomCamera(.12);}
      else if(key==='-'||key==='_'){ev.preventDefault();this.renderer.zoomCamera(-.12);}
    });
    this.canvas.addEventListener('contextmenu',ev=>{if(this.state?.mode==='combat')ev.preventDefault();});
    this.canvas.addEventListener('pointerdown',ev=>{
      if(this.state?.mode!=='combat'||![1,2].includes(ev.button))return;ev.preventDefault();this.cameraDrag={x:ev.clientX,y:ev.clientY,moved:false};this.canvas.setPointerCapture?.(ev.pointerId);
    });
    this.canvas.addEventListener('pointermove',ev=>{
      if(!this.cameraDrag||this.state?.mode!=='combat')return;const dx=ev.clientX-this.cameraDrag.x,dy=ev.clientY-this.cameraDrag.y;if(Math.abs(dx)+Math.abs(dy)>2)this.cameraDrag.moved=true;this.cameraDrag.x=ev.clientX;this.cameraDrag.y=ev.clientY;const rect=this.canvas.getBoundingClientRect(),scale=this.canvas.width/rect.width,zoom=this.combat.current?.camera?.zoom||1;this.renderer.panCamera(-dx*scale/zoom,-dy*scale/zoom);
    });
    const stopDrag=ev=>{if(!this.cameraDrag)return;if(this.cameraDrag.moved)this.suppressCanvasClickUntil=performance.now()+220;this.cameraDrag=null;this.canvas.releasePointerCapture?.(ev.pointerId);};
    this.canvas.addEventListener('pointerup',stopDrag);this.canvas.addEventListener('pointercancel',stopDrag);
    this.canvas.addEventListener('wheel',ev=>{if(this.state?.mode!=='combat')return;ev.preventDefault();this.renderer.zoomCamera(ev.deltaY<0?.12:-.12);},{passive:false});
  }

  initializeTacticalState(){
    if(!this.state)return;if(this.state.encounter&&(!this.state.encounter.actors||!this.state.encounter.mapId))this.state.encounter=null;
    if(this.state.encounter){this.state.encounter.camera||={x:AO.CONFIG.mapWidth*AO.CONFIG.tile/2,y:AO.CONFIG.mapHeight*AO.CONFIG.tile/2,zoom:1.34};}
  }

  newGame(build){super.newGame(build);this.state.encounter=null;this.state.mode='explore';this.saveGame(true);}
  migrateState(){super.migrateState();this.initializeTacticalState();}

  saveGame(silent=false){
    if(!this.state)return;if(this.combat.current)this.state.encounter=this.combat.current;const ok=AO.SaveManager.save(this.state);if(!silent)this.toast(ok?(this.state.mode==='combat'?'Encounter saved.':'Game saved.'):'Save failed.');
  }

  loadGame(){
    const loaded=AO.SaveManager.load();if(!loaded){this.toast('No saved game found.');return;}
    clearTimeout(this.combat.aiTimer);this.combat.current=null;this.state=loaded;this.migrateState();this.state.dialogueNpc=null;this.recalculatePlayer();
    this.world.load(this.state.world.mapId,this.state.world.x,this.state.world.y);this.quests.reconcileAll();
    this.ui.e.defeat.classList.add('hidden');this.ui.closeCombat();this.ui.closeTacticalCombat?.();this.ui.showGame();this.ui.applySettings?.();
    const savedEncounter=this.state.encounter,savedMode=this.state.mode;
    if(savedMode==='combat'&&savedEncounter&&this.combat.resume(savedEncounter))this.toast('Saved tactical encounter resumed.');
    else{this.state.mode='explore';this.state.encounter=null;this.combat.current=null;this.updateNearbyPrompt();this.toast('Save loaded and migrated to v1.4.2.');}
    this.ui.updateHud();
  }

  updateNearbyPrompt(){
    if(this.state?.mode==='combat'&&this.ui.e.nearbyPrompt){const c=this.combat.current,a=this.combat.activeActor();this.ui.e.nearbyPrompt.innerHTML=`<strong>${c?.battlefield?.name||'Tactical encounter'}:</strong> Round ${c?.round||1} • ${a?.name||'Resolving'} acts • WASD pans • arrows move • Tab targets • F recenters.`;return;}
    super.updateNearbyPrompt();
  }
};
