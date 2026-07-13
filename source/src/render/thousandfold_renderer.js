/* Thousandfold Realms v1.6.5-dev — generated sprite atlas vertical slice.
   Loads a compact project-owned atlas and falls back to the established procedural
   renderer until the atlas is ready or whenever an asset is unavailable. */
(() => {
  'use strict';
  if(!window.AO||!AO.Renderer||!AO.SpriteFactory)return;

  const TILE=32;
  const ATLAS_CHUNKS=Array.from({length:6},(_,index)=>`assets/thousandfold/generated/generated-proof-atlas.part${String(index).padStart(2,'0')}.b64`);
  const SPRITES={
    haven_tree_deciduous_green:{x:4,y:4,w:96,h:112,anchor:'bottomCenter'},
    haven_tree_evergreen:{x:104,y:4,w:80,h:112,anchor:'bottomCenter'},
    haven_tree_autumn:{x:188,y:4,w:96,h:112,anchor:'bottomCenter'},
    haven_bush_round_green:{x:288,y:4,w:64,h:48,anchor:'bottomCenter'},
    haven_lamppost_hanging_lantern:{x:356,y:4,w:40,h:96,anchor:'bottomCenter'},
    haven_well_stone_roofed:{x:400,y:4,w:64,h:64,anchor:'topLeft'},
    haven_market_stall_green_awning:{x:4,y:120,w:80,h:64,anchor:'topLeft'},
    haven_tavern_exterior:{x:88,y:120,w:256,h:160,anchor:'topLeft'},
    tavern_fireplace_stone:{x:348,y:120,w:64,h:64,anchor:'topLeft'}
  };

  const GeneratedArt={
    image:null,ready:false,failed:false,loading:false,
    async init(){
      if(this.ready||this.loading)return;
      this.loading=true;
      try{
        const responses=await Promise.all(ATLAS_CHUNKS.map(path=>fetch(path,{cache:'force-cache'})));
        for(const response of responses)if(!response.ok)throw new Error(`atlas chunk ${response.status}`);
        const base64=(await Promise.all(responses.map(response=>response.text()))).join('').replace(/\s+/g,'');
        const image=new Image();
        image.decoding='async';
        image.onload=()=>{
          this.image=image;this.ready=true;this.failed=false;this.loading=false;
          AO.events?.emit?.('assetsReady');AO.events?.emit?.('worldChanged');
        };
        image.onerror=()=>this.fail();
        image.src=`data:image/png;base64,${base64}`;
      }catch(error){
        this.fail(error);
      }
    },
    fail(error){
      this.failed=true;this.loading=false;
      console.warn('Thousandfold Realms generated sprite atlas failed to load; procedural fallback remains active.',error||'');
    },
    sprite(id){return SPRITES[id]||null;},
    glow(ctx,cx,cy,r){
      if(!ctx.createRadialGradient)return;
      const g=ctx.createRadialGradient(cx,cy,2,cx,cy,r);
      g.addColorStop(0,'rgba(255,207,104,.25)');
      g.addColorStop(1,'rgba(255,178,55,0)');
      ctx.fillStyle=g;ctx.fillRect(cx-r,cy-r,r*2,r*2);
    },
    origin(entity,sprite){
      const w=entity.generatedArtW||sprite.w,h=entity.generatedArtH||sprite.h;
      const anchor=entity.generatedArtAnchor||entity.artAnchor||sprite.anchor;
      if(anchor==='topLeft')return{x:entity.x*TILE,y:entity.y*TILE,w,h};
      return{x:entity.x*TILE+TILE/2-w/2,y:entity.y*TILE+TILE-h,w,h};
    },
    drawSprite(ctx,id,dx,dy,dw,dh){
      const sprite=this.sprite(id);
      if(!this.ready||!this.image||!sprite)return false;
      ctx.save();ctx.imageSmoothingEnabled=false;
      ctx.drawImage(this.image,sprite.x,sprite.y,sprite.w,sprite.h,
        Math.round(dx),Math.round(dy),Math.round(dw),Math.round(dh));
      ctx.restore();return true;
    },
    drawEntity(ctx,entity){
      const id=entity.generatedArtId,sprite=this.sprite(id);
      if(!id||!sprite||!this.ready)return false;
      const o=this.origin(entity,sprite);
      if(entity.artLight)this.glow(ctx,o.x+o.w/2,o.y+o.h*.48,entity.artLight);
      return this.drawSprite(ctx,id,o.x,o.y,o.w,o.h);
    },
    drawDoorOverlay(ctx,building,world,dx,dy){
      const frame=building.doorFrame||{x:3.48,y:3.17,w:1.08,h:1.75};
      const x=Math.round(dx+frame.x*TILE),y=Math.round(dy+frame.y*TILE);
      const w=Math.round(frame.w*TILE),h=Math.round(frame.h*TILE);
      const door=world?.entities?.find(entity=>entity.id===building.doorId);
      ctx.save();ctx.imageSmoothingEnabled=false;
      ctx.fillStyle='#171617';ctx.fillRect(x-2,y-3,w+4,h+4);
      if(door?.open){
        ctx.fillStyle='#080a0b';ctx.fillRect(x,y,w,h);
        ctx.fillStyle='#6b422b';ctx.fillRect(x+w-7,y+3,6,h-6);
        ctx.fillStyle='#c99b4b';ctx.fillRect(x+w-6,y+h/2,2,2);
      }else{
        ctx.fillStyle='#4b2d20';ctx.fillRect(x,y,w,h);
        ctx.fillStyle='#7d4b2c';ctx.fillRect(x+3,y+3,w-6,h-6);
        ctx.fillStyle='#352119';ctx.fillRect(x+5,y+10,w-10,2);
        ctx.fillRect(x+5,y+Math.round(h*.62),w-10,2);
        ctx.fillStyle='#d4a44f';ctx.fillRect(x+w-8,y+Math.round(h*.52),3,3);
      }
      ctx.restore();
    },
    drawBuilding(ctx,building,world){
      const id=building.generatedArtId,sprite=this.sprite(id);
      if(!id||!sprite||!this.ready)return false;
      const dx=building.x*TILE,dy=building.y*TILE;
      const dw=(building.w||8)*TILE,dh=(building.h||5)*TILE;
      this.drawSprite(ctx,id,dx,dy,dw,dh);
      this.drawDoorOverlay(ctx,building,world,dx,dy);
      return true;
    }
  };
  AO.GeneratedSpriteArt=GeneratedArt;

  function patchGeneratedContent(){
    if(AO.GeneratedSpriteContent?.installed)return;
    const map=id=>AO.MAP_DEFS?.[id];
    const by=(mapId,id)=>map(mapId)?.objects?.find(entry=>entry.id===id);
    const patch=(mapId,id,generatedArtId)=>{
      const target=by(mapId,id);if(target)target.generatedArtId=generatedArtId;
    };
    for(const id of ['lamp_1','lamp_2','lamp_3','lamp_4'])
      patch('haven',id,'haven_lamppost_hanging_lantern');
    for(const id of ['market_stall_1','market_stall_2'])
      patch('haven',id,'haven_market_stall_green_awning');
    patch('haven','haven_well','haven_well_stone_roofed');
    patch('tavern','tavern_fire','tavern_fireplace_stone');

    const tavern=map('haven')?.buildings?.find(building=>building.id==='haven_tavern');
    if(tavern)tavern.generatedArtId='haven_tavern_exterior';

    const generatedScenery=[
      {id:'generated_tree_green',x:3,y:2,generatedArtId:'haven_tree_deciduous_green'},
      {id:'generated_tree_evergreen',x:12,y:2,generatedArtId:'haven_tree_evergreen'},
      {id:'generated_tree_autumn',x:17,y:13,generatedArtId:'haven_tree_autumn'},
      {id:'generated_bush_green',x:2,y:6,generatedArtId:'haven_bush_round_green'}
    ];
    const wilds=map('wilds');
    if(wilds){
      wilds.objects||=[];
      for(const scenery of generatedScenery){
        if(wilds.objects.some(entry=>entry.id===scenery.id))continue;
        wilds.objects.push({
          ...scenery,type:'decor',kind:'generated_scenery',blocking:true,
          collisionFootprint:[{x:0,y:0}],artInteractive:false
        });
      }
    }

    const baseWilds=AO.MapBuilders?.wilds;
    if(baseWilds&&!baseWilds.generatedSpriteWrapped){
      const wrapped=function(){
        const grid=baseWilds.call(this);
        for(const {x,y} of generatedScenery)if(grid[y]?.[x]!=null)grid[y][x]='grass';
        return grid;
      };
      wrapped.generatedSpriteWrapped=true;
      AO.MapBuilders.wilds=wrapped;
    }
    AO.GeneratedSpriteContent={
      installed:true,version:'v165',
      assetIds:Object.keys(SPRITES),
      liveMaps:['haven','tavern','wilds']
    };
  }

  patchGeneratedContent();
  GeneratedArt.init();

  const baseIcon=AO.SpriteFactory.icon.bind(AO.SpriteFactory);
  AO.SpriteFactory.icon=function(ctx,x,y,type,entity={}){
    if(AO.GeneratedSpriteArt?.drawEntity(ctx,entity))return;
    const mapId=window.game?.world?.map?.id;
    if(AO.ThousandfoldArt?.drawEntity(ctx,entity,mapId,typeof performance!=='undefined'?performance.now():0))return;
    return baseIcon(ctx,x,y,type,entity);
  };

  const baseNpc=AO.SpriteFactory.npc.bind(AO.SpriteFactory);
  AO.SpriteFactory.npc=function(ctx,x,y,visual,scale=1,options={}){
    if(AO.ThousandfoldArt?.drawNpc(ctx,x,y,visual,scale,options))return;
    return baseNpc(ctx,x,y,visual,scale,options);
  };

  const PreviousRenderer=AO.Renderer;
  AO.Renderer=class extends PreviousRenderer{
    tile(ctx,x,y,tile,theme){
      if(AO.ThousandfoldArt?.drawTile(ctx,tile,x,y,theme))return true;
      return super.tile(ctx,x,y,tile,theme);
    }
    renderBuildings(ctx){
      const buildings=this.game.world.map?.buildings||[];
      if(!buildings.length)return;
      const night=(this.game.state.world.time??8)<6||(this.game.state.world.time??8)>18;
      ctx.save();ctx.imageSmoothingEnabled=false;
      for(const b of buildings){
        const drawn=AO.GeneratedSpriteArt?.drawBuilding(ctx,b,this.game.world)
          ||AO.ThousandfoldArt?.drawBuilding(ctx,b,this.game.world)
          ||AO.Assets?.drawBuilding(ctx,b);
        if(!drawn)continue;
        const dx=b.x*32,dy=b.y*32,dw=b.w*32,dh=b.h*32;
        ctx.fillStyle='rgba(7,8,10,.20)';ctx.fillRect(dx+8,dy+dh-7,dw-4,9);
        if(night){
          const cx=dx+dw/2,cy=dy+dh-30,g=ctx.createRadialGradient(cx,cy,4,cx,cy,78);
          g.addColorStop(0,'rgba(255,205,105,.20)');g.addColorStop(1,'rgba(255,185,70,0)');
          ctx.fillStyle=g;ctx.fillRect(cx-78,cy-78,156,156);
        }
      }
      ctx.restore();
    }
    render(){
      super.render();
      if(this.game.state?.mode!=='explore'||!AO.EntityGeometry)return;
      const nearby=this.game.world.entities.find(entity=>!entity.hidden&&entity.type!=='portal'&&AO.EntityGeometry.distance(this.game.world.playerPos(),entity)<=1);
      if(!nearby)return;
      const bounds=AO.EntityGeometry.bounds(nearby);
      if(bounds.w<=1&&bounds.h<=1)return;
      const ctx=this.ctx;ctx.save();ctx.strokeStyle='rgba(240,198,110,.72)';ctx.lineWidth=1;
      ctx.setLineDash([4,3]);ctx.strokeRect(bounds.x*32+2,bounds.y*32+2,bounds.w*32-4,bounds.h*32-4);ctx.restore();
    }
  };
})();
