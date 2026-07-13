/* Thousandfold Realms v1.6.1-dev — canonical Haven pixel-art runtime.
   The production art is drawn from project-owned pixel primitives so every tile,
   prop, anchor, collision footprint, and door remains deterministic and editable. */
(() => {
  'use strict';
  if (!window.AO) return;

  const TILE = 32;
  const P = {
    ink:'#17191b', deepest:'#090c0d', shadow:'#25221f', stone0:'#343b3b', stone1:'#4c5551', stone2:'#697168', stone3:'#8b8d7b',
    wood0:'#33251d', wood1:'#503426', wood2:'#74492f', wood3:'#9a6941', wood4:'#c09158',
    green0:'#26352c', green1:'#354a36', green2:'#4e6743', green3:'#71845a', moss:'#64724c',
    red0:'#552b28', red1:'#7c3d31', red2:'#a85a3b', roofGreen0:'#314b43', roofGreen1:'#49675a', roofGreen2:'#6f8370',
    gold0:'#8d642d', gold1:'#d0a44f', gold2:'#f1d27b', amber:'#f0aa43', flame:'#ffcf68',
    parchment:'#d8c397', cloth:'#6f403b', cloth2:'#315c55', blue:'#4c7180', violet:'#635375'
  };

  const hash=(x,y=0,z=0)=>Math.abs(Math.imul(x+17,73856093)^Math.imul(y+31,19349663)^Math.imul(z+7,83492791));
  const rect=(ctx,x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
  const outline=(ctx,x,y,w,h,c=P.ink)=>{ctx.strokeStyle=c;ctx.lineWidth=1;ctx.strokeRect(Math.round(x)+.5,Math.round(y)+.5,Math.round(w)-1,Math.round(h)-1);};
  const poly=(ctx,points,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();ctx.fill();};
  const line=(ctx,x1,y1,x2,y2,c,w=1)=>{ctx.strokeStyle=c;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(Math.round(x1)+.5,Math.round(y1)+.5);ctx.lineTo(Math.round(x2)+.5,Math.round(y2)+.5);ctx.stroke();};
  const px=(ctx,x,y,c)=>rect(ctx,x,y,2,2,c);
  const withPixelState=(ctx,fn)=>{ctx.save();ctx.imageSmoothingEnabled=false;fn();ctx.restore();};

  function floorTile(ctx,x,y,theme,variant){
    const h=hash(x,y,variant),base=theme==='cellar'?['#343633','#41413b']:theme==='forge'?['#494640','#56514a']:theme==='chapel'?['#5a554b','#676053']:theme==='arcane'?['#343244','#413d53']:['#67452e','#765036'];
    rect(ctx,x,y,32,32,base[h%2]);
    if(theme==='tavern'||theme==='interior'){
      for(let yy=0;yy<32;yy+=8){rect(ctx,x,y+yy,32,1,'rgba(25,17,13,.55)');const shift=((yy/8+h)%3)*7;rect(ctx,x+shift,y+yy+2,1,6,'rgba(28,18,12,.38)');rect(ctx,x+shift+1,y+yy+2,9,1,'rgba(214,156,87,.13)');}
      if(h%7===0){rect(ctx,x+5,y+19,8,2,'rgba(30,20,14,.28)');rect(ctx,x+18,y+7,2,7,'rgba(220,171,101,.12)');}
    } else {
      for(let yy=3;yy<31;yy+=10){line(ctx,x+2,y+yy,x+29,y+yy-2,'rgba(20,22,20,.25)');}
      if(h%4===0)rect(ctx,x+7,y+9,6,3,'rgba(185,174,142,.11)');
    }
  }

  function grassTile(ctx,x,y,variant){
    const h=hash(x,y,variant),base=[P.green1,'#3e543b','#42583e'][h%3];rect(ctx,x,y,32,32,base);
    for(let i=0;i<5;i++){const xx=x+3+(hash(h,i)%27),yy=y+5+(hash(i,h)%23);rect(ctx,xx,yy,1,4,i%2?P.green3:P.green2);if((h+i)%8===0)px(ctx,xx-1,yy-1,['#d7c66d','#c98391','#92b8d2'][i%3]);}
    if(h%6===0){rect(ctx,x+20,y+22,7,3,'rgba(20,31,22,.28)');rect(ctx,x+23,y+19,2,4,P.moss);}
  }

  function cobbleTile(ctx,x,y,variant){
    const h=hash(x,y,variant),base=h%2?'#676861':'#5d605c';rect(ctx,x,y,32,32,base);
    const stones=[[1,2,13,8],[15,1,15,10],[3,12,10,9],[14,13,16,8],[1,23,14,8],[17,23,14,8]];
    for(let i=0;i<stones.length;i++){const [sx,sy,w,hh]=stones[i];rect(ctx,x+sx,y+sy,w,hh,i%3===h%3?'#75766d':'#6a6b65');line(ctx,x+sx,y+sy+hh,x+sx+w,y+sy+hh,'rgba(20,23,23,.32)');if((h+i)%4===0)rect(ctx,x+sx+2,y+sy+2,Math.min(5,w-3),1,'rgba(231,220,186,.10)');}
    if(h%7===0){rect(ctx,x+28,y+5,2,8,P.moss);rect(ctx,x+25,y+10,5,2,P.moss);}
  }

  function wallTile(ctx,x,y,theme,wood=false){
    if(wood){rect(ctx,x,y,32,32,P.wood1);rect(ctx,x+2,y+2,28,28,'#7f5838');for(let yy=6;yy<32;yy+=8)line(ctx,x+2,y+yy,x+30,y+yy-1,'rgba(31,21,15,.48)');rect(ctx,x+3,y,4,32,P.wood0);rect(ctx,x+25,y,4,32,P.wood0);line(ctx,x+4,y+3,x+27,y+29,P.wood0,3);return;}
    const base=theme==='arcane'?'#373849':theme==='chapel'?'#55534c':'#3f4544';rect(ctx,x,y,32,32,base);
    const rows=[[1,2,14,8],[16,2,15,8],[3,12,12,8],[16,12,14,8],[1,22,15,9],[17,22,14,9]];
    rows.forEach(([sx,sy,w,h],i)=>{rect(ctx,x+sx,y+sy,w,h,i%2?'#505654':'#59605c');line(ctx,x+sx,y+sy+h,x+sx+w,y+sy+h,'rgba(15,17,17,.45)');if(i%3===0)rect(ctx,x+sx+2,y+sy+2,5,1,'rgba(232,219,182,.10)');});
  }

  function rugTile(ctx,x,y,theme){rect(ctx,x,y,32,32,theme==='arcane'?'#51465e':P.cloth);rect(ctx,x+3,y+3,26,26,theme==='chapel'?'#7a5743':'#87473b');outline(ctx,x+3,y+3,26,26,P.gold0);for(let i=0;i<4;i++){px(ctx,x+8+i*5,y+8+(i%2)*8,P.gold1);px(ctx,x+22-i*5,y+22-(i%2)*8,P.gold1);}rect(ctx,x+14,y+8,4,16,'rgba(230,192,101,.28)');}
  function stageTile(ctx,x,y){floorTile(ctx,x,y,'tavern',5);rect(ctx,x,y+25,32,7,P.wood0);rect(ctx,x,y+25,32,2,P.wood4);rect(ctx,x+4,y+28,4,4,P.ink);rect(ctx,x+24,y+28,4,4,P.ink);}

  function roof(ctx,x,y,w,h,colors){
    rect(ctx,x,y,w,h,colors[0]);
    for(let yy=0;yy<h;yy+=8){rect(ctx,x,y+yy,w,2,P.ink);for(let xx=((yy/8)%2)*8;xx<w;xx+=16){rect(ctx,x+xx,y+yy+2,14,6,colors[1]);rect(ctx,x+xx+2,y+yy+2,10,1,colors[2]);rect(ctx,x+xx+13,y+yy+3,1,5,'rgba(0,0,0,.28)');}}
  }
  function stoneCourse(ctx,x,y,w,h){rect(ctx,x,y,w,h,P.stone0);for(let yy=0;yy<h;yy+=10){for(let xx=((yy/10)%2)*10;xx<w;xx+=20){rect(ctx,x+xx+1,y+yy+1,18,8,(xx+yy)%40?P.stone1:P.stone2);rect(ctx,x+xx+3,y+yy+2,7,1,'rgba(230,221,185,.12)');}}}
  function timberWall(ctx,x,y,w,h,style){
    const plaster=style==='arcane'?'#596262':style==='chapel'?'#78715e':style==='provisions'?'#6b6a55':'#75604a';rect(ctx,x,y,w,h,plaster);
    for(let xx=0;xx<=w;xx+=32)rect(ctx,x+xx-2,y,4,h,P.wood0);rect(ctx,x,y+h-5,w,5,P.wood0);rect(ctx,x,y+3,w,4,P.wood2);
    for(let xx=0;xx<w;xx+=64){line(ctx,x+xx+4,y+7,x+xx+60,y+h-7,P.wood1,4);line(ctx,x+xx+60,y+7,x+xx+4,y+h-7,P.wood1,4);}
  }
  function litWindow(ctx,x,y,w=24,h=30,accent=P.gold1){rect(ctx,x-2,y-2,w+4,h+4,P.ink);rect(ctx,x,y,w,h,P.wood2);rect(ctx,x+3,y+3,w-6,h-6,'#d9973e');rect(ctx,x+5,y+5,w-10,h-10,'#ffd978');rect(ctx,x+w/2-1,y+3,2,h-6,P.wood0);rect(ctx,x+3,y+h/2-1,w-6,2,P.wood0);rect(ctx,x+5,y+5,w-10,2,'rgba(255,255,220,.35)');rect(ctx,x-1,y+h+2,w+2,3,accent);}
  function exteriorDoor(ctx,x,y,open=false){rect(ctx,x-3,y-4,38,52,P.stone0);rect(ctx,x,y,32,48,P.wood0);if(open){rect(ctx,x+4,y+4,24,42,P.deepest);rect(ctx,x+25,y+5,5,38,P.wood2);}else{rect(ctx,x+3,y+3,26,42,P.wood2);poly(ctx,[[x+3,y+10],[x+16,y],[x+29,y+10]],P.wood3);rect(ctx,x+6,y+14,20,2,P.wood0);rect(ctx,x+6,y+29,20,2,P.wood0);rect(ctx,x+22,y+24,3,3,P.gold2);}outline(ctx,x-3,y-4,38,52,P.ink);}
  function hangingSign(ctx,x,y,label,accent){rect(ctx,x,y,3,31,P.wood0);rect(ctx,x+2,y,22,3,P.wood2);rect(ctx,x+19,y+2,2,8,P.gold0);rect(ctx,x+8,y+9,25,20,P.wood0);rect(ctx,x+10,y+11,21,16,P.wood2);outline(ctx,x+10,y+11,21,16,accent);ctx.fillStyle=accent;ctx.font='bold 8px monospace';ctx.textAlign='center';ctx.fillText(label,x+20,y+22);}

  function drawBuilding(ctx,b,world){
    const dx=b.x*TILE,dy=b.y*TILE,dw=(b.w||8)*TILE,dh=(b.h||5)*TILE,style=b.style||'inn';
    const green=['#203b35',P.roofGreen1,P.roofGreen2],red=[P.red0,P.red1,P.red2],roofColors=['arcane','chapel','provisions'].includes(style)?green:red;
    withPixelState(ctx,()=>{
      rect(ctx,dx+5,dy+12,dw-1,dh-4,'rgba(5,7,7,.45)');
      timberWall(ctx,dx+7,dy+54,dw-14,92,style);
      stoneCourse(ctx,dx+7,dy+119,dw-14,35);
      roof(ctx,dx+2,dy+9,dw-4,52,roofColors);
      poly(ctx,[[dx+70,dy+59],[dx+dw/2,dy+5],[dx+dw-70,dy+59]],roofColors[0]);
      for(let yy=18;yy<56;yy+=8){line(ctx,dx+74+(yy-18),dy+yy,dx+dw-74-(yy-18),dy+yy,roofColors[1],6);}
      rect(ctx,dx+dw/2-3,dy+14,6,42,P.wood0);line(ctx,dx+76,dy+57,dx+dw/2,dy+8,P.wood1,4);line(ctx,dx+dw-76,dy+57,dx+dw/2,dy+8,P.wood1,4);
      litWindow(ctx,dx+42,dy+78,25,28,b.accent||P.gold1);litWindow(ctx,dx+dw-67,dy+78,25,28,b.accent||P.gold1);
      litWindow(ctx,dx+dw/2-11,dy+28,22,21,b.accent||P.gold1);
      const door=world?.entities?.find(e=>e.id===b.doorId),doorX=dx+dw/2-16,doorY=dy+103;exteriorDoor(ctx,doorX,doorY,!!door?.open);
      const labels={inn:'INN',arcane:'ARC',tavern:'ALE',provisions:'SHOP',chapel:'LUX',forge:'FORGE'};hangingSign(ctx,dx+dw-45,dy+64,labels[style]||'SHOP',b.accent||P.gold1);
      if(style==='forge'){stoneCourse(ctx,dx+dw-43,dy+5,24,55);rect(ctx,dx+dw-39,dy,16,8,P.stone1);rect(ctx,dx+18,dy+118,32,18,P.wood0);rect(ctx,dx+23,dy+121,22,11,'#ef8c34');}
      if(style==='arcane'){px(ctx,dx+26,dy+80,'#9ed9e5');px(ctx,dx+232,dy+71,'#9ed9e5');ctx.strokeStyle='#8fc7df';ctx.beginPath();ctx.arc(dx+dw/2,dy+40,8,0,Math.PI*2);ctx.stroke();}
      if(style==='chapel'){rect(ctx,dx+dw/2-2,dy+1,4,13,P.gold1);rect(ctx,dx+dw/2-7,dy+6,14,4,P.gold1);}
      if(style==='provisions'){rect(ctx,dx+23,dy+106,52,8,P.cloth2);rect(ctx,dx+181,dy+106,52,8,P.parchment);}
      if(style==='tavern'){rect(ctx,dx+18,dy+119,20,26,P.wood1);rect(ctx,dx+22,dy+123,12,12,P.gold0);px(ctx,dx+27,dy+127,P.flame);}
      if(style!=='forge'){for(let i=0;i<5;i++){rect(ctx,dx+11+i*3,dy+93+i*7,2,8,P.green2);px(ctx,dx+8+i*4,dy+101+i*6,P.green3);}rect(ctx,dx+38,dy+108,34,5,P.wood1);for(let i=0;i<4;i++)px(ctx,dx+44+i*7,dy+105,['#d6878d','#e0c764'][i%2]);}
    });return true;
  }

  function shadow(ctx,x,y,w){rect(ctx,x+4,y-3,Math.max(12,w-8),5,'rgba(5,7,8,.28)');}
  function drawLantern(ctx,x,y,scale=1){rect(ctx,x+6*scale,y,4*scale,8*scale,P.wood0);rect(ctx,x+2*scale,y+7*scale,12*scale,14*scale,P.ink);rect(ctx,x+4*scale,y+9*scale,8*scale,10*scale,P.amber);rect(ctx,x+6*scale,y+11*scale,4*scale,6*scale,P.flame);rect(ctx,x+3*scale,y+21*scale,10*scale,3*scale,P.wood1);}
  function lightGlow(ctx,cx,cy,r){const g=ctx.createRadialGradient(cx,cy,2,cx,cy,r);g.addColorStop(0,'rgba(255,210,100,.28)');g.addColorStop(1,'rgba(255,185,70,0)');ctx.fillStyle=g;ctx.fillRect(cx-r,cy-r,r*2,r*2);}

  function objectOrigin(e){const w=e.artW||32,h=e.artH||32,anchor=e.artAnchor||'bottomCenter';if(anchor==='topLeft')return{x:e.x*TILE,y:e.y*TILE,w,h};return{x:e.x*TILE+16-w/2,y:e.y*TILE+32-h,w,h};}
  function woodenTable(ctx,x,y,w,h,round=false){shadow(ctx,x,y+h,w);if(round){rect(ctx,x+4,y+5,w-8,h-13,P.wood0);rect(ctx,x+2,y+2,w-4,h-14,P.wood3);rect(ctx,x+7,y+5,w-14,h-20,P.wood4);}else{rect(ctx,x,y+5,w,h-14,P.wood0);rect(ctx,x+2,y+2,w-4,h-16,P.wood3);for(let xx=x+8;xx<x+w-3;xx+=12)line(ctx,xx,y+3,xx,y+h-15,'rgba(49,30,20,.38)');rect(ctx,x+6,y+h-13,5,12,P.wood0);rect(ctx,x+w-11,y+h-13,5,12,P.wood0);}outline(ctx,x+2,y+2,w-4,h-16,P.ink);}
  function crate(ctx,x,y,w,h){shadow(ctx,x,y+h,w);rect(ctx,x,y,w,h,P.wood1);rect(ctx,x+3,y+3,w-6,h-6,P.wood3);rect(ctx,x+3,y+3,w-6,4,P.wood4);rect(ctx,x+3,y+h-7,w-6,4,P.wood0);line(ctx,x+5,y+5,x+w-5,y+h-5,P.wood0,3);line(ctx,x+w-5,y+5,x+5,y+h-5,P.wood0,3);outline(ctx,x,y,w,h,P.ink);}
  function barrel(ctx,x,y,w,h){shadow(ctx,x,y+h,w);rect(ctx,x+4,y,w-8,h,P.wood0);rect(ctx,x+2,y+5,w-4,h-10,P.wood2);rect(ctx,x+5,y+4,w-10,h-8,P.wood3);rect(ctx,x+2,y+7,w-4,3,P.stone0);rect(ctx,x+1,y+h-10,w-2,3,P.stone0);line(ctx,x+w/2,y+4,x+w/2,y+h-5,'rgba(45,27,18,.38)');outline(ctx,x+2,y+5,w-4,h-10,P.ink);}

  function drawObject(ctx,e){
    const id=e.open&&e.openArtId?e.openArtId:e.artId;if(!id)return false;const o=objectOrigin(e),x=Math.round(o.x),y=Math.round(o.y),w=Math.round(o.w),h=Math.round(o.h);
    withPixelState(ctx,()=>{
      if(e.artLight)lightGlow(ctx,x+w/2,y+h*.55,e.artLight);
      switch(id){
        case 'door_arch':case 'door_frame':case 'cellar_door': exteriorDoor(ctx,x,y,!!e.open);break;
        case 'lamp_post': rect(ctx,x+w/2-2,y+12,4,h-12,P.wood0);rect(ctx,x+w/2-8,y+10,16,3,P.wood2);drawLantern(ctx,x+w/2-8,y,1);rect(ctx,x+w/2-6,y+h-4,12,4,P.stone0);break;
        case 'shrine': stoneCourse(ctx,x+8,y+20,w-16,h-20);rect(ctx,x+2,y+h-8,w-4,8,P.stone0);drawLantern(ctx,x+w/2-8,y+5,1);px(ctx,x+5,y+h-13,'#d58c92');px(ctx,x+w-7,y+h-16,'#d8c762');break;
        case 'well': stoneCourse(ctx,x+6,y+30,w-12,h-30);rect(ctx,x+3,y+28,w-6,5,P.stone0);rect(ctx,x+8,y+4,4,30,P.wood1);rect(ctx,x+w-12,y+4,4,30,P.wood1);poly(ctx,[[x+3,y+10],[x+w/2,y],[x+w-3,y+10]],P.red1);rect(ctx,x+12,y+14,w-24,3,P.wood2);break;
        case 'market_stall': rect(ctx,x+4,y+18,4,h-18,P.wood0);rect(ctx,x+w-8,y+18,4,h-18,P.wood0);rect(ctx,x+2,y+34,w-4,h-36,P.wood2);for(let xx=0;xx<w;xx+=12)rect(ctx,x+xx,y+4,10,20,(xx/12)%2?P.parchment:P.cloth2);poly(ctx,[[x,y+4],[x+w,y+4],[x+w-5,y],[x+5,y]],P.wood0);for(let i=0;i<5;i++){crate(ctx,x+7+i*13,y+h-18,12,16);px(ctx,x+10+i*13,y+h-21,['#d77b57','#d5c163','#67965a'][i%3]);}break;
        case 'bench':case 'bench_inside': shadow(ctx,x,y+h,w);rect(ctx,x+2,y+5,w-4,8,P.wood3);rect(ctx,x+2,y+16,w-4,8,P.wood2);rect(ctx,x+7,y+2,5,h-2,P.wood0);rect(ctx,x+w-12,y+2,5,h-2,P.wood0);break;
        case 'cart': shadow(ctx,x,y+h,w);rect(ctx,x+5,y+8,w-17,h-20,P.wood2);for(let xx=x+8;xx<x+w-15;xx+=12)rect(ctx,xx,y+10,8,h-24,P.wood3);ctx.fillStyle=P.ink;ctx.beginPath();ctx.arc(x+17,y+h-8,9,0,Math.PI*2);ctx.arc(x+w-23,y+h-8,9,0,Math.PI*2);ctx.fill();ctx.fillStyle=P.wood3;ctx.beginPath();ctx.arc(x+17,y+h-8,6,0,Math.PI*2);ctx.arc(x+w-23,y+h-8,6,0,Math.PI*2);ctx.fill();rect(ctx,x+w-14,y+12,20,4,P.wood1);break;
        case 'flower_planter': crate(ctx,x,y+10,w,h-10);for(let i=0;i<6;i++){rect(ctx,x+5+i*7,y+5+(i%2)*2,2,8,P.green2);px(ctx,x+4+i*7,y+3+(i%2)*2,['#d77f8d','#e0cb68','#8eb6d5'][i%3]);}break;
        case 'noticeboard': rect(ctx,x+5,y+5,w-10,h-7,P.wood0);rect(ctx,x+9,y+8,w-18,h-15,P.wood2);for(let i=0;i<5;i++){const xx=x+12+(i%3)*14,yy=y+11+Math.floor(i/3)*15;rect(ctx,xx,yy,11,10,i%2?P.parchment:'#bda779');px(ctx,xx+2,yy+2,P.red1);}rect(ctx,x+9,y+h-3,4,9,P.wood0);rect(ctx,x+w-13,y+h-3,4,9,P.wood0);break;
        case 'black_lantern_sign': hangingSign(ctx,x+5,y+3,'BL',P.gold2);break;
        case 'barrel': barrel(ctx,x,y,w,h);break;
        case 'crate': crate(ctx,x,y,w,h);break;
        case 'kegs': for(let i=0;i<3;i++)barrel(ctx,x+i*(w/3),y+(i%2)*3,w/3+2,h-(i%2)*3);break;
        case 'counter_tap':case 'counter_serving':case 'counter_shelf':case 'counter_straight':
          shadow(ctx,x,y+h,w);rect(ctx,x,y+16,w,h-16,P.wood0);rect(ctx,x+3,y+12,w-6,12,P.wood3);for(let xx=x+8;xx<x+w;xx+=18)rect(ctx,xx,y+24,4,h-25,P.wood1);outline(ctx,x,y+12,w,h-12,P.ink);
          if(id==='counter_tap'){for(let i=0;i<4;i++){rect(ctx,x+14+i*22,y+4,3,12,P.gold1);rect(ctx,x+12+i*22,y+3,8,3,P.gold2);}}
          if(id==='counter_serving'){rect(ctx,x+16,y+6,18,5,P.parchment);rect(ctx,x+48,y+5,12,7,'#8a5038');px(ctx,x+72,y+7,P.flame);}
          if(id==='counter_shelf'){for(let i=0;i<5;i++){rect(ctx,x+8+i*17,y+2,8,13,['#5e6d52','#6e4a35','#465f6c'][i%3]);rect(ctx,x+9+i*17,y,6,3,P.gold0);}}
          break;
        case 'table_square': woodenTable(ctx,x,y,w,h,false);px(ctx,x+w/2-1,y+7,P.flame);break;
        case 'table_round': woodenTable(ctx,x,y,w,h,true);px(ctx,x+w/2-1,y+7,P.flame);break;
        case 'long_table': woodenTable(ctx,x,y,w,h,false);for(let i=0;i<7;i++){rect(ctx,x+12+i*25,y+8,11,5,P.parchment);px(ctx,x+17+i*25,y+18,P.flame);}break;
        case 'stool': rect(ctx,x+3,y+3,w-6,8,P.wood3);rect(ctx,x+6,y+10,4,h-10,P.wood0);rect(ctx,x+w-10,y+10,4,h-10,P.wood0);break;
        case 'chair': rect(ctx,x+3,y,4,h,P.wood0);rect(ctx,x+w-7,y,4,h,P.wood0);rect(ctx,x+5,y+5,w-10,13,P.wood3);rect(ctx,x+4,y+20,w-8,7,P.wood2);break;
        case 'bed': shadow(ctx,x,y+h,w);rect(ctx,x,y+4,w,h-4,P.wood0);rect(ctx,x+3,y+7,w-6,h-13,'#8a7659');rect(ctx,x+5,y+9,w-10,13,P.parchment);rect(ctx,x+4,y+25,w-8,h-31,P.cloth2);break;
        case 'shelf':case 'books': rect(ctx,x,y,w,h,P.wood0);rect(ctx,x+4,y+4,w-8,h-8,P.wood2);for(let yy=y+11;yy<y+h-5;yy+=13){rect(ctx,x+4,yy,w-8,3,P.wood0);for(let xx=x+7;xx<x+w-8;xx+=7)rect(ctx,xx,yy-8,5,8,['#715044','#4b6570','#6c5b7b','#8a6a3e'][(xx+yy)%4]);}outline(ctx,x,y,w,h,P.ink);break;
        case 'cupboard': rect(ctx,x,y,w,h,P.wood0);rect(ctx,x+3,y+3,w-6,h-6,P.wood2);rect(ctx,x+w/2-2,y+3,4,h-6,P.wood0);rect(ctx,x+8,y+8,w/2-12,h-16,'#3d3027');rect(ctx,x+w/2+4,y+8,w/2-12,h-16,'#3d3027');px(ctx,x+w/2-7,y+h/2,P.gold2);px(ctx,x+w/2+5,y+h/2,P.gold2);break;
        case 'fireplace':case 'oven': stoneCourse(ctx,x,y,w,h);rect(ctx,x+10,y+22,w-20,h-22,P.ink);poly(ctx,[[x+10,y+27],[x+w/2,y+15],[x+w-10,y+27]],P.stone0);rect(ctx,x+15,y+h-24,w-30,18,'#5b291e');poly(ctx,[[x+w/2-8,y+h-7],[x+w/2,y+h-28],[x+w/2+8,y+h-7]],P.amber);poly(ctx,[[x+w/2-4,y+h-7],[x+w/2,y+h-20],[x+w/2+4,y+h-7]],P.flame);break;
        case 'cookpot': rect(ctx,x+5,y+8,w-10,3,P.wood0);line(ctx,x+8,y+10,x+w/2,y+24,P.stone2,2);line(ctx,x+w-8,y+10,x+w/2,y+24,P.stone2,2);rect(ctx,x+8,y+24,w-16,17,P.ink);rect(ctx,x+11,y+27,w-22,11,P.stone0);poly(ctx,[[x+8,y+h],[x+w/2,y+39],[x+w-8,y+h]],P.amber);break;
        case 'prep_table': woodenTable(ctx,x,y,w,h,false);rect(ctx,x+10,y+6,17,9,P.parchment);rect(ctx,x+37,y+7,15,7,'#6f8b58');break;
        case 'dish_rack': rect(ctx,x,y,w,h,P.wood0);for(let yy=7;yy<h;yy+=14)rect(ctx,x+3,y+yy,w-6,3,P.wood2);for(let i=0;i<5;i++){ctx.strokeStyle=P.parchment;ctx.beginPath();ctx.arc(x+8+i*8,y+14,4,0,Math.PI*2);ctx.stroke();}break;
        case 'tools': for(let i=0;i<5;i++){rect(ctx,x+5+i*14,y+4,3,h-12,P.wood2);rect(ctx,x+2+i*14,y+2,9,8,i%2?P.stone2:P.stone1);}break;
        case 'candles':case 'floor_lanterns':case 'hanging_lanterns': for(let i=0;i<Math.max(2,Math.floor(w/22));i++){const lx=x+4+i*22;drawLantern(ctx,lx,y+Math.max(0,h-30),.75);}break;
        case 'potted_plants': for(let i=0;i<4;i++){const bx=x+4+i*18;rect(ctx,bx,y+h-13,14,12,P.wood2);for(let j=0;j<5;j++){rect(ctx,bx+6+(j%2)*3,y+5+j*4,2,h-18-j*4,P.green2);px(ctx,bx+3+(j*3)%11,y+4+j*3,j%2?'#d58a91':P.green3);}}break;
        case 'stage_props': rect(ctx,x,y+h-10,w,10,P.wood0);rect(ctx,x+4,y+h-8,w-8,5,P.wood3);rect(ctx,x+14,y+15,3,h-25,P.wood2);rect(ctx,x+9,y+12,13,5,P.gold1);ctx.strokeStyle=P.wood4;ctx.beginPath();ctx.ellipse(x+w-24,y+31,11,18,0,0,Math.PI*2);ctx.stroke();rect(ctx,x+w-25,y+48,3,13,P.wood2);rect(ctx,x+30,y+5,w-36,28,P.cloth);break;
        default: crate(ctx,x,y,w,h);break;
      }
    });return true;
  }

  function drawNpc(ctx,x,y,visual,scale=1,options={}){
    if(!visual?.artFrames)return false;const frame=(options.idleFrame||0)%2,role=visual.artFrames[0]||'',S=scale,bob=frame?0:-1;
    const skin=visual.skin||'#b98664',hair=visual.hair||'#493126',outfit=role.includes('server')?'#d7cfc1':role.includes('bard')?'#4f6847':role.includes('patron')?'#5a493e':visual.outfit||'#6f4d35',accent=visual.accent||P.gold1;
    withPixelState(ctx,()=>{
      const ox=x+2*S,oy=y-15*S+bob;
      rect(ctx,ox+8*S,oy+2*S,16*S,14*S,P.ink);rect(ctx,ox+10*S,oy+4*S,12*S,11*S,skin);
      rect(ctx,ox+8*S,oy+1*S,16*S,6*S,hair);rect(ctx,ox+7*S,oy+5*S,4*S,8*S,hair);if(role.includes('tavernkeeper')||visual.beard){rect(ctx,ox+10*S,oy+12*S,12*S,7*S,hair);}
      px(ctx,ox+12*S,oy+8*S,'#2c2521');px(ctx,ox+19*S,oy+8*S,'#2c2521');
      rect(ctx,ox+7*S,oy+17*S,18*S,20*S,P.ink);rect(ctx,ox+9*S,oy+18*S,14*S,18*S,outfit);rect(ctx,ox+10*S,oy+19*S,12*S,4*S,accent);
      rect(ctx,ox+3*S,oy+19*S,6*S,15*S,P.ink);rect(ctx,ox+23*S,oy+19*S,6*S,15*S,P.ink);rect(ctx,ox+4*S,oy+21*S,4*S,10*S,skin);rect(ctx,ox+24*S,oy+21*S,4*S,10*S,skin);
      rect(ctx,ox+9*S,oy+36*S,6*S,11*S,P.ink);rect(ctx,ox+18*S,oy+36*S,6*S,11*S,P.ink);rect(ctx,ox+10*S,oy+36*S,4*S,8*S,P.wood1);rect(ctx,ox+19*S,oy+36*S,4*S,8*S,P.wood1);
      if(role.includes('server')){rect(ctx,ox+9*S,oy+25*S,14*S,11*S,'#ede3cd');rect(ctx,ox+24*S,oy+18*S,10*S,2*S,P.stone2);rect(ctx,ox+26*S,oy+15*S,6*S,3*S,P.parchment);}
      if(role.includes('bard')){ctx.strokeStyle=P.wood4;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(ox+26*S,oy+27*S,7*S,10*S,0,0,Math.PI*2);ctx.stroke();line(ctx,ox+21*S,oy+20*S,ox+30*S,oy+37*S,P.wood2,2);}
      if(role.includes('patron')){rect(ctx,ox+25*S,oy+24*S,7*S,9*S,P.stone2);rect(ctx,ox+26*S,oy+22*S,5*S,3*S,P.gold1);}
    });return true;
  }

  AO.ThousandfoldArt={
    ready:true,failed:false,source:'procedural-project-atlas-v161',
    handlesTile(tile,theme){
      if(theme==='haven')return ['grass','cobble','path','roof','tree','flower_patch','shrub','rocks'].includes(tile);
      if(['tavern','interior','forge','arcane','chapel','cellar'].includes(theme))return ['woodfloor','rug','stage','stonewall','woodwall','stonefloor','forgefloor','magicfloor','rune','chapelfloor','altar','cellarfloor'].includes(tile);
      return false;
    },
    drawTile(ctx,tile,x,y,theme){
      if(!this.handlesTile(tile,theme))return false;const dx=x*TILE,dy=y*TILE,h=hash(x,y);
      withPixelState(ctx,()=>{
        if(theme==='haven'){
          if(tile==='grass')grassTile(ctx,dx,dy,h%3);
          else if(tile==='cobble')cobbleTile(ctx,dx,dy,h%2);
          else if(tile==='path'){rect(ctx,dx,dy,32,32,h%2?'#72543a':'#664b35');for(let i=0;i<4;i++)rect(ctx,dx+3+(hash(h,i)%25),dy+4+(hash(i,h)%22),5,2,'rgba(41,29,21,.34)');}
          else if(tile==='roof'){rect(ctx,dx,dy,32,32,P.green0);rect(ctx,dx,dy+27,32,5,'rgba(5,7,8,.35)');}
          else if(tile==='tree'){grassTile(ctx,dx,dy,1);rect(ctx,dx+14,dy+17,5,15,P.wood1);rect(ctx,dx+5,dy+3,22,20,P.green0);rect(ctx,dx+2,dy+8,14,16,P.green1);rect(ctx,dx+14,dy+1,15,17,P.green2);rect(ctx,dx+8,dy+6,8,4,P.green3);}
          else if(tile==='flower_patch'){grassTile(ctx,dx,dy,0);for(let i=0;i<5;i++){rect(ctx,dx+6+i*5,dy+15+(i%2)*3,1,9,P.green2);px(ctx,dx+5+i*5,dy+12+(i%2)*3,['#d47f8e','#e4cb67','#8fb6d4'][i%3]);}}
          else if(tile==='shrub'){grassTile(ctx,dx,dy,1);rect(ctx,dx+4,dy+13,24,15,P.green0);rect(ctx,dx+7,dy+9,18,15,P.green2);px(ctx,dx+10,dy+12,P.green3);px(ctx,dx+22,dy+15,'#d98c98');}
          else if(tile==='rocks'){grassTile(ctx,dx,dy,1);poly(ctx,[[dx+4,dy+25],[dx+8,dy+12],[dx+18,dy+8],[dx+28,dy+25]],P.stone0);poly(ctx,[[dx+8,dy+21],[dx+11,dy+14],[dx+18,dy+11],[dx+24,dy+21]],P.stone2);}
        } else {
          if(['woodfloor','stonefloor','forgefloor','magicfloor','chapelfloor','cellarfloor'].includes(tile))floorTile(ctx,dx,dy,theme,h%4);
          else if(tile==='rug'||tile==='rune'||tile==='altar')rugTile(ctx,dx,dy,theme);
          else if(tile==='stage')stageTile(ctx,dx,dy);
          else if(tile==='stonewall')wallTile(ctx,dx,dy,theme,false);
          else if(tile==='woodwall')wallTile(ctx,dx,dy,theme,true);
        }
      });return true;
    },
    drawBuilding,
    drawEntity(ctx,e,mapId,time){if(e.integratedBuildingDoor)return true;return drawObject(ctx,e);},
    drawNpc
  };
})();
