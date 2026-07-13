/* Thousandfold Realms v1.6.1-dev — Haven art placement, furnished interiors, and searchable world details. */
(() => {
  'use strict';
  if(!window.AO||!AO.MAP_DEFS||!AO.MapBuilders)return;

  const footprint=(w,h=1)=>Array.from({length:h},(_,y)=>Array.from({length:w},(_,x)=>({x,y}))).flat();
  const map=id=>AO.MAP_DEFS[id];
  const object=(mapId,id)=>map(mapId)?.objects?.find(entry=>entry.id===id);
  const patch=(mapId,id,values)=>{const target=object(mapId,id);if(target)Object.assign(target,values);return target;};
  const add=(mapId,values)=>{const target=map(mapId);if(!target)return;target.objects||=[];if(!target.objects.some(entry=>entry.id===values.id))target.objects.push(values);};

  /* The tavern now uses furniture entities for collision rather than a solid 9×2 bar tile. */
  AO.MapBuilders.tavern=function(){
    const grid=this.room('woodfloor');
    this.rect(grid,20,2,8,3,'stage');
    this.rect(grid,11,11,8,3,'rug');
    return grid;
  };

  /* Exterior architecture keeps one logical door per building, with a taller visual hit area. */
  for(const entry of map('haven')?.objects||[]){
    if(entry.type==='door'&&!entry.integratedBuildingDoor)entry.artId='door_arch';
    if(entry.type==='door')entry.interactionFootprint??={left:0,right:0,up:1,down:0};
  }
  for(const [mapId,definition] of Object.entries(AO.MAP_DEFS)){
    for(const entry of definition.objects||[]){
      if(entry.type!=='door'||entry.integratedBuildingDoor)continue;
      entry.artId=entry.id.includes('cellar')?'cellar_door':'door_arch';
      entry.openArtId='door_frame';entry.artW=32;entry.artH=48;entry.interactionFootprint??={left:0,right:0,up:1,down:0};
    }
  }

  /* Haven square and storefront details. */
  patch('haven','town_fountain',{
    name:'Lantern Shrine',kind:'shrine',artId:'shrine',artW:48,artH:64,
    description:'The town spring rises through a lantern monument built from the oldest ward-stones in Haven.',
    useAction:{label:'Rest a hand on the warm stone.',oncePerDay:true,mana:2,stamina:2,text:'The stone answers with a quiet warmth, steadying breath and thought.'}
  });
  patch('haven','market_stall_1',{
    name:'Nessa’s Cloth Stall',artId:'market_stall',artW:80,artH:64,artAnchor:'topLeft',collisionFootprint:footprint(2,1),
    description:'Weatherproof cloaks, dyed cord, and patched road blankets hang beneath a striped awning.',
    searchable:{chance:.28,loot:['travel_ration','honey_cake'],gold:[0,3],foundText:'Between folded blankets you find a small traveler’s bundle Nessa marked as free to take.',emptyText:'Everything useful has already been carefully sorted.'}
  });
  patch('haven','market_stall_2',{
    name:'Jory’s Jewel Stall',artId:'market_stall',artW:80,artH:64,artAnchor:'topLeft',collisionFootprint:footprint(2,1),
    description:'Small rings, polished stones, and repaired clasps rest beneath a locked glass lid.',
    searchable:{chance:.18,loot:['copper_charm','silver_ring'],gold:[1,4],foundText:'A loose display drawer holds a forgotten trinket and a few coins.',emptyText:'Jory’s locks and inventory marks leave nothing overlooked.'}
  });
  for(const id of ['bench_1','bench_2'])patch('haven',id,{
    name:'Lantern Square Bench',artId:'bench',artW:64,artH:40,artAnchor:'topLeft',collisionFootprint:footprint(2,1),
    description:'A broad oak bench faces the ward-stone and the busiest doors in Haven.',
    useAction:{label:'Sit for a moment.',oncePerDay:true,stamina:2,text:'The noise of the square settles into a familiar rhythm. You rise with steadier legs.'}
  });
  for(const id of ['lamp_1','lamp_2','lamp_3','lamp_4'])patch('haven',id,{name:'Warded Lamp Post',artId:'lamp_post',artW:24,artH:64,artLight:66,description:'A smokeless lantern burns behind amber glass etched with road wards.'});
  for(const id of ['flowers_1','flowers_2'])patch('haven',id,{name:'Square Flower Box',artId:'flower_planter',artW:48,artH:32,description:'Hardy mountain flowers soften the stonework around Lantern Square.'});
  patch('haven','town_board',{name:'Haven Noticeboard',artId:'noticeboard',artW:64,artH:48,description:'Contracts, road warnings, room notices, and three increasingly angry reminders about borrowed ladders.'});
  add('haven',{id:'haven_well',type:'decor',kind:'well',name:'Old Market Well',x:3,y:9,blocking:true,artId:'well',artW:64,artH:64,
    description:'The covered well predates the square. Its bucket chain is newer than everything around it.',
    useAction:{label:'Draw a cup of water.',oncePerDay:true,stamina:2,text:'The water is cold, metallic, and startlingly refreshing.'}});
  add('haven',{id:'haven_delivery_cart',type:'decor',kind:'cart',name:'Road Delivery Cart',x:26,y:9,blocking:true,artId:'cart',artW:80,artH:48,collisionFootprint:footprint(2,1),
    description:'A mud-spattered cart waits for cargo bound toward Whisperwood.',
    searchable:{chance:.32,loot:['travel_ration','healing_draught'],gold:[0,4],foundText:'Beneath a tied canvas you find a small parcel marked “road emergency.”',emptyText:'The remaining cargo is sealed, counted, and plainly owned.'}});

  /* Black Lantern Tavern: real bar, dining, hearth, stage, kitchen corner, and cellar route. */
  patch('tavern','tavern_bar',{x:3,y:3,name:'Black Lantern Tap',artId:'counter_tap',artW:128,artH:64,artAnchor:'topLeft',collisionFootprint:footprint(4,1),
    description:'The curved bar carries a row of brass taps, knife marks, old burns, and Bran’s immaculate tally scratches.'});
  add('tavern',{id:'tavern_serving_counter',type:'decor',kind:'counter',name:'Serving Counter',x:7,y:3,blocking:true,artId:'counter_serving',artW:96,artH:64,artAnchor:'topLeft',collisionFootprint:footprint(3,1),
    description:'Stew bowls, bread boards, and clean mugs wait for the evening rush.'});
  patch('tavern','tavern_shelf_mugs',{x:3,y:2,name:'Back-Bar Shelves',artId:'counter_shelf',artW:96,artH:56,artAnchor:'topLeft',collisionFootprint:footprint(3,1),
    description:'Bottles and mismatched mugs crowd shelves darkened by years of hearth smoke.',
    searchable:{chance:.34,loot:['black_ale','honey_cake'],gold:[0,3],foundText:'Behind a stack of chipped mugs sits a drink token and a wrapped snack.',emptyText:'Only cracked mugs and Bran’s private inventory marks remain.'}});
  patch('tavern','tavern_fire',{x:3,y:13,name:'Black Lantern Hearth',artId:'fireplace',artW:64,artH:64,artAnchor:'topLeft',collisionFootprint:footprint(2,2),
    description:'A deep stone hearth turns the tavern’s lower corner gold and keeps a pot warm through the night.',
    useAction:{label:'Warm yourself by the hearth.',oncePerDay:true,hp:3,stamina:2,text:'Heat returns to your hands and shoulders while the fire snaps softly.'}});
  patch('tavern','tavern_stage',{x:23,y:3,name:'Festival Stage',artId:'stage_props',artW:80,artH:64,artAnchor:'topLeft',collisionFootprint:footprint(2,2),
    description:'A small stage holds a stool, instrument stands, and a curtain repaired in at least six shades of red.',
    useAction:{label:'Study the performers’ marks.',oncePerDay:true,xp:2,text:'Scratched cues and old set lists reveal how many travelers have passed through this room.'}});
  patch('tavern','tavern_table_1',{x:6,y:8,name:'Corner Table',artId:'table_square',artW:48,artH:48,collisionFootprint:footprint(2,1),description:'Two mugs and a plate of salt remain from an unfinished conversation.',
    searchable:{chance:.28,loot:['honey_cake','black_ale'],gold:[0,4],foundText:'Under the table edge you discover a forgotten coin and a wrapped bite of food.',emptyText:'Only crumbs and old mug rings remain.'}});
  patch('tavern','tavern_table_2',{x:14,y:9,name:'Travelers’ Table',artId:'table_square',artW:48,artH:48,collisionFootprint:footprint(2,1),description:'Road maps have been traced into the varnish with wet fingertips.'});
  patch('tavern','tavern_table_3',{x:21,y:9,name:'Musicians’ Table',artId:'table_round',artW:40,artH:40,description:'A compact round table sits within easy reach of the stage.'});
  patch('tavern','tavern_keg_1',{x:3,y:6,name:'House Ale Casks',artId:'kegs',artW:80,artH:48,artAnchor:'topLeft',collisionFootprint:footprint(2,1),description:'Three casks bear the black-lantern seal.',
    searchable:{chance:.40,loot:['black_ale'],foundText:'One cask tap has been left ready with a clean stoppered flask.',emptyText:'The casks are tightly sealed and carefully counted.'}});
  patch('tavern','tavern_keg_2',{x:5,y:6,name:'Small Beer Barrel',artId:'barrel',artW:28,artH:40,description:'A small barrel reserved for kitchen use.'});
  patch('tavern','job_board',{x:12,y:3,name:'Black Lantern Job Board',artId:'noticeboard',artW:64,artH:48,description:'Work notices overlap old warnings, missing-person sketches, and contracts nobody admits posting.'});
  for(const [id,x,y] of [['tavern_bench_1',6,10],['tavern_bench_2',14,11],['tavern_bench_3',21,11]])patch('tavern',id,{x,y,name:'Tavern Bench',artId:'bench_inside',artW:64,artH:32,artAnchor:'topLeft',collisionFootprint:footprint(2,1),description:'A low bench polished by boots, cloaks, and countless hurried meals.'});
  for(const id of ['tavern_stage_lamp_1','tavern_stage_lamp_2'])patch('tavern',id,{name:'Hanging Stage Lanterns',artId:'hanging_lanterns',artW:64,artH:48,artLight:54,blocking:false});
  patch('tavern','tavern_supply_crates',{x:24,y:14,name:'Tavern Supply Crate',artId:'crate',artW:34,artH:32,description:'A kitchen delivery crate stamped with three different road seals.',
    searchable:{chance:.46,loot:['travel_ration','hearty_stew','antidote'],gold:[0,2],foundText:'A loose slat gives way to a useful supply tucked beneath the packing straw.',emptyText:'Only straw, onion skins, and broken twine remain.'}});
  patch('tavern','cellar_door',{name:'Cellar Door',artId:'cellar_door',openArtId:'door_frame',artW:48,artH:64,interactionFootprint:{left:0,right:0,up:1,down:0}});
  add('tavern',{id:'tavern_long_table',type:'decor',kind:'table',name:'Common Table',x:10,y:12,blocking:true,artId:'long_table',artW:192,artH:64,artAnchor:'topLeft',collisionFootprint:footprint(6,1),
    description:'A long table serves supper, council, dice games, and arguments depending on the hour.'});
  add('tavern',{id:'tavern_prep_table',type:'decor',kind:'table',name:'Kitchen Prep Table',x:6,y:14,blocking:true,artId:'prep_table',artW:64,artH:48,artAnchor:'topLeft',collisionFootprint:footprint(2,1),
    description:'Knives, herbs, and a flour-dusted board crowd the kitchen worktable.',
    searchable:{chance:.36,loot:['hearty_stew','travel_ration'],foundText:'A covered bowl and wrapped travel portion have been set aside for whoever needs them.',emptyText:'The remaining food is spoken for.'}});
  add('tavern',{id:'tavern_cookpot',type:'decor',kind:'cookpot',name:'Stew Pot',x:8,y:14,blocking:true,artId:'cookpot',artW:40,artH:56,
    description:'The house stew changes every day, though Bran insists the recipe never does.'});
  add('tavern',{id:'tavern_wall_sign',type:'decor',kind:'sign',name:'Black Lantern Sign',x:1,y:4,blocking:false,artId:'black_lantern_sign',artW:40,artH:56,
    description:'The painted lantern is black, but the small flame at its center is fresh gold leaf.'});
  add('tavern',{id:'tavern_table_candles',type:'decor',kind:'candles',name:'Table Candles',x:17,y:10,blocking:false,artId:'candles',artW:48,artH:32,artLight:42,
    description:'Short candles burn in mismatched holders weighted with old coins.'});
  add('tavern',{id:'tavern_herbs',type:'decor',kind:'herbs',name:'Kitchen Herbs',x:18,y:3,blocking:false,artId:'potted_plants',artW:64,artH:32,
    description:'Rosemary, feverfew, and bitterleaf grow in pots near the warmest wall.'});

  /* Cellar storage gains readable props and discoveries without changing the quest enemies. */
  for(const id of ['cellar_keg_1','cellar_keg_2'])patch('tavern_cellar',id,{name:'Cellar Casks',artId:'kegs',artW:64,artH:40,artAnchor:'topLeft',collisionFootprint:footprint(2,1),description:'Cool stone keeps the casks steady and the ale dark.'});
  patch('tavern_cellar','cellar_crates',{name:'Old Supply Crates',artId:'cupboard',artW:80,artH:48,artAnchor:'topLeft',collisionFootprint:footprint(2,1),description:'Supplies have been stacked around something the rats repeatedly tried to reach.',
    searchable:{chance:.55,loot:['travel_ration','antidote','stamina_tonic'],gold:[0,5],foundText:'A dry inner box still holds a useful sealed supply.',emptyText:'Rat-chewed packing and broken bottles fill the remaining space.'}});

  /* Lantern Rest and guest rooms. */
  patch('inn','inn_desk',{x:13,y:4,name:'Lantern Rest Desk',artId:'counter_straight',artW:96,artH:32,artAnchor:'topLeft',collisionFootprint:footprint(3,1),description:'A brass ledger, room keys, and neatly stacked correspondence fill the inn desk.',
    searchable:{chance:.22,loot:['travel_ration','honey_cake'],gold:[0,4],foundText:'A forgotten guest envelope contains a meal token and a few coins.',emptyText:'Every active room key and account is precisely recorded.'}});
  patch('inn','inn_fire',{name:'Common-Room Hearth',artId:'fireplace',artW:64,artH:64,artAnchor:'topLeft',collisionFootprint:footprint(2,2),description:'A clean fire burns beneath a carved lantern mantle.',
    useAction:{label:'Warm yourself.',oncePerDay:true,hp:2,stamina:2,text:'The inn’s quiet warmth loosens the road from your shoulders.'}});
  for(const id of ['inn_table_1','inn_table_2'])patch('inn',id,{name:'Guest Table',artId:'table_square',artW:48,artH:48,collisionFootprint:footprint(2,1),description:'A small guest table set with clean cups and a folded map cloth.'});
  for(const id of ['inn_bed_1','inn_bed_2','upper_bed_1','upper_bed_2','upper_bed_3','upper_bed_4']){
    const mapId=id.startsWith('upper_')?'inn_upper':'inn';patch(mapId,id,{name:'Guest Bed',artId:'bed',artW:32,artH:56,artAnchor:'topLeft',collisionFootprint:footprint(1,2),description:'A carefully made bed with a thick road blanket.',
      useAction:{label:'Rest briefly.',oncePerDay:true,hp:3,stamina:3,text:'A short rest in clean linen restores some of your strength.'}});
  }
  patch('inn','inn_shelf_guestbook',{name:'Guestbook Shelves',artId:'shelf',artW:64,artH:48,artAnchor:'topLeft',collisionFootprint:footprint(2,1),description:'Guest ledgers, spare lanterns, and folded blankets fill the shelves.',
    searchable:{chance:.30,loot:['honey_cake','travel_ration'],foundText:'A shelf marked “late arrivals” still holds a wrapped welcome ration.',emptyText:'The ledgers contain stories, but nothing you should carry away.'}});
  for(const id of ['inn_chair_hearth_1','inn_chair_hearth_2'])patch('inn',id,{name:'Hearth Bench',artId:'bench_inside',artW:64,artH:32,artAnchor:'topLeft',collisionFootprint:footprint(2,1),description:'A low bench placed where the fire reaches without becoming uncomfortable.'});
  for(const id of ['inn_lamp_front_1','inn_lamp_front_2','upper_lamp_1','upper_lamp_2','upper_lamp_3']){
    const mapId=id.startsWith('upper_')?'inn_upper':'inn';patch(mapId,id,{name:'Inn Lantern',artId:'floor_lanterns',artW:40,artH:40,artLight:52,blocking:false,description:'A shaded lantern gives the room a patient amber light.'});
  }
  patch('inn','inn_crates_linen',{name:'Linen Cupboard',artId:'cupboard',artW:80,artH:48,artAnchor:'topLeft',collisionFootprint:footprint(2,1),description:'Clean linen and travel blankets are sorted by room.'});

  /* Provisions shop. */
  patch('general_store','store_counter',{x:13,y:5,name:'Mara’s Counter',artId:'counter_serving',artW:96,artH:64,artAnchor:'topLeft',collisionFootprint:footprint(3,1),description:'Wrapped remedies and weighed supplies sit behind a counter scrubbed with bitter herbs.'});
  for(const id of ['shelf_1','shelf_2','shelf_3','shelf_4','store_shelf_remedy_1','store_shelf_remedy_2','store_shelf_supply_1','store_shelf_supply_2'])patch('general_store',id,{name:'Provision Shelves',artId:'shelf',artW:64,artH:48,artAnchor:'topLeft',collisionFootprint:footprint(2,1),description:'Road food, bandages, lamp oil, and medicines are arranged by urgency.',
    searchable:{chance:.20,loot:['antidote','mana_tonic','travel_ration'],foundText:'A returned-but-unopened supply has been left in the public exchange tray.',emptyText:'Mara’s inventory is exact down to the last cork.'}});
  for(const id of ['herb_rack','store_herbs_2','store_herbs_3'])patch('general_store',id,{name:'Remedy Herbs',artId:'potted_plants',artW:64,artH:32,blocking:false,description:'Drying herbs and living cuttings fill the air with sharp green scents.'});
  patch('general_store','store_crates',{name:'Road Supply Crates',artId:'crate',artW:34,artH:32,description:'Waxed crates hold goods waiting for eastbound caravans.',
    searchable:{chance:.34,loot:['travel_ration','healing_draught'],foundText:'A damaged parcel has been marked free salvage and still contains something useful.',emptyText:'The remaining parcels are sealed for named customers.'}});

  /* Forge. */
  patch('forge','forge_fire',{x:4,y:3,name:'Ward-Stone Forge',artId:'oven',artW:64,artH:64,artAnchor:'topLeft',collisionFootprint:footprint(2,2),description:'Blue-white fire circles an old ward-stone core beneath the chimney.',
    useAction:{label:'Warm your hands at a safe distance.',oncePerDay:true,stamina:2,text:'The heat is fierce but clean, driving the chill from your fingers.'}});
  for(const id of ['ore_crates','forge_crates_ore'])patch('forge',id,{name:'Ore Crates',artId:'crate',artW:34,artH:32,description:'Sorted ore and scrap metal wait for Borin’s inspection.',
    searchable:{chance:.34,loot:['iron_ore','stamina_tonic'],foundText:'A small usable piece was set aside with the scrap.',emptyText:'Only slag and accounted-for stock remain.'}});
  patch('forge','forge_cart_scrap',{name:'Scrap Cart',artId:'cart',artW:80,artH:48,collisionFootprint:footprint(2,1),description:'A low cart holds bent fittings and failed experiments.'});
  for(const id of ['forge_brazier_1','forge_brazier_2'])patch('forge',id,{name:'Cooling Lantern',artId:'floor_lanterns',artW:40,artH:40,artLight:48,blocking:false,description:'A low protected flame marks the safe edge of the work floor.'});
  add('forge',{id:'forge_workbench_art',type:'decor',kind:'workbench',name:'Smithing Workbench',x:16,y:4,blocking:true,artId:'prep_table',artW:64,artH:48,artAnchor:'topLeft',collisionFootprint:footprint(2,1),description:'Tongs, punches, files, and a half-finished hinge cover the bench.',
    searchable:{chance:.28,loot:['iron_ore','stamina_tonic'],foundText:'A usable offcut rests among the failed pieces.',emptyText:'Every good tool is exactly where Borin expects it.'}});
  add('forge',{id:'forge_wall_tools_art',type:'decor',kind:'tools',name:'Forge Tools',x:21,y:3,blocking:false,artId:'tools',artW:64,artH:40,description:'Long-handled tools hang by size and burn marks.'});

  /* Arcane shop. */
  patch('arcane_shop','arcane_counter',{x:13,y:6,name:'Antiquities Counter',artId:'counter_straight',artW:96,artH:32,artAnchor:'topLeft',collisionFootprint:footprint(3,1),description:'Relics sit on black felt beside a ledger written in three hands.'});
  for(const id of ['arcane_shelf_1','arcane_shelf_2','arcane_shelf_3','arcane_shelf_4'])patch('arcane_shop',id,{name:'Arcane Bookcase',artId:'books',artW:64,artH:32,collisionFootprint:footprint(2,1),description:'Scroll cases, field notes, and dangerous books have been shelved according to temperament.',
    searchable:{chance:.23,loot:['scroll_sparks','mana_tonic'],foundText:'A duplicate study copy has been marked safe for travelers.',emptyText:'The remaining volumes are chained, catalogued, or actively watching you.'}});
  for(const id of ['arcane_lamp_1','arcane_lamp_2'])patch('arcane_shop',id,{name:'Scholar’s Candles',artId:'candles',artW:48,artH:32,artLight:42,blocking:false,description:'The candles burn without shortening and lean toward nearby magic.'});
  patch('arcane_shop','arcane_crates_relics',{name:'Sealed Relic Cupboard',artId:'cupboard',artW:80,artH:48,artAnchor:'topLeft',collisionFootprint:footprint(2,1),description:'Warning sigils in six dead scripts overlap across the cupboard doors.',
    searchable:{chance:.16,loot:['mana_tonic','scroll_mending'],foundText:'One compartment is marked “harmless duplicates” and contains a usable item.',emptyText:'Every remaining seal is intact for a reason.'}});
  patch('arcane_shop','arcane_orb',{name:'Impossible View Orb',description:'The orb shows Haven from above, though no tower stands high enough for the view.',
    useAction:{label:'Study the impossible view.',oncePerDay:true,mana:2,xp:2,text:'For one breath, roads beyond the horizon arrange themselves into a pattern you almost understand.'}});

  /* Chapel. */
  patch('chapel','chapel_altar',{name:'Altar of the Last Light',artId:'shrine',artW:56,artH:72,description:'The altar bears no god’s name—only a carved lantern surrounded by open hands.',
    useAction:{label:'Stand in the lantern’s warmth.',oncePerDay:true,hp:2,mana:2,text:'The light asks for no oath. It simply reminds you that you are still here.'}});
  for(const id of ['pew_1','pew_2','pew_3','pew_4','chapel_pew_1','chapel_pew_2','chapel_pew_3','chapel_pew_4'])patch('chapel',id,{name:'Chapel Pew',artId:'bench_inside',artW:64,artH:32,artAnchor:'topLeft',collisionFootprint:footprint(2,1),description:'A plain wooden pew worn smooth by travelers and mourners.',
    useAction:{label:'Sit in silence.',oncePerDay:true,stamina:2,text:'The quiet steadies you more than any sermon could.'}});
  for(const id of ['chapel_lamp_1','chapel_lamp_2','chapel_brazier_1','chapel_brazier_2'])patch('chapel',id,{name:'Last-Light Lantern',artId:'floor_lanterns',artW:40,artH:40,artLight:52,blocking:false,description:'A low lantern burns with a pale, unwavering flame.'});

  /* Named and ambient tavern/inn residents receive the new canonical character samples. */
  if(AO.NPCS.bran)AO.NPCS.bran.visual.artFrames=['char_tavernkeeper_1','char_tavernkeeper_2'];
  if(AO.NPCS.lys)AO.NPCS.lys.visual.artFrames=['char_bard_1','char_bard_2'];
  if(AO.NPCS.elowen)AO.NPCS.elowen.visual.artFrames=['char_server_1','char_server_2'];
  if(AO.NPCS.mara)AO.NPCS.mara.visual.artFrames=['char_server_2','char_server_1'];
  if(AO.NPCS.borin)AO.NPCS.borin.visual.artFrames=['char_tavernkeeper_2','char_tavernkeeper_1'];
  if(AO.AMBIENT_ACTORS?.tavern_patron_1)AO.AMBIENT_ACTORS.tavern_patron_1.visual.artFrames=['char_patron2_1','char_patron2_2'];
  if(AO.AMBIENT_ACTORS?.tavern_patron_2)AO.AMBIENT_ACTORS.tavern_patron_2.visual.artFrames=['char_bard_2','char_bard_1'];
  if(AO.AMBIENT_ACTORS?.inn_guest)AO.AMBIENT_ACTORS.inn_guest.visual.artFrames=['char_patron2_2','char_patron2_1'];
  if(AO.AMBIENT_ACTORS?.inn_attendant)AO.AMBIENT_ACTORS.inn_attendant.visual.artFrames=['char_server_1','char_server_2'];

  /* Keep landmark labels aligned with the rebuilt room. */
  if(AO.MAP_LANDMARKS?.tavern){
    const bar=AO.MAP_LANDMARKS.tavern.find(entry=>entry.kind==='service');if(bar){bar.x=6;bar.y=3;}
    const stage=AO.MAP_LANDMARKS.tavern.find(entry=>entry.kind==='stage');if(stage){stage.x=24;stage.y=3;}
  }
})();
