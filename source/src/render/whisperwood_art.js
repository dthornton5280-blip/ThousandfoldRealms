/* Thousandfold Realms v1.6.4-dev — project-owned Whisperwood terrain and wilderness-object renderer. */
(() => {
  'use strict';
  if(!window.AO||!AO.ThousandfoldArt)return;

  const T=32;
  const C={
    ink:'#101715',deep:'#17241d',forest0:'#1d3025',forest1:'#294333',forest2:'#365640',forest3:'#4f7050',leaf:'#6e8958',
    moss0:'#42553c',moss1:'#617255',grass0:'#314838',grass1:'#3a533f',grass2:'#50664b',fern:'#78906a',
    dirt0:'#4b3d2e',dirt1:'#66513a',dirt2:'#82674a',stone0:'#313c39',stone1:'#4b5852',stone2:'#6c766b',stone3:'#909482',
    water0:'#173a43',water1:'#22515c',water2:'#347080',water3:'#6c9aa0',wood0:'#38281f',wood1:'#51392a',wood2:'#745039',wood3:'#997051',
    gold0:'#80632f',gold1:'#c39a4a',gold2:'#efd17b',amber:'#e79a43',flame:'#ffe09a',violet:'#9d78ad',moon:'#b8d5c2',
    red:'#8f4c43',cloth:'#697452',shadow:'rgba(7,12,10,.38)'
  };
  const hash=(x,y=0,s=0)=>{let n=Math.imul((x|0)+s*1013,374761393)+Math.imul((y|0)+s*733,668265263);n=(n^(n>>>13))*1274126177;return(n^(n>>>16))>>>0;};
  const rect=(ctx,x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
  const px=(ctx,x,y,color)=>rect(ctx,x,y,2,2,color);
  const line=(ctx,x1,y1,x2,y2,color,width=1)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(Math.round(x1)+.5,Math.round(y1)+.5);ctx.lineTo(Math.round(x2)+.5,Math.round(y2)+.5);ctx.stroke();};
  const poly=(ctx,points,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();ctx.fill();};
  const withPixels=(ctx,fn)=>{ctx.save();ctx.imageSmoothingEnabled=false;fn();ctx.restore();};

  function ground(ctx,x,y,variant=0){
    rect(ctx,x,y,T,T,variant%2?C.grass1:C.grass0);
    rect(ctx,x,y+25,T,7,'rgba(13,24,18,.12)');
    for(let i=0;i<5;i++){
      const h=hash(x/T,y/T,i+variant),xx=x+3+(h%27),yy=y+5+((h>>>6)%23);
      rect(ctx,xx,yy,1,3+(h%3),i%3===0?C.grass2:C.moss0);
      if(i===1||i===4)px(ctx,xx+2,yy-1,i===1?'#879b69':'#536b50');
    }
    if(variant===2){rect(ctx,x+3,y+3,9,4,'rgba(24,41,30,.22)');rect(ctx,x+21,y+20,7,3,'rgba(24,41,30,.18)');}
  }
  function path(ctx,x,y,variant=0){
    rect(ctx,x,y,T,T,variant%2?C.dirt1:C.dirt0);
    rect(ctx,x,y,3,T,'rgba(25,35,26,.17)');rect(ctx,x+29,y,3,T,'rgba(25,35,26,.17)');
    for(let i=0;i<6;i++){const h=hash(x/T,y/T,i);const xx=x+4+h%24,yy=y+3+(h>>>5)%26;rect(ctx,xx,yy,3+(h%4),2,(i%3)?C.dirt2:C.stone1);}
    line(ctx,x+5,y+8,x+27,y+10,'rgba(41,29,20,.24)',1);line(ctx,x+3,y+25,x+23,y+23,'rgba(41,29,20,.18)',1);
  }
  function water(ctx,x,y,shallow=false){
    rect(ctx,x,y,T,T,shallow?C.water1:C.water0);
    rect(ctx,x,y+26,T,6,'rgba(4,19,23,.24)');
    const offset=(hash(x/T,y/T)%9);
    rect(ctx,x+3+offset,y+7,13,2,shallow?C.water3:C.water2);rect(ctx,x+14-offset/2,y+20,14,2,'rgba(107,159,166,.45)');
    if(shallow){for(let i=0;i<4;i++)rect(ctx,x+4+i*7,y+27-(i%2)*3,2,5,C.moss1);}
  }
  function bridge(ctx,x,y){
    rect(ctx,x,y,T,T,C.water0);rect(ctx,x,y+6,T,22,C.wood0);
    for(let yy=y+7;yy<y+28;yy+=5){rect(ctx,x+1,yy,T-2,4,(yy/5)%2?C.wood2:C.wood1);line(ctx,x+2,yy+3,x+29,yy+3,'rgba(25,15,11,.45)');}
    rect(ctx,x+3,y+4,3,26,C.wood3);rect(ctx,x+26,y+4,3,26,C.wood3);
    px(ctx,x+4,y+10,C.gold0);px(ctx,x+27,y+21,C.gold0);
  }
  function tree(ctx,x,y,variant=0){
    ground(ctx,x,y,variant%3);
    rect(ctx,x+13,y+17,7,15,C.wood0);rect(ctx,x+15,y+14,4,17,C.wood2);rect(ctx,x+5,y+27,22,4,C.shadow);
    const shift=variant%3===1?-3:variant%3===2?3:0;
    rect(ctx,x+3+shift,y-7,26,24,C.forest0);rect(ctx,x-2+shift,y+1,22,20,C.forest1);rect(ctx,x+13+shift,y-12,19,25,C.forest2);
    rect(ctx,x+4+shift,y-2,12,8,C.forest3);rect(ctx,x+16+shift,y-7,9,7,C.leaf);
    px(ctx,x+8+shift,y+8,'#789064');px(ctx,x+24+shift,y+2,'#57714e');
  }
  function shrub(ctx,x,y,variant=0){
    ground(ctx,x,y,variant);rect(ctx,x+3,y+18,26,11,C.shadow);rect(ctx,x+2,y+11,17,17,C.forest0);rect(ctx,x+12,y+7,17,20,C.forest1);rect(ctx,x+6,y+5,14,18,C.forest2);rect(ctx,x+10,y+9,8,5,C.forest3);px(ctx,x+23,y+12,'#788d67');
  }
  function rocks(ctx,x,y){
    ground(ctx,x,y,2);rect(ctx,x+4,y+25,24,4,C.shadow);poly(ctx,[[x+3,y+25],[x+8,y+12],[x+18,y+8],[x+29,y+25]],C.stone0);poly(ctx,[[x+7,y+22],[x+11,y+13],[x+18,y+11],[x+24,y+22]],C.stone2);line(ctx,x+12,y+13,x+18,y+11,C.stone3,2);rect(ctx,x+7,y+22,11,3,C.moss0);
  }
  function flowers(ctx,x,y){ground(ctx,x,y,0);for(let i=0;i<6;i++){const xx=x+4+i*5,yy=y+13+(i%2)*5;rect(ctx,xx,yy,1,10,C.moss1);px(ctx,xx-1,yy-2,[C.violet,C.gold2,'#cc8f9b'][i%3]);}}
  function reeds(ctx,x,y){water(ctx,x,y,true);for(let i=0;i<7;i++){const xx=x+3+i*4;line(ctx,xx,y+29,xx+(i%2),y+8+(i%3)*3,C.moss1,2);px(ctx,xx-1,y+8+(i%3)*3,C.dirt2);}}
  function lily(ctx,x,y){water(ctx,x,y,false);for(let i=0;i<3;i++){const h=hash(x/T,y/T,i),xx=x+4+h%21,yy=y+7+(h>>>6)%17;rect(ctx,xx,yy,8,5,C.moss1);px(ctx,xx+3,yy-2,i===1?'#e0a9bc':C.gold2);}}
  function cliff(ctx,x,y){rect(ctx,x,y,T,T,C.stone0);rect(ctx,x,y,32,6,C.moss0);for(let i=0;i<4;i++){const xx=x+2+i*8;poly(ctx,[[xx,y+6],[xx+7,y+6],[xx+5,y+31],[xx+1,y+31]],i%2?C.stone1:C.stone2);line(ctx,xx+2,y+11,xx+6,y+11,C.stone3);}}
  function waterfall(ctx,x,y,pool=false){if(pool){water(ctx,x,y,false);rect(ctx,x+4,y+4,24,5,'rgba(168,211,216,.44)');for(let i=0;i<5;i++)px(ctx,x+5+i*5,y+10+(i%2)*2,'#8fb5ba');return;}rect(ctx,x,y,T,T,C.stone0);rect(ctx,x+8,y,16,T,C.water2);rect(ctx,x+11,y,4,T,'rgba(172,218,222,.55)');rect(ctx,x+19,y,2,T,'rgba(221,240,234,.40)');}
  function stairs(ctx,x,y){cliff(ctx,x,y);for(let i=0;i<6;i++){rect(ctx,x+5+i,y+4+i*5,22-i*2,4,C.stone2);line(ctx,x+6+i,y+7+i*5,x+25-i,y+7+i*5,C.stone0);}}

  const wildTiles=new Set(['grass','path','bridge','water','shallow_water','waterfall','waterfall_pool','tree','shrub','rocks','flower_patch','reeds','lilywater','cliff_face','stairs','moss_stone']);
  function drawWildTile(ctx,tile,x,y){
    if(!wildTiles.has(tile))return false;const dx=x*T,dy=y*T,v=hash(x,y)%3;
    withPixels(ctx,()=>{
      if(tile==='grass')ground(ctx,dx,dy,v);
      else if(tile==='path')path(ctx,dx,dy,v);
      else if(tile==='bridge')bridge(ctx,dx,dy);
      else if(tile==='water')water(ctx,dx,dy,false);
      else if(tile==='shallow_water')water(ctx,dx,dy,true);
      else if(tile==='waterfall')waterfall(ctx,dx,dy,false);
      else if(tile==='waterfall_pool')waterfall(ctx,dx,dy,true);
      else if(tile==='tree')tree(ctx,dx,dy,v);
      else if(tile==='shrub')shrub(ctx,dx,dy,v);
      else if(tile==='rocks'||tile==='moss_stone')rocks(ctx,dx,dy);
      else if(tile==='flower_patch')flowers(ctx,dx,dy);
      else if(tile==='reeds')reeds(ctx,dx,dy);
      else if(tile==='lilywater')lily(ctx,dx,dy);
      else if(tile==='cliff_face')cliff(ctx,dx,dy);
      else if(tile==='stairs')stairs(ctx,dx,dy);
    });return true;
  }

  function origin(e){const w=e.artW||32,h=e.artH||32;if(e.artAnchor==='topLeft')return{x:e.x*T,y:e.y*T,w,h};return{x:e.x*T+16-w/2,y:e.y*T+32-h,w,h};}
  function shadow(ctx,x,y,w){rect(ctx,x+4,y-4,Math.max(12,w-8),6,C.shadow);}
  function lantern(ctx,x,y){rect(ctx,x+14,y+17,5,47,C.wood0);rect(ctx,x+8,y+15,17,4,C.wood2);rect(ctx,x+6,y+2,21,19,C.ink);rect(ctx,x+9,y+5,15,13,C.amber);rect(ctx,x+13,y+7,7,9,C.flame);rect(ctx,x+9,y+21,15,3,C.wood1);rect(ctx,x+10,y+62,13,4,C.stone0);}
  function glow(ctx,cx,cy,r){if(!ctx.createRadialGradient)return;const g=ctx.createRadialGradient(cx,cy,2,cx,cy,r);g.addColorStop(0,'rgba(255,202,93,.28)');g.addColorStop(1,'rgba(255,183,60,0)');ctx.fillStyle=g;ctx.fillRect(cx-r,cy-r,r*2,r*2);}
  function cache(ctx,x,y,w,h){shadow(ctx,x,y+h,w);rect(ctx,x,y+7,w,h-7,C.wood0);rect(ctx,x+3,y+10,w-6,h-13,C.wood2);rect(ctx,x+2,y+4,w-4,10,C.wood3);rect(ctx,x+w/2-4,y+13,8,10,C.gold0);rect(ctx,x+w/2-2,y+15,4,6,C.gold2);line(ctx,x+4,y+17,x+w-4,y+17,C.wood0,2);}
  function drawObject(ctx,e){
    const id=e.artId;if(!id||!id.startsWith('whisper_'))return false;const o=origin(e),x=Math.round(o.x),y=Math.round(o.y),w=Math.round(o.w),h=Math.round(o.h);
    withPixels(ctx,()=>{
      if(e.artLight)glow(ctx,x+w/2,y+h*.45,e.artLight);
      if(id==='whisper_road_lantern')lantern(ctx,x,y);
      else if(id==='whisper_camp'){
        shadow(ctx,x,y+h,w);poly(ctx,[[x+3,y+h-8],[x+23,y+12],[x+43,y+h-8]],C.cloth);poly(ctx,[[x+23,y+12],[x+43,y+h-8],[x+49,y+h-8]],C.forest0);line(ctx,x+23,y+10,x+23,y+h-6,C.wood0,3);rect(ctx,x+50,y+h-15,24,5,C.wood1);for(let i=0;i<5;i++)line(ctx,x+51+i*5,y+h-14,x+57+i*4,y+h-22,C.wood2,2);for(let i=0;i<7;i++){const a=i/7*Math.PI*2;rect(ctx,x+55+Math.cos(a)*9,y+31+Math.sin(a)*5,5,4,C.stone1);}poly(ctx,[[x+53,y+34],[x+60,y+18],[x+67,y+34]],C.amber);poly(ctx,[[x+57,y+34],[x+60,y+24],[x+63,y+34]],C.flame);
      }
      else if(id==='whisper_wrecked_cart'){
        shadow(ctx,x,y+h,w);poly(ctx,[[x+8,y+10],[x+58,y+7],[x+69,y+31],[x+14,y+37]],C.wood0);for(let i=0;i<4;i++)line(ctx,x+16+i*12,y+10,x+20+i*11,y+34,C.wood3,4);ctx.fillStyle=C.ink;ctx.beginPath();ctx.arc(x+18,y+h-9,11,0,Math.PI*2);ctx.fill();ctx.fillStyle=C.wood2;ctx.beginPath();ctx.arc(x+18,y+h-9,7,0,Math.PI*2);ctx.fill();line(ctx,x+18,y+h-16,x+18,y+h-2,C.wood0,2);line(ctx,x+11,y+h-9,x+25,y+h-9,C.wood0,2);line(ctx,x+63,y+20,x+82,y+9,C.wood1,4);line(ctx,x+48,y+8,x+56,y+34,C.red,2);
      }
      else if(id==='whisper_cache')cache(ctx,x,y,w,h);
      else if(id==='whisper_wardstone'){
        shadow(ctx,x,y+h,w);poly(ctx,[[x+8,y+h-4],[x+4,y+23],[x+14,y+3],[x+34,y+7],[x+42,y+h-4]],C.stone0);poly(ctx,[[x+12,y+h-8],[x+9,y+25],[x+17,y+8],[x+31,y+11],[x+37,y+h-8]],C.stone2);rect(ctx,x+17,y+23,12,21,C.deep);rect(ctx,x+20,y+26,6,15,C.gold0);px(ctx,x+22,y+29,C.gold2);for(let i=0;i<5;i++)rect(ctx,x+8+i*7,y+h-13-(i%2)*2,5,4,C.moss0);
      }
      else if(id==='whisper_fallen_log'){
        shadow(ctx,x,y+h,w);rect(ctx,x+6,y+7,w-12,h-13,C.wood0);rect(ctx,x+9,y+9,w-19,h-17,C.wood2);for(let i=0;i<5;i++)line(ctx,x+14+i*10,y+10,x+11+i*11,y+h-9,C.wood1,2);ctx.fillStyle=C.ink;ctx.beginPath();ctx.arc(x+w-9,y+h/2,12,0,Math.PI*2);ctx.fill();ctx.fillStyle=C.wood3;ctx.beginPath();ctx.arc(x+w-9,y+h/2,8,0,Math.PI*2);ctx.fill();ctx.fillStyle=C.wood0;ctx.beginPath();ctx.arc(x+w-9,y+h/2,4,0,Math.PI*2);ctx.fill();for(let i=0;i<6;i++)rect(ctx,x+10+i*8,y+5-(i%2)*2,7,5,C.moss1);
      }
      else if(id==='whisper_mushroom_ring'){
        for(let i=0;i<9;i++){const a=i/9*Math.PI*2,cx=x+w/2+Math.cos(a)*(w*.36),cy=y+h/2+Math.sin(a)*(h*.30);rect(ctx,cx-1,cy,3,8,C.moon);rect(ctx,cx-4,cy-3,9,5,i%3===0?C.gold2:C.amber);px(ctx,cx-1,cy-2,C.flame);}
      }
      else if(id==='whisper_root_hollow'){
        shadow(ctx,x,y+h,w);poly(ctx,[[x+2,y+h],[x+9,y+9],[x+20,y+2],[x+29,y+7],[x+38,y+2],[x+50,y+h]],C.wood0);poly(ctx,[[x+13,y+h],[x+16,y+17],[x+26,y+12],[x+37,y+18],[x+40,y+h]],C.ink);rect(ctx,x+20,y+20,14,h-20,C.deep);for(let i=0;i<5;i++)rect(ctx,x+5+i*10,y+h-7-(i%2)*2,8,5,C.moss0);
      }
      else if(id==='whisper_cairn'){
        shadow(ctx,x,y+h,w);rect(ctx,x+7,y+h-12,w-14,10,C.stone0);rect(ctx,x+11,y+h-23,w-22,10,C.stone1);rect(ctx,x+16,y+h-33,w-32,9,C.stone2);rect(ctx,x+20,y+h-43,w-40,9,C.stone1);px(ctx,x+w/2-1,y+7,C.gold2);rect(ctx,x+9,y+h-15,12,3,C.moss0);
      }
      else if(id==='whisper_bridge_marker'){
        rect(ctx,x+15,y+11,4,h-11,C.wood0);rect(ctx,x+2,y+5,30,12,C.wood2);poly(ctx,[[x+32,y+5],[x+39,y+11],[x+32,y+17]],C.wood2);rect(ctx,x+7,y+8,16,2,C.gold0);rect(ctx,x+12,y+h-4,11,4,C.stone0);
      }
      else if(id==='whisper_offering_stone'){
        shadow(ctx,x,y+h,w);poly(ctx,[[x+2,y+h-4],[x+7,y+15],[x+17,y+7],[x+34,y+10],[x+40,y+h-4]],C.stone0);poly(ctx,[[x+8,y+h-9],[x+12,y+17],[x+30,y+15],[x+35,y+h-9]],C.stone2);for(let i=0;i<5;i++){px(ctx,x+10+i*5,y+13+(i%2)*4,i%2?C.gold2:C.violet);}
      }
      else if(id==='whisper_moon_herb'){
        for(let i=0;i<4;i++){line(ctx,x+w/2,y+h-3,x+5+i*6,y+9+(i%2)*5,C.moss1,2);poly(ctx,[[x+4+i*6,y+10+(i%2)*5],[x+10+i*5,y+5+(i%2)*4],[x+12+i*5,y+13+(i%2)*4]],i%2?C.moon:C.leaf);}px(ctx,x+w/2-1,y+7,C.gold2);
      }
      else if(id==='whisper_dusk_bloom'){
        line(ctx,x+w/2,y+h,x+w/2,y+12,C.moss1,2);for(let i=0;i<6;i++){const a=i/6*Math.PI*2,cx=x+w/2+Math.cos(a)*7,cy=y+10+Math.sin(a)*5;rect(ctx,cx-2,cy-2,5,5,i%2?C.violet:'#c090c2');}rect(ctx,x+w/2-2,y+8,5,5,C.gold2);
      }
    });return true;
  }

  const baseTile=AO.ThousandfoldArt.drawTile.bind(AO.ThousandfoldArt);
  const baseEntity=AO.ThousandfoldArt.drawEntity.bind(AO.ThousandfoldArt);
  AO.ThousandfoldArt.drawTile=function(ctx,tile,x,y,theme){if(theme==='wilds'&&drawWildTile(ctx,tile,x,y))return true;return baseTile(ctx,tile,x,y,theme);};
  AO.ThousandfoldArt.drawEntity=function(ctx,e,mapId,time){if(mapId==='wilds'&&drawObject(ctx,e))return true;return baseEntity(ctx,e,mapId,time);};

  AO.WhisperwoodArt={source:'project-owned-whisperwood-v164',tiles:[...wildTiles],objects:['whisper_road_lantern','whisper_camp','whisper_wrecked_cart','whisper_cache','whisper_wardstone','whisper_fallen_log','whisper_mushroom_ring','whisper_root_hollow','whisper_cairn','whisper_bridge_marker','whisper_offering_stone','whisper_moon_herb','whisper_dusk_bloom']};
})();
