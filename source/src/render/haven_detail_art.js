/* Thousandfold Realms v1.6.3-dev — distinctive Haven prop artwork. */
(() => {
  'use strict';
  if(!window.AO||!AO.ThousandfoldArt)return;

  const TILE=32;
  const C={ink:'#17191b',deep:'#0d1113',stone0:'#343b3b',stone1:'#59605c',stone2:'#858b82',wood0:'#33251d',wood1:'#503426',wood2:'#74492f',wood3:'#9a6941',wood4:'#c09158',gold0:'#8d642d',gold1:'#d0a44f',gold2:'#f1d27b',amber:'#f0aa43',flame:'#ffd978',cloth:'#6f403b',cloth2:'#315c55',green:'#4e6743',green2:'#71845a',blue:'#5a8595',violet:'#6b5a7c',parchment:'#d8c397'};
  const rect=(ctx,x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
  const line=(ctx,x1,y1,x2,y2,color,width=1)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(Math.round(x1)+.5,Math.round(y1)+.5);ctx.lineTo(Math.round(x2)+.5,Math.round(y2)+.5);ctx.stroke();};
  const outline=(ctx,x,y,w,h,color=C.ink)=>{ctx.strokeStyle=color;ctx.lineWidth=1;ctx.strokeRect(Math.round(x)+.5,Math.round(y)+.5,Math.round(w)-1,Math.round(h)-1);};
  const px=(ctx,x,y,color)=>rect(ctx,x,y,2,2,color);
  const poly=(ctx,points,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();ctx.fill();};
  const origin=e=>{const w=e.artW||32,h=e.artH||32;if(e.artAnchor==='topLeft')return{x:e.x*TILE,y:e.y*TILE,w,h};return{x:e.x*TILE+16-w/2,y:e.y*TILE+32-h,w,h};};
  const shadow=(ctx,x,y,w)=>rect(ctx,x+5,y-3,Math.max(12,w-10),5,'rgba(3,5,6,.30)');
  const glow=(ctx,cx,cy,r,color='255,205,105')=>{const g=ctx.createRadialGradient(cx,cy,2,cx,cy,r);g.addColorStop(0,`rgba(${color},.25)`);g.addColorStop(1,`rgba(${color},0)`);ctx.fillStyle=g;ctx.fillRect(cx-r,cy-r,r*2,r*2);};
  const lantern=(ctx,x,y,s=1)=>{rect(ctx,x+6*s,y,4*s,8*s,C.wood0);rect(ctx,x+2*s,y+7*s,12*s,14*s,C.ink);rect(ctx,x+4*s,y+9*s,8*s,10*s,C.amber);rect(ctx,x+6*s,y+11*s,4*s,6*s,C.flame);rect(ctx,x+3*s,y+21*s,10*s,3*s,C.wood1);};
  const crate=(ctx,x,y,w,h)=>{shadow(ctx,x,y+h,w);rect(ctx,x,y,w,h,C.wood1);rect(ctx,x+3,y+3,w-6,h-6,C.wood3);line(ctx,x+5,y+5,x+w-5,y+h-5,C.wood0,3);line(ctx,x+w-5,y+5,x+5,y+h-5,C.wood0,3);outline(ctx,x,y,w,h);};
  const table=(ctx,x,y,w,h)=>{shadow(ctx,x,y+h,w);rect(ctx,x,y+5,w,h-14,C.wood0);rect(ctx,x+2,y+2,w-4,h-16,C.wood3);for(let xx=x+9;xx<x+w-4;xx+=14)line(ctx,xx,y+3,xx,y+h-15,'rgba(49,30,20,.38)');rect(ctx,x+6,y+h-13,5,12,C.wood0);rect(ctx,x+w-11,y+h-13,5,12,C.wood0);outline(ctx,x+2,y+2,w-4,h-16);};

  const handled=new Set(['road_signpost','town_gate_post','street_banner','luggage_rack','breakfast_sideboard','remedy_display','supply_baskets','quench_trough','anvil','weaponrack','relic_pedestal','reading_table','lantern_statue','lectern','offering_table']);

  function drawDetail(ctx,e){
    const id=e.open&&e.openArtId?e.openArtId:e.artId;
    if(!handled.has(id))return false;
    const o=origin(e),x=Math.round(o.x),y=Math.round(o.y),w=Math.round(o.w),h=Math.round(o.h);
    ctx.save();ctx.imageSmoothingEnabled=false;if(e.artLight)glow(ctx,x+w/2,y+h*.55,e.artLight);

    switch(id){
      case 'road_signpost':
        rect(ctx,x+w/2-2,y+9,5,h-9,C.wood0);rect(ctx,x+4,y+7,w-8,9,C.wood1);poly(ctx,[[x+w-8,y+7],[x+w,y+11],[x+w-8,y+16]],C.wood1);rect(ctx,x+7,y+20,w-15,9,C.wood2);poly(ctx,[[x+7,y+20],[x,y+24],[x+7,y+29]],C.wood2);line(ctx,x+9,y+10,x+w-10,y+10,C.wood4);line(ctx,x+9,y+23,x+w-12,y+23,C.wood4);rect(ctx,x+w/2-8,y+h-5,16,5,C.stone0);break;
      case 'town_gate_post':
        rect(ctx,x+12,y+18,8,h-18,C.stone0);rect(ctx,x+10,y+18,12,5,C.stone2);rect(ctx,x+8,y+h-8,16,8,C.stone1);lantern(ctx,x+8,y+1,1);rect(ctx,x+5,y+15,22,4,C.wood1);break;
      case 'street_banner':
        rect(ctx,x+14,y+2,4,h-2,C.wood0);rect(ctx,x+4,y+6,14,3,C.wood2);rect(ctx,x+3,y+9,13,31,C.cloth2);poly(ctx,[[x+3,y+40],[x+9,y+47],[x+16,y+40]],C.cloth2);outline(ctx,x+3,y+9,13,31,C.gold0);lantern(ctx,x+10,y+41,.55);break;
      case 'luggage_rack':
        shadow(ctx,x,y+h,w);rect(ctx,x+3,y+17,w-6,6,C.wood1);rect(ctx,x+7,y+22,5,h-22,C.wood0);rect(ctx,x+w-12,y+22,5,h-22,C.wood0);for(let i=0;i<4;i++){const bx=x+5+i*18;rect(ctx,bx,y+3+(i%2)*4,15,16,C.ink);rect(ctx,bx+2,y+5+(i%2)*4,11,12,[C.cloth2,C.wood3,C.cloth,C.green][i]);rect(ctx,bx+5,y+1+(i%2)*4,5,5,C.gold0);}break;
      case 'breakfast_sideboard':
        shadow(ctx,x,y+h,w);rect(ctx,x,y+14,w,h-14,C.wood0);rect(ctx,x+3,y+17,w-6,h-20,C.wood2);rect(ctx,x+5,y+5,w-10,12,C.wood3);for(let i=0;i<4;i++){rect(ctx,x+9+i*16,y+2,9,5,C.parchment);px(ctx,x+12+i*16,y+8,[C.flame,C.green2,C.gold1,C.blue][i]);}for(let i=0;i<3;i++)rect(ctx,x+10+i*22,y+24,14,12,C.wood1);outline(ctx,x,y+14,w,h-14);break;
      case 'remedy_display':
        table(ctx,x,y,w,h);for(let i=0;i<5;i++){const bx=x+8+i*13;rect(ctx,bx,y+3,8,10,[C.green,C.blue,C.violet,C.gold0,C.cloth][i]);rect(ctx,bx+2,y,4,4,C.parchment);}rect(ctx,x+8,y+18,w-16,5,C.parchment);for(let i=0;i<6;i++)px(ctx,x+12+i*10,y+19,C.green2);break;
      case 'supply_baskets':
        shadow(ctx,x,y+h,w);for(let i=0;i<3;i++){const bx=x+3+i*23;rect(ctx,bx,y+10,20,h-10,C.wood0);rect(ctx,bx+2,y+12,16,h-14,C.wood3);for(let yy=y+15;yy<y+h-3;yy+=5)line(ctx,bx+2,yy,bx+18,yy,C.wood1);for(let xx=bx+4;xx<bx+18;xx+=5)line(ctx,xx,y+12,xx,y+h-3,C.wood4);}rect(ctx,x+8,y+3,10,10,C.cloth2);rect(ctx,x+31,y+1,13,12,C.parchment);rect(ctx,x+55,y+4,9,9,C.green);break;
      case 'quench_trough':
        shadow(ctx,x,y+h,w);rect(ctx,x,y+9,w,h-9,C.ink);rect(ctx,x+3,y+12,w-6,h-15,C.stone0);rect(ctx,x+7,y+15,w-14,h-22,'#294651');rect(ctx,x+10,y+17,w-20,3,C.blue);for(let i=0;i<5;i++)rect(ctx,x+11+i*12,y+20+(i%2),8,1,'rgba(190,231,240,.28)');rect(ctx,x+5,y+h-6,6,6,C.wood0);rect(ctx,x+w-11,y+h-6,6,6,C.wood0);break;
      case 'anvil':
        shadow(ctx,x,y+h,w);poly(ctx,[[x+2,y+8],[x+w-8,y+8],[x+w-2,y+14],[x+w-14,y+19],[x+12,y+19],[x+5,y+15]],C.ink);poly(ctx,[[x+5,y+9],[x+w-10,y+9],[x+w-5,y+13],[x+w-15,y+17],[x+13,y+17],[x+7,y+14]],C.stone2);rect(ctx,x+w/2-6,y+18,12,h-23,C.stone0);rect(ctx,x+w/2-11,y+h-8,22,7,C.stone1);line(ctx,x+9,y+11,x+w-12,y+11,'rgba(240,245,238,.35)',2);break;
      case 'weaponrack':
        shadow(ctx,x,y+h,w);rect(ctx,x+3,y+2,w-6,h-4,C.wood0);rect(ctx,x+7,y+6,w-14,h-12,C.wood1);rect(ctx,x+7,y+18,w-14,4,C.wood3);rect(ctx,x+7,y+h-20,w-14,4,C.wood3);for(let i=0;i<4;i++){const xx=x+12+i*12;rect(ctx,xx,y+8,3,h-20,i%2?C.stone2:C.wood4);if(i%2===0)poly(ctx,[[xx-4,y+8],[xx+7,y+8],[xx+2,y+2]],C.stone2);else rect(ctx,xx-4,y+6,11,3,C.stone1);}outline(ctx,x+3,y+2,w-6,h-4);break;
      case 'relic_pedestal':
        shadow(ctx,x,y+h,w);rect(ctx,x+10,y+35,w-20,h-35,C.stone0);rect(ctx,x+6,y+31,w-12,7,C.stone2);rect(ctx,x+4,y+h-8,w-8,8,C.stone1);glow(ctx,x+w/2,y+20,30,'130,210,235');ctx.strokeStyle=C.blue;ctx.lineWidth=3;ctx.beginPath();ctx.arc(x+w/2,y+17,11,0,Math.PI*2);ctx.stroke();ctx.strokeStyle=C.gold1;ctx.lineWidth=1;ctx.beginPath();ctx.arc(x+w/2,y+17,15,0,Math.PI*2);ctx.stroke();px(ctx,x+w/2-1,y+16,'#d8fbff');break;
      case 'reading_table':
        table(ctx,x,y,w,h);rect(ctx,x+8,y+3,24,14,C.parchment);line(ctx,x+20,y+4,x+20,y+16,C.gold0);rect(ctx,x+38,y+5,23,11,C.cloth2);for(let i=0;i<4;i++)line(ctx,x+41,y+8+i*2,x+58,y+8+i*2,'rgba(220,224,207,.28)');rect(ctx,x+w-14,y+2,7,13,C.violet);rect(ctx,x+w-12,y,3,4,C.gold1);break;
      case 'lantern_statue':
        shadow(ctx,x,y+h,w);rect(ctx,x+11,y+29,w-22,h-29,C.stone0);rect(ctx,x+6,y+h-11,w-12,11,C.stone1);rect(ctx,x+16,y+10,16,25,C.stone2);rect(ctx,x+12,y+14,24,11,C.stone2);rect(ctx,x+14,y+5,20,12,C.stone1);lantern(ctx,x+w/2-8,y+12,.75);rect(ctx,x+4,y+h-15,w-8,4,C.gold0);break;
      case 'lectern':
        shadow(ctx,x,y+h,w);rect(ctx,x+w/2-5,y+20,10,h-20,C.wood0);rect(ctx,x+w/2-12,y+h-8,24,8,C.wood1);poly(ctx,[[x+4,y+9],[x+w-4,y+3],[x+w-1,y+20],[x+7,y+24]],C.wood2);rect(ctx,x+8,y+7,w-16,13,C.parchment);line(ctx,x+w/2,y+8,x+w/2,y+19,C.gold0);outline(ctx,x+4,y+4,w-8,20);break;
      case 'offering_table':
        table(ctx,x,y,w,h);rect(ctx,x+7,y+2,13,7,C.parchment);rect(ctx,x+24,y+4,10,8,C.cloth2);rect(ctx,x+40,y+3,9,9,C.wood3);for(let i=0;i<5;i++)px(ctx,x+54+i*3,y+7,C.gold1);lantern(ctx,x+w-18,y-3,.55);break;
    }
    ctx.restore();return true;
  }

  const base=AO.ThousandfoldArt.drawEntity.bind(AO.ThousandfoldArt);
  AO.ThousandfoldArt.drawEntity=function(ctx,e,mapId,time){
    if(drawDetail(ctx,e,mapId,time))return true;
    return base(ctx,e,mapId,time);
  };
  AO.HavenDetailArt={version:'v163',handled:[...handled],drawEntity:drawDetail};
})();
