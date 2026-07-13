/* Thousandfold Realms v1.6.13-dev — visual-footprint collision normalization.
   Exact sprites keep their authored pixels while movement and interaction geometry
   match the visible object instead of the old one-cell procedural placeholders. */
(() => {
  'use strict';
  if(typeof window==='undefined'||!window.AO)return;

  const rect=(w,h,ox=0,oy=0)=>Array.from({length:h},(_,y)=>
    Array.from({length:w},(_,x)=>({x:x+ox,y:y+oy}))).flat();

  const GEOMETRY={
    haven_cart_wood_sacks:{blocking:true,collisionFootprint:rect(4,3),interactionFootprint:rect(4,3)},
    haven_bench_wood_backrest:{blocking:true,collisionFootprint:rect(2,1),interactionFootprint:rect(2,1)},
    haven_signpost_wood_dual:{blocking:false,collisionFootprint:[],interactionFootprint:[{x:0,y:0}]},
    tavern_barrel_oak:{blocking:true,collisionFootprint:rect(1,1),interactionFootprint:rect(1,1)},
    haven_crate_wood:{blocking:true,collisionFootprint:rect(1,1),interactionFootprint:rect(1,1)},
    tavern_table_square:{blocking:true,collisionFootprint:rect(2,1),interactionFootprint:rect(2,1)},
    tavern_chair_wood:{blocking:true,collisionFootprint:rect(1,1),interactionFootprint:rect(1,1)},
    tavern_stool_wood:{blocking:true,collisionFootprint:rect(1,1),interactionFootprint:rect(1,1)},
    tavern_hanging_lantern:{blocking:false,collisionFootprint:[],interactionFootprint:[{x:0,y:0}]},
    tavern_shelf_bottles:{blocking:true,collisionFootprint:rect(3,1),interactionFootprint:rect(3,1)}
  };

  const clone=value=>AO.Util?.deepCopy?AO.Util.deepCopy(value):JSON.parse(JSON.stringify(value));
  const apply=entity=>{
    const geometry=GEOMETRY[entity?.generatedArtId];
    if(!geometry)return false;
    entity.blocking=geometry.blocking;
    entity.collisionFootprint=clone(geometry.collisionFootprint);
    entity.interactionFootprint=clone(geometry.interactionFootprint);
    entity.visualFootprint={
      spriteId:entity.generatedArtId,
      widthTiles:Math.max(1,...geometry.interactionFootprint.map(cell=>cell.x+1),1),
      heightTiles:Math.max(1,...geometry.interactionFootprint.map(cell=>cell.y+1),1)
    };
    return true;
  };

  const applyDefinitions=()=>{
    for(const map of Object.values(AO.MAP_DEFS||{})){
      for(const entity of map.objects||[])apply(entity);
    }
  };

  const applyWorld=world=>{
    if(!Array.isArray(world?.entities))return false;
    let changed=false;
    for(const entity of world.entities){
      const before=JSON.stringify([entity.blocking,entity.collisionFootprint,entity.interactionFootprint]);
      if(!apply(entity))continue;
      const after=JSON.stringify([entity.blocking,entity.collisionFootprint,entity.interactionFootprint]);
      if(before!==after)changed=true;
    }
    if(changed)AO.events?.emit?.('worldChanged');
    return changed;
  };

  const installLoadHook=()=>{
    const proto=AO.WorldSystem?.prototype;
    if(!proto?.load||proto.load.tfrPropGeometryV1613)return false;
    const prior=proto.load;
    const wrapped=function(...args){
      const result=prior.apply(this,args);
      applyDefinitions();
      applyWorld(this);
      return result;
    };
    wrapped.tfrPropGeometryV1613=true;
    proto.load=wrapped;
    return true;
  };

  applyDefinitions();
  applyWorld(window.game?.world);
  installLoadHook();

  AO.PropGeometryV1613={
    installed:true,
    version:'1.6.13-dev',
    geometry:GEOMETRY,
    applyDefinitions,
    applyWorld
  };
})();