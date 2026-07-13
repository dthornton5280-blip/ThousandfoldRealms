AO.Renderer = class {
  constructor(game,canvas){this.game=game;this.canvas=canvas;this.ctx=canvas.getContext('2d');this.ctx.imageSmoothingEnabled=false;}
  tile(ctx,x,y,tile,theme){
    if(AO.PixelCrawlerArt?.drawTile(ctx,tile,x,y,theme)) return true;
    if(AO.Assets?.drawTile(ctx,tile,x,y,theme)) return true;
    const s=AO.CONFIG.tile,px=x*s,py=y*s,parity=(x+y)%2,palettes={
      haven:{grass:['#445947','#485e4a'],cobble:['#77746d','#807c74'],roof:['#5f4140','#684744'],tree:['#243a2d','#294232']},
      wilds:{grass:['#344b39','#394f3d'],path:['#71664e','#786d54'],tree:['#23382c','#294130'],water:['#2e5360','#345d6b'],bridge:['#705038','#79573c']},
      interior:{woodfloor:['#73533d','#7b5941'],woodwall:['#3e3027','#46352b'],rug:['#6f4f52','#79575a'],stonewall:['#252a2d','#2c3134']},
      tavern:{woodfloor:['#684935','#704f39'],bar:['#4f3729','#573c2c'],stage:['#5c4032','#634637'],rug:['#6d3f3d','#754542'],stonewall:['#24282a','#2b2f31']},
      cellar:{cellarfloor:['#45413b','#4b4740'],stonewall:['#242526','#292b2c']},
      forge:{stonefloor:['#4b4a47','#51504d'],forgefloor:['#3d3531','#443a35'],rug:['#654a3b','#6d5040'],stonewall:['#292c2d','#303334']},
      arcane:{magicfloor:['#3e3a53','#45405b'],rune:['#4f4966','#574f70'],rug:['#4c4860','#55506a'],stonewall:['#24262f','#2b2d37']},
      chapel:{chapelfloor:['#5b5750','#625e56'],altar:['#6e6758','#766e5e'],rug:['#724e45','#7a554b'],stonewall:['#2b2e2e','#323535']},
      mine:{cavefloor:['#3d4142','#444849'],stonewall:['#1f2324','#25292a']},
      crypt:{cryptfloor:['#3d3b3a','#42403f'],stonewall:['#1f2224','#24282a']}
    },p=palettes[theme]||palettes.interior,pair=p[tile]||p.woodfloor||['#444','#494949'];ctx.fillStyle=pair[parity];ctx.fillRect(px,py,s,s);
    if(['stonewall','tree','roof','woodwall'].includes(tile)){ctx.fillStyle=tile==='tree'?'#36563d':tile==='roof'?'#7a5350':tile==='woodwall'?'#604638':'#555b5e';ctx.fillRect(px,py,s,8);ctx.fillStyle='rgba(0,0,0,.22)';ctx.fillRect(px,py+25,s,7);if(tile==='tree'){ctx.fillStyle='#466d48';ctx.fillRect(px+4,py+2,24,9);ctx.fillStyle='#2c4633';ctx.fillRect(px+10,py+10,12,18);}if(tile==='roof'){ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(px+3,py+4,11,2);ctx.fillRect(px+18,py+13,10,2);}}
    if(tile==='water'){ctx.fillStyle='rgba(182,221,227,.20)';ctx.fillRect(px+4,py+8,16,2);ctx.fillRect(px+14,py+21,13,2);}if(tile==='grass'&&(x*13+y*17)%9===0){ctx.fillStyle='#62735a';ctx.fillRect(px+7,py+20,2,5);ctx.fillRect(px+12,py+18,2,6);}if(['cryptfloor','cavefloor','cellarfloor'].includes(tile)&&(x*7+y*11)%8===0){ctx.fillStyle='#282727';ctx.fillRect(px+8,py+17,12,2);ctx.fillRect(px+17,py+13,2,6);}if(tile==='cobble'){ctx.strokeStyle='rgba(30,31,31,.2)';ctx.strokeRect(px+2,py+3,13,10);ctx.strokeRect(px+16,py+14,13,11);}if(tile==='rune'){ctx.strokeStyle='rgba(132,198,218,.35)';ctx.beginPath();ctx.arc(px+16,py+16,8,0,Math.PI*2);ctx.stroke();}
  }
  questMarker(entity){
    const game=this.game,trackedId=game.state.trackedQuestId,q=trackedId?game.quests.state(trackedId):null,stage=trackedId?game.quests.currentStage(trackedId):null;
    if(entity.type==='npc'){const ready=Object.entries(game.state.quests||{}).some(([id,state])=>state.status==='ready'&&AO.QUESTS[id]?.giver===entity.id);if(ready)return{text:'?',color:'#e8c15e'};if(stage&&['talk','return'].includes(stage.type)&&stage.target===entity.id)return{text:'!',color:'#8fc6df'};const available=Object.keys(AO.QUESTS).some(id=>AO.QUESTS[id].giver===entity.id&&game.quests.canStart(id));if(available)return{text:'!',color:'#e8c15e'};}
    if(q?.status==='active'&&stage){if(entity.type==='enemy'&&stage.type==='kill'&&entity.enemyType===stage.target)return{text:'◆',color:'#d96c63'};if(entity.type==='resource'&&stage.type==='collect'&&entity.resource===stage.target)return{text:'◆',color:'#82bf76'};if(entity.type==='chest'&&stage.type==='collect'&&(entity.loot||[]).includes(stage.target))return{text:'◆',color:'#82bf76'};}return null;
  }
  drawMarker(entity){const m=this.questMarker(entity);if(!m)return;const x=entity.x*32+16,y=entity.y*32-2;this.ctx.save();this.ctx.font='bold 15px Courier New';this.ctx.textAlign='center';this.ctx.lineWidth=3;this.ctx.strokeStyle='#111';this.ctx.strokeText(m.text,x,y);this.ctx.fillStyle=m.color;this.ctx.fillText(m.text,x,y);this.ctx.restore();}
  render(){
    const ctx=this.ctx,w=this.canvas.width,h=this.canvas.height,world=this.game.world;ctx.clearRect(0,0,w,h);if(!world.map)return;
    for(let y=0;y<AO.CONFIG.mapHeight;y++)for(let x=0;x<AO.CONFIG.mapWidth;x++)this.tile(ctx,x,y,world.grid[y][x],world.map.theme);
    if(this.renderTerrainEffects)this.renderTerrainEffects(ctx,'under');
    if(world.path.length){ctx.fillStyle='rgba(126,180,207,.23)';for(const p of world.path)ctx.fillRect(p.x*32+4,p.y*32+4,24,24);}
    for(const e of world.entities.filter(e=>!e.hidden&&e.type==='portal'))AO.SpriteFactory.icon(ctx,e.x*32,e.y*32,'portal',e);
    const p=this.game.state.player,r=AO.RACES[p.raceId],c=AO.CLASSES[p.classId],moving=performance.now()<world.movingUntil,animFrame=Math.floor(performance.now()/95)%4;
    const drawables=world.entities.filter(e=>!e.hidden&&e.type!=='portal').map(e=>({...e,_player:false}));
    drawables.push({id:'__player',type:'player',x:this.game.state.world.x,y:this.game.state.world.y,_player:true});
    drawables.sort((a,b)=>(a.y-b.y)||((a._player?2:a.type==='npc'||a.type==='enemy'?1:0)-(b._player?2:b.type==='npc'||b.type==='enemy'?1:0)));
    for(const e of drawables){
      if(!e._player&&AO.PixelCrawlerArt?.drawEntity(ctx,e,world.map.id,performance.now()))continue;
      if(e._player)AO.SpriteFactory.character(ctx,e.x*32,e.y*32,AO.Util.visualFor(r.visual,p.appearance),c.visual,1,{selected:true,player:p,moving,animFrame,facing:world.facing});
      else if(['decor','door','camp','chest','resource','sign'].includes(e.type)&&!(e.type==='door'&&e.integratedBuildingDoor))AO.SpriteFactory.icon(ctx,e.x*32,e.y*32,e.type,e);
      else if(e.type==='npc')AO.SpriteFactory.npc(ctx,e.x*32,e.y*32,e.visual,1,{idleFrame:Math.floor(performance.now()/520+e.x+e.y)%2});
      else if(e.type==='enemy')AO.SpriteFactory.enemy(ctx,e.x*32,e.y*32,e.visual,1);
    }
    for(const e of world.entities.filter(e=>!e.hidden))this.drawMarker(e);
    if(this.renderTerrainEffects)this.renderTerrainEffects(ctx,'over');
    const grad=ctx.createRadialGradient(w/2,h/2,190,w/2,h/2,630);grad.addColorStop(0,'rgba(0,0,0,0)');grad.addColorStop(1,world.map.theme==='interior'?'rgba(0,0,0,.2)':'rgba(0,0,0,.3)');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
  }
};
