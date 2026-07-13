/* Thousandfold Realms v1.6.2-dev — dedicated dialogue bust portraits. */
(() => {
  'use strict';
  if(!window.AO)return;

  const tone=(hex,amount=0)=>{
    if(!hex||hex[0]!=='#'||hex.length<7)return hex||'#777777';
    const n=parseInt(hex.slice(1,7),16),r=Math.max(0,Math.min(255,(n>>16)+amount)),g=Math.max(0,Math.min(255,((n>>8)&255)+amount)),b=Math.max(0,Math.min(255,(n&255)+amount));
    return `#${((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}`;
  };
  const rect=(ctx,x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
  const line=(ctx,x1,y1,x2,y2,color,width=2)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(Math.round(x1)+.5,Math.round(y1)+.5);ctx.lineTo(Math.round(x2)+.5,Math.round(y2)+.5);ctx.stroke();};

  const roleFor=visual=>String(visual?.artFrames?.[0]||visual?.portraitRole||'resident').toLowerCase();

  const draw=(ctx,visual)=>{
    if(!ctx||!visual)return false;
    const w=ctx.canvas?.width||160,h=ctx.canvas?.height||220,role=roleFor(visual);
    const ink='#15181a',deep='#0d1113',frame='#343a3d',skin=visual.skin||'#b98664',skinDark=tone(skin,-34),skinLight=tone(skin,26),hair=visual.hair||'#493126',hairDark=tone(hair,-30),outfit=role.includes('server')?'#d4c9b5':role.includes('bard')?'#4f694e':role.includes('patron')?'#5b4b40':visual.outfit||'#665043',outfitDark=tone(outfit,-30),accent=visual.accent||'#c9a35a';

    ctx.save();ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,w,h);
    rect(ctx,0,0,w,h,deep);
    rect(ctx,6,6,w-12,h-12,'#111619');
    rect(ctx,10,10,w-20,h-20,'#182024');
    for(let y=15;y<h-15;y+=16)rect(ctx,14,y,w-28,1,'rgba(215,185,120,.035)');
    rect(ctx,10,h-42,w-20,32,'#121719');
    rect(ctx,10,h-42,w-20,2,tone(accent,-35));

    /* Shoulders and torso form a proper portrait crop rather than a scaled world sprite. */
    rect(ctx,25,119,110,92,ink);
    rect(ctx,30,122,100,89,outfitDark);
    rect(ctx,38,116,84,95,outfit);
    rect(ctx,42,121,8,84,tone(outfit,18));
    rect(ctx,111,124,7,81,tone(outfit,-22));
    rect(ctx,38,132,84,8,tone(accent,-22));
    rect(ctx,72,132,16,10,accent);
    rect(ctx,67,105,26,22,ink);
    rect(ctx,71,107,18,20,skinDark);

    /* Head, ears, hair, and face. */
    const hx=46,hy=36,hw=68,hh=76;
    if(visual.ears==='long'){
      rect(ctx,hx-18,hy+28,20,16,ink);rect(ctx,hx-15,hy+30,18,12,skinDark);
      rect(ctx,hx+hw-2,hy+28,20,16,ink);rect(ctx,hx+hw-3,hy+30,18,12,skinDark);
    }
    rect(ctx,hx-4,hy-4,hw+8,hh+8,ink);
    rect(ctx,hx,hy,hw,hh,skin);
    rect(ctx,hx+5,hy+7,10,hh-14,skinLight);
    rect(ctx,hx+hw-12,hy+10,8,hh-18,skinDark);
    rect(ctx,hx-5,hy-5,hw+10,22,ink);
    rect(ctx,hx-1,hy-2,hw+2,19,hair);
    rect(ctx,hx-7,hy+8,12,38,ink);rect(ctx,hx-3,hy+10,8,34,hairDark);
    rect(ctx,hx+hw-5,hy+8,12,38,ink);rect(ctx,hx+hw-5,hy+10,8,34,hairDark);

    if(visual.beard||role.includes('tavernkeeper')){
      rect(ctx,hx+11,hy+53,46,30,ink);
      rect(ctx,hx+15,hy+54,38,25,hair);
      rect(ctx,hx+24,hy+76,20,13,hairDark);
    }

    rect(ctx,hx+14,hy+34,12,8,ink);rect(ctx,hx+42,hy+34,12,8,ink);
    rect(ctx,hx+17,hy+36,6,4,visual.eye||'#252729');rect(ctx,hx+45,hy+36,6,4,visual.eye||'#252729');
    rect(ctx,hx+31,hy+45,7,4,skinDark);
    rect(ctx,hx+25,hy+58,18,4,tone(skin,-44));
    rect(ctx,hx+28,hy+58,12,2,skinLight);

    /* Role cues stay inside the bust composition instead of exploding beyond the canvas. */
    if(role.includes('bard')){
      ctx.strokeStyle=tone(accent,-10);ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(121,157,22,29,0,0,Math.PI*2);ctx.stroke();
      rect(ctx,117,126,6,61,tone('#765033',-10));line(ctx,103,132,134,190,tone('#765033',8),3);
      for(let y=139;y<178;y+=8)line(ctx,116,y,128,y+3,'rgba(235,214,163,.72)',1);
    }else if(role.includes('server')){
      rect(ctx,103,154,37,5,'#8d9492');rect(ctx,108,145,27,9,'#d7c6a4');rect(ctx,115,139,13,6,accent);
    }else if(role.includes('tavernkeeper')){
      rect(ctx,108,155,27,34,ink);rect(ctx,112,158,19,27,'#70513a');rect(ctx,131,161,12,6,accent);
    }else if(role.includes('smith')||visual.beard){
      rect(ctx,29,145,18,48,'#565d5f');rect(ctx,31,148,14,8,'#899092');
      for(let y=160;y<190;y+=9)rect(ctx,34,y,8,3,tone(accent,-20));
    }

    /* Subtle inner frame keeps pale hair and ears from disappearing into the panel. */
    ctx.strokeStyle=frame;ctx.lineWidth=2;ctx.strokeRect(10.5,10.5,w-21,h-21);
    ctx.strokeStyle=tone(accent,-38);ctx.lineWidth=1;ctx.strokeRect(14.5,14.5,w-29,h-29);
    ctx.restore();return true;
  };

  AO.ThousandfoldPortraits={source:'dialogue-bust-v162',draw};

  if(AO.UI?.prototype?.dialogue){
    const baseDialogue=AO.UI.prototype.dialogue;
    AO.UI.prototype.dialogue=function(speaker,text,choices,visual=null,title='Conversation'){
      baseDialogue.call(this,speaker,text,choices,visual,title);
      if(visual&&this.e?.dialoguePortrait){
        const ctx=this.e.dialoguePortrait.getContext('2d');
        AO.ThousandfoldPortraits.draw(ctx,visual);
      }
    };
  }
})();