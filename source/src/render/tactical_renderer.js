/* Thousandfold Realms v1.4.1 — tactical overlays, seeded battlefields, and camera viewport. */
const TacticalBaseRenderer = AO.Renderer;
AO.Renderer = class extends TacticalBaseRenderer {
  cameraState(){return this.game.combat?.current?.camera||null;}
  clampCamera(){
    const cam=this.cameraState();if(!cam)return;const w=this.canvas.width,h=this.canvas.height,zoom=AO.Util.clamp(cam.zoom||1.34,1,1.9),halfW=w/(2*zoom),halfH=h/(2*zoom),worldW=AO.CONFIG.mapWidth*AO.CONFIG.tile,worldH=AO.CONFIG.mapHeight*AO.CONFIG.tile;
    cam.zoom=zoom;cam.x=AO.Util.clamp(cam.x??worldW/2,halfW,worldW-halfW);cam.y=AO.Util.clamp(cam.y??worldH/2,halfH,worldH-halfH);
  }
  panCamera(dx,dy){const cam=this.cameraState();if(!cam)return;cam.x+=dx;cam.y+=dy;this.clampCamera();}
  zoomCamera(delta){const cam=this.cameraState();if(!cam)return;cam.zoom=AO.Util.clamp((cam.zoom||1.34)+delta,1,1.9);this.clampCamera();}
  centerOnActor(actor=this.game.combat?.activeActor(),hard=true){const cam=this.cameraState();if(!cam||!actor)return;const tx=actor.x*AO.CONFIG.tile+AO.CONFIG.tile/2,ty=actor.y*AO.CONFIG.tile+AO.CONFIG.tile/2;if(hard){cam.x=tx;cam.y=ty;}else{cam.x=cam.x*.55+tx*.45;cam.y=cam.y*.55+ty*.45;}this.clampCamera();}
  screenToWorld(px,py){
    const cam=this.cameraState();if(this.game.state?.mode!=='combat'||!cam)return{x:px,y:py};this.clampCamera();const sw=this.canvas.width/cam.zoom,sh=this.canvas.height/cam.zoom,sx=cam.x-sw/2,sy=cam.y-sh/2;return{x:sx+px/cam.zoom,y:sy+py/cam.zoom};
  }
  drawTacticalOverlay(ctx){
    const combat=this.game.combat,c=combat?.current;if(!c)return;const s=AO.CONFIG.tile,playerTurn=combat.isPlayerTurn(),reachable=playerTurn?combat.reachableTiles():new Map(),pending=AO.ABILITIES[c.pendingAbilityId]||AO.ABILITIES.basic_attack;
    ctx.save();ctx.imageSmoothingEnabled=false;
    const b=c.boundary;ctx.strokeStyle='rgba(240,182,72,.92)';ctx.lineWidth=3;ctx.setLineDash([8,5]);ctx.strokeRect(b.minX*s+2,b.minY*s+2,(b.maxX-b.minX+1)*s-4,(b.maxY-b.minY+1)*s-4);ctx.setLineDash([]);
    if(playerTurn){
      for(const [key,cost] of reachable){const [x,y]=key.split(',').map(Number);if(x===combat.playerActor().x&&y===combat.playerActor().y)continue;ctx.fillStyle=`rgba(76,151,196,${Math.max(.10,.30-cost*.018)})`;ctx.fillRect(x*s+3,y*s+3,s-6,s-6);ctx.strokeStyle='rgba(130,210,245,.52)';ctx.strokeRect(x*s+5,y*s+5,s-10,s-10);}
      for(const enemy of combat.livingEnemies()){const valid=combat.validTarget(enemy,pending);if(valid.ok){ctx.fillStyle='rgba(194,70,65,.25)';ctx.fillRect(enemy.x*s+2,enemy.y*s+2,s-4,s-4);ctx.strokeStyle='rgba(255,125,112,.95)';ctx.lineWidth=2;ctx.strokeRect(enemy.x*s+3,enemy.y*s+3,s-6,s-6);}}
    }
    for(const actor of Object.values(c.actors).filter(a=>a.side==='enemy'&&a.hp>0)){
      const entity=this.game.world.entities.find(e=>e.id===actor.spawnId&&!e.hidden);if(!entity)AO.SpriteFactory.enemy(ctx,actor.x*s,actor.y*s,actor.visual,1);
    }
    const selected=combat.actor(c.selectedTargetId),active=combat.activeActor();
    if(selected?.hp>0){const p=combat.playerActor();ctx.strokeStyle='#f6df78';ctx.lineWidth=3;ctx.strokeRect(selected.x*s+1,selected.y*s+1,s-2,s-2);if(combat.hasLineOfSight(p,selected)){ctx.strokeStyle='rgba(246,223,120,.50)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.x*s+s/2,p.y*s+s/2);ctx.lineTo(selected.x*s+s/2,selected.y*s+s/2);ctx.stroke();}}
    for(const actor of Object.values(c.actors).filter(a=>combat.actorAlive(a))){
      const hp=actor.side==='player'?this.game.state.player.hp:actor.hp,max=actor.side==='player'?this.game.state.player.maxHp:actor.maxHp,x=actor.x*s+2,y=actor.y*s-6,w=s-4;
      ctx.fillStyle='rgba(4,6,8,.86)';ctx.fillRect(x,y,w,5);ctx.fillStyle=actor.side==='player'?'#72ad79':'#c45b55';ctx.fillRect(x+1,y+1,Math.max(0,(w-2)*hp/max),3);
      if(active?.id===actor.id){ctx.fillStyle='#f0c66e';ctx.font='bold 12px Courier New';ctx.textAlign='center';ctx.fillText('▼',actor.x*s+s/2,actor.y*s-9);}
      const terrain=AO.TacticalRules.tileInfo(combat.tileAt(actor.x,actor.y));if(terrain.hazard){ctx.fillStyle='#f0a05d';ctx.font='bold 9px Courier New';ctx.textAlign='right';ctx.fillText('!',actor.x*s+s-2,actor.y*s+10);}
    }
    ctx.restore();
  }
  render(){
    const combat=this.game.combat,c=combat?.current;if(this.game.state?.mode!=='combat'||!c){super.render();return;}
    const visibleCanvas=this.canvas,visibleCtx=this.ctx;this.tacticalSurface||=document.createElement('canvas');const surface=this.tacticalSurface;surface.width=visibleCanvas.width;surface.height=visibleCanvas.height;const surfaceCtx=surface.getContext('2d');surfaceCtx.imageSmoothingEnabled=false;
    const originalGrid=this.game.world.grid;if(c.battlefield?.grid)this.game.world.grid=c.battlefield.grid;
    this.canvas=surface;this.ctx=surfaceCtx;super.render();this.drawTacticalOverlay(surfaceCtx);this.canvas=visibleCanvas;this.ctx=visibleCtx;this.game.world.grid=originalGrid;
    this.clampCamera();const cam=c.camera,sw=visibleCanvas.width/cam.zoom,sh=visibleCanvas.height/cam.zoom,sx=AO.Util.clamp(cam.x-sw/2,0,surface.width-sw),sy=AO.Util.clamp(cam.y-sh/2,0,surface.height-sh);
    visibleCtx.clearRect(0,0,visibleCanvas.width,visibleCanvas.height);visibleCtx.imageSmoothingEnabled=false;visibleCtx.drawImage(surface,sx,sy,sw,sh,0,0,visibleCanvas.width,visibleCanvas.height);
    visibleCtx.save();visibleCtx.fillStyle='rgba(8,10,12,.72)';visibleCtx.fillRect(8,8,220,24);visibleCtx.strokeStyle='rgba(225,184,92,.65)';visibleCtx.strokeRect(8.5,8.5,219,23);visibleCtx.fillStyle='#e8c873';visibleCtx.font='bold 10px Courier New';visibleCtx.fillText(`${c.battlefield?.name||'Local Battlefield'} • ${Math.round(cam.zoom*100)}%`,17,24);visibleCtx.restore();
  }
};
