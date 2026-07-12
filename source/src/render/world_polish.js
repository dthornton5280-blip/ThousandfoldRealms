/* Thousandfold Realms v1.4.1 — integrated storefront doors and contextual world labels. */
const LivingWorldRenderer = AO.Renderer;
AO.Renderer = class extends LivingWorldRenderer {
  renderTerrainEffects(ctx,layer){
    super.renderTerrainEffects(ctx,layer);
    if(layer==='under')this.renderBuildings(ctx);
  }
  renderIntegratedDoor(ctx,b,door){
    if(!door?.open)return;
    const frame=b.doorFrame||{x:3.48,y:3.17,w:1.08,h:1.75},x=Math.round((b.x+frame.x)*32),y=Math.round((b.y+frame.y)*32),w=Math.round(frame.w*32),h=Math.round(frame.h*32);
    ctx.save();
    /* Dark interior is clipped inside the authored frame instead of drawing the old
       48px freestanding door sprite over the new building artwork. */
    ctx.fillStyle='#111116';ctx.fillRect(x+5,y+5,w-10,h-7);
    const g=ctx.createLinearGradient(x,y,x+w,y);g.addColorStop(0,'rgba(255,211,121,.05)');g.addColorStop(.55,'rgba(34,28,29,.88)');g.addColorStop(1,'rgba(0,0,0,.95)');ctx.fillStyle=g;ctx.fillRect(x+7,y+7,w-14,h-11);
    ctx.strokeStyle=b.accent||'#c9a35a';ctx.lineWidth=2;ctx.strokeRect(x+4.5,y+4.5,w-9,h-8);
    /* A narrow swung-open slab makes the state readable without covering the façade. */
    ctx.fillStyle='#513929';ctx.fillRect(x+w-10,y+8,6,h-15);ctx.fillStyle='rgba(238,190,92,.75)';ctx.fillRect(x+w-9,y+Math.round(h*.54),2,2);
    ctx.restore();
  }
  renderBuildings(ctx){
    const buildings=this.game.world.map?.buildings||[];
    if(!buildings.length)return;
    const t=performance.now(),night=(this.game.state.world.time??8)<6||(this.game.state.world.time??8)>18;
    ctx.save();ctx.imageSmoothingEnabled=false;
    for(const b of buildings){
      if(!AO.Assets?.drawBuilding(ctx,b))continue;
      const dx=b.x*32,dy=b.y*32,dw=b.w*32,dh=b.h*32;
      ctx.fillStyle='rgba(7,8,10,.26)';ctx.fillRect(dx+8,dy+dh-8,dw-4,10);
      ctx.fillStyle='rgba(255,242,196,.08)';ctx.fillRect(dx+22,dy+15,dw-48,2);
      if(night){
        const cx=dx+dw/2,cy=dy+dh-32,g=ctx.createRadialGradient(cx,cy,4,cx,cy,82);
        g.addColorStop(0,'rgba(255,205,105,.22)');g.addColorStop(1,'rgba(255,185,70,0)');ctx.fillStyle=g;ctx.fillRect(cx-82,cy-82,164,164);
      }
      if(!this.game.state.settings?.reducedMotion&&(b.style==='forge'||b.style==='inn')){
        const sx=dx+(b.style==='forge'?202:194),base=dy+(b.style==='forge'?10:12),phase=(t/45)%70;
        for(let i=0;i<3;i++){const yy=base-phase-i*17,xx=sx+Math.sin(t/500+i)*5+i*4,alpha=Math.max(0,.18-(base-yy)/520);ctx.fillStyle=`rgba(175,180,177,${alpha})`;ctx.fillRect(Math.round(xx),Math.round(yy),12+i*3,7+i*2);}
      }
      const door=this.game.world.entities.find(e=>e.id===b.doorId);this.renderIntegratedDoor(ctx,b,door);
    }
    ctx.restore();
  }
  drawMarker(entity){
    const m=this.questMarker(entity);if(!m)return;const x=entity.x*32+16,y=entity.y*32-(entity.type==='npc'?24:8);this.ctx.save();this.ctx.font='bold 15px Courier New';this.ctx.textAlign='center';this.ctx.lineWidth=3;this.ctx.strokeStyle='#111';this.ctx.strokeText(m.text,x,y);this.ctx.fillStyle=m.color;this.ctx.fillText(m.text,x,y);this.ctx.restore();
  }
  entityHovered(entity){const h=this.game.world.hoveredTile;return !!h&&h.x===entity.x&&h.y===entity.y;}
  drawWorldNameplate(entity,occupied=[]){
    const ctx=this.ctx,p=this.game.world.playerPos(),dist=AO.Util.dist(p,entity),npc=entity.type==='npc',enemy=entity.type==='enemy',hovered=this.entityHovered(entity);
    if(this.game.state.mode==='combat'||document.body.classList.contains('rpg-menu-open'))return null;
    if(npc&&!(hovered||dist<=(AO.UI_LABELS?.npcNameDistance??2)))return null;
    if(enemy&&!(hovered||dist<=(AO.UI_LABELS?.enemyNameDistance??3)))return null;
    if(!npc&&!enemy)return null;
    const title=npc&&AO.UI_LABELS?.npcTitlesNearby&&(hovered||dist<=1)?entity.title:null,text=entity.name||AO.Util.title(entity.enemyType||entity.id),sub=title||'';
    ctx.save();ctx.font='bold 10px Courier New';ctx.textAlign='center';const width=Math.max(ctx.measureText(text).width,sub?ctx.measureText(sub).width:0)+12,x=entity.x*32+16;let y=entity.y*32+34,height=sub?25:15;
    let box={x:Math.round(x-width/2),y,w:width,h:height};
    for(let n=0;n<4&&occupied.some(o=>!(box.x+box.w<o.x||o.x+o.w<box.x||box.y+box.h<o.y||o.y+o.h<box.y));n++){box.y-=height+3;y=box.y;}
    occupied.push(box);ctx.fillStyle='rgba(8,10,12,.88)';ctx.fillRect(box.x,box.y,box.w,box.h);ctx.strokeStyle=npc?'rgba(218,182,96,.70)':'rgba(198,83,75,.75)';ctx.strokeRect(box.x+.5,box.y+.5,box.w-1,box.h-1);ctx.fillStyle=npc?'#f0d58a':'#e78b84';ctx.fillText(text,x,box.y+11);
    if(sub){ctx.font='8px Courier New';ctx.fillStyle='#c0b8a5';ctx.fillText(sub,x,box.y+21);}ctx.restore();return box;
  }
  drawBuildingTooltip(){
    if(!AO.UI_LABELS?.buildingTooltips||this.game.state.mode==='combat'||document.body.classList.contains('rpg-menu-open'))return;
    const ctx=this.ctx,player=this.game.world.playerPos(),hover=this.game.world.hoveredTile,buildings=this.game.world.map?.buildings||[];
    const candidates=buildings.map(b=>{const door=this.game.world.entities.find(e=>e.id===b.doorId),d=door||{x:b.x+4,y:b.y+4};return{b,door:d,dist:AO.Util.dist(player,d),hovered:hover&&hover.x===d.x&&hover.y===d.y};}).filter(x=>x.hovered||x.dist<=2).sort((a,b)=>(b.hovered-a.hovered)||a.dist-b.dist);
    const found=candidates[0];if(!found)return;const {b,door}=found,cx=door.x*32+16,base=Math.max(8,(b.y*32)-2),title=b.name,sub=b.subtitle||'Enter';
    ctx.save();ctx.textAlign='center';ctx.font='bold 10px Courier New';const width=Math.max(ctx.measureText(title).width,ctx.measureText(sub).width)+18,x=Math.max(4,Math.min(this.canvas.width-width-4,Math.round(cx-width/2))),y=base;
    ctx.fillStyle='rgba(8,10,12,.94)';ctx.fillRect(x,y,width,31);ctx.strokeStyle=b.accent||'#d3aa55';ctx.strokeRect(x+.5,y+.5,width-1,30);ctx.fillStyle=b.accent||'#f0c66e';ctx.fillText(title,x+width/2,y+12);ctx.font='8px Courier New';ctx.fillStyle='#d4cbb8';ctx.fillText(`${sub} • E to interact`,x+width/2,y+24);ctx.restore();
  }
  render(){
    super.render();
    if(this.game.state?.mode!=='combat'){
      this.drawBuildingTooltip();const occupied=[];
      const visible=this.game.world.entities.filter(e=>!e.hidden&&(e.type==='npc'||e.type==='enemy')).sort((a,b)=>AO.Util.dist(this.game.world.playerPos(),a)-AO.Util.dist(this.game.world.playerPos(),b));
      for(const e of visible)this.drawWorldNameplate(e,occupied);
    }
  }
};
