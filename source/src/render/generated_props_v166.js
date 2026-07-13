/* Thousandfold Realms v1.6.6-dev — hybrid props and furniture runtime atlas.
   Loads a second compact generated atlas, patches only approved standalone objects,
   and preserves all existing IDs, collision, interactions, and procedural fallbacks. */
(() => {
  'use strict';
  if(!window.AO)return;

  const TILE=32;
  const ATLAS_CHUNKS=['assets/thousandfold/generated/generated-props-atlas-v166.b64'];
  const SPRITES={
    haven_cart_wood_sacks:{x:4,y:4,w:128,h:96,anchor:'topLeft'},
    haven_bench_wood_backrest:{x:136,y:4,w:64,h:48,anchor:'topLeft'},
    haven_signpost_wood_dual:{x:204,y:4,w:48,h:96,anchor:'bottomCenter'},
    tavern_barrel_oak:{x:256,y:4,w:32,h:40,anchor:'topLeft'},
    haven_crate_wood:{x:292,y:4,w:32,h:32,anchor:'topLeft'},
    tavern_table_square:{x:328,y:4,w:64,h:48,anchor:'topLeft'},
    tavern_chair_wood:{x:396,y:4,w:32,h:48,anchor:'topLeft'},
    tavern_stool_wood:{x:432,y:4,w:32,h:32,anchor:'topLeft'},
    tavern_hanging_lantern:{x:468,y:4,w:32,h:48,anchor:'topLeft'},
    tavern_shelf_bottles:{x:4,y:104,w:96,h:64,anchor:'topLeft'}
  };

  const PropArt={
    image:null,ready:false,failed:false,loading:false,
    async init(){
      if(this.ready||this.loading)return;
      this.loading=true;
      try{
        const responses=await Promise.all(ATLAS_CHUNKS.map(path=>fetch(path,{cache:'no-cache'})));
        for(const response of responses)if(!response.ok)throw new Error(`v1.6.6 prop atlas chunk ${response.status}`);
        const base64=(await Promise.all(responses.map(response=>response.text()))).join('').replace(/\s+/g,'');
        const image=new Image();
        image.decoding='async';
        image.onload=()=>{
          this.image=image;this.ready=true;this.failed=false;this.loading=false;
          patchDefinitions();patchCurrentWorld();
          AO.events?.emit?.('assetsReady');AO.events?.emit?.('worldChanged');
        };
        image.onerror=()=>this.fail();
        image.src=`data:image/png;base64,${base64}`;
      }catch(error){this.fail(error);}
    },
    fail(error){
      this.failed=true;this.loading=false;
      console.warn('Thousandfold Realms v1.6.6 prop atlas failed to load; procedural fallback remains active.',error||'');
    },
    sprite(id){return SPRITES[id]||null;},
    origin(entity,sprite){
      const w=entity.generatedArtW||sprite.w,h=entity.generatedArtH||sprite.h;
      const anchor=entity.generatedArtAnchor||entity.artAnchor||sprite.anchor;
      if(anchor==='topLeft')return{x:entity.x*TILE,y:entity.y*TILE,w,h};
      return{x:entity.x*TILE+TILE/2-w/2,y:entity.y*TILE+TILE-h,w,h};
    },
    glow(ctx,cx,cy,r){
      if(!ctx.createRadialGradient)return;
      const g=ctx.createRadialGradient(cx,cy,2,cx,cy,r);
      g.addColorStop(0,'rgba(255,207,104,.28)');
      g.addColorStop(1,'rgba(255,178,55,0)');
      ctx.fillStyle=g;ctx.fillRect(cx-r,cy-r,r*2,r*2);
    },
    drawEntity(ctx,entity){
      const id=entity.generatedArtId,sprite=this.sprite(id);
      if(!id||!sprite||!this.ready||!this.image)return false;
      const o=this.origin(entity,sprite);
      ctx.save();ctx.imageSmoothingEnabled=false;
      if(entity.artLight)this.glow(ctx,o.x+o.w/2,o.y+o.h*.52,entity.artLight);
      ctx.drawImage(this.image,sprite.x,sprite.y,sprite.w,sprite.h,
        Math.round(o.x),Math.round(o.y),Math.round(o.w),Math.round(o.h));
      ctx.restore();return true;
    }
  };
  AO.GeneratedPropArt=PropArt;

  const dimensions={
    haven_cart_wood_sacks:{w:128,h:96,anchor:'topLeft'},
    haven_bench_wood_backrest:{w:64,h:48,anchor:'topLeft'},
    haven_signpost_wood_dual:{w:48,h:96,anchor:'bottomCenter'},
    tavern_barrel_oak:{w:32,h:40,anchor:'topLeft'},
    haven_crate_wood:{w:32,h:32,anchor:'topLeft'},
    tavern_table_square:{w:64,h:48,anchor:'topLeft'},
    tavern_chair_wood:{w:32,h:48,anchor:'topLeft'},
    tavern_stool_wood:{w:32,h:32,anchor:'topLeft'},
    tavern_shelf_bottles:{w:96,h:64,anchor:'topLeft'},
    tavern_hanging_lantern:{w:32,h:48,anchor:'topLeft'}
  };

  function apply(entity,id,override={}){
    if(!entity)return false;
    const d=dimensions[id];
    Object.assign(entity,{
      generatedArtId:id,
      generatedArtW:override.w||d.w,
      generatedArtH:override.h||d.h,
      generatedArtAnchor:override.anchor||d.anchor
    });
    if(override.light!=null)entity.artLight=override.light;
    return true;
  }
  function object(mapId,id){return AO.MAP_DEFS?.[mapId]?.objects?.find(entry=>entry.id===id);}
  function patchIds(mapId,ids,asset,override){for(const id of ids)apply(object(mapId,id),asset,override);}
  function patchByKind(mapId,kinds,asset,override){
    const set=new Set(kinds);
    for(const entity of AO.MAP_DEFS?.[mapId]?.objects||[])if(set.has(entity.kind))apply(entity,asset,override);
  }

  function patchDefinitions(){
    patchIds('haven',['haven_delivery_cart'],'haven_cart_wood_sacks');
    patchIds('haven',['bench_1','bench_2'],'haven_bench_wood_backrest');
    patchIds('haven',['haven_east_sign'],'haven_signpost_wood_dual');
    patchIds('tavern',['tavern_keg_2'],'tavern_barrel_oak');
    patchIds('tavern_cellar',['cellar_keg_1','cellar_keg_2'],'tavern_barrel_oak');
    patchIds('tavern',['tavern_supply_crates'],'haven_crate_wood');
    patchIds('tavern_cellar',['cellar_crates'],'haven_crate_wood');
    patchIds('tavern',['tavern_table_1','tavern_table_2','tavern_table_3'],'tavern_table_square');
    patchIds('tavern',['tavern_shelf_mugs'],'tavern_shelf_bottles');
    patchIds('tavern',['tavern_stage_lamp_1','tavern_stage_lamp_2'],'tavern_hanging_lantern',{light:46});
    patchIds('inn',['inn_table_1','inn_table_2'],'tavern_table_square');
    patchIds('inn_upper',['upper_hall_table'],'tavern_table_square');
    patchByKind('inn',['chair'],'tavern_chair_wood');
    patchByKind('inn_upper',['chair'],'tavern_chair_wood');
    patchByKind('tavern',['chair'],'tavern_chair_wood');
    patchByKind('tavern',['stool'],'tavern_stool_wood');
    patchByKind('general_store',['crates'],'haven_crate_wood');
    patchByKind('forge',['crates'],'haven_crate_wood');
    const state=AO.GeneratedPropContent||{};
    Object.assign(state,{installed:true,version:'v166',assetIds:Object.keys(SPRITES),liveMaps:['haven','tavern','tavern_cellar','inn','inn_upper'],preservedFallback:true});
    AO.GeneratedPropContent=state;
  }

  function definitionsReady(){
    return Boolean(
      object('haven','haven_delivery_cart')?.generatedArtId&&
      object('haven','haven_east_sign')?.generatedArtId&&
      object('tavern','tavern_table_1')?.generatedArtId&&
      object('inn_upper','upper_hall_table')?.generatedArtId
    );
  }

  function patchCurrentWorld(){
    const mapId=window.game?.world?.map?.id;
    const entities=window.game?.world?.entities;
    if(!mapId||!Array.isArray(entities))return;
    const definitions=AO.MAP_DEFS?.[mapId]?.objects||[];
    const byId=new Map(definitions.map(entity=>[entity.id,entity]));
    for(const entity of entities){
      const definition=byId.get(entity.id);
      if(definition?.generatedArtId)Object.assign(entity,{generatedArtId:definition.generatedArtId,generatedArtW:definition.generatedArtW,generatedArtH:definition.generatedArtH,generatedArtAnchor:definition.generatedArtAnchor,artLight:definition.artLight});
    }
  }

  patchDefinitions();
  let attempts=0;
  const timer=setInterval(()=>{
    patchDefinitions();patchCurrentWorld();
    if(definitionsReady()||++attempts>80)clearInterval(timer);
  },25);
  PropArt.init();
})();