/* Thousandfold Realms v1.6.9-dev — authoritative prop/furniture runtime integration.
   Reverts the mistaken Haven showcase trees, binds the approved cart/bench/sign,
   tavern, cellar, and inn furniture assets to real authored objects, and draws them
   ahead of every procedural fallback for both new games and existing saves. */
(() => {
  'use strict';
  if(typeof window==='undefined'||!window.AO)return;

  const TILE=32;
  const ATLAS_URL='assets/thousandfold/generated/generated-props-atlas-v166.b64?v=169';
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
      inn_guest_chair_1:'tavern_chair_wood',inn_guest_chair_2:'tavern_chair_wood'
    },
    inn_upper:{
      upper_hall_table:'tavern_table_square',upper_hall_stool:'tavern_stool_wood'
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
  const assetFor=(mapId,entity)=>BINDINGS[mapId]?.[entity?.id]
    ||((['tavern','inn','inn_upper'].includes(mapId)&&entity?.kind==='chair')?'tavern_chair_wood':null)
    ||((['tavern','inn','inn_upper'].includes(mapId)&&entity?.kind==='stool')?'tavern_stool_wood':null);

  const applyBinding=(mapId,entity)=>{
    const assetId=assetFor(mapId,entity),sprite=SPRITES[assetId];
    if(!entity||!assetId||!sprite)return false;
    entity.generatedArtId=assetId;
    entity.generatedArtW=sprite.w;entity.generatedArtH=sprite.h;entity.generatedArtAnchor=sprite.anchor;
    if(assetId==='tavern_hanging_lantern'){entity.blocking=false;entity.artLight=54;entity.collisionFootprint=[];}
    if(assetId==='haven_signpost_wood_dual'){entity.blocking=false;entity.collisionFootprint=[];}
    if(['cellar_keg_1','cellar_keg_2','cellar_crates'].includes(entity.id)){
      entity.collisionFootprint=[{x:0,y:0}];
      entity.interactionFootprint=[{x:0,y:0}];
    }
    return true;
  };

  const removeMistakenNature=world=>{
    const haven=AO.MAP_DEFS?.haven;
    if(haven?.objects)haven.objects=haven.objects.filter(entity=>!MISTAKEN_HAVEN_IDS.includes(entity.id));
    if(world?.map?.id==='haven'&&Array.isArray(world.entities))world.entities=world.entities.filter(entity=>!MISTAKEN_HAVEN_IDS.includes(entity.id));
  };

  const ensureAuthoredFurniture=()=>{
    for(const spec of AUTHORED_FURNITURE){
      const objects=mapObjects(spec.mapId);
      const existing=objects.find(entity=>entity.id===spec.id);
      if(existing)Object.assign(existing,spec);else objects.push({...spec});
    }
  };

  const patchDefinitions=()=>{
    removeMistakenNature();ensureAuthoredFurniture();
    for(const mapId of Object.keys(BINDINGS))for(const entity of mapObjects(mapId))applyBinding(mapId,entity);
    AO.PropFurnitureContentV169={
      installed:true,version:'1.6.9-dev',assetIds:Object.keys(SPRITES),
      maps:Object.keys(BINDINGS),removedEntityIds:[...MISTAKEN_HAVEN_IDS],
      authoredFurnitureIds:AUTHORED_FURNITURE.map(entry=>entry.id)
    };
  };

  const syncWorld=world=>{
    if(!world?.map?.id||!Array.isArray(world.entities))return false;
    patchDefinitions();removeMistakenNature(world);
    const mapId=world.map.id,definitions=mapObjects(mapId);let changed=false;
    for(const spec of AUTHORED_FURNITURE.filter(entry=>entry.mapId===mapId)){
      if(!world.entities.some(entity=>entity.id===spec.id)){world.entities.push(deepCopy(definitions.find(entity=>entity.id===spec.id)));changed=true;}
    }
    for(const entity of world.entities){
      const definition=definitions.find(entry=>entry.id===entity.id);
      if(!definition)continue;
      const assetId=assetFor(mapId,definition);if(!assetId)continue;
      const before=`${entity.generatedArtId||''}:${entity.generatedArtW||0}:${entity.generatedArtH||0}:${JSON.stringify(entity.collisionFootprint||[])}`;
      Object.assign(entity,{
        generatedArtId:definition.generatedArtId,generatedArtW:definition.generatedArtW,
        generatedArtH:definition.generatedArtH,generatedArtAnchor:definition.generatedArtAnchor,
        artLight:definition.artLight,blocking:definition.blocking,
        collisionFootprint:deepCopy(definition.collisionFootprint||[]),
        interactionFootprint:deepCopy(definition.interactionFootprint||[])
      });
      const after=`${entity.generatedArtId||''}:${entity.generatedArtW||0}:${entity.generatedArtH||0}:${JSON.stringify(entity.collisionFootprint||[])}`;
      if(before!==after)changed=true;
    }
    if(changed)AO.events?.emit?.('worldChanged');
    return changed;
  };

  const Art={
    image:null,ready:false,loading:false,failed:false,
    async init(){
      if(this.ready||this.loading)return;this.loading=true;
      try{
        const response=await fetch(ATLAS_URL,{cache:'reload'});
        if(!response.ok)throw new Error(`v1.6.9 prop atlas ${response.status}`);
        const encoded=(await response.text()).replace(/\s+/g,'');
        const image=new Image();image.decoding='async';
        image.onload=()=>{this.image=image;this.ready=true;this.failed=false;this.loading=false;syncWorld(window.game?.world);AO.events?.emit?.('assetsReady');AO.events?.emit?.('worldChanged');};
        image.onerror=()=>this.fail(new Error('decoded prop atlas image failed'));
        image.src=`data:image/png;base64,${encoded}`;
      }catch(error){this.fail(error);}
    },
    fail(error){this.failed=true;this.loading=false;console.warn('Thousandfold Realms v1.6.9 furniture atlas failed; established fallback art remains active.',error||'');},
    drawEntity(ctx,x,y,entity,mapId){
      const assetId=assetFor(mapId,entity),sprite=SPRITES[assetId];
      if(!ctx||!entity||!sprite||!this.ready||!this.image)return false;
      const dx=sprite.anchor==='topLeft'?x:x+TILE/2-sprite.w/2;
      const dy=sprite.anchor==='topLeft'?y:y+TILE-sprite.h;
      ctx.save();ctx.imageSmoothingEnabled=false;
      if(assetId==='tavern_hanging_lantern'&&ctx.createRadialGradient){
        const cx=dx+sprite.w/2,cy=dy+sprite.h*.55,r=54,g=ctx.createRadialGradient(cx,cy,2,cx,cy,r);
        g.addColorStop(0,'rgba(255,205,104,.30)');g.addColorStop(1,'rgba(255,177,55,0)');ctx.fillStyle=g;ctx.fillRect(cx-r,cy-r,r*2,r*2);
      }
      ctx.drawImage(this.image,sprite.x,sprite.y,sprite.w,sprite.h,Math.round(dx),Math.round(dy),sprite.w,sprite.h);
      ctx.restore();return true;
    }
  };

  const installRenderHook=()=>{
    if(!AO.SpriteFactory?.icon||AO.SpriteFactory.icon.tfrPropFurnitureV169)return false;
    const prior=AO.SpriteFactory.icon;
    const wrapped=function(ctx,x,y,type,entity={}){
      const mapId=window.game?.world?.map?.id;
      if(Art.drawEntity(ctx,x,y,entity,mapId))return;
      return prior.call(this,ctx,x,y,type,entity);
    };
    wrapped.tfrPropFurnitureV169=true;AO.SpriteFactory.icon=wrapped;return true;
  };

  const installLoadHook=()=>{
    const proto=AO.WorldSystem?.prototype;
    if(!proto?.load||proto.load.tfrPropFurnitureV169)return false;
    const prior=proto.load;
    const wrapped=function(...args){const result=prior.apply(this,args);syncWorld(this);return result;};
    wrapped.tfrPropFurnitureV169=true;proto.load=wrapped;return true;
  };

  patchDefinitions();Art.init();
  AO.PropFurnitureArtV169=Art;

  let attempts=0;
  const timer=setInterval(()=>{
    patchDefinitions();
    if(window.game)syncWorld(window.game.world);
    const finalRendererReady=Boolean(AO.GeneratedSpriteContent?.installed);
    const olderRepairReady=Boolean(AO.SpriteFactory?.icon?.tfrGeneratedPropsV167)||attempts>160;
    const rendered=finalRendererReady&&olderRepairReady&&installRenderHook();
    const loaded=installLoadHook();
    if(Art.ready&&finalRendererReady&&(rendered||AO.SpriteFactory?.icon?.tfrPropFurnitureV169)&&(loaded||AO.WorldSystem?.prototype?.load?.tfrPropFurnitureV169)){
      syncWorld(window.game?.world);clearInterval(timer);
    }else if(++attempts>520){
      console.warn('Thousandfold Realms v1.6.9 prop integration timed out; established fallback art remains active.');clearInterval(timer);
    }
  },25);
})();
