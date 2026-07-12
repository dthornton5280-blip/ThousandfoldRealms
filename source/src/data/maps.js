AO.MapBuilders = {
  grid(fill='grass'){return Array.from({length:AO.CONFIG.mapHeight},()=>Array.from({length:AO.CONFIG.mapWidth},()=>fill));},
  border(grid,tile='stonewall'){
    const h=grid.length,w=grid[0].length;
    for(let x=0;x<w;x++){grid[0][x]=tile;grid[h-1][x]=tile;}
    for(let y=0;y<h;y++){grid[y][0]=tile;grid[y][w-1]=tile;}
    return grid;
  },
  rect(grid,x,y,w,h,tile){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)if(grid[yy]?.[xx]!=null)grid[yy][xx]=tile;},
  lineH(grid,x1,x2,y,tile){for(let x=x1;x<=x2;x++)if(grid[y]?.[x]!=null)grid[y][x]=tile;},
  lineV(grid,x,y1,y2,tile){for(let y=y1;y<=y2;y++)if(grid[y]?.[x]!=null)grid[y][x]=tile;},
  room(floor='woodfloor'){
    const g=this.border(this.grid(floor),'stonewall');
    g[17][14]=floor;g[17][15]=floor;
    return g;
  },
  haven(){
    const g=this.border(this.grid('grass'),'tree');
    for(let y=7;y<=10;y++)this.lineH(g,1,29,y,'cobble');
    for(let x=13;x<=16;x++)this.lineV(g,x,1,16,'cobble');
    this.rect(g,9,6,12,6,'cobble');
    const buildings=[[2,2,8,5],[11,2,8,5],[20,2,8,5],[2,11,8,5],[11,11,8,5],[20,11,8,5]];
    for(const [x,y,w,h] of buildings)this.rect(g,x,y,w,h,'roof');
    [[6,6],[15,6],[24,6],[6,11],[15,11],[24,11]].forEach(([x,y])=>g[y][x]='cobble');
    g[8][29]='cobble';
    return g;
  },
  inn(){
    const g=this.room('woodfloor');
    this.rect(g,2,2,26,2,'rug');
    this.lineH(g,2,10,8,'woodwall');g[8][6]='woodfloor';
    this.lineH(g,19,27,8,'woodwall');g[8][23]='woodfloor';
    return g;
  },
  innUpper(){
    const g=this.room('woodfloor');
    this.lineH(g,1,28,8,'woodwall');
    [5,11,18,24].forEach(x=>g[8][x]='woodfloor');
    this.lineV(g,9,1,7,'woodwall');g[4][9]='woodfloor';
    this.lineV(g,20,1,7,'woodwall');g[4][20]='woodfloor';
    this.lineV(g,9,9,16,'woodwall');g[12][9]='woodfloor';
    this.lineV(g,20,9,16,'woodwall');g[12][20]='woodfloor';
    return g;
  },
  tavern(){
    const g=this.room('woodfloor');
    this.rect(g,2,2,9,2,'bar');
    this.rect(g,20,2,8,2,'stage');
    this.rect(g,12,12,6,3,'rug');
    return g;
  },
  cellar(){
    const g=this.border(this.grid('cellarfloor'),'stonewall');
    this.rect(g,3,3,8,5,'cellarfloor');this.rect(g,18,3,9,5,'cellarfloor');
    this.rect(g,5,10,20,6,'cellarfloor');
    this.lineH(g,10,19,8,'cellarfloor');
    g[17][14]='cellarfloor';g[17][15]='cellarfloor';
    return g;
  },
  generalStore(){
    const g=this.room('woodfloor');
    this.rect(g,2,2,26,2,'rug');
    this.lineV(g,8,5,14,'woodwall');g[10][8]='woodfloor';
    this.lineV(g,21,5,14,'woodwall');g[10][21]='woodfloor';
    return g;
  },
  forge(){
    const g=this.room('stonefloor');
    this.rect(g,2,2,9,5,'forgefloor');
    this.rect(g,19,2,9,5,'forgefloor');
    this.rect(g,11,10,8,4,'rug');
    return g;
  },
  arcaneShop(){
    const g=this.room('magicfloor');
    this.rect(g,11,2,8,5,'rune');
    this.rect(g,3,3,5,11,'rug');
    this.rect(g,22,3,5,11,'rug');
    return g;
  },
  chapel(){
    const g=this.room('chapelfloor');
    this.rect(g,11,2,8,4,'altar');
    this.lineV(g,14,6,16,'rug');this.lineV(g,15,6,16,'rug');
    return g;
  },
  wilds(){
    const g=this.border(this.grid('grass'),'tree');
    /* Main road and north trail remain readable while the scenery gains layered cliffs and water. */
    for(let x=1;x<29;x++)g[9][x]=(x>=8&&x<=10)||(x>=19&&x<=21)?'bridge':'path';
    for(let y=1;y<9;y++)g[y][24]='path';
    /* Western river with a shallow, irregular bank. */
    for(let y=2;y<17;y++){
      g[y][9]='water';
      if([3,4,12,13,14].includes(y))g[y][8]='shallow_water';
      if([5,6,15].includes(y))g[y][10]='reeds';
    }
    g[9][8]='bridge';g[9][9]='bridge';g[9][10]='bridge';
    g[2][9]='waterfall_pool';g[1][9]='waterfall';
    /* Raised eastern overlook: cliff face, stair approach, waterfall and upper trail. */
    for(let y=1;y<=6;y++)for(let x=18;x<=28;x++)if(g[y][x]!=='path')g[y][x]=((x+y)%7===0?'flower_patch':'grass');
    for(let x=18;x<=28;x++)g[7][x]='cliff_face';
    g[7][20]='waterfall';g[8][20]='waterfall_pool';g[7][24]='stairs';g[8][24]='stairs';
    for(let y=1;y<=6;y++)g[y][24]='path';
    g[9][19]='bridge';g[9][20]='bridge';g[9][21]='bridge';
    /* Southern lily pond and rocky garden. */
    for(let y=13;y<=16;y++)for(let x=2;x<=7;x++)g[y][x]=((x+y)%4===0?'lilywater':'water');
    g[12][3]='shallow_water';g[12][4]='reeds';g[12][6]='rocks';g[16][8]='moss_stone';
    /* Dense, authored-looking woodland clusters. */
    [[3,2],[4,2],[5,3],[12,2],[13,3],[15,2],[16,3],[12,12],[13,13],[17,13],[18,14],[26,11],[27,12],[4,10],[5,11]].forEach(([x,y])=>g[y][x]='tree');
    [[2,6],[6,5],[14,6],[16,11],[23,12],[27,5],[11,15]].forEach(([x,y])=>g[y][x]='shrub');
    [[3,7],[7,3],[12,5],[15,14],[22,13],[27,7]].forEach(([x,y])=>g[y][x]='flower_patch');
    [[6,12],[11,4],[17,6],[25,14],[28,4]].forEach(([x,y])=>g[y][x]='rocks');
    g[9][0]='path';g[9][29]='path';g[0][24]='path';
    return g;
  },
  mine(){
    const g=this.grid('stonewall');
    this.rect(g,1,7,8,4,'cavefloor');
    this.rect(g,7,4,7,10,'cavefloor');
    this.rect(g,12,2,8,6,'cavefloor');
    this.rect(g,17,6,6,8,'cavefloor');
    this.rect(g,21,10,8,6,'cavefloor');
    this.rect(g,23,2,6,9,'cavefloor');
    g[9][0]='cavefloor';
    return g;
  },
  crypt(){
    const g=this.grid('stonewall');
    this.rect(g,1,7,8,4,'cryptfloor');
    this.rect(g,7,3,5,10,'cryptfloor');
    this.rect(g,10,2,9,6,'cryptfloor');
    this.rect(g,15,6,5,7,'cryptfloor');
    this.rect(g,18,9,10,6,'cryptfloor');
    this.rect(g,22,3,6,7,'cryptfloor');
    this.rect(g,26,6,3,4,'cryptfloor');
    g[9][0]='cryptfloor';
    return g;
  }
};

AO.MAP_DEFS = {
  haven:{
    id:'haven',name:'Haven of the Last Lantern',theme:'haven',builder:'haven',start:{x:14,y:15},allowCamp:false,
    portals:[{id:'haven_to_wilds',x:29,y:8,to:'wilds',toX:1,toY:9,label:'Whisperwood Road'}],
    npcs:['mira','nessa','jory'],
    objects:[
      {id:'door_inn',type:'door',x:6,y:6,to:'inn',toX:14,toY:15,label:'The Lantern Rest'},
      {id:'door_arcane',type:'door',x:15,y:6,to:'arcane_shop',toX:14,toY:15,label:'Selene’s Arcana'},
      {id:'door_tavern',type:'door',x:24,y:6,to:'tavern',toX:14,toY:15,label:'The Black Lantern Tavern'},
      {id:'door_store',type:'door',x:6,y:11,to:'general_store',toX:14,toY:15,label:'Mara’s Provisions'},
      {id:'door_chapel',type:'door',x:15,y:11,to:'chapel',toX:14,toY:15,label:'Chapel of the Last Light'},
      {id:'door_forge',type:'door',x:24,y:11,to:'forge',toX:14,toY:15,label:'Borin’s Forge'},
      {id:'town_fountain',type:'decor',kind:'fountain',x:15,y:9,blocking:true,text:'The fountain is fed by a spring beneath the old ward-stone.'},
      {id:'market_stall_1',type:'decor',kind:'stall',x:8,y:8,blocking:true,text:'Nessa’s stall displays dyed cloth and weatherproof cloaks.'},
      {id:'market_stall_2',type:'decor',kind:'stall',x:21,y:8,blocking:true,text:'Jory has arranged rings and amulets beneath a locked glass lid.'},
      {id:'bench_1',type:'decor',kind:'bench',x:11,y:9,blocking:true},{id:'bench_2',type:'decor',kind:'bench',x:19,y:9,blocking:true},
      {id:'lamp_1',type:'decor',kind:'lamp',x:12,y:7,blocking:false},{id:'lamp_2',type:'decor',kind:'lamp',x:18,y:7,blocking:false},
      {id:'lamp_3',type:'decor',kind:'lamp',x:12,y:10,blocking:false},{id:'lamp_4',type:'decor',kind:'lamp',x:18,y:10,blocking:false},
      {id:'flowers_1',type:'decor',kind:'flowers',x:3,y:8,blocking:false},{id:'flowers_2',type:'decor',kind:'flowers',x:27,y:9,blocking:false},
      {id:'town_board',type:'sign',x:14,y:7,text:'THE LAST LANTERN HOLDS • Rooms at the Lantern Rest • Work posted at the Black Lantern Tavern'},
      {id:'haven_cache',type:'chest',x:4,y:15,loot:['travelers_cloak','travel_ration','healing_draught'],gold:18}
    ],enemies:[]
  },
  inn:{
    id:'inn',name:'The Lantern Rest',theme:'interior',builder:'inn',start:{x:14,y:15},allowCamp:false,npcs:['elowen'],portals:[],
    objects:[
      {id:'inn_exit',type:'door',x:14,y:17,to:'haven',toX:6,toY:7,label:'Lantern Square'},
      {id:'inn_stairs',type:'door',x:26,y:4,to:'inn_upper',toX:14,toY:15,label:'Upper Guest Rooms'},
      {id:'inn_desk',type:'decor',kind:'counter',x:14,y:4,blocking:true,text:'A brass ledger lists travelers from roads that no longer exist.'},
      {id:'inn_fire',type:'decor',kind:'fireplace',x:3,y:4,blocking:true,text:'A clean fire burns beneath a carved wooden lantern.'},
      {id:'inn_table_1',type:'decor',kind:'table',x:7,y:12,blocking:true},{id:'inn_table_2',type:'decor',kind:'table',x:22,y:12,blocking:true},
      {id:'inn_bed_1',type:'decor',kind:'bed',x:4,y:4,blocking:true,text:'A tidy guest bed. Elowen rents rooms at the front desk.'},
      {id:'inn_bed_2',type:'decor',kind:'bed',x:24,y:4,blocking:true,text:'A tidy guest bed. Elowen rents rooms at the front desk.'},
      {id:'inn_chest',type:'chest',x:4,y:13,loot:['honey_cake','travel_ration'],gold:8}
    ],enemies:[]
  },
  inn_upper:{
    id:'inn_upper',name:'Lantern Rest — Upper Floor',theme:'interior',builder:'innUpper',start:{x:14,y:15},allowCamp:false,npcs:[],portals:[],
    objects:[
      {id:'upper_exit',type:'door',x:14,y:17,to:'inn',toX:25,toY:4,label:'Downstairs'},
      {id:'room_1_door',type:'door',x:5,y:8,label:'Room One'},
      {id:'room_3_door',type:'door',x:11,y:8,label:'Room Three'},
      {id:'room_5_door',type:'door',x:18,y:8,label:'Room Five'},
      {id:'room_7_door',type:'door',x:20,y:12,label:'Room Seven'},
      {id:'upper_bed_1',type:'decor',kind:'bed',x:4,y:4,blocking:true},{id:'upper_bed_2',type:'decor',kind:'bed',x:14,y:4,blocking:true},
      {id:'upper_bed_3',type:'decor',kind:'bed',x:24,y:4,blocking:true},{id:'upper_bed_4',type:'decor',kind:'bed',x:24,y:12,blocking:true},
      {id:'room7_note',type:'sign',x:26,y:12,text:'The page is dated eighty-three years ago: “Room Seven is not to be opened until he remembers his own name.”'}
    ],
    enemies:[{id:'restless_guest_1',type:'restless_guest',x:25,y:11,requiresQuest:'room_seven'}]
  },
  tavern:{
    id:'tavern',name:'The Black Lantern Tavern',theme:'tavern',builder:'tavern',start:{x:14,y:15},allowCamp:false,npcs:['bran','lys'],portals:[],
    objects:[
      {id:'tavern_exit',type:'door',x:14,y:17,to:'haven',toX:24,toY:7,label:'Lantern Square'},
      {id:'cellar_door',type:'door',x:27,y:14,to:'tavern_cellar',toX:14,toY:15,label:'Tavern Cellar'},
      {id:'tavern_bar',type:'decor',kind:'counter',x:8,y:4,blocking:true,text:'The bar is scarred by decades of mugs, knives, and unpaid promises.'},
      {id:'tavern_fire',type:'decor',kind:'fireplace',x:3,y:14,blocking:true},
      {id:'tavern_stage',type:'decor',kind:'stage',x:24,y:4,blocking:true,text:'A chalkboard promises music on festival nights.'},
      {id:'tavern_table_1',type:'decor',kind:'table',x:7,y:9,blocking:true},{id:'tavern_table_2',type:'decor',kind:'table',x:15,y:10,blocking:true},{id:'tavern_table_3',type:'decor',kind:'table',x:22,y:10,blocking:true},
      {id:'tavern_keg_1',type:'decor',kind:'keg',x:3,y:5,blocking:true},{id:'tavern_keg_2',type:'decor',kind:'keg',x:4,y:5,blocking:true},
      {id:'job_board',type:'sign',x:12,y:4,text:'WORK WANTED: cellar vermin • missing shipment • discreet escorts • no necromancers without references'},
      {id:'tavern_cache',type:'chest',x:26,y:4,loot:['black_ale','hearty_stew','smoke_bomb'],gold:10}
    ],enemies:[]
  },
  tavern_cellar:{
    id:'tavern_cellar',name:'Black Lantern Cellar',theme:'cellar',builder:'cellar',start:{x:14,y:15},allowCamp:false,npcs:[],portals:[],
    objects:[
      {id:'cellar_exit',type:'door',x:14,y:17,to:'tavern',toX:26,toY:14,label:'Back Upstairs'},
      {id:'cellar_keg_1',type:'decor',kind:'keg',x:4,y:4,blocking:true},{id:'cellar_keg_2',type:'decor',kind:'keg',x:6,y:4,blocking:true},
      {id:'cellar_crates',type:'decor',kind:'crates',x:22,y:4,blocking:true},
      {id:'cellar_chest',type:'chest',x:26,y:14,loot:['brewer_seal','greater_stamina'],gold:20}
    ],
    enemies:[
      {id:'rat_1',type:'cellar_rat',x:7,y:10,requiresQuest:'cellar_vermin'},{id:'rat_2',type:'cellar_rat',x:11,y:6,requiresQuest:'cellar_vermin'},
      {id:'rat_3',type:'cellar_rat',x:18,y:11,requiresQuest:'cellar_vermin'},{id:'rat_4',type:'cellar_rat',x:23,y:6,requiresQuest:'cellar_vermin'},
      {id:'rat_king_1',type:'rat_king',x:25,y:13,requiresQuest:'cellar_vermin'}
    ]
  },
  general_store:{
    id:'general_store',name:'Mara’s Provisions & Remedies',theme:'interior',builder:'generalStore',start:{x:14,y:15},allowCamp:false,npcs:['mara'],portals:[],
    objects:[
      {id:'store_exit',type:'door',x:14,y:17,to:'haven',toX:6,toY:10,label:'Lantern Square'},
      {id:'store_counter',type:'decor',kind:'counter',x:15,y:5,blocking:true},
      {id:'shelf_1',type:'decor',kind:'shelf',x:4,y:6,blocking:true},{id:'shelf_2',type:'decor',kind:'shelf',x:4,y:11,blocking:true},
      {id:'shelf_3',type:'decor',kind:'shelf',x:25,y:6,blocking:true},{id:'shelf_4',type:'decor',kind:'shelf',x:25,y:11,blocking:true},
      {id:'herb_rack',type:'decor',kind:'herbs',x:13,y:3,blocking:false},{id:'store_crates',type:'decor',kind:'crates',x:24,y:14,blocking:true},
      {id:'store_cache',type:'chest',x:4,y:14,loot:['antidote','mana_tonic','travel_ration'],gold:14}
    ],enemies:[]
  },
  forge:{
    id:'forge',name:'Borin’s Forge',theme:'forge',builder:'forge',start:{x:14,y:15},allowCamp:false,npcs:['borin'],portals:[],
    objects:[
      {id:'forge_exit',type:'door',x:14,y:17,to:'haven',toX:24,toY:10,label:'Lantern Square'},
      {id:'forge_fire',type:'decor',kind:'forge',x:5,y:4,blocking:true,text:'The forge burns blue-white around a core of old ward-stone.'},
      {id:'anvil_1',type:'decor',kind:'anvil',x:12,y:6,blocking:true},{id:'anvil_2',type:'decor',kind:'anvil',x:23,y:5,blocking:true},
      {id:'weapon_rack',type:'decor',kind:'weaponrack',x:26,y:10,blocking:true},
      {id:'ore_crates',type:'decor',kind:'crates',x:4,y:12,blocking:true},
      {id:'forge_chest',type:'chest',x:25,y:14,loot:['iron_gauntlets','stamina_tonic'],gold:22}
    ],enemies:[]
  },
  arcane_shop:{
    id:'arcane_shop',name:'Selene’s Arcana & Antiquities',theme:'arcane',builder:'arcaneShop',start:{x:14,y:15},allowCamp:false,npcs:['selene'],portals:[],
    objects:[
      {id:'arcane_exit',type:'door',x:14,y:17,to:'haven',toX:15,toY:7,label:'Lantern Square'},
      {id:'arcane_counter',type:'decor',kind:'counter',x:15,y:6,blocking:true},
      {id:'arcane_shelf_1',type:'decor',kind:'shelf',x:5,y:5,blocking:true},{id:'arcane_shelf_2',type:'decor',kind:'shelf',x:24,y:5,blocking:true},
      {id:'crystal_1',type:'decor',kind:'crystal',x:12,y:4,blocking:false},{id:'crystal_2',type:'decor',kind:'crystal',x:18,y:4,blocking:false},
      {id:'arcane_orb',type:'decor',kind:'orb',x:15,y:3,blocking:true,text:'The orb shows Haven from above, though no tower stands high enough for the view.'},
      {id:'arcane_chest',type:'chest',x:25,y:14,loot:['scroll_sparks','mana_tonic'],gold:20}
    ],enemies:[]
  },
  chapel:{
    id:'chapel',name:'Chapel of the Last Light',theme:'chapel',builder:'chapel',start:{x:14,y:15},allowCamp:false,npcs:['odo'],portals:[],
    objects:[
      {id:'chapel_exit',type:'door',x:14,y:17,to:'haven',toX:15,toY:10,label:'Lantern Square'},
      {id:'chapel_altar',type:'decor',kind:'altar',x:15,y:3,blocking:true,text:'The altar bears no god’s name—only a carved lantern surrounded by open hands.'},
      {id:'pew_1',type:'decor',kind:'pew',x:9,y:8,blocking:true},{id:'pew_2',type:'decor',kind:'pew',x:20,y:8,blocking:true},
      {id:'pew_3',type:'decor',kind:'pew',x:9,y:12,blocking:true},{id:'pew_4',type:'decor',kind:'pew',x:20,y:12,blocking:true},
      {id:'chapel_lamp_1',type:'decor',kind:'lamp',x:12,y:5,blocking:false},{id:'chapel_lamp_2',type:'decor',kind:'lamp',x:18,y:5,blocking:false},
      {id:'chapel_cache',type:'chest',x:25,y:14,loot:['scroll_mending','silver_ring'],gold:12}
    ],enemies:[]
  },
  wilds:{
    id:'wilds',name:'Whisperwood',theme:'wilds',builder:'wilds',start:{x:2,y:9},allowCamp:true,
    portals:[
      {id:'wilds_to_haven',x:0,y:9,to:'haven',toX:28,toY:8,label:'Haven'},
      {id:'wilds_to_crypt',x:29,y:9,to:'crypt',toX:1,toY:9,label:'Ashen Crypt'},
      {id:'wilds_to_mine',x:24,y:0,to:'lantern_mine',toX:1,toY:9,label:'Lantern Mine'}
    ],npcs:[],
    objects:[
      {id:'herb_1',type:'resource',resource:'moon_herb',x:5,y:6},{id:'herb_2',type:'resource',resource:'moon_herb',x:14,y:5},
      {id:'herb_3',type:'resource',resource:'moon_herb',x:21,y:14},{id:'herb_4',type:'resource',resource:'moon_herb',x:26,y:12},
      {id:'bloom_1',type:'resource',resource:'dusk_bloom',x:3,y:4},{id:'bloom_2',type:'resource',resource:'dusk_bloom',x:12,y:14},
      {id:'bloom_3',type:'resource',resource:'dusk_bloom',x:18,y:3},{id:'bloom_4',type:'resource',resource:'dusk_bloom',x:22,y:15},{id:'bloom_5',type:'resource',resource:'dusk_bloom',x:27,y:6},
      {id:'wild_camp',type:'camp',x:13,y:10,blocking:true,text:'A sheltered camp ring sits beneath an old road marker.'},
      {id:'road_lantern_1',type:'decor',kind:'lamp',x:4,y:8,blocking:false},{id:'road_lantern_2',type:'decor',kind:'lamp',x:15,y:8,blocking:false},{id:'road_lantern_3',type:'decor',kind:'lamp',x:25,y:8,blocking:false},
      {id:'fallen_cart',type:'decor',kind:'cart',x:16,y:7,blocking:true,text:'The cart bears deep axe marks and Haven’s eastern-road seal.'},
      {id:'shipment_chest',type:'chest',x:20,y:5,loot:['trade_crate','healing_draught'],gold:28},
      {id:'wild_chest',type:'chest',x:16,y:15,loot:['greater_healing','copper_charm','fire_bomb'],gold:30}
    ],
    enemies:[
      {id:'mire_1',type:'mireling',x:6,y:8},{id:'mire_2',type:'mireling',x:13,y:10},{id:'mire_3',type:'mireling',x:22,y:10},{id:'mire_4',type:'mireling',x:25,y:15},
      {id:'bandit_1',type:'bandit',x:17,y:4},{id:'bandit_2',type:'bandit',x:26,y:5}
    ]
  },
  lantern_mine:{
    id:'lantern_mine',name:'Abandoned Lantern Mine',theme:'mine',builder:'mine',start:{x:1,y:9},allowCamp:true,
    portals:[{id:'mine_to_wilds',x:0,y:9,to:'wilds',toX:24,toY:1,label:'Whisperwood'}],npcs:[],
    objects:[
      {id:'mine_camp',type:'camp',x:7,y:9,blocking:true,text:'An abandoned miner’s camp still has dry kindling.'},
      {id:'ore_1',type:'resource',resource:'iron_ore',x:10,y:6},{id:'ore_2',type:'resource',resource:'iron_ore',x:14,y:4},
      {id:'ore_3',type:'resource',resource:'iron_ore',x:20,y:11},{id:'ore_4',type:'resource',resource:'iron_ore',x:25,y:13},
      {id:'crystal_ore_1',type:'resource',resource:'ember_crystal',x:17,y:4},{id:'crystal_ore_2',type:'resource',resource:'ember_crystal',x:24,y:5},
      {id:'mine_cart_1',type:'decor',kind:'minecart',x:8,y:11,blocking:true},{id:'mine_cart_2',type:'decor',kind:'minecart',x:22,y:12,blocking:true},
      {id:'mine_beam_1',type:'decor',kind:'beam',x:12,y:7,blocking:false},{id:'mine_beam_2',type:'decor',kind:'beam',x:19,y:8,blocking:false},
      {id:'mine_cache',type:'chest',x:27,y:14,loot:['greater_mana','ember_crystal','softstep_boots'],gold:48}
    ],
    enemies:[
      {id:'stalker_1',type:'mine_stalker',x:9,y:6},{id:'stalker_2',type:'mine_stalker',x:17,y:7},{id:'stalker_3',type:'mine_stalker',x:23,y:11},
      {id:'wisp_1',type:'crystal_wisp',x:15,y:4},{id:'wisp_2',type:'crystal_wisp',x:25,y:6},
      {id:'stone_troll_1',type:'stone_troll',x:26,y:13,requiresQuest:'miners_echo'}
    ]
  },
  crypt:{
    id:'crypt',name:'The Ashen Crypt',theme:'crypt',builder:'crypt',start:{x:1,y:9},allowCamp:false,
    portals:[{id:'crypt_to_wilds',x:0,y:9,to:'wilds',toX:28,toY:9,label:'Whisperwood'}],npcs:[],
    objects:[
      {id:'seal_chest',type:'chest',x:17,y:4,loot:['ember_shard','greater_healing','ember_ring'],gold:45},
      {id:'crypt_cache',type:'chest',x:25,y:13,loot:['moon_lens','mana_tonic','forgotten_prayer'],gold:38},
      {id:'crypt_inscription',type:'sign',x:11,y:4,text:'THE HEART BELOW SLEEPS ONLY WHILE THE SEAL REMAINS WHOLE.'},
      {id:'crypt_brazier_1',type:'decor',kind:'brazier',x:9,y:8,blocking:false},{id:'crypt_brazier_2',type:'decor',kind:'brazier',x:20,y:10,blocking:false},
      {id:'crypt_statue_1',type:'decor',kind:'statue',x:14,y:3,blocking:true},{id:'crypt_statue_2',type:'decor',kind:'statue',x:24,y:4,blocking:true},
      {id:'crypt_sarcophagus',type:'decor',kind:'sarcophagus',x:19,y:12,blocking:true,text:'The lid bears the name of a warden erased from every town record.'}
    ],
    enemies:[
      {id:'skel_1',type:'skeleton',x:8,y:5},{id:'skel_2',type:'skeleton',x:13,y:4},{id:'skel_3',type:'skeleton',x:17,y:10},
      {id:'adept_1',type:'ember_adept',x:22,y:11},{id:'ember_boss',type:'ember_warden',x:26,y:7,requiresQuest:'heart_of_cinders'}
    ]
  }
};
