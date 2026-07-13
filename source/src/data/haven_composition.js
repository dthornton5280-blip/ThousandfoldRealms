/* Thousandfold Realms v1.6.3-dev — Haven square and starter-interior composition pass. */
(() => {
  'use strict';
  if(!window.AO||!AO.MAP_DEFS||!AO.MapBuilders)return;

  const footprint=(w,h=1)=>Array.from({length:h},(_,y)=>Array.from({length:w},(_,x)=>({x,y}))).flat();
  const map=id=>AO.MAP_DEFS[id];
  const object=(mapId,id)=>map(mapId)?.objects?.find(entry=>entry.id===id);
  const place=(mapId,id,x,y,values={})=>{const entry=object(mapId,id);if(entry)Object.assign(entry,{x,y,...values});return entry;};
  const patch=(mapId,id,values={})=>{const entry=object(mapId,id);if(entry)Object.assign(entry,values);return entry;};
  const add=(mapId,entry)=>{const target=map(mapId);if(!target)return null;target.objects||=[];const prior=target.objects.find(item=>item.id===entry.id);if(prior){Object.assign(prior,entry);return prior;}target.objects.push(entry);return entry;};
  const hide=(mapId,ids)=>{for(const id of ids){const entry=object(mapId,id);if(entry)Object.assign(entry,{hidden:true,blocking:false});}};

  /* ---------- Haven exterior ---------- */
  AO.MapBuilders.haven=function(){
    const grid=this.border(this.grid('grass'),'tree');
    /* Six storefront footprints. The doorway cell is restored to cobble below. */
    for(const [x,y,w,h] of [[2,2,8,5],[11,2,8,5],[20,2,8,5],[2,11,8,5],[11,11,8,5],[20,11,8,5]])this.rect(grid,x,y,w,h,'roof');
    /* Broad market street with a clear east-west road and north-south lantern walk. */
    this.rect(grid,1,7,28,4,'cobble');
    this.rect(grid,13,1,4,16,'cobble');
    this.lineH(grid,4,8,16,'path');this.lineH(grid,21,25,16,'path');
    this.lineH(grid,4,8,1,'path');this.lineH(grid,21,25,1,'path');
    for(const [x,y] of [[6,6],[15,6],[24,6],[6,15],[15,15],[24,15],[29,8]])grid[y][x]='cobble';
    /* Soft garden borders keep the square from feeling like a bare rectangle. */
    for(const [x,y,tile] of [[1,6,'flower_patch'],[10,6,'shrub'],[19,6,'shrub'],[28,6,'flower_patch'],[1,11,'shrub'],[10,11,'flower_patch'],[19,11,'flower_patch'],[28,11,'shrub']])grid[y][x]=tile;
    return grid;
  };

  place('haven','market_stall_1',6,8,{artAnchor:'topLeft',artW:80,artH:64,collisionFootprint:footprint(2,1)});
  place('haven','market_stall_2',22,8,{artAnchor:'topLeft',artW:80,artH:64,collisionFootprint:footprint(2,1)});
  place('haven','bench_1',10,9,{artAnchor:'topLeft',artW:64,artH:40,collisionFootprint:footprint(2,1)});
  place('haven','bench_2',19,9,{artAnchor:'topLeft',artW:64,artH:40,collisionFootprint:footprint(2,1)});
  place('haven','town_fountain',15,9,{collisionFootprint:footprint(1,1)});
  /* Keep the public noticeboard in the square instead of letting its old 2x2
     interaction area steal input from Selene's doorway one row north. */
  place('haven','town_board',13,8,{blocking:false,artAnchor:'topLeft',artW:64,artH:48,interactionFootprint:footprint(2,1)});
  place('haven','haven_well',2,8,{artAnchor:'topLeft',artW:64,artH:64,collisionFootprint:footprint(2,2)});
  place('haven','haven_delivery_cart',24,8,{artAnchor:'topLeft',artW:96,artH:72,collisionFootprint:[{x:1,y:1},{x:2,y:1}]});
  for(const [id,x,y] of [['lamp_1',11,7],['lamp_2',18,7],['lamp_3',11,10],['lamp_4',18,10]])place('haven',id,x,y,{blocking:false});
  place('haven','flowers_1',3,7,{blocking:false});place('haven','flowers_2',26,7,{blocking:false});
  add('haven',{id:'haven_east_sign',type:'decor',kind:'sign',name:'Eastern Road Signpost',x:28,y:8,blocking:false,artId:'road_signpost',artW:48,artH:48,description:'Weathered arrows point west to Lantern Square and east through Whisperwood toward Aurelia.'});
  add('haven',{id:'haven_gate_north',type:'decor',kind:'gate',name:'Eastern Gate Lantern',x:29,y:6,blocking:false,artId:'town_gate_post',artW:32,artH:64,artLight:54,description:'A warded lantern marks the northern side of Haven’s open eastern gate.'});
  add('haven',{id:'haven_gate_south',type:'decor',kind:'gate',name:'Eastern Gate Lantern',x:29,y:10,blocking:false,artId:'town_gate_post',artW:32,artH:64,artLight:54,description:'Its twin burns on the southern side of the road, bright even in heavy fog.'});
  add('haven',{id:'haven_banner_1',type:'decor',kind:'banner',name:'Last Lantern Banner',x:12,y:5,blocking:false,artId:'street_banner',artW:32,artH:64,description:'The stitched lantern emblem has faded at the edges but never at its flame.'});
  add('haven',{id:'haven_banner_2',type:'decor',kind:'banner',name:'Last Lantern Banner',x:17,y:12,blocking:false,artId:'street_banner',artW:32,artH:64,description:'A square banner turns slowly above the southern walk.'});

  if(AO.NPCS?.mira)Object.assign(AO.NPCS.mira,{x:16,y:8});
  if(AO.NPCS?.nessa)Object.assign(AO.NPCS.nessa,{x:8,y:9});
  if(AO.NPCS?.jory)Object.assign(AO.NPCS.jory,{x:21,y:9});
  if(AO.AMBIENT_ACTORS?.town_courier)Object.assign(AO.AMBIENT_ACTORS.town_courier,{x:10,y:8,route:[[10,8],[11,8],[12,8],[13,8],[14,8],[15,8],[16,8],[17,8],[18,8],[19,8],[20,8],[19,8],[18,8],[17,8],[16,8],[15,8],[14,8],[13,8],[12,8],[11,8]]});
  if(AO.AMBIENT_ACTORS?.town_sweeper)Object.assign(AO.AMBIENT_ACTORS.town_sweeper,{x:12,y:10,route:[[12,10],[13,10],[14,10],[15,10],[16,10],[17,10],[18,10],[17,10],[16,10],[15,10],[14,10],[13,10]]});

  /* ---------- Lantern Rest ground floor ---------- */
  AO.MapBuilders.inn=function(){
    const grid=this.room('woodfloor');
    this.rect(grid,11,2,8,3,'rug');
    this.rect(grid,3,8,8,4,'rug');
    this.rect(grid,20,8,7,4,'rug');
    this.lineV(grid,14,6,16,'woodfloor');this.lineV(grid,15,6,16,'woodfloor');
    return grid;
  };
  hide('inn',['inn_bed_1','inn_bed_2']);
  place('inn','inn_fire',2,3,{artAnchor:'topLeft',artW:64,artH:64,collisionFootprint:footprint(2,2)});
  place('inn','inn_desk',12,3,{artAnchor:'topLeft',artW:128,artH:64,collisionFootprint:footprint(4,1)});
  place('inn','inn_shelf_guestbook',19,3,{artAnchor:'topLeft',artW:64,artH:48,collisionFootprint:footprint(2,1)});
  place('inn','inn_stairs',26,4,{interactionFootprint:{left:0,right:0,up:1,down:0}});
  place('inn','inn_table_1',5,9,{artAnchor:'topLeft',artW:64,artH:48,collisionFootprint:footprint(2,1)});
  place('inn','inn_table_2',22,9,{artAnchor:'topLeft',artW:64,artH:48,collisionFootprint:footprint(2,1)});
  place('inn','inn_chair_hearth_1',4,11,{artAnchor:'topLeft',artW:64,artH:32,collisionFootprint:footprint(2,1)});
  place('inn','inn_chair_hearth_2',22,11,{artAnchor:'topLeft',artW:64,artH:32,collisionFootprint:footprint(2,1)});
  place('inn','inn_lamp_front_1',10,5,{blocking:false});place('inn','inn_lamp_front_2',20,5,{blocking:false});
  place('inn','inn_crates_linen',24,13,{artAnchor:'topLeft',artW:80,artH:48,collisionFootprint:footprint(2,1)});
  add('inn',{id:'inn_luggage_rack',type:'decor',kind:'luggage',name:'Traveler’s Luggage Rack',x:3,y:14,blocking:true,artId:'luggage_rack',artW:80,artH:40,artAnchor:'topLeft',collisionFootprint:footprint(2,1),description:'Tagged packs, walking sticks, and rolled blankets wait for guests checking in.',searchable:{chance:.18,loot:['travel_ration','honey_cake'],foundText:'A parcel in the public exchange basket contains a small road meal.',emptyText:'Every remaining pack bears a guest’s name and room number.'}});
  add('inn',{id:'inn_breakfast_sideboard',type:'decor',kind:'sideboard',name:'Breakfast Sideboard',x:3,y:6,blocking:true,artId:'breakfast_sideboard',artW:80,artH:48,artAnchor:'topLeft',collisionFootprint:footprint(2,1),description:'Tea, oat bread, preserves, and clean cups are laid out for early departures.',useAction:{label:'Take a modest breakfast.',oncePerDay:true,hp:2,stamina:2,text:'Warm tea and oat bread settle the stomach before the road.'}});
  if(AO.NPCS?.elowen)Object.assign(AO.NPCS.elowen,{x:15,y:5});
  if(AO.AMBIENT_ACTORS?.inn_guest)Object.assign(AO.AMBIENT_ACTORS.inn_guest,{x:7,y:9,route:[[7,9],[8,9],[8,10],[7,10]]});
  if(AO.AMBIENT_ACTORS?.inn_attendant)Object.assign(AO.AMBIENT_ACTORS.inn_attendant,{x:21,y:5,route:[[21,5],[22,5],[22,6],[21,6],[20,6],[20,5]]});

  /* ---------- Lantern Rest upper floor ---------- */
  AO.MapBuilders.innUpper=function(){
    const grid=this.room('woodfloor');
    this.lineH(grid,1,28,8,'woodwall');
    for(const x of [5,11,18,24])grid[8][x]='woodfloor';
    this.lineV(grid,9,1,7,'woodwall');grid[4][9]='woodfloor';
    this.lineV(grid,20,1,7,'woodwall');grid[4][20]='woodfloor';
    this.lineV(grid,9,9,16,'woodwall');grid[12][9]='woodfloor';
    this.lineV(grid,20,9,16,'woodwall');grid[12][20]='woodfloor';
    this.rect(grid,11,10,8,5,'rug');
    return grid;
  };
  place('inn_upper','upper_bed_1',3,3,{artAnchor:'topLeft',artW:32,artH:56,collisionFootprint:footprint(1,2)});
  place('inn_upper','upper_bed_2',13,3,{artAnchor:'topLeft',artW:32,artH:56,collisionFootprint:footprint(1,2)});
  place('inn_upper','upper_bed_3',24,3,{artAnchor:'topLeft',artW:32,artH:56,collisionFootprint:footprint(1,2)});
  place('inn_upper','upper_bed_4',24,11,{artAnchor:'topLeft',artW:32,artH:56,collisionFootprint:footprint(1,2)});
  place('inn_upper','upper_shelf_1',3,6,{artAnchor:'topLeft',artW:64,artH:48,collisionFootprint:footprint(2,1)});
  place('inn_upper','upper_shelf_2',13,6,{artAnchor:'topLeft',artW:64,artH:48,collisionFootprint:footprint(2,1)});
  for(const [id,x,y] of [['upper_lamp_1',6,3],['upper_lamp_2',16,3],['upper_lamp_3',25,9]])place('inn_upper',id,x,y,{blocking:false});
  add('inn_upper',{id:'upper_hall_table',type:'decor',kind:'table',name:'Upper Hall Table',x:13,y:11,blocking:true,artId:'table_square',artW:64,artH:48,artAnchor:'topLeft',collisionFootprint:footprint(2,1),description:'A narrow hall table holds fresh water, spare candles, and a bell for the night attendant.'});

  /* ---------- Mara’s Provisions ---------- */
  AO.MapBuilders.generalStore=function(){
    const grid=this.room('woodfloor');
    this.rect(grid,11,2,8,4,'rug');
    this.rect(grid,8,7,5,4,'rug');this.rect(grid,18,7,5,4,'rug');
    this.lineV(grid,14,7,16,'woodfloor');this.lineV(grid,15,7,16,'woodfloor');
    return grid;
  };
  const storeShelves=['shelf_1','shelf_2','store_shelf_remedy_1','store_shelf_remedy_2','shelf_3','shelf_4','store_shelf_supply_1','store_shelf_supply_2'];
  const shelfPlaces=[[2,3],[2,6],[2,9],[2,12],[26,3],[26,6],[26,9],[26,12]];
  storeShelves.forEach((id,index)=>place('general_store',id,shelfPlaces[index][0],shelfPlaces[index][1],{artAnchor:'topLeft',artW:64,artH:48,collisionFootprint:footprint(2,1)}));
  place('general_store','store_counter',12,4,{artAnchor:'topLeft',artW:128,artH:64,collisionFootprint:footprint(4,1)});
  for(const [id,x] of [['herb_rack',8],['store_herbs_2',13],['store_herbs_3',18]])place('general_store',id,x,2,{blocking:false,artAnchor:'topLeft',artW:64,artH:32});
  place('general_store','store_crates',24,14,{artAnchor:'topLeft',artW:34,artH:32,collisionFootprint:footprint(1,1)});
  place('general_store','store_lamp_counter',16,6,{blocking:false});
  add('general_store',{id:'store_remedy_display',type:'decor',kind:'display',name:'Remedy Display',x:8,y:8,blocking:true,artId:'remedy_display',artW:80,artH:48,artAnchor:'topLeft',collisionFootprint:footprint(2,1),description:'Bandages, salves, antidotes, and labeled tea packets are arranged by symptom.',searchable:{chance:.22,loot:['antidote','healing_draught'],foundText:'A returned remedy packet has been cleared for public use.',emptyText:'Everything else is sealed, labeled, and accounted for.'}});
  add('general_store',{id:'store_supply_baskets',type:'decor',kind:'display',name:'Road Supply Baskets',x:19,y:8,blocking:true,artId:'supply_baskets',artW:72,artH:40,artAnchor:'topLeft',collisionFootprint:footprint(2,1),description:'Rope, tinder, ration tins, and weather covers fill broad wicker baskets.'});
  if(AO.NPCS?.mara)Object.assign(AO.NPCS.mara,{x:15,y:6});
  if(AO.AMBIENT_ACTORS?.store_shopper)Object.assign(AO.AMBIENT_ACTORS.store_shopper,{x:8,y:7,route:[[8,7],[9,7],[9,8],[9,9],[8,9],[8,8]]});

  /* ---------- Borin’s Forge ---------- */
  AO.MapBuilders.forge=function(){
    const grid=this.room('stonefloor');
    this.rect(grid,2,2,8,5,'forgefloor');
    this.rect(grid,11,5,9,6,'forgefloor');
    this.rect(grid,22,2,6,7,'forgefloor');
    this.rect(grid,11,12,8,4,'rug');
    return grid;
  };
  hide('forge',['anvil_2','forge_anvil_small','forge_weaponrack_2']);
  place('forge','forge_fire',2,2,{artAnchor:'topLeft',artW:64,artH:64,collisionFootprint:footprint(2,2)});
  place('forge','forge_workbench_art',6,3,{artAnchor:'topLeft',artW:96,artH:48,collisionFootprint:footprint(3,1)});
  place('forge','forge_wall_tools_art',9,2,{blocking:false,artAnchor:'topLeft',artW:64,artH:40});
  place('forge','forge_anvil_main',12,7,{name:'Main Anvil',artId:'anvil',artW:48,artH:40,artAnchor:'topLeft',collisionFootprint:footprint(2,1)});
  place('forge','anvil_1',16,8,{name:'Detail Anvil',artId:'anvil',artW:40,artH:36,artAnchor:'topLeft',collisionFootprint:footprint(1,1),description:'A smaller anvil is reserved for fittings, clasps, and delicate repair work.'});
  place('forge','weapon_rack',24,3,{name:'Finished Weapons Rack',artId:'weaponrack',artW:64,artH:64,artAnchor:'topLeft',collisionFootprint:footprint(2,2)});
  place('forge','forge_weaponrack_1',25,7,{name:'Repair Rack',artId:'weaponrack',artW:64,artH:64,artAnchor:'topLeft',collisionFootprint:footprint(2,2)});
  place('forge','ore_crates',3,10,{artAnchor:'topLeft',artW:34,artH:32});
  place('forge','forge_crates_ore',5,10,{artAnchor:'topLeft',artW:34,artH:32});
  place('forge','forge_cart_scrap',22,13,{artAnchor:'topLeft',artW:80,artH:48,collisionFootprint:footprint(2,1)});
  for(const [id,x,y] of [['forge_brazier_1',10,5],['forge_brazier_2',20,5]])place('forge',id,x,y,{blocking:false});
  add('forge',{id:'forge_quench_trough',type:'decor',kind:'trough',name:'Quenching Trough',x:8,y:8,blocking:true,artId:'quench_trough',artW:80,artH:40,artAnchor:'topLeft',collisionFootprint:footprint(2,1),description:'Dark water shivers inside an iron-bound trough beside the anvil floor.',useAction:{label:'Cool your hands at the trough.',oncePerDay:true,hp:1,stamina:2,text:'The water is painfully cold, but it clears the forge heat from your head.'}});
  if(AO.NPCS?.borin)Object.assign(AO.NPCS.borin,{x:14,y:6});
  if(AO.AMBIENT_ACTORS?.forge_apprentice)Object.assign(AO.AMBIENT_ACTORS.forge_apprentice,{x:11,y:9,route:[[11,9],[12,9],[12,10],[11,10]]});

  /* ---------- Selene’s Arcana ---------- */
  AO.MapBuilders.arcaneShop=function(){
    const grid=this.room('magicfloor');
    this.rect(grid,11,2,8,5,'rune');
    this.rect(grid,3,3,5,11,'rug');
    this.rect(grid,22,3,5,11,'rug');
    this.rect(grid,11,9,8,4,'rug');
    return grid;
  };
  place('arcane_shop','arcane_counter',12,7,{artAnchor:'topLeft',artW:128,artH:48,collisionFootprint:footprint(4,1)});
  const arcShelves=[['arcane_shelf_1',2,3],['arcane_shelf_3',2,10],['arcane_shelf_2',26,3],['arcane_shelf_4',26,10]];
  for(const [id,x,y] of arcShelves)place('arcane_shop',id,x,y,{artAnchor:'topLeft',artW:64,artH:48,collisionFootprint:footprint(2,1)});
  place('arcane_shop','arcane_orb',15,3,{name:'Impossible View Orb',artId:'relic_pedestal',artW:48,artH:64,artAnchor:'topLeft',collisionFootprint:footprint(1,2)});
  place('arcane_shop','crystal_1',11,4,{name:'Azure Focus Crystal',artId:'crystal',artW:32,artH:48,blocking:false});
  place('arcane_shop','crystal_2',19,4,{name:'Rose Focus Crystal',artId:'crystal',artW:32,artH:48,blocking:false});
  place('arcane_shop','arcane_crystal_1',8,8,{name:'Bound Relic Crystal',artId:'crystal',artW:40,artH:56,collisionFootprint:footprint(1,1)});
  place('arcane_shop','arcane_crystal_2',21,8,{name:'Bound Relic Crystal',artId:'crystal',artW:40,artH:56,collisionFootprint:footprint(1,1)});
  place('arcane_shop','arcane_lamp_1',10,2,{blocking:false});place('arcane_shop','arcane_lamp_2',20,2,{blocking:false});
  place('arcane_shop','arcane_crates_relics',25,14,{artAnchor:'topLeft',artW:80,artH:48,collisionFootprint:footprint(2,1)});
  add('arcane_shop',{id:'arcane_reading_table',type:'decor',kind:'table',name:'Scholar’s Reading Table',x:5,y:8,blocking:true,artId:'reading_table',artW:80,artH:48,artAnchor:'topLeft',collisionFootprint:footprint(2,1),description:'Open notes surround a weighted map of the eastern marches.',searchable:{chance:.18,loot:['scroll_sparks','mana_tonic'],foundText:'A copied field note has been marked safe for students to take.',emptyText:'The remaining notes are either private or incomprehensible.'}});
  if(AO.NPCS?.selene)Object.assign(AO.NPCS.selene,{x:15,y:9});
  if(AO.AMBIENT_ACTORS?.arcane_scholar)Object.assign(AO.AMBIENT_ACTORS.arcane_scholar,{x:7,y:8,route:[[7,8],[7,9],[8,9],[8,8]]});

  /* ---------- Chapel of the Last Light ---------- */
  AO.MapBuilders.chapel=function(){
    const grid=this.room('chapelfloor');
    this.rect(grid,11,2,8,4,'altar');
    this.lineV(grid,14,5,16,'rug');this.lineV(grid,15,5,16,'rug');
    return grid;
  };
  hide('chapel',['chapel_pew_1','chapel_pew_2','chapel_pew_3','chapel_pew_4']);
  place('chapel','chapel_altar',14,2,{artAnchor:'topLeft',artW:64,artH:72,collisionFootprint:footprint(2,2)});
  for(const [id,x,y] of [['pew_1',6,7],['pew_2',18,7],['pew_3',6,11],['pew_4',18,11]])place('chapel',id,x,y,{artAnchor:'topLeft',artW:96,artH:32,collisionFootprint:footprint(3,1)});
  for(const [id,x,y] of [['chapel_lamp_1',11,4],['chapel_lamp_2',19,4],['chapel_brazier_1',10,6],['chapel_brazier_2',20,6]])place('chapel',id,x,y,{blocking:false});
  place('chapel','chapel_statue_1',4,3,{artAnchor:'topLeft',artW:48,artH:72,collisionFootprint:footprint(1,2)});
  place('chapel','chapel_statue_2',25,3,{artAnchor:'topLeft',artW:48,artH:72,collisionFootprint:footprint(1,2)});
  add('chapel',{id:'chapel_lectern',type:'decor',kind:'lectern',name:'Road-Worn Lectern',x:9,y:4,blocking:true,artId:'lectern',artW:48,artH:56,artAnchor:'topLeft',collisionFootprint:footprint(1,1),description:'A ledger records names of travelers who asked for light, shelter, or remembrance.'});
  add('chapel',{id:'chapel_offering_table',type:'decor',kind:'table',name:'Traveler’s Offering Table',x:22,y:14,blocking:true,artId:'offering_table',artW:72,artH:40,artAnchor:'topLeft',collisionFootprint:footprint(2,1),description:'Bread, candles, patched gloves, and small coins are left for whoever arrives next.',searchable:{chance:.20,loot:['honey_cake','scroll_mending'],gold:[0,3],foundText:'A note explicitly invites travelers to take one useful offering.',emptyText:'The remaining gifts are meant for someone else.'}});
  if(AO.NPCS?.odo)Object.assign(AO.NPCS.odo,{x:15,y:5});
  if(AO.AMBIENT_ACTORS?.chapel_pilgrim)Object.assign(AO.AMBIENT_ACTORS.chapel_pilgrim,{x:13,y:12,route:[[13,12],[13,13],[14,13],[14,12]]});

  /* Updated local-map labels match the composed spaces. */
  AO.MAP_LANDMARKS.haven=[
    {x:6,y:4,label:'Lantern Rest',kind:'inn'},{x:15,y:4,label:'Selene’s Arcana',kind:'arcane'},{x:24,y:4,label:'Black Lantern',kind:'tavern'},
    {x:15,y:9,label:'Lantern Square',kind:'square'},{x:6,y:13,label:'Provisions',kind:'shop'},{x:15,y:13,label:'Last Light Chapel',kind:'chapel'},
    {x:24,y:13,label:'Borin’s Forge',kind:'forge'},{x:28,y:8,label:'Whisperwood Road',kind:'exit'}
  ];
  AO.MAP_LANDMARKS.inn=[{x:14,y:4,label:'Front Desk',kind:'service'},{x:3,y:4,label:'Common Hearth',kind:'hearth'},{x:26,y:4,label:'Guest Stairs',kind:'stairs'}];
  AO.MAP_LANDMARKS.general_store=[{x:14,y:5,label:'Mara’s Counter',kind:'service'},{x:4,y:7,label:'Remedies',kind:'shop'},{x:26,y:8,label:'Road Supplies',kind:'shop'}];
  AO.MAP_LANDMARKS.forge=[{x:3,y:3,label:'Ward-Stone Forge',kind:'forge'},{x:13,y:8,label:'Anvil Floor',kind:'service'},{x:25,y:5,label:'Weapon Racks',kind:'shop'}];
  AO.MAP_LANDMARKS.arcane_shop=[{x:15,y:4,label:'Impossible View Orb',kind:'arcane'},{x:14,y:8,label:'Antiquities Counter',kind:'service'},{x:4,y:7,label:'Scroll Archive',kind:'shop'}];
  AO.MAP_LANDMARKS.chapel=[{x:15,y:3,label:'Last Light Altar',kind:'chapel'},{x:15,y:11,label:'Lantern Nave',kind:'rooms'}];

  AO.HavenComposition={version:'v163',maps:['haven','inn','inn_upper','general_store','forge','arcane_shop','chapel']};
})();
