/* Thousandfold Realms v1.6.8-dev — visible generated-asset placement pass.
   The earlier atlas work was technically loaded, but most of the proof batch was
   either confined to interiors/Whisperwood or visually lost among procedural art.
   This pass places the missing nature sprites directly into Haven, preserves the
   established collision fixes, and updates an already-loaded save without reset. */
(() => {
  'use strict';
  if(typeof window==='undefined'||!window.AO)return;

  const HAVEN_SCENERY=[
    {
      id:'haven_generated_oak_north',type:'decor',kind:'tree',name:'Lantern Square Oak',
      x:10,y:6,blocking:true,generatedArtId:'haven_tree_deciduous_green',
      generatedArtW:76,generatedArtH:90,generatedArtAnchor:'bottomCenter',
      collisionFootprint:[{x:0,y:0}],artInteractive:false,
      description:'An old oak softens the narrow garden between Haven’s northern buildings.'
    },
    {
      id:'haven_generated_evergreen_north',type:'decor',kind:'tree',name:'Warded Evergreen',
      x:19,y:6,blocking:true,generatedArtId:'haven_tree_evergreen',
      generatedArtW:68,generatedArtH:92,generatedArtAnchor:'bottomCenter',
      collisionFootprint:[{x:0,y:0}],artInteractive:false,
      description:'A dark evergreen grows beside the eastern storefronts beneath a small warding charm.'
    },
    {
      id:'haven_generated_autumn_south',type:'decor',kind:'tree',name:'Copperleaf Tree',
      x:10,y:16,blocking:true,generatedArtId:'haven_tree_autumn',
      generatedArtW:76,generatedArtH:90,generatedArtAnchor:'bottomCenter',
      collisionFootprint:[{x:0,y:0}],artInteractive:false,
      description:'Copper-orange leaves gather in the sheltered lane between the southern buildings.'
    },
    {
      id:'haven_generated_bush_south',type:'decor',kind:'shrub',name:'Lanternberry Shrub',
      x:19,y:16,blocking:true,generatedArtId:'haven_bush_round_green',
      generatedArtW:52,generatedArtH:38,generatedArtAnchor:'bottomCenter',
      collisionFootprint:[{x:0,y:0}],artInteractive:false,
      description:'A dense evergreen shrub fills the opposite garden gap without crowding the main road.'
    }
  ];

  const existingBindings=()=>{
    const map=AO.MAP_DEFS?.haven;if(!map)return false;
    const by=id=>map.objects?.find(entity=>entity.id===id);
    for(const id of ['lamp_1','lamp_2','lamp_3','lamp_4'])if(by(id))by(id).generatedArtId='haven_lamppost_hanging_lantern';
    for(const id of ['market_stall_1','market_stall_2'])if(by(id))by(id).generatedArtId='haven_market_stall_green_awning';
    if(by('haven_well'))by('haven_well').generatedArtId='haven_well_stone_roofed';
    const tavern=map.buildings?.find(building=>building.id==='haven_tavern');if(tavern)tavern.generatedArtId='haven_tavern_exterior';
    const fire=AO.MAP_DEFS?.tavern?.objects?.find(entity=>entity.id==='tavern_fire');if(fire)fire.generatedArtId='tavern_fireplace_stone';
    return true;
  };

  const ensureDefinitions=()=>{
    const map=AO.MAP_DEFS?.haven;if(!map)return false;
    map.objects||=[];existingBindings();
    for(const spec of HAVEN_SCENERY){
      const current=map.objects.find(entity=>entity.id===spec.id);
      if(current)Object.assign(current,spec);else map.objects.push({...spec});
    }
    AO.VisibleGeneratedAssetsV168={
      installed:true,version:'1.6.8-dev',map:'haven',
      assetIds:[...new Set(HAVEN_SCENERY.map(entry=>entry.generatedArtId))],
      entityIds:HAVEN_SCENERY.map(entry=>entry.id)
    };
    return true;
  };

  const syncWorld=world=>{
    if(!world||world.map?.id!=='haven'||!Array.isArray(world.entities))return false;
    ensureDefinitions();let changed=false;
    const definitions=AO.MAP_DEFS.haven.objects;
    for(const spec of HAVEN_SCENERY){
      const definition=definitions.find(entity=>entity.id===spec.id);
      const current=world.entities.find(entity=>entity.id===spec.id);
      if(current){
        const before=`${current.x},${current.y},${current.generatedArtId},${current.generatedArtW},${current.generatedArtH}`;
        Object.assign(current,AO.Util?.deepCopy?AO.Util.deepCopy(definition):{...definition});
        const after=`${current.x},${current.y},${current.generatedArtId},${current.generatedArtW},${current.generatedArtH}`;
        if(before!==after)changed=true;
      }else{
        world.entities.push(AO.Util?.deepCopy?AO.Util.deepCopy(definition):{...definition});changed=true;
      }
    }
    if(changed)AO.events?.emit?.('worldChanged');
    return changed;
  };

  const installLoadHook=()=>{
    const proto=AO.WorldSystem?.prototype;
    if(!proto||proto.load?.tfrVisibleGeneratedAssetsV168)return false;
    const prior=proto.load;
    const wrapped=function(...args){
      const result=prior.apply(this,args);ensureDefinitions();
      if(this.map?.id==='haven')syncWorld(this);
      return result;
    };
    wrapped.tfrVisibleGeneratedAssetsV168=true;proto.load=wrapped;return true;
  };

  ensureDefinitions();
  let attempts=0;
  const timer=setInterval(()=>{
    ensureDefinitions();
    const ready=Boolean(AO.GeneratedSpriteArt?.ready);
    const repaired=Boolean(AO.LiveRuntimeV167?.worldCollisionInstalled);
    const hooked=repaired&&installLoadHook();
    if(window.game&&ready)syncWorld(window.game.world);
    if(window.game&&ready&&repaired&&(hooked||AO.WorldSystem?.prototype?.load?.tfrVisibleGeneratedAssetsV168)){
      AO.events?.emit?.('worldChanged');clearInterval(timer);
    }else if(++attempts>500){
      console.warn('Thousandfold Realms v1.6.8 visible asset pass timed out; existing generated art remains available.');clearInterval(timer);
    }
  },25);
})();