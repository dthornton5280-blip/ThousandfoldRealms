/* Thousandfold Realms v1.6.4-dev — Whisperwood visual composition, discoveries, and route-safe wilderness details. */
(() => {
  'use strict';
  if(!window.AO||!AO.MAP_DEFS?.wilds)return;

  const map=AO.MAP_DEFS.wilds;
  const footprint=(w,h=1)=>Array.from({length:h},(_,y)=>Array.from({length:w},(_,x)=>({x,y}))).flat();
  const by=id=>map.objects.find(entry=>entry.id===id);
  const patch=(id,values)=>{const target=by(id);if(target)Object.assign(target,values);return target;};
  const add=values=>{if(!by(values.id))map.objects.push(values);};

  map.composition={version:'v164',name:'Whisperwood Living Wilderness'};
  map.visualProfile={palette:'lantern-forest',canopy:'layered',water:'mosswater',road:'old-lantern-road'};

  /* Existing gameplay objects receive art, exact footprints, and richer world text. */
  for(const id of ['herb_1','herb_2','herb_3','herb_4'])patch(id,{
    name:'Moon Herb',artId:'whisper_moon_herb',artW:28,artH:34,blocking:false,
    description:'Silver-veined leaves fold toward shade even at midday. Apothecaries prize the sap collected before dusk.'
  });
  for(const id of ['bloom_1','bloom_2','bloom_3','bloom_4','bloom_5'])patch(id,{
    name:'Dusk Bloom',artId:'whisper_dusk_bloom',artW:30,artH:38,blocking:false,
    description:'A violet woodland flower that opens fully only when the road lanterns begin to glow.'
  });

  patch('wild_camp',{
    x:12,y:7,name:'Old Road Camp',artId:'whisper_camp',artW:76,artH:62,artAnchor:'topLeft',collisionFootprint:footprint(2,1),
    description:'A sheltered fire ring, patched lean-to, and dry woodpile mark a camp maintained by travelers who never meet.',
    text:'A sheltered fire ring sits beneath an old road marker.'
  });
  for(const id of ['road_lantern_1','road_lantern_2','road_lantern_3'])patch(id,{
    name:'Lantern Road Ward',artId:'whisper_road_lantern',artW:32,artH:68,artLight:68,blocking:false,
    description:'Amber glass encloses a ward-flame that bends toward Haven whenever the forest fog thickens.'
  });
  patch('fallen_cart',{
    x:16,y:7,name:'Axemark Wreck',artId:'whisper_wrecked_cart',artW:80,artH:54,artAnchor:'topLeft',collisionFootprint:footprint(2,1),
    description:'Haven’s eastern-road seal remains visible beneath axe cuts, old rain, and a web of pale roots.',
    searchable:{chance:.58,loot:['travel_ration','healing_draught','trade_crate'],gold:[1,7],foundText:'Under the collapsed driver’s board you find a waxed emergency parcel and a few road coins.',emptyText:'The useful cargo has already been claimed; only splinters and soaked rope remain.'}
  });
  patch('shipment_chest',{
    x:12,y:3,name:'Lost Shipment Strongbox',artId:'whisper_cache',artW:42,artH:36,
    description:'A merchant strongbox lies half-hidden beneath fern fronds, its brass corners dark with weather.'
  });
  patch('wild_chest',{
    x:16,y:15,name:'Rootbound Wayfarer Cache',artId:'whisper_cache',artW:42,artH:36,
    description:'Twisted roots have grown around a small iron-bound cache placed well off the traveled road.'
  });

  /* New authored wilderness details. Blocking pieces stay outside enemy and wildlife circuits. */
  add({
    id:'whisper_wardstone',type:'decor',kind:'wardstone',name:'Mosswater Ward-Stone',x:11,y:8,blocking:true,
    artId:'whisper_wardstone',artW:46,artH:68,description:'The old stone marks the boundary where Haven’s road wards weaken and the older forest laws begin.',
    useAction:{label:'Trace the lantern rune.',oncePerDay:true,mana:2,xp:2,text:'The rune warms beneath your fingers. For a moment, every lantern along the road answers with the same distant pulse.'}
  });
  add({
    id:'whisper_fallen_log',type:'decor',kind:'fallen_log',name:'Storm-Felled Cedar',x:2,y:11,blocking:true,
    artId:'whisper_fallen_log',artW:70,artH:38,artAnchor:'topLeft',collisionFootprint:footprint(2,1),
    description:'Lightning split this cedar years ago. Moss, beetles, and small careful creatures have inherited the hollow trunk.',
    searchable:{chance:.52,loot:['moon_herb','travel_ration','animal_hide'],gold:[0,3],foundText:'Inside the dry heartwood you uncover a forager’s wrapped bundle.',emptyText:'Only beetle husks, soft rot, and damp moss remain.'}
  });
  add({
    id:'whisper_mushroom_ring',type:'decor',kind:'mushrooms',name:'Lanterncap Ring',x:13,y:14,blocking:false,
    artId:'whisper_mushroom_ring',artW:54,artH:32,artAnchor:'topLeft',description:'Tiny gold-capped mushrooms form an almost perfect circle around an empty patch of dark soil.',
    searchable:{chance:.44,loot:['moon_herb','dusk_bloom','antidote'],foundText:'One lanterncap is mature enough to harvest without breaking the ring.',emptyText:'The remaining caps are too young—or too strange—to take safely.'}
  });
  add({
    id:'whisper_root_hollow',type:'decor',kind:'root_hollow',name:'Foxroot Hollow',x:8,y:13,blocking:true,
    artId:'whisper_root_hollow',artW:52,artH:44,description:'The exposed roots of an ancient tree form a dry chamber lined with feathers, nutshells, and bits of blue thread.',
    searchable:{chance:.38,loot:['wild_feathers','copper_charm','smoke_bomb'],gold:[0,5],foundText:'Behind a curtain of root fibers lies a small object carried here by some curious animal.',emptyText:'The hollow holds only old nesting material and a sharp woodland scent.'}
  });
  add({
    id:'whisper_overlook_cairn',type:'decor',kind:'cairn',name:'Eastern Overlook Cairn',x:22,y:2,blocking:true,
    artId:'whisper_cairn',artW:48,artH:58,description:'Travelers have stacked river stones here for generations, each facing the road that brought them safely through.',
    useAction:{label:'Add a stone to the cairn.',oncePerDay:true,stamina:2,xp:2,text:'You choose a flat stone and set it among hundreds of others. The overlook feels briefly less lonely.'}
  });
  add({
    id:'whisper_bridge_marker',type:'sign',kind:'road_marker',name:'Mosswater Bridge Marker',x:7,y:8,blocking:false,
    artId:'whisper_bridge_marker',artW:34,artH:50,description:'One arrow points west to Haven. Another points east, where the carved place-name has been deliberately cut away.',
    artInteractive:true
  });
  add({
    id:'whisper_pond_offering',type:'decor',kind:'offering',name:'Lilymere Offering Stone',x:7,y:12,blocking:true,
    artId:'whisper_offering_stone',artW:42,artH:42,description:'Coins, flower stems, and smooth white pebbles rest on a low stone beside Lilymere Pond.',
    searchable:{chance:.24,loot:['dusk_bloom','wild_feathers'],gold:[0,2],foundText:'Among the offerings is a small item clearly left for whichever traveler needs it next.',emptyText:'Nothing here feels abandoned enough to take.'}
  });

  /* Cartography labels match the authored objects without changing travel portals. */
  AO.MAP_LANDMARKS ||= {};
  AO.MAP_LANDMARKS.wilds=[
    {id:'landmark_havenroad',x:2,y:9,label:'Road to Haven',kind:'exit'},
    {id:'landmark_westbridge',x:9,y:9,label:'Mosswater Bridge',kind:'bridge'},
    {id:'landmark_roadcamp',x:13,y:7,label:'Old Road Camp',kind:'camp'},
    {id:'landmark_overlook',x:22,y:2,label:'Eastern Overlook',kind:'highground'},
    {id:'landmark_lilypond',x:5,y:14,label:'Lilymere Pond',kind:'water'},
    {id:'landmark_northtrail',x:24,y:1,label:'Lantern Mine Trail',kind:'exit'},
    {id:'landmark_ashenroad',x:28,y:9,label:'Road to the Ashen Crypt',kind:'danger'}
  ];

  AO.WhisperwoodComposition={
    version:'v164',mapId:'wilds',
    protectedRoutes:{
      mainRoad:Array.from({length:30},(_,x)=>[x,9]),
      mineTrail:Array.from({length:10},(_,y)=>[24,y]),
      mirelings:[[[6,8],[8,8],[8,10],[5,10]],[[13,10],[15,10],[15,12],[12,12]],[[22,10],[24,10],[24,12],[21,12]],[[25,15],[27,15],[27,13],[24,13]]],
      bandits:[[[17,4],[20,4],[20,6],[17,6]],[[26,5],[28,5],[28,3],[25,3]]],
      deer:[[19,5],[22,5],[22,7],[19,7]]
    }
  };
})();
