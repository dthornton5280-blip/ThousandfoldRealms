/* Thousandfold Realms v1.1 visual pass: equipment layers, richer terrain, water edges, atmosphere. */
const BaseCharacterDraw = AO.SpriteFactory.character.bind(AO.SpriteFactory);
AO.SpriteFactory.character = function(ctx,x,y,raceVisual,classVisual,scale=1,options={}){
  const p=options.player||window.game?.state?.player,r=raceVisual||{},S=scale,moving=!!options.moving,frame=options.animFrame||0;
  const bob=moving&&frame%2===1?-1:(!moving&&Math.floor(performance.now()/650)%2===1?0:-0);
  y+=bob;
  /* cloak is behind the body and follows racial scale */
  if(p?.equipment?.cloak){
    const rarity=AO.ITEMS[p.equipment.cloak]?.rarity||'common',colors={common:'#51493f',uncommon:'#496451',rare:'#465f7b',epic:'#655080',legendary:'#a66f38'},col=colors[rarity]||colors.common;
    this.withCharacterTransform(ctx,x,y,r,S,()=>{this.rect(ctx,5,9,24,18,'#17191b');this.rect(ctx,6,10,22,16,col);this.rect(ctx,8,11,3,13,this.tone(col,22));});
  }
  BaseCharacterDraw(ctx,x,y,r,classVisual,scale,options);
  if(!p)return;
  this.withCharacterTransform(ctx,x,y,r,S,()=>{
    const R=(xx,yy,w,h,c)=>this.rect(ctx,xx,yy,w,h,c),rarityColor=id=>{const rr=AO.ITEMS[id]?.rarity||'common';return({common:'#77736b',uncommon:'#647762',rare:'#647b91',epic:'#806a92',legendary:'#c2904e'})[rr]||'#77736b';};
    if(p.equipment?.head){const col=rarityColor(p.equipment.head);R(9,0,16,6,'#17191b');R(10,1,14,4,col);R(9,4,3,5,col);R(22,4,3,5,col);R(13,1,8,1,this.tone(col,35));}
    if(p.equipment?.offhand&&AO.ITEMS[p.equipment.offhand]?.ac){R(0,10,10,15,'#17191b');R(1,11,8,13,'#6f6757');R(3,13,4,9,'#a58d58');R(4,15,2,5,'#d4bd75');}
    if(p.equipment?.belt){R(7,18,20,4,'#17191b');R(8,19,18,2,'#8d6841');R(15,18,4,4,'#c8a05c');}
    if(p.equipment?.amulet){R(16,12,2,5,'#d3b45e');R(15,16,4,3,rarityColor(p.equipment.amulet));}
    if(p.equipment?.ring1||p.equipment?.ring2){R(28,20,2,2,'#e5c66b');}
  });
  if(moving&&frame%2===1){ctx.save();ctx.fillStyle='rgba(198,176,128,.32)';ctx.fillRect(x+8,y+28,5,2);ctx.fillRect(x+21,y+29,4,1);ctx.restore();}
};

const BaseRenderer = AO.Renderer;
AO.Renderer = class extends BaseRenderer {
  tile(ctx,x,y,tile,theme){
    super.tile(ctx,x,y,tile,theme);
    const s=AO.CONFIG.tile,px=x*s,py=y*s,hash=(x*31+y*17)%37,grid=this.game.world.grid,at=(xx,yy)=>grid?.[yy]?.[xx];
    /* terrain micro-detail */
    if(tile==='grass'){
      if(hash%5===0){ctx.fillStyle='#73805e';ctx.fillRect(px+6+(hash%15),py+19,2,6);ctx.fillRect(px+4+(hash%15),py+22,5,2);}
      if(hash%11===0){ctx.fillStyle=['#d58a91','#d6c96a','#8eb9d0'][hash%3];ctx.fillRect(px+22,py+10,3,3);ctx.fillStyle='#43613f';ctx.fillRect(px+23,py+13,1,5);}
      if(hash%13===0){ctx.fillStyle='rgba(30,43,31,.35)';ctx.fillRect(px+5,py+26,10,2);ctx.fillRect(px+8,py+23,2,4);}
    }
    if(tile==='path'){
      ctx.fillStyle='rgba(45,39,29,.20)';ctx.fillRect(px+3+(hash%8),py+5,7,2);ctx.fillRect(px+19,py+19+(hash%5),6,2);
      if(at(x-1,y)==='grass'){ctx.fillStyle='#4b5f43';ctx.fillRect(px,py,3,s);}if(at(x+1,y)==='grass'){ctx.fillStyle='#4b5f43';ctx.fillRect(px+s-3,py,3,s);}
    }
    if(tile==='cobble'||tile==='stonefloor'||tile==='chapelfloor'){
      ctx.strokeStyle='rgba(22,23,23,.22)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(px+2,py+16);ctx.lineTo(px+14,py+16);ctx.lineTo(px+18,py+9);ctx.lineTo(px+30,py+9);ctx.stroke();
      ctx.fillStyle='rgba(235,218,180,.07)';ctx.fillRect(px+4,py+4,8,1);ctx.fillRect(px+19,py+20,7,1);
      if(hash%9===0){ctx.fillStyle='#64715c';ctx.fillRect(px+25,py+5,2,4);ctx.fillRect(px+23,py+7,6,2);}
    }
    if(tile==='water'){
      const t=Math.floor(performance.now()/220),phase=(hash+t)%4;ctx.fillStyle='rgba(196,236,244,.24)';ctx.fillRect(px+3+phase*3,py+7,12,2);ctx.fillRect(px+16-phase*2,py+22,11,2);
      const neighbors=[[0,-1],[1,0],[0,1],[-1,0]];for(const [dx,dy] of neighbors){if(at(x+dx,y+dy)!=='water'){
        ctx.fillStyle='rgba(216,244,239,.34)';if(dy<0)ctx.fillRect(px,py,s,3);if(dy>0)ctx.fillRect(px,py+s-3,s,3);if(dx<0)ctx.fillRect(px,py,3,s);if(dx>0)ctx.fillRect(px+s-3,py,3,s);
      }}
      if(hash%7===0){ctx.fillStyle='#557d54';ctx.fillRect(px+18,py+13,8,4);ctx.fillStyle='#a9cf8c';ctx.fillRect(px+20,py+13,3,2);}
    }
    if(tile==='bridge'){
      ctx.fillStyle='rgba(40,27,18,.42)';for(let yy=4;yy<32;yy+=7)ctx.fillRect(px+2,py+yy,28,2);ctx.fillStyle='#9b7045';ctx.fillRect(px+3,py+2,3,28);ctx.fillRect(px+26,py+2,3,28);
    }
    if(tile==='tree'){
      ctx.fillStyle='#1d3025';ctx.fillRect(px+3,py+2,11,10);ctx.fillRect(px+16,py+1,13,11);ctx.fillStyle='#3f6743';ctx.fillRect(px+5,py+3,8,7);ctx.fillRect(px+18,py+2,9,8);ctx.fillStyle='#547a4c';ctx.fillRect(px+9,py+5,3,2);ctx.fillRect(px+22,py+4,3,2);
      if(hash%4===0){ctx.fillStyle='#8b5165';ctx.fillRect(px+6,py+8,2,2);ctx.fillRect(px+25,py+6,2,2);}
    }
    if(['stonewall','woodwall'].includes(tile)){
      ctx.strokeStyle='rgba(10,10,10,.28)';ctx.strokeRect(px+2,py+9,13,8);ctx.strokeRect(px+16,py+17,14,8);ctx.fillStyle='rgba(240,225,190,.08)';ctx.fillRect(px+4,py+11,8,1);
      if(hash%8===0){ctx.fillStyle='#3e5b3e';ctx.fillRect(px+2,py+3,3,13);ctx.fillRect(px+5,py+5,4,2);}
    }
    if(tile==='roof'){
      for(let yy=4;yy<28;yy+=7){ctx.fillStyle='rgba(23,22,25,.25)';ctx.fillRect(px,py+yy,s,2);ctx.fillStyle='rgba(205,142,115,.08)';ctx.fillRect(px+4,py+yy-2,12,1);}
    }
    if(['cavefloor','cryptfloor','cellarfloor'].includes(tile)){
      if(hash%6===0){ctx.fillStyle='#606365';ctx.fillRect(px+5,py+5,5,3);ctx.fillStyle='#26292a';ctx.fillRect(px+7,py+8,6,2);}
      if(theme==='mine'&&hash%15===0){ctx.fillStyle='#65aab5';ctx.fillRect(px+23,py+9,3,7);ctx.fillStyle='#a4e0e5';ctx.fillRect(px+24,py+10,1,4);}
    }
  }
  renderTerrainEffects(ctx,layer){
    const world=this.game.world,grid=world.grid,s=AO.CONFIG.tile,t=performance.now(),theme=world.map?.theme;
    if(layer==='under'){
      for(let y=0;y<AO.CONFIG.mapHeight;y++)for(let x=0;x<AO.CONFIG.mapWidth;x++){
        const tile=grid[y][x],px=x*s,py=y*s,below=grid[y+1]?.[x];
        if(tile==='roof'&&below!=='roof'){ctx.fillStyle='rgba(10,12,15,.30)';ctx.fillRect(px+2,py+s-2,s-2,7);}
        if(tile==='cliff_face'){const grad=ctx.createLinearGradient(px,py,px,py+s);grad.addColorStop(0,'rgba(20,17,14,.06)');grad.addColorStop(1,'rgba(20,17,14,.34)');ctx.fillStyle=grad;ctx.fillRect(px,py,s,s);}
        if(tile==='tree'&&below!=='tree'){ctx.fillStyle='rgba(8,16,10,.23)';ctx.fillRect(px+6,py+27,23,6);}
      }
      return;
    }
    ctx.save();ctx.imageSmoothingEnabled=false;
    for(let y=0;y<AO.CONFIG.mapHeight;y++)for(let x=0;x<AO.CONFIG.mapWidth;x++){
      const tile=grid[y][x],px=x*s,py=y*s,phase=Math.floor(t/140+x*3+y*5);
      if(tile==='waterfall'){
        ctx.fillStyle='rgba(224,248,247,.42)';for(let i=0;i<4;i++){const mx=px+((phase*7+i*11)%31),my=py+24+((phase+i*3)%8);ctx.fillRect(mx,my,3+(i%2),2);}
        ctx.fillStyle='rgba(174,225,230,.22)';ctx.fillRect(px-4,py+27,40,8);
      }
      if(tile==='waterfall_pool'||tile==='water'||tile==='lilywater'){
        if((x*17+y*11)%9===0){const fx=px+4+((phase*2)%18),fy=py+9+((x+y)%12);ctx.fillStyle='rgba(218,246,244,.38)';ctx.fillRect(fx,fy,5,1);}
      }
      if(tile==='tree'&&!this.game.state.settings?.reducedMotion){const sway=Math.round(Math.sin(t/430+x*1.7+y)*1.5);ctx.fillStyle='rgba(132,174,103,.38)';ctx.fillRect(px+9+sway,py+5,4,2);ctx.fillRect(px+21-sway,py+11,3,2);}
      if(tile==='flower_patch'&&!this.game.state.settings?.reducedMotion){const sway=Math.round(Math.sin(t/350+x+y)*1);ctx.fillStyle='rgba(255,227,166,.45)';ctx.fillRect(px+14+sway,py+9,2,2);}
    }
    if(['wilds','haven'].includes(theme)&&!this.game.state.settings?.reducedMotion){
      for(let i=0;i<7;i++){const bx=(i*137+t/18*(i%2?1:-1)+960)%960,by=70+((i*83+Math.sin(t/650+i)*38)%430);ctx.fillStyle=i%3===0?'#e9c76b':'#adcfe0';ctx.fillRect(Math.round(bx),Math.round(by),2,2);ctx.fillRect(Math.round(bx)+(i%2?2:-2),Math.round(by)+1,1,1);}
    }
    if(theme==='wilds'&&!this.game.state.settings?.reducedMotion){
      const birdX=(t/32)%1080-80,birdY=42+Math.sin(t/900)*16;ctx.fillStyle='rgba(24,31,29,.55)';ctx.fillRect(birdX,birdY,3,1);ctx.fillRect(birdX-2,birdY-1,2,1);ctx.fillRect(birdX+3,birdY-1,2,1);
    }
    ctx.restore();
  }
  render(){
    super.render();const ctx=this.ctx,g=this.game.state;if(!g||!this.game.world.map)return;
    for(const e of this.game.world.entities.filter(e=>!e.hidden&&e.type==='discovery')){const x=e.x*32+16,y=e.y*32+16;ctx.save();ctx.font='bold 18px Courier New';ctx.textAlign='center';ctx.strokeStyle='#111';ctx.lineWidth=3;ctx.strokeText('✦',x,y+5);ctx.fillStyle=g.world.discoveries?.[e.id]?'#8a8f91':'#f0c66e';ctx.fillText('✦',x,y+5);ctx.restore();}
    const near=this.game.world.entities.find(e=>!e.hidden&&AO.Util.dist(this.game.world.playerPos(),e)<=1&&e.type!=='portal');if(near){ctx.strokeStyle='#f0c66e';ctx.lineWidth=2;ctx.strokeRect(near.x*32+2,near.y*32+2,28,28);}
    const time=g.world.time??8,night=time<6?Math.min(.48,(6-time)*.08):time>18?Math.min(.5,(time-18)*.07):0;if(night){ctx.fillStyle=`rgba(16,25,48,${night})`;ctx.fillRect(0,0,this.canvas.width,this.canvas.height);for(const e of this.game.world.entities.filter(e=>!e.hidden&&(e.kind==='lamp'||e.kind==='brazier'||e.kind==='fireplace'||e.type==='camp'))){const cx=e.x*32+16,cy=e.y*32+16,grad=ctx.createRadialGradient(cx,cy,3,cx,cy,76);grad.addColorStop(0,'rgba(255,218,125,.38)');grad.addColorStop(.45,'rgba(255,190,75,.15)');grad.addColorStop(1,'rgba(255,180,60,0)');ctx.fillStyle=grad;ctx.fillRect(cx-76,cy-76,152,152);}}
    const weather=g.world.weather||'clear',def=AO.WEATHER[weather]||AO.WEATHER.clear;if(def.tint){ctx.fillStyle=def.tint;ctx.fillRect(0,0,this.canvas.width,this.canvas.height);}if(!g.settings?.reducedMotion){const t=performance.now()/20;if(weather==='rain'){ctx.strokeStyle='rgba(165,205,225,.36)';ctx.lineWidth=1;for(let i=0;i<45;i++){const x=(i*79+t*2)%this.canvas.width,y=(i*47+t*4)%this.canvas.height;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-5,y+12);ctx.stroke();}}else if(weather==='emberfall'){ctx.fillStyle='rgba(245,105,48,.55)';for(let i=0;i<30;i++){const x=(i*113+t)%this.canvas.width,y=(i*61+t*.5)%this.canvas.height;ctx.fillRect(x,y,2,2);}}else if(weather==='fog'){ctx.fillStyle='rgba(210,220,215,.06)';for(let i=0;i<6;i++)ctx.fillRect(((i*190+t)%1100)-120,i*88,260,38);}}
  }
};
