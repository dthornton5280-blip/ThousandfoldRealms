/* Thousandfold Realms v1.6.12-dev — exact user-provided prop assets.
   The source PNGs were background-cleaned, normalized to the 32px world grid,
   packed into a transparent atlas, and bound to real authored entities. */
(() => {
  'use strict';
  if(typeof window==='undefined'||!window.AO)return;

  const TILE=32;
  const ATLAS_URL='assets/thousandfold/generated/generated-props-atlas-v1612.b64?v=1612';
  const ATLAS_SIZE={w:512,h:192};
  const MISTAKEN_HAVEN_IDS=[
    'haven_generated_oak_north','haven_generated_evergreen_north',
    'haven_generated_autumn_south','haven_generated_bush_south'
  ];

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

  const BINDINGS={
    haven:{
      haven_delivery_cart:'haven_cart_wood_sacks',
      bench_1:'haven_bench_wood_backrest',bench_2:'haven_bench_wood_backrest',
      haven_east_sign:'haven_signpost_wood_dual'
    },
    tavern:{
      tavern_shelf_mugs:'tavern_shelf_bottles',
      tavern_keg_2:'tavern_barrel_oak',
      tavern_supply_crates:'haven_crate_wood',
      tavern_table_1:'tavern_table_square',tavern_table_2:'tavern_table_square',tavern_table_3:'tavern_table_square',
      tavern_stage_lamp_1:'tavern_hanging_lantern',tavern_stage_lamp_2:'tavern_hanging_lantern',
      tavern_bar_stool_1:'tavern_stool_wood',tavern_bar_stool_2:'tavern_stool_wood',
      tavern_dining_chair_1:'tavern_chair_wood',tavern_dining_chair_2:'tavern_chair_wood'
    },
    tavern_cellar:{
      cellar_keg_1:'tavern_barrel_oak',cellar_keg_2:'tavern_barrel_oak',
      cellar_crates:'haven_crate_wood'
    },
    inn:{
      inn_table_1:'tavern_table_square',inn_table_2:'tavern_table_square',
      inn_guest_chair_1:'tavern_chair_wood',inn_guest_chair_2:'tavern_chair_wood',
      inn_shelf_guestbook:'tavern_shelf_bottles',inn_crates_linen:'haven_crate_wood'
    },
    inn_upper:{
      upper_hall_table:'tavern_table_square',upper_hall_stool:'tavern_stool_wood',
      upper_shelf_1:'tavern_shelf_bottles',upper_shelf_2:'tavern_shelf_bottles'
    },
    general_store:{
      shelf_1:'tavern_shelf_bottles',shelf_2:'tavern_shelf_bottles',
      shelf_3:'tavern_shelf_bottles',shelf_4:'tavern_shelf_bottles',
      store_shelf_remedy_1:'tavern_shelf_bottles',store_shelf_remedy_2:'tavern_shelf_bottles',
      store_shelf_supply_1:'tavern_shelf_bottles',store_shelf_supply_2:'tavern_shelf_bottles',
      store_crates:'haven_crate_wood'
    },
    arcane_shop:{
      arcane_shelf_1:'tavern_shelf_bottles',arcane_shelf_2:'tavern_shelf_bottles',
      arcane_shelf_3:'tavern_shelf_bottles',arcane_shelf_4:'tavern_shelf_bottles',
      arcane_crates_relics:'haven_crate_wood'
    }
  };

  const AUTHORED_FURNITURE=[
    {mapId:'tavern',id:'tavern_bar_stool_1',type:'decor',kind:'stool',name:'Black Lantern Bar Stool',x:4,y:4,blocking:true,collisionFootprint:[{x:0,y:0}],description:'A heavy oak stool sits directly before the tap bar.'},
    {mapId:'tavern',id:'tavern_bar_stool_2',type:'decor',kind:'stool',name:'Black Lantern Bar Stool',x:6,y:4,blocking:true,collisionFootprint:[{x:0,y:0}],description:'A second stool leaves the serving passage clear.'},
    {mapId:'tavern',id:'tavern_dining_chair_1',type:'decor',kind:'chair',name:'Tavern Dining Chair',x:8,y:8,blocking:true,collisionFootprint:[{x:0,y:0}],description:'A straight-backed chair completes the western dining table.'},
    {mapId:'tavern',id:'tavern_dining_chair_2',type:'decor',kind:'chair',name:'Tavern Dining Chair',x:19,y:8,blocking:true,collisionFootprint:[{x:0,y:0}],description:'A sturdy chair faces the eastern dining table without narrowing the main aisle.'},
    {mapId:'inn',id:'inn_guest_chair_1',type:'decor',kind:'chair',name:'Lantern Rest Chair',x:4,y:9,blocking:true,collisionFootprint:[{x:0,y:0}],description:'A guest chair sits beside the western breakfast table.'},
    {mapId:'inn',id:'inn_guest_chair_2',type:'decor',kind:'chair',name:'Lantern Rest Chair',x:24,y:9,blocking:true,collisionFootprint:[{x:0,y:0}],description:'A matching chair sits beside the eastern guest table.'},
    {mapId:'inn_upper',id:'upper_hall_stool',type:'decor',kind:'stool',name:'Upper Hall Stool',x:15,y:11,blocking:true,collisionFootprint:[{x:0,y:0}],description:'A compact stool rests beside the water and candle table.'}
  ];

  const deepCopy=value=>AO.Util?.deepCopy?AO.Util.deepCopy(value):JSON.parse(JSON.stringify(value));
  const mapObjects=mapId=>AO.MAP_DEFS?.[mapId]?.objects||[];
  const assetFor=(mapId,entity)=>BINDINGS[mapId]?.[entity?.id]||null;

  const applyBinding=(mapId,entity)=>{
    const assetId=assetFor(mapId,entity),sprite=SPRITES[assetId];
    if(!entity||!assetId||!sprite)return false;
    entity.generatedArtId=assetId;
    entity.generatedArtW=sprite.w;
    entity.generatedArtH=sprite.h;
    entity.generatedArtAnchor=sprite.anchor;
    if(assetId==='tavern_hanging_lantern'){
      entity.blocking=false;entity.artLight=54;entity.collisionFootprint=[];
    }
    if(assetId==='haven_signpost_wood_dual'){
      entity.blocking=false;entity.collisionFootprint=[];
    }
    if(assetId==='tavern_barrel_oak'||assetId==='haven_crate_wood'){
      entity.collisionFootprint=[{x:0,y:0}];
      entity.interactionFootprint=[{x:0,y:0}];
    }
    return true;
  };

  const removeMistakenNature=world=>{
    const haven=AO.MAP_DEFS?.haven;
    if(haven?.objects)haven.objects=haven.objects.filter(entity=>!MISTAKEN_HAVEN_IDS.includes(entity.id));
    if(world?.map?.id==='haven'&&Array.isArray(world.entities)){
      world.entities=world.entities.filter(entity=>!MISTAKEN_HAVEN_IDS.includes(entity.id));
    }
  };

  const ensureAuthoredFurniture=()=>{
    for(const spec of AUTHORED_FURNITURE){
      const objects=mapObjects(spec.mapId);
      const existing=objects.find(entity=>entity.id===spec.id);
      if(existing)Object.assign(existing,spec);else objects.push({...spec});
    }
  };

  const patchDefinitions=()=>{
    removeMistakenNature();
    ensureAuthoredFurniture();
    for(const mapId of Object.keys(BINDINGS)){
      for(const entity of mapObjects(mapId))applyBinding(mapId,entity);
    }
    AO.PropFurnitureContentV1612={
      installed:true,version:'1.6.12-dev',atlas:ATLAS_URL,
      assetIds:Object.keys(SPRITES),maps:Object.keys(BINDINGS),
      removedEntityIds:[...MISTAKEN_HAVEN_IDS],
      authoredFurnitureIds:AUTHORED_FURNITURE.map(entry=>entry.id)
    };
  };

  const syncWorld=world=>{
    if(!world?.map?.id||!Array.isArray(world.entities))return false;
    patchDefinitions();removeMistakenNature(world);
    const mapId=world.map.id,definitions=mapObjects(mapId);let changed=false;
    for(const spec of AUTHORED_FURNITURE.filter(entry=>entry.mapId===mapId)){
      if(world.entities.some(entity=>entity.id===spec.id))continue;
      const definition=definitions.find(entity=>entity.id===spec.id);
      if(definition){world.entities.push(deepCopy(definition));changed=true;}
    }
    for(const entity of world.entities){
      const definition=definitions.find(entry=>entry.id===entity.id)||entity;
      const assetId=assetFor(mapId,definition);if(!assetId)continue;
      applyBinding(mapId,definition);
      const before=entity.generatedArtId;
      Object.assign(entity,{
        generatedArtId:definition.generatedArtId,
        generatedArtW:definition.generatedArtW,
        generatedArtH:definition.generatedArtH,
        generatedArtAnchor:definition.generatedArtAnchor,
        artLight:definition.artLight,
        blocking:definition.blocking,
        collisionFootprint:deepCopy(definition.collisionFootprint||[]),
        interactionFootprint:deepCopy(definition.interactionFootprint||[])
      });
      if(before!==entity.generatedArtId)changed=true;
    }
    if(changed)AO.events?.emit?.('worldChanged');
    return changed;
  };

  const setStatus=(state,error='')=>{
    document.documentElement.dataset.tfrProps=state;
    AO.PropFurnitureDiagnosticsV1612={state,error,atlas:ATLAS_URL};
  };

  const Art={
    image:null,ready:false,loading:false,failed:false,lastError:null,
    async init(){
      if(this.ready||this.loading)return;
      this.loading=true;setStatus('loading');
      try{
        const url=new URL(ATLAS_URL,document.baseURI).href;
        const response=await fetch(url,{cache:'reload'});
        if(!response.ok)throw new Error(`exact prop atlas HTTP ${response.status}`);
        const encoded=(await response.text()).replace(/\s+/g,'');
        if(!encoded.startsWith('iVBORw0KGgo'))throw new Error('exact prop atlas is not a PNG payload');
        const image=new Image();image.decoding='async';
        image.onload=()=>{
          if(image.naturalWidth!==ATLAS_SIZE.w||image.naturalHeight!==ATLAS_SIZE.h){
            this.fail(new Error(`exact prop atlas size ${image.naturalWidth}x${image.naturalHeight}`));return;
          }
          this.image=image;this.ready=true;this.failed=false;this.loading=false;this.lastError=null;
          setStatus('ready');syncWorld(window.game?.world);
          AO.events?.emit?.('assetsReady');AO.events?.emit?.('worldChanged');
        };
        image.onerror=()=>this.fail(new Error('exact prop atlas image decode failed'));
        image.src=`data:image/png;base64,${encoded}`;
      }catch(error){this.fail(error);}
    },
    fail(error){
      this.failed=true;this.loading=false;this.lastError=String(error?.message||error||'unknown error');
      setStatus('failed',this.lastError);
      console.error('Thousandfold Realms exact prop assets failed to load.',error||'');
    },
    drawEntity(ctx,x,y,entity,mapId){
      const assetId=assetFor(mapId,entity),sprite=SPRITES[assetId];
      if(!ctx||!entity||!sprite||!this.ready||!this.image)return false;
      const dx=sprite.anchor==='topLeft'?x:x+TILE/2-sprite.w/2;
      const dy=sprite.anchor==='topLeft'?y:y+TILE-sprite.h;
      ctx.save();ctx.imageSmoothingEnabled=false;
      if(assetId==='tavern_hanging_lantern'&&ctx.createRadialGradient){
        const cx=dx+sprite.w/2,cy=dy+sprite.h*.55,r=54;
        const glow=ctx.createRadialGradient(cx,cy,2,cx,cy,r);
        glow.addColorStop(0,'rgba(255,205,104,.30)');
        glow.addColorStop(1,'rgba(255,177,55,0)');
        ctx.fillStyle=glow;ctx.fillRect(cx-r,cy-r,r*2,r*2);
      }
      ctx.drawImage(this.image,sprite.x,sprite.y,sprite.w,sprite.h,
        Math.round(dx),Math.round(dy),sprite.w,sprite.h);
      ctx.restore();return true;
    }
  };

  const installIconHook=()=>{
    if(!AO.SpriteFactory?.icon||AO.SpriteFactory.icon.tfrExactPropsV1612)return false;
    const prior=AO.SpriteFactory.icon;
    const wrapped=function(ctx,x,y,type,entity={}){
      const mapId=window.game?.world?.map?.id;
      if(Art.drawEntity(ctx,x,y,entity,mapId))return;
      return prior.call(this,ctx,x,y,type,entity);
    };
    wrapped.tfrExactPropsV1612=true;
    AO.SpriteFactory.icon=wrapped;
    return true;
  };

  const installLoadHook=()=>{
    const proto=AO.WorldSystem?.prototype;
    if(!proto?.load||proto.load.tfrExactPropsV1612)return false;
    const prior=proto.load;
    const wrapped=function(...args){
      const result=prior.apply(this,args);syncWorld(this);return result;
    };
    wrapped.tfrExactPropsV1612=true;
    proto.load=wrapped;
    return true;
  };

  patchDefinitions();
  AO.PropFurnitureArtV1612=Art;
  AO.PropFurnitureArtV1611=Art;
  AO.PropFurnitureArtV169=Art;
  installIconHook();installLoadHook();Art.init();

  let attempts=0;
  const timer=setInterval(()=>{
    patchDefinitions();installIconHook();installLoadHook();
    if(window.game)syncWorld(window.game.world);
    if(Art.ready&&AO.SpriteFactory?.icon&&AO.WorldSystem?.prototype?.load){
      clearInterval(timer);
    }else if(++attempts>400){
      clearInterval(timer);
      if(!Art.ready&&!Art.failed)Art.fail(new Error('exact prop runtime initialization timed out'));
    }
  },25);
})();
