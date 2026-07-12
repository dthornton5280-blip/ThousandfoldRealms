/* Procedural pixel sprites. All coordinates are authored in a 32×32 logical tile. */
AO.SpriteFactory = {
  rect(ctx,x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));},
  tone(hex,amount=0){
    if(!hex||hex[0]!=='#'||hex.length<7)return hex||'#777777';
    const n=parseInt(hex.slice(1,7),16),r=Math.max(0,Math.min(255,(n>>16)+amount)),g=Math.max(0,Math.min(255,((n>>8)&255)+amount)),b=Math.max(0,Math.min(255,(n&255)+amount));
    return `#${((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}`;
  },
  sizeFactor(r={}){return({small:.72,short:.84,medium:1,tall:1.08,large:1.18,giant:1.30})[r.size]||1;},
  withCharacterTransform(ctx,x,y,r,scale,fn){
    const S=scale,f=this.sizeFactor(r);ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(x+16*S,y+30*S);ctx.scale(S*f,S*f);ctx.translate(-16,-30);fn();ctx.restore();
  },
  character(ctx,x,y,raceVisual,classVisual,scale=1,options={}){
    const r=raceVisual||{},c=classVisual||{},S=scale,f=this.sizeFactor(r),shadowW=(r.size==='giant'?27:r.size==='large'?24:r.size==='small'?15:20)*S;
    ctx.save();ctx.imageSmoothingEnabled=false;
    this.rect(ctx,x+16*S-shadowW/2,y+27*S,shadowW,4*S,'rgba(0,0,0,.42)');
    ctx.restore();
    this.withCharacterTransform(ctx,x,y,r,S,()=>{
      const R=(xx,yy,ww,hh,col)=>this.rect(ctx,xx,yy,ww,hh,col),skin=r.skin||'#c29573',skinD=this.tone(skin,-30),skinL=this.tone(skin,28),hair=r.hair||'#40332c',hairD=this.tone(hair,-28),accent=r.accent||'#b5914f',outfit=c.outfit||r.outfit||'#59616a',trim=c.trim||accent,ink='#17191b';
      const small=['small','short'].includes(r.size),giant=['large','giant'].includes(r.size),dwarf=r.silhouette==='dwarf',gnome=r.silhouette==='gnome',skeleton=r.skeleton||r.silhouette==='skeleton',dragon=['dragon','kobold'].includes(r.silhouette),undead=r.undead;
      const frame=r.frame||'standard',bodyW=(frame==='slim'?13:frame==='heavy'?21:17)+(giant?2:0)+(dwarf?2:0),bodyX=16-Math.floor(bodyW/2),legY=dwarf||small?21:20,bodyY=dwarf?11:10,bodyH=dwarf?12:13,headY=small?4:4,headW=gnome?12:dragon?11:10,headH=gnome?10:9,headX=16-Math.floor(headW/2);

      /* rear silhouette: tails, wings, cloaks */
      if(r.wings){R(3,8,8,12,ink);R(4,9,6,9,this.tone(accent,-20));R(23,8,8,12,ink);R(24,9,6,9,this.tone(accent,-20));R(5,11,4,2,skinL);R(25,11,4,2,skinL);}
      if(r.tail){const tailCol=dragon?skin:accent;R(23,20,7,4,ink);R(25,19,5,3,tailCol);R(28,17,3,4,ink);R(29,17,2,3,tailCol);if(r.tail==='spade'){R(29,14,3,4,ink);R(29,15,2,2,accent);}}
      if(r.silhouette==='giant'){R(4,10,5,12,ink);R(5,11,4,10,outfit);R(25,10,5,12,ink);R(25,11,4,10,outfit);}

      if(skeleton){
        const bone=skin,shade=this.tone(bone,-35);R(12,4,10,9,ink);R(13,4,8,8,bone);R(14,6,2,2,ink);R(19,6,2,2,ink);R(16,9,3,2,shade);
        R(14,12,7,2,ink);R(15,12,5,11,bone);for(let yy=14;yy<=20;yy+=3){R(10,yy,5,2,bone);R(20,yy,5,2,bone);}R(11,13,2,10,bone);R(23,13,2,10,bone);R(12,22,3,7,bone);R(20,22,3,7,bone);R(15,13,5,2,accent);if(r.runeBones){R(16,16,3,2,r.eye||accent);R(13,24,2,2,r.eye||accent);}
      }else{
        /* boots and legs */
        R(9,legY-1,7,9,ink);R(10,legY,5,7,c.boots||'#303236');R(18,legY-1,7,9,ink);R(19,legY,5,7,c.boots||'#303236');R(9,27,7,2,this.tone(c.boots||'#303236',18));R(18,27,7,2,this.tone(c.boots||'#303236',18));
        /* arms */
        R(bodyX-3,bodyY+2,4,12,ink);R(bodyX-2,bodyY+3,3,10,c.sleeve||outfit);R(bodyX+bodyW-1,bodyY+2,4,12,ink);R(bodyX+bodyW,bodyY+3,3,10,c.sleeve||outfit);
        R(bodyX-2,bodyY+12,3,3,skinD);R(bodyX+bodyW,bodyY+12,3,3,skinD);
        /* torso with outline, belt, highlights */
        R(bodyX-1,bodyY-1,bodyW+2,bodyH+2,ink);R(bodyX,bodyY,bodyW,bodyH,outfit);R(bodyX+1,bodyY+1,3,bodyH-2,this.tone(outfit,18));R(bodyX+bodyW-3,bodyY+2,2,bodyH-3,this.tone(outfit,-22));R(bodyX,bodyY+9,bodyW,3,this.tone(trim,-18));R(bodyX+Math.floor(bodyW/2)-1,bodyY+9,3,3,trim);R(bodyX+2,bodyY+2,2,2,trim);
        if(dwarf){R(bodyX-2,bodyY+1,3,8,trim);R(bodyX+bodyW-1,bodyY+1,3,8,trim);}
        /* neck and head */
        R(14,10,6,4,ink);R(15,10,4,3,skinD);R(headX-1,headY-1,headW+2,headH+2,ink);R(headX,headY,headW,headH,skin);R(headX+1,headY+1,2,headH-2,skinL);R(headX+headW-2,headY+2,1,headH-3,skinD);
        if(dragon&&r.snout){R(13,9,9,5,ink);R(14,9,7,4,skinD);R(19,10,3,2,skinL);}
        /* eyes and face */
        const eye=r.eye||'#232323';R(headX+2,headY+4,2,2,ink);R(headX+headW-4,headY+4,2,2,ink);R(headX+2,headY+4,1,1,eye);R(headX+headW-3,headY+4,1,1,eye);if(r.glowEyes){R(headX+2,headY+3,2,1,eye);R(headX+headW-4,headY+3,2,1,eye);}R(16,headY+7,3,1,skinD);
      }

      /* ears and race anatomy */
      if(!skeleton){
        if(r.ears==='long'){R(headX-4,headY+3,4,3,ink);R(headX-3,headY+3,4,2,skin);R(headX+headW,headY+3,4,3,ink);R(headX+headW-1,headY+3,4,2,skin);}
        if(r.ears==='point'){R(headX-3,headY+4,3,2,skin);R(headX+headW,headY+4,3,2,skin);}
        if(r.ears==='leaf'){R(headX-5,headY+2,5,5,ink);R(headX-4,headY+2,4,4,accent);R(headX+headW,headY+2,5,5,ink);R(headX+headW,headY+2,4,4,accent);}
        if(r.ears==='fin'){R(headX-4,headY+1,4,7,ink);R(headX-3,headY+2,3,5,accent);R(headX+headW,headY+1,4,7,ink);R(headX+headW,headY+2,3,5,accent);}
        if(r.horns){R(10,0,4,6,ink);R(11,0,2,5,this.tone(accent,-40));R(20,0,4,6,ink);R(21,0,2,5,this.tone(accent,-40));if(r.crest){R(15,0,4,4,accent);}}
        if(r.antlers){R(10,-1,3,7,ink);R(11,0,1,6,'#77643e');R(22,-1,3,7,ink);R(23,0,1,6,'#77643e');R(7,0,5,2,'#77643e');R(23,0,5,2,'#77643e');}
        if(r.tusks){R(11,11,3,4,ink);R(12,11,1,3,'#e8dfbd');R(21,11,3,4,ink);R(22,11,1,3,'#e8dfbd');}
      }

      /* hair, hats, beards, racial surface details */
      if(!skeleton){
        const style=r.hairStyle||'natural';
        if(r.hat==='tinker'){R(9,0,16,4,ink);R(10,0,14,3,accent);R(12,-4,10,5,ink);R(13,-3,8,4,this.tone(accent,12));}
        else if(style==='mohawk'||r.crest){R(14,-1,6,5,ink);R(15,-1,4,5,hair);}
        else if(style==='cropped'){R(headX,headY-2,headW,4,ink);R(headX+1,headY-1,headW-2,3,hair);}
        else if(style==='long'){R(headX-1,headY-2,headW+2,5,ink);R(headX,headY-1,headW,4,hair);R(headX-2,headY+2,3,13,ink);R(headX-1,headY+2,2,12,hair);R(headX+headW-1,headY+2,3,13,ink);R(headX+headW-1,headY+2,2,12,hair);}
        else {R(headX-1,headY-2,headW+2,5,ink);R(headX,headY-1,headW,4,hair);if(r.curlyHair){R(headX-2,headY,3,4,hair);R(headX+headW-1,headY,3,4,hair);}}
        if(style==='braided'||r.warBraids){R(headX-2,headY+2,2,12,hairD);R(headX+headW,headY+2,2,12,hairD);R(headX-2,headY+7,2,2,accent);R(headX+headW,headY+7,2,2,accent);}
        if(r.leafHair){R(headX+1,headY-3,4,3,accent);R(headX+headW-4,headY-4,4,4,this.tone(accent,20));}
        if(r.crystalHair){R(headX+2,headY-5,3,5,'#85d6d0');R(headX+headW-5,headY-4,3,4,'#6cb7bb');}
        if(r.beard){R(11,11,12,8,ink);R(12,11,10,7,hair);R(14,17,6,4,hairD);if(r.braids){R(12,15,2,7,hairD);R(20,15,2,7,hairD);R(12,20,2,2,accent);R(20,20,2,2,accent);}}
        if(r.goggles){R(10,7,14,4,ink);R(11,7,5,3,'#6fc0cd');R(18,7,5,3,'#6fc0cd');R(16,8,2,1,accent);}
        if(r.scales){for(const [sx,sy] of [[12,6],[20,8],[10,13],[23,15]]){R(sx,sy,2,2,this.tone(accent,12));R(sx+1,sy,1,1,this.tone(accent,40));}}
        if(r.bark){R(12,7,1,5,this.tone(skin,-35));R(21,12,1,5,this.tone(skin,-35));}
        if(r.undead){R(12,9,3,1,this.tone(skin,-45));R(21,5,2,3,this.tone(skin,-35));}
        if(r.stitches){R(11,10,5,1,ink);R(13,9,1,3,ink);}
        if(r.darkVeins){R(13,9,1,3,this.tone(accent,-20));R(21,8,1,3,this.tone(accent,-20));}
        if(r.soot){R(19,8,2,2,'rgba(35,28,25,.55)');R(12,14,3,2,'rgba(35,28,25,.45)');}
        if(r.iceCrystals){R(9,2,3,4,'#9adcec');R(22,1,3,5,'#b4edf4');}
        if(r.giantRunes){R(8,13,3,2,'#8ab0b8');R(24,13,2,4,'#8ab0b8');}
        if(r.crownMark){R(14,6,1,1,'#fff0a2');R(18,5,1,1,'#fff0a2');}
        if(r.freckles||r.mark==='freckles'){R(13,9,1,1,skinD);R(20,9,1,1,skinD);}
      }
      if(r.mark==='scar')R(15,6,6,1,'#6f3434');
      if(r.mark==='paint'){R(11,8,12,2,accent);R(16,10,2,3,accent);}
      if(r.mark==='runes'){R(9,13,2,2,r.eye||accent);R(23,16,2,2,r.eye||accent);R(15,18,4,1,r.eye||accent);}

      /* weapons */
      const weapon=c.weapon;
      if(weapon==='sword'){R(25,9,4,18,ink);R(26,9,2,16,'#b8c0c0');R(22,18,9,3,ink);R(23,19,7,1,'#c7a056');}
      if(weapon==='mace'){R(25,12,4,15,ink);R(26,13,2,13,'#806f55');R(21,7,11,8,ink);R(22,8,9,6,'#969d9d');}
      if(weapon==='axe'){R(25,10,4,18,ink);R(26,11,2,16,'#75573b');R(20,7,12,9,ink);R(21,8,10,7,'#9ba1a1');}
      if(weapon==='staff'){R(26,4,4,25,ink);R(27,5,2,23,'#74553a');R(22,1,12,10,ink);R(23,2,10,8,trim);R(26,3,4,4,r.eye||'#b5e4f4');}
      if(weapon==='bow'){ctx.strokeStyle=ink;ctx.lineWidth=3;ctx.beginPath();ctx.arc(25,16,9,-Math.PI/2,Math.PI/2);ctx.stroke();ctx.strokeStyle='#9a7443';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(25,16,8,-Math.PI/2,Math.PI/2);ctx.stroke();R(25,7,1,18,'#d1c7aa');}
      if(weapon==='daggers'){R(4,13,5,12,ink);R(5,14,3,10,'#c4cccc');R(25,13,5,12,ink);R(26,14,3,10,'#c4cccc');}
      if(options.selected){ctx.strokeStyle='#e4bd63';ctx.lineWidth=1.5;ctx.strokeRect(2,1,29,29);}
    });
  },
  enemy(ctx,x,y,visual,scale=1){
    const v=visual||{},S=scale;ctx.save();ctx.imageSmoothingEnabled=false;this.rect(ctx,x+5*S,y+26*S,22*S,4*S,'rgba(0,0,0,.4)');
    if(v.kind==='mireling'){this.rect(ctx,x+4*S,y+13*S,25*S,14*S,'#17191b');this.rect(ctx,x+5*S,y+14*S,23*S,12*S,v.body);this.rect(ctx,x+8*S,y+7*S,17*S,12*S,'#17191b');this.rect(ctx,x+9*S,y+8*S,15*S,10*S,v.body);this.rect(ctx,x+11*S,y+11*S,3*S,3*S,'#d8e073');this.rect(ctx,x+20*S,y+11*S,3*S,3*S,'#d8e073');this.rect(ctx,x+3*S,y+20*S,6*S,5*S,v.accent);this.rect(ctx,x+25*S,y+20*S,6*S,5*S,v.accent);this.rect(ctx,x+12*S,y+17*S,10*S,2*S,this.tone(v.body,-25));}
    else if(v.kind==='skeleton'){this.rect(ctx,x+12*S,y+3*S,11*S,10*S,'#17191b');this.rect(ctx,x+13*S,y+4*S,9*S,8*S,v.body);this.rect(ctx,x+15*S,y+12*S,5*S,12*S,v.body);this.rect(ctx,x+8*S,y+14*S,7*S,3*S,v.body);this.rect(ctx,x+20*S,y+14*S,7*S,3*S,v.body);this.rect(ctx,x+13*S,y+23*S,3*S,6*S,v.body);this.rect(ctx,x+20*S,y+23*S,3*S,6*S,v.body);this.rect(ctx,x+14*S,y+7*S,2*S,2*S,'#1a1716');this.rect(ctx,x+20*S,y+7*S,2*S,2*S,'#1a1716');}
    else if(v.kind==='golem'){this.rect(ctx,x+4*S,y+8*S,26*S,19*S,'#17191b');this.rect(ctx,x+5*S,y+9*S,24*S,17*S,v.body);this.rect(ctx,x+9*S,y+1*S,16*S,12*S,'#17191b');this.rect(ctx,x+10*S,y+2*S,14*S,10*S,v.body);this.rect(ctx,x+1*S,y+13*S,7*S,13*S,v.body);this.rect(ctx,x+27*S,y+13*S,7*S,13*S,v.body);this.rect(ctx,x+13*S,y+13*S,8*S,8*S,v.core||v.accent);this.rect(ctx,x+15*S,y+15*S,4*S,4*S,'#ffd17a');}
    else this.character(ctx,x,y,{silhouette:v.silhouette||'human',size:v.size||'medium',skin:v.skin||'#ad8062',hair:'#302724',horns:v.horns,accent:v.accent,eye:v.eye,undead:v.undead,scales:v.scales,snout:v.snout,tail:v.tail},{outfit:v.body||'#584843',trim:v.accent,weapon:v.weapon},S);ctx.restore();
  },
  npc(ctx,x,y,v,scale=1,options={}){const bob=options.idleFrame?1:0;this.character(ctx,x,y-bob,{silhouette:v.silhouette||'human',size:v.size||'medium',skin:v.skin,hair:v.hair,eye:v.eye,ears:v.ears,beard:v.beard,horns:v.horns,scales:v.scales,undead:v.undead,accent:v.accent},{outfit:v.outfit,trim:v.accent,weapon:v.weapon},scale,options);},
  icon(ctx,x,y,type,entity={}){
    if(AO.Assets?.drawIcon(ctx,x,y,type,entity))return;
    if(type==='chest'){this.rect(ctx,x+5,y+12,22,15,'#2a1d14');this.rect(ctx,x+6,y+13,20,13,'#744b27');this.rect(ctx,x+6,y+7,20,10,'#2a1d14');this.rect(ctx,x+7,y+8,18,8,'#966538');this.rect(ctx,x+14,y+14,5,6,'#d7ad4f');this.rect(ctx,x+9,y+10,12,1,'#c38a4e');}
    if(type==='resource'){const color=entity.resource==='dusk_bloom'?'#a875b7':entity.resource==='iron_ore'?'#7d8588':entity.resource==='ember_crystal'?'#dc7a42':'#87a95f';this.rect(ctx,x+14,y+13,5,15,'#263a24');this.rect(ctx,x+15,y+13,3,14,'#4c6e3d');this.rect(ctx,x+7,y+9,11,8,this.tone(color,-25));this.rect(ctx,x+8,y+10,9,6,color);this.rect(ctx,x+16,y+5,10,10,this.tone(color,-25));this.rect(ctx,x+17,y+6,8,8,color);this.rect(ctx,x+19,y+7,3,2,this.tone(color,35));}
    if(type==='sign'){this.rect(ctx,x+13,y+9,6,20,'#2a1c13');this.rect(ctx,x+14,y+10,4,18,'#6c4a2e');this.rect(ctx,x+4,y+4,25,14,'#2a1c13');this.rect(ctx,x+5,y+5,23,12,'#8d653d');this.rect(ctx,x+8,y+8,16,2,'#b58a56');}
    if(type==='portal'){this.rect(ctx,x+10,y+4,12,24,'#292e32');this.rect(ctx,x+11,y+5,10,22,'#5f6d77');this.rect(ctx,x+13,y+7,6,18,'#9cc4d5');this.rect(ctx,x+14,y+8,4,16,'rgba(183,235,255,.7)');}
    if(type==='door'){const open=entity.open;this.rect(ctx,x+4,y+2,24,29,'#211914');this.rect(ctx,x+5,y+3,22,27,open?'#45352d':'#6e4b34');this.rect(ctx,x+8,y+6,16,22,open?'#1d2023':'#8b6240');if(!open){this.rect(ctx,x+10,y+8,12,2,'#a77a4d');this.rect(ctx,x+21,y+16,3,3,'#d6b45e');}}
    if(type==='camp'){this.rect(ctx,x+5,y+22,22,6,'#2c2118');this.rect(ctx,x+6,y+23,20,4,'#5d4630');this.rect(ctx,x+10,y+14,12,11,'#5d271c');this.rect(ctx,x+11,y+15,10,9,'#d35f35');this.rect(ctx,x+14,y+10,4,8,'#f4b24c');this.rect(ctx,x+15,y+8,2,5,'#ffe38b');}
    if(type==='decor')this.decor(ctx,x,y,entity.kind);
  },
  decor(ctx,x,y,kind){
    const r=this.rect.bind(this,ctx);
    if(kind==='fountain'){r(x+4,y+17,24,10,'#393e40');r(x+5,y+18,22,8,'#777f80');r(x+8,y+9,16,11,'#334d56');r(x+9,y+10,14,9,'#4d7581');r(x+14,y+3,4,10,'#929a98');r(x+11,y+6,10,3,'#8ec0cf');r(x+7,y+15,18,2,'#a8d5de');}
    else if(kind==='stall'){r(x+3,y+11,26,16,'#302116');r(x+4,y+12,24,14,'#6d4a32');r(x+1,y+5,30,10,'#35211f');r(x+2,y+6,28,8,'#8b4e45');r(x+5,y+3,22,4,'#d2b16a');r(x+7,y+8,4,2,'#d9c27b');r(x+18,y+8,5,2,'#d9c27b');}
    else if(kind==='bench'||kind==='pew'){r(x+3,y+11,26,9,'#302116');r(x+4,y+12,24,7,'#755238');r(x+7,y+19,4,9,'#4d3929');r(x+21,y+19,4,9,'#4d3929');r(x+6,y+14,20,1,'#a97a4c');}
    else if(kind==='lamp'||kind==='brazier'){r(x+13,y+9,6,20,'#28231e');r(x+14,y+10,4,18,'#5c5042');r(x+8,y+4,16,12,'#342719');r(x+9,y+5,14,10,'#a36c35');r(x+12,y+6,8,7,'#e6b04e');r(x+14,y+6,4,5,'#fff0a0');}
    else if(kind==='flowers'||kind==='herbs'){r(x+14,y+14,3,14,'#48663f');r(x+7,y+9,10,7,'#a96685');r(x+17,y+6,9,9,'#c991a8');r(x+10,y+11,3,2,'#f2d981');r(x+20,y+8,3,2,'#f1e1b0');}
    else if(kind==='counter'||kind==='bar'){r(x+2,y+11,28,16,'#302116');r(x+3,y+12,26,14,'#6d4a32');r(x+2,y+9,28,5,'#9a6e45');r(x+5,y+11,22,1,'#c59158');}
    else if(kind==='table'){r(x+4,y+10,24,12,'#302116');r(x+5,y+11,22,10,'#765136');r(x+8,y+21,4,8,'#4c3829');r(x+21,y+21,4,8,'#4c3829');r(x+8,y+13,16,1,'#a97b4d');}
    else if(kind==='fireplace'||kind==='forge'){r(x+3,y+4,26,25,'#222425');r(x+4,y+5,24,23,'#4b4c4b');r(x+8,y+11,16,14,'#2c2623');r(x+11,y+14,10,10,kind==='forge'?'#e15e32':'#c67b3e');r(x+14,y+10,4,8,'#f0b54f');r(x+15,y+9,2,5,'#ffe18a');}
    else if(kind==='bed'){r(x+2,y+7,28,20,'#2d2017');r(x+3,y+8,26,18,'#6c4b35');r(x+6,y+10,20,7,'#d7d0bc');r(x+7,y+17,19,7,'#63788b');r(x+9,y+18,15,1,'#8fa4b1');}
    else if(kind==='stage'){r(x+1,y+16,30,12,'#2d2017');r(x+2,y+17,28,10,'#70503a');r(x+5,y+6,22,11,'#5b3d36');r(x+7,y+8,18,2,'#a66e59');}
    else if(kind==='keg'){r(x+7,y+4,18,25,'#302116');r(x+8,y+5,16,23,'#7b5433');r(x+7,y+9,18,3,'#a5a09a');r(x+7,y+21,18,3,'#a5a09a');r(x+11,y+6,2,17,'#9f6d3f');}
    else if(kind==='crates'){r(x+3,y+11,16,16,'#2d2017');r(x+4,y+12,14,14,'#785334');r(x+15,y+6,14,21,'#2d2017');r(x+16,y+7,12,19,'#8b613a');r(x+5,y+13,12,2,'#a97a49');r(x+17,y+9,10,2,'#b27f4b');}
    else if(kind==='shelf'){r(x+4,y+2,24,28,'#302116');r(x+5,y+3,22,26,'#5a4030');for(let yy=7;yy<27;yy+=7){r(x+7,y+yy,18,2,'#8a633e');r(x+8,y+yy-5,4,5,'#7d915e');r(x+15,y+yy-4,4,4,'#9e6a50');r(x+21,y+yy-5,3,5,'#7189a0');}}
    else if(kind==='anvil'){r(x+6,y+9,20,9,'#252829');r(x+7,y+10,18,7,'#858b8d');r(x+11,y+17,10,7,'#5e6365');r(x+8,y+24,16,4,'#3e4244');r(x+9,y+11,13,2,'#adb3b3');}
    else if(kind==='weaponrack'){r(x+4,y+3,24,26,'#302116');r(x+5,y+4,22,24,'#5f432f');r(x+10,y+5,2,18,'#aeb5b5');r(x+20,y+6,3,18,'#89633d');r(x+7,y+12,18,2,'#8d653e');}
    else if(kind==='crystal'||kind==='orb'){r(x+11,y+4,10,20,'#24434c');r(x+12,y+5,8,18,'#79b9ce');r(x+8,y+11,16,10,'rgba(123,202,224,.45)');r(x+15,y+6,2,10,'#c9f6ff');}
    else if(kind==='altar'){r(x+4,y+14,24,14,'#373633');r(x+5,y+15,22,12,'#77736c');r(x+10,y+7,12,10,'#d0aa58');r(x+14,y+9,4,5,'#fff0aa');}
    else if(kind==='cart'||kind==='minecart'){r(x+3,y+9,26,15,'#302116');r(x+4,y+10,24,13,'#674a34');r(x+6,y+23,6,6,'#292b2c');r(x+21,y+23,6,6,'#292b2c');r(x+6,y+12,20,2,'#96704c');}
    else if(kind==='beam'){r(x+4,y+3,6,27,'#302116');r(x+5,y+4,4,25,'#5c4430');r(x+22,y+3,6,27,'#302116');r(x+23,y+4,4,25,'#5c4430');r(x+4,y+3,24,6,'#302116');r(x+5,y+4,22,4,'#7b5a3a');}
    else if(kind==='statue'){r(x+9,y+4,14,20,'#343838');r(x+10,y+5,12,18,'#6c7273');r(x+7,y+23,18,6,'#565b5c');r(x+13,y+8,6,2,'#929a9a');}
    else if(kind==='sarcophagus'){r(x+3,y+7,26,20,'#343536');r(x+4,y+8,24,18,'#656769');r(x+7,y+11,18,12,'#777a7b');r(x+11,y+13,10,2,'#9a9d9d');}
    else r(x+7,y+7,18,20,'#6e5b44');
  }
};
