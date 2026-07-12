/* Thousandfold Realms v1.4.2 — cartography, authored interiors, broad interaction footprints, and ambient life. */
AO.VERSION='1.4.4-thousandfold-realms-brand-migration';

AO.MAP_LANDMARKS={
  haven:[
    {id:'landmark_inn',x:6,y:4,label:'Lantern Rest',kind:'inn'},
    {id:'landmark_arcana',x:15,y:4,label:'Selene’s Arcana',kind:'arcane'},
    {id:'landmark_tavern',x:24,y:4,label:'Black Lantern',kind:'tavern'},
    {id:'landmark_market',x:15,y:9,label:'Lantern Square',kind:'square'},
    {id:'landmark_provisions',x:6,y:13,label:'Provisions',kind:'shop'},
    {id:'landmark_chapel',x:15,y:13,label:'Last Light Chapel',kind:'chapel'},
    {id:'landmark_forge',x:24,y:13,label:'Borin’s Forge',kind:'forge'},
    {id:'landmark_eastroad',x:28,y:8,label:'Whisperwood Road',kind:'exit'}
  ],
  wilds:[
    {id:'landmark_havenroad',x:2,y:9,label:'Road to Haven',kind:'exit'},
    {id:'landmark_westbridge',x:9,y:9,label:'Mosswater Bridge',kind:'bridge'},
    {id:'landmark_overlook',x:24,y:5,label:'Eastern Overlook',kind:'highground'},
    {id:'landmark_lilypond',x:5,y:14,label:'Lilymere Pond',kind:'water'},
    {id:'landmark_northtrail',x:24,y:1,label:'North Trail',kind:'exit'}
  ],
  inn:[{x:14,y:4,label:'Front Desk',kind:'service'},{x:3,y:4,label:'Common Hearth',kind:'hearth'},{x:26,y:4,label:'Guest Stairs',kind:'stairs'}],
  inn_upper:[{x:14,y:4,label:'Guest Rooms',kind:'rooms'},{x:25,y:12,label:'Room Seven',kind:'danger'}],
  tavern:[{x:8,y:4,label:'Bar',kind:'service'},{x:24,y:4,label:'Stage',kind:'stage'},{x:27,y:14,label:'Cellar Stairs',kind:'stairs'}],
  general_store:[{x:15,y:5,label:'Mara’s Counter',kind:'service'},{x:5,y:5,label:'Remedies',kind:'shop'},{x:24,y:7,label:'Road Supplies',kind:'shop'}],
  forge:[{x:5,y:4,label:'Main Forge',kind:'forge'},{x:15,y:6,label:'Anvil Floor',kind:'service'},{x:24,y:4,label:'Weapon Racks',kind:'shop'}],
  arcane_shop:[{x:15,y:3,label:'Star Orb',kind:'arcane'},{x:15,y:6,label:'Antiquities Counter',kind:'service'},{x:5,y:5,label:'Scroll Archive',kind:'shop'}],
  chapel:[{x:15,y:3,label:'Last Light Altar',kind:'chapel'},{x:15,y:11,label:'Nave',kind:'rooms'}],
  tavern_cellar:[{x:14,y:15,label:'Cellar Exit',kind:'stairs'}],
  mine:[{x:2,y:9,label:'Mine Entrance',kind:'exit'},{x:18,y:5,label:'Crystal Galleries',kind:'danger'},{x:25,y:12,label:'Deep Workings',kind:'danger'}],
  crypt:[{x:2,y:9,label:'Crypt Entrance',kind:'exit'},{x:17,y:7,label:'Warden Hall',kind:'danger'},{x:25,y:7,label:'Ember Vault',kind:'danger'}]
};

/* The visual doorway spans more than one logical tile. Keep the original door entity
   and ID as the pathfinding anchor, but let the entire rendered doorway select it. */
for(const b of AO.MAP_DEFS?.haven?.buildings||[]){
  b.doorHitbox={left:1,right:1,up:1,down:0};
  b.visualDepth=8;
}
for(const obj of AO.MAP_DEFS?.haven?.objects||[]){
  if(obj.integratedBuildingDoor){obj.interactionFootprint={left:1,right:1,up:1,down:0};obj.renderWidth=2;obj.renderHeight=2;}
}

const addObjects=(mapId,items)=>{
  const map=AO.MAP_DEFS?.[mapId];if(!map)return;map.objects||=[];
  const known=new Set(map.objects.map(o=>o.id));for(const item of items)if(!known.has(item.id))map.objects.push(item);
};

/* Interior furnishing additions are additive and use new stable IDs. */
addObjects('inn',[
  {id:'inn_shelf_guestbook',type:'decor',kind:'shelf',x:18,y:4,blocking:true,text:'Guest ledgers, spare lanterns, and folded blankets fill the shelves.'},
  {id:'inn_chair_hearth_1',type:'decor',kind:'bench',x:3,y:8,blocking:true},{id:'inn_chair_hearth_2',type:'decor',kind:'bench',x:5,y:8,blocking:true},
  {id:'inn_lamp_front_1',type:'decor',kind:'lamp',x:11,y:5,blocking:false},{id:'inn_lamp_front_2',type:'decor',kind:'lamp',x:18,y:5,blocking:false},
  {id:'inn_crates_linen',type:'decor',kind:'crates',x:25,y:13,blocking:true,text:'Clean linen and travel blankets are sorted by room.'}
]);
addObjects('inn_upper',[
  {id:'upper_shelf_1',type:'decor',kind:'shelf',x:3,y:13,blocking:true},{id:'upper_shelf_2',type:'decor',kind:'shelf',x:15,y:13,blocking:true},
  {id:'upper_lamp_1',type:'decor',kind:'lamp',x:6,y:4,blocking:false},{id:'upper_lamp_2',type:'decor',kind:'lamp',x:17,y:4,blocking:false},{id:'upper_lamp_3',type:'decor',kind:'lamp',x:25,y:9,blocking:false}
]);
addObjects('tavern',[
  {id:'tavern_bench_1',type:'decor',kind:'bench',x:7,y:11,blocking:true},{id:'tavern_bench_2',type:'decor',kind:'bench',x:15,y:12,blocking:true},{id:'tavern_bench_3',type:'decor',kind:'bench',x:23,y:12,blocking:true},
  {id:'tavern_shelf_mugs',type:'decor',kind:'shelf',x:4,y:4,blocking:true,text:'Rows of mismatched mugs sit beneath a chalk tally.'},
  {id:'tavern_stage_lamp_1',type:'decor',kind:'lamp',x:21,y:5,blocking:false},{id:'tavern_stage_lamp_2',type:'decor',kind:'lamp',x:27,y:5,blocking:false},
  {id:'tavern_supply_crates',type:'decor',kind:'crates',x:25,y:14,blocking:true}
]);
addObjects('general_store',[
  {id:'store_shelf_remedy_1',type:'decor',kind:'shelf',x:4,y:5,blocking:true},{id:'store_shelf_remedy_2',type:'decor',kind:'shelf',x:4,y:10,blocking:true},
  {id:'store_shelf_supply_1',type:'decor',kind:'shelf',x:25,y:5,blocking:true},{id:'store_shelf_supply_2',type:'decor',kind:'shelf',x:25,y:10,blocking:true},
  {id:'store_herbs_2',type:'decor',kind:'herbs',x:11,y:3,blocking:false},{id:'store_herbs_3',type:'decor',kind:'herbs',x:18,y:3,blocking:false},
  {id:'store_lamp_counter',type:'decor',kind:'lamp',x:15,y:8,blocking:false}
]);
addObjects('forge',[
  {id:'forge_anvil_main',type:'decor',kind:'anvil',x:14,y:6,blocking:true,text:'The main anvil is polished bright by years of exacting work.'},
  {id:'forge_anvil_small',type:'decor',kind:'anvil',x:9,y:8,blocking:true},
  {id:'forge_weaponrack_1',type:'decor',kind:'weaponrack',x:24,y:4,blocking:true},{id:'forge_weaponrack_2',type:'decor',kind:'weaponrack',x:26,y:7,blocking:true},
  {id:'forge_crates_ore',type:'decor',kind:'crates',x:4,y:13,blocking:true},{id:'forge_cart_scrap',type:'decor',kind:'cart',x:23,y:13,blocking:true},
  {id:'forge_brazier_1',type:'decor',kind:'brazier',x:11,y:4,blocking:false},{id:'forge_brazier_2',type:'decor',kind:'brazier',x:18,y:4,blocking:false}
]);
addObjects('arcane_shop',[
  {id:'arcane_shelf_3',type:'decor',kind:'shelf',x:5,y:11,blocking:true},{id:'arcane_shelf_4',type:'decor',kind:'shelf',x:24,y:11,blocking:true},
  {id:'arcane_crystal_1',type:'decor',kind:'crystal',x:10,y:7,blocking:true},{id:'arcane_crystal_2',type:'decor',kind:'crystal',x:20,y:7,blocking:true},
  {id:'arcane_lamp_1',type:'decor',kind:'lamp',x:11,y:3,blocking:false},{id:'arcane_lamp_2',type:'decor',kind:'lamp',x:19,y:3,blocking:false},
  {id:'arcane_crates_relics',type:'decor',kind:'crates',x:26,y:14,blocking:true,text:'Sealed crates bear warning sigils in six dead scripts.'}
]);
addObjects('chapel',[
  {id:'chapel_pew_1',type:'decor',kind:'pew',x:10,y:8,blocking:true},{id:'chapel_pew_2',type:'decor',kind:'pew',x:19,y:8,blocking:true},
  {id:'chapel_pew_3',type:'decor',kind:'pew',x:10,y:12,blocking:true},{id:'chapel_pew_4',type:'decor',kind:'pew',x:19,y:12,blocking:true},
  {id:'chapel_statue_1',type:'decor',kind:'statue',x:6,y:4,blocking:true},{id:'chapel_statue_2',type:'decor',kind:'statue',x:24,y:4,blocking:true},
  {id:'chapel_brazier_1',type:'decor',kind:'brazier',x:11,y:4,blocking:false},{id:'chapel_brazier_2',type:'decor',kind:'brazier',x:19,y:4,blocking:false}
]);

AO.AMBIENT_ACTORS={
  town_courier:{id:'town_courier',name:'Lantern Courier',title:'Town Runner',map:'haven',x:10,y:8,ambient:true,activity:'parcel',moveEvery:1050,route:[[10,8],[11,8],[12,8],[13,8],[14,8],[15,8],[16,8],[17,8],[18,8],[19,8],[20,8],[19,8],[18,8],[17,8],[16,8],[15,8],[14,8],[13,8],[12,8],[11,8]],visual:{skin:'#b98a68',hair:'#44342c',outfit:'#5a684e',accent:'#d0aa5b'},ambientText:'“Messages, parcels, and no questions asked.”'},
  town_sweeper:{id:'town_sweeper',name:'Square Keeper',title:'Lantern Square',map:'haven',x:12,y:10,ambient:true,activity:'sweep',moveEvery:1450,route:[[12,10],[13,10],[14,10],[15,10],[16,10],[17,10],[18,10],[17,10],[16,10],[15,10],[14,10],[13,10]],visual:{skin:'#9e765c',hair:'#d0c1a7',outfit:'#63594c',accent:'#b79656'},ambientText:'“Cobble remembers every muddy boot.”'},
  inn_guest:{id:'inn_guest',name:'Road-Weary Guest',title:'Traveler',map:'inn',x:7,y:11,ambient:true,activity:'mug',moveEvery:1900,route:[[7,11],[8,11],[8,12],[7,12]],visual:{skin:'#b68163',hair:'#704b34',outfit:'#4f6170',accent:'#b88953'},ambientText:'“The eastern road is quieter than it should be.”'},
  inn_attendant:{id:'inn_attendant',name:'Inn Attendant',title:'Lantern Rest Staff',map:'inn',x:18,y:6,ambient:true,activity:'linen',moveEvery:1250,route:[[18,6],[19,6],[20,6],[20,7],[19,7],[18,7]],visual:{skin:'#c09275',hair:'#4c3932',outfit:'#657166',accent:'#d0ad67'},ambientText:'“Fresh linen in every room. Even Room Seven, when it behaves.”'},
  tavern_patron_1:{id:'tavern_patron_1',name:'Local Patron',title:'Regular',map:'tavern',x:7,y:8,ambient:true,activity:'mug',moveEvery:2200,route:[[7,8],[8,8],[8,9],[7,9]],visual:{skin:'#a9795d',hair:'#3f312b',outfit:'#665043',accent:'#bd8d4e'},ambientText:'“Ask Bran which stories are true. Then believe the opposite.”'},
  tavern_patron_2:{id:'tavern_patron_2',name:'Traveling Musician',title:'Wayfarer',map:'tavern',x:23,y:6,ambient:true,activity:'music',moveEvery:2600,route:[[23,6],[24,6],[25,6],[24,6]],visual:{skin:'#b88a6c',hair:'#2f2933',outfit:'#5b4e6b',accent:'#cf9d5e'},ambientText:'“The next song improves once someone buys supper.”'},
  store_shopper:{id:'store_shopper',name:'Road Shopper',title:'Customer',map:'general_store',x:6,y:7,ambient:true,activity:'browse',moveEvery:1350,route:[[6,7],[6,8],[6,9],[7,9],[7,8],[7,7]],visual:{skin:'#9a735c',hair:'#59402f',outfit:'#4e6570',accent:'#b8a05b'},ambientText:'“Mara’s bitter remedies work. That is the problem.”'},
  forge_apprentice:{id:'forge_apprentice',name:'Forge Apprentice',title:'Smith-in-Training',map:'forge',x:11,y:7,ambient:true,activity:'hammer',moveEvery:1200,route:[[11,7],[12,7],[12,8],[11,8]],visual:{skin:'#b27d5c',hair:'#332b27',outfit:'#5e5953',accent:'#c17843'},ambientText:'“Borin says sparks teach faster than books.”'},
  arcane_scholar:{id:'arcane_scholar',name:'Visiting Scholar',title:'Relic Researcher',map:'arcane_shop',x:7,y:8,ambient:true,activity:'read',moveEvery:1800,route:[[7,8],[7,9],[8,9],[8,8]],visual:{skin:'#a889b7',hair:'#d6d0dc',outfit:'#4b5068',accent:'#79a9bd',ears:'long'},ambientText:'“The shelf moved while I was reading it.”'},
  chapel_pilgrim:{id:'chapel_pilgrim',name:'Quiet Pilgrim',title:'Wayfarer',map:'chapel',x:13,y:12,ambient:true,activity:'pray',moveEvery:2400,route:[[13,12],[13,11],[14,11],[14,12]],visual:{skin:'#96705b',hair:'#5f5145',outfit:'#5f5a50',accent:'#c3a85e'},ambientText:'“The light asks no name before it warms you.”'}
};
for(const actor of Object.values(AO.AMBIENT_ACTORS)){
  if(!AO.NPCS[actor.id])AO.NPCS[actor.id]=actor;
  const map=AO.MAP_DEFS?.[actor.map];if(map&&!map.npcs.includes(actor.id))map.npcs.push(actor.id);
}
