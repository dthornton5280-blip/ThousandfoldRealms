/* Thousandfold Realms v1.4.2 — remove legacy building tiles, deepen façades/interiors, and animate ambient residents. */
const ImmersiveRendererBase=AO.Renderer;
AO.Renderer=class extends ImmersiveRendererBase{
  buildingAtTile(x,y){return (this.game.world.map?.buildings||[]).find(b=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h);}
  tile(ctx,x,y,tile,theme){
    /* Keep roof tiles as collision data, but never render the obsolete block building
       underneath the authored storefront atlas. */
    if(theme==='haven'&&tile==='roof'&&this.buildingAtTile(x,y))return super.tile(ctx,x,y,'grass',theme);
    return super.tile(ctx,x,y,tile,theme);
  }
  renderTerrainEffects(ctx,layer){
    if(layer==='under')this.renderBuildingCastShadows(ctx);
    super.renderTerrainEffects?.(ctx,layer);
    if(layer==='under'){this.renderBuildingDepth(ctx);this.renderInteriorDepth(ctx);}
  }
  renderBuildingCastShadows(ctx){
    const buildings=this.game.world.map?.buildings||[];if(!buildings.length)return;ctx.save();
    for(const b of buildings){const x=b.x*32,y=b.y*32,w=b.w*32,h=b.h*32,d=b.visualDepth||8;ctx.fillStyle='rgba(0,0,0,.34)';ctx.beginPath();ctx.moveTo(x+14,y+h-3);ctx.lineTo(x+w+d,y+h-3);ctx.lineTo(x+w+d,y+h+d);ctx.lineTo(x+22,y+h+d);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.moveTo(x+w-3,y+18);ctx.lineTo(x+w+d,y+26);ctx.lineTo(x+w+d,y+h+d);ctx.lineTo(x+w-3,y+h-3);ctx.closePath();ctx.fill();}
    ctx.restore();
  }
  renderBuildingDepth(ctx){
    const buildings=this.game.world.map?.buildings||[];if(!buildings.length)return;const hover=this.game.world.hoveredTile;ctx.save();
    for(const b of buildings){const x=b.x*32,y=b.y*32,w=b.w*32,h=b.h*32,d=b.visualDepth||8,door=this.game.world.entities.find(e=>e.id===b.doorId),active=door&&hover&&this.game.world.containsPoint?.(door,hover.x,hover.y);
      /* A right wall, foundation lip, roof ridge and corner posts give the atlas a
         shallow isometric extrusion without replacing its authored pixels. */
      ctx.fillStyle='rgba(25,18,18,.42)';ctx.beginPath();ctx.moveTo(x+w-7,y+39);ctx.lineTo(x+w+d-1,y+47);ctx.lineTo(x+w+d-1,y+h-4);ctx.lineTo(x+w-7,y+h-4);ctx.closePath();ctx.fill();
      ctx.fillStyle='rgba(61,42,31,.72)';ctx.fillRect(x+7,y+h-9,w-7,7);ctx.fillStyle='rgba(215,174,99,.28)';ctx.fillRect(x+10,y+h-9,w-18,2);
      ctx.fillStyle='rgba(255,244,205,.12)';ctx.fillRect(x+28,y+11,w-58,2);ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(x+20,y+36,w-40,4);
      ctx.fillStyle='rgba(48,31,24,.72)';ctx.fillRect(x+10,y+71,5,h-83);ctx.fillRect(x+w-15,y+71,5,h-83);
      if(active){const f=b.doorFrame||{x:3.48,y:3.17,w:1.08,h:1.75},fx=(b.x+f.x)*32,fy=(b.y+f.y)*32,fw=f.w*32,fh=f.h*32;ctx.strokeStyle='rgba(247,207,105,.92)';ctx.lineWidth=2;ctx.setLineDash([5,3]);ctx.strokeRect(fx-7,fy-5,fw+14,fh+9);ctx.setLineDash([]);}
      /* Small exterior props keep each frontage grounded in the square. */
      if(b.style==='inn'||b.style==='provisions'){ctx.fillStyle='#4c3827';ctx.fillRect(x+18,y+h-18,13,10);ctx.fillStyle='#7c5b38';ctx.fillRect(x+20,y+h-16,9,7);}
      if(b.style==='forge'){ctx.fillStyle='rgba(226,91,42,.55)';ctx.fillRect(x+w-34,y+h-19,10,5);ctx.fillStyle='rgba(255,194,77,.8)';ctx.fillRect(x+w-31,y+h-23,3,6);}
    }
    ctx.restore();
  }
  renderInteriorDepth(ctx){
    const theme=this.game.world.map?.theme;if(!['interior','tavern','forge','arcane','chapel'].includes(theme))return;const grid=this.game.world.grid,s=32;ctx.save();
    const wall=new Set(['stonewall','woodwall','bar']);
    for(let y=0;y<AO.CONFIG.mapHeight;y++)for(let x=0;x<AO.CONFIG.mapWidth;x++)if(wall.has(grid[y]?.[x])){
      const px=x*s,py=y*s,below=grid[y+1]?.[x],right=grid[y]?.[x+1];
      ctx.fillStyle='rgba(255,235,193,.07)';ctx.fillRect(px+2,py+2,s-4,2);
      if(!wall.has(below)){ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(px+3,py+s-1,s-2,7);}
      if(!wall.has(right)){ctx.fillStyle='rgba(0,0,0,.24)';ctx.fillRect(px+s-2,py+5,6,s-5);}
    }
    /* Warm localized light pools make furnished rooms feel occupied. */
    const lamps=this.game.world.entities.filter(e=>e.type==='decor'&&['lamp','brazier','fireplace','forge','orb','crystal'].includes(e.kind));
    for(const e of lamps){const cx=e.x*s+16,cy=e.y*s+16,g=ctx.createRadialGradient(cx,cy,5,cx,cy,e.kind==='fireplace'||e.kind==='forge'?95:62);g.addColorStop(0,e.kind==='orb'||e.kind==='crystal'?'rgba(114,198,226,.18)':'rgba(255,195,91,.16)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(cx-100,cy-100,200,200);}
    ctx.restore();
  }
  entityHovered(entity){const h=this.game.world.hoveredTile;return !!h&&!!this.game.world.containsPoint?.(entity,h.x,h.y);}
  drawBuildingTooltip(){
    if(!AO.UI_LABELS?.buildingTooltips||this.game.state.mode==='combat'||document.body.classList.contains('rpg-menu-open'))return;const ctx=this.ctx,player=this.game.world.playerPos(),hover=this.game.world.hoveredTile,buildings=this.game.world.map?.buildings||[];
    const candidates=buildings.map(b=>{const door=this.game.world.entities.find(e=>e.id===b.doorId),d=door||{x:b.x+4,y:b.y+4};return{b,door:d,dist:AO.Util.dist(player,d),hovered:door&&hover&&this.game.world.containsPoint?.(door,hover.x,hover.y)};}).filter(x=>x.hovered||x.dist<=2).sort((a,b)=>(Number(b.hovered)-Number(a.hovered))||a.dist-b.dist);
    const found=candidates[0];if(!found)return;const {b,door}=found,cx=door.x*32+16,base=Math.max(8,b.y*32-2),title=b.name,sub=b.subtitle||'Enter';ctx.save();ctx.textAlign='center';ctx.font='bold 10px Courier New';const width=Math.max(ctx.measureText(title).width,ctx.measureText(sub).width)+18,x=Math.max(4,Math.min(this.canvas.width-width-4,Math.round(cx-width/2))),y=base;ctx.fillStyle='rgba(8,10,12,.95)';ctx.fillRect(x,y,width,32);ctx.strokeStyle=b.accent||'#d3aa55';ctx.strokeRect(x+.5,y+.5,width-1,31);ctx.fillStyle=b.accent||'#f0c66e';ctx.fillText(title,x+width/2,y+12);ctx.font='8px Courier New';ctx.fillStyle='#d4cbb8';ctx.fillText(`${sub} • Click doorway or press E`,x+width/2,y+25);ctx.restore();
  }
  drawAmbientActivity(e){
    const ctx=this.ctx,x=e.x*32,y=e.y*32,t=performance.now(),phase=Math.floor(t/220)%2;ctx.save();ctx.lineWidth=2;
    if(e.activity==='sweep'){ctx.strokeStyle='#9a744c';ctx.beginPath();ctx.moveTo(x+24,y+14);ctx.lineTo(x+29,y+30);ctx.stroke();ctx.fillStyle='#c5a06a';ctx.fillRect(x+24+phase*2,y+28,8,2);}
    else if(e.activity==='hammer'){ctx.strokeStyle='#aaa7a0';ctx.beginPath();ctx.moveTo(x+25,y+8);ctx.lineTo(x+20+phase*3,y+17);ctx.stroke();ctx.fillStyle='#d8d4ca';ctx.fillRect(x+22+phase*2,y+6,7,4);if(phase){ctx.fillStyle='#f0a94d';ctx.fillRect(x+7,y+22,2,2);ctx.fillRect(x+11,y+18,2,2);ctx.fillRect(x+15,y+24,2,2);}}
    else if(e.activity==='mug'){ctx.fillStyle='#9b7047';ctx.fillRect(x+23,y+13-phase*2,6,7);ctx.fillStyle='#d8c48d';ctx.fillRect(x+24,y+14-phase*2,4,2);}
    else if(e.activity==='read'){ctx.fillStyle='#d2c08a';ctx.fillRect(x+4,y+18,9,6);ctx.fillRect(x+13,y+18,9,6);ctx.fillStyle='#6f4a3a';ctx.fillRect(x+12,y+18,2,6);}
    else if(e.activity==='music'){ctx.fillStyle='#d5ba68';ctx.font='bold 12px serif';ctx.fillText(phase?'♪':'♫',x+25,y+5);}
    else if(e.activity==='pray'){ctx.fillStyle='rgba(245,214,121,.75)';ctx.fillRect(x+15,y-3,2,6);ctx.fillRect(x+13,y-1,6,2);}
    else if(e.activity==='browse'){ctx.fillStyle='#cab36d';ctx.fillRect(x+4,y+17,7,8);ctx.fillStyle='#8d6f48';ctx.fillRect(x+5,y+18,5,6);}
    else if(e.activity==='parcel'){ctx.fillStyle='#8d633e';ctx.fillRect(x+22,y+18,8,7);ctx.strokeStyle='#d1b168';ctx.strokeRect(x+22.5,y+18.5,7,6);}
    else if(e.activity==='linen'){ctx.fillStyle='#d8d2bd';ctx.fillRect(x+22,y+17,8,6);ctx.fillStyle='#8a9c96';ctx.fillRect(x+22,y+20,8,3);}
    ctx.restore();
  }
  render(){super.render();if(this.game.state?.mode!=='combat')for(const e of this.game.world.entities.filter(x=>x.ambient&&!x.hidden))this.drawAmbientActivity(e);}
};
