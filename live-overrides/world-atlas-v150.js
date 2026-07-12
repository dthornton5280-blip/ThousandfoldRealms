/* Thousandfold Realms v1.5.0-dev — Living Atlas, regional travel, and Aurelia city districts. */
(() => {
  'use strict';
  if (!window.AO || !AO.UI || !AO.WorldSystem || !AO.Game) return;

  const REGION_ID = 'last_lantern_vale';
  const MAP_WIDTH = () => AO.CONFIG.mapWidth;
  const MAP_HEIGHT = () => AO.CONFIG.mapHeight;

  AO.ATLAS_REGIONS = {
    last_lantern_vale: {
      id: REGION_ID,
      name: 'Last Lantern Vale',
      shortName: 'Lantern Vale',
      x: 22,
      y: 55,
      biome: 'Temperate vale, old forest, river roads',
      description: 'Haven, Whisperwood, the Lantern Road, and the great city of Aurelia hold the eastern marches together.',
      status: 'open',
      accent: '#d6aa58'
    },
    drowned_fen: {
      id: 'drowned_fen', name: 'The Drowned Fen', x: 42, y: 69,
      biome: 'Flooded marsh, drowned villages, reed islands',
      description: 'A drowned lowland where chapel bells still sound beneath black water.',
      status: 'charted', accent: '#6f9d8c'
    },
    cinder_marches: {
      id: 'cinder_marches', name: 'The Cinder Marches', x: 62, y: 62,
      biome: 'Ash plains, basalt ridges, ruined keeps',
      description: 'The old southern fortresses burn beneath a sky that never fully clears.',
      status: 'charted', accent: '#b56b4e'
    },
    frostmere_reach: {
      id: 'frostmere_reach', name: 'Frostmere Reach', x: 58, y: 28,
      biome: 'High mountains, frozen lakes, pine valleys',
      description: 'Ancient roads climb toward glacier monasteries and a crown buried in ice.',
      status: 'charted', accent: '#8fb3c4'
    },
    shattered_coast: {
      id: 'shattered_coast', name: 'The Shattered Coast', x: 82, y: 48,
      biome: 'Cliffs, storm ports, islands, sea ruins',
      description: 'A broken coast of ship cities, lighthouse orders, and drowned empires.',
      status: 'charted', accent: '#6795ad'
    },
    veiled_highlands: {
      id: 'veiled_highlands', name: 'The Veiled Highlands', x: 38, y: 31,
      biome: 'Arcane moor, star ruins, floating stone',
      description: 'The old observatories still turn, though the constellations they followed are gone.',
      status: 'charted', accent: '#9a82b3'
    },
    sunken_crown: {
      id: 'sunken_crown', name: 'The Sunken Crown', x: 76, y: 78,
      biome: 'Salt desert, buried palaces, glass dunes',
      description: 'A royal heartland swallowed by sand and the memory of an inland sea.',
      status: 'charted', accent: '#c39a62'
    }
  };

  AO.ATLAS_LOCATIONS = {
    haven: {
      id: 'haven', regionId: REGION_ID, name: 'Haven of the Last Lantern', type: 'town',
      x: 18, y: 54, mapId: 'haven', entry: {x: 14, y: 15}, fastTravel: true,
      initialKnown: true,
      summary: 'The fortified starting town and last dependable light on the eastern road.',
      maps: ['haven','inn','inn_upper','tavern','tavern_cellar','general_store','forge','arcane_shop','chapel']
    },
    whisperwood: {
      id: 'whisperwood', regionId: REGION_ID, name: 'Whisperwood', type: 'wilderness',
      x: 34, y: 48, mapId: 'wilds', entry: {x: 2, y: 9}, fastTravel: true,
      initialKnown: true,
      summary: 'A layered woodland of old roads, water, ruins, bandits, and buried ward-stones.',
      maps: ['wilds']
    },
    lantern_mine: {
      id: 'lantern_mine', regionId: REGION_ID, name: 'Abandoned Lantern Mine', type: 'dungeon',
      x: 39, y: 25, mapId: 'lantern_mine', entry: {x: 1, y: 9}, fastTravel: false,
      initialKnown: true,
      summary: 'Blue crystal galleries and abandoned workings beneath the northern ridge.',
      maps: ['lantern_mine']
    },
    ashen_crypt: {
      id: 'ashen_crypt', regionId: REGION_ID, name: 'The Ashen Crypt', type: 'dungeon',
      x: 53, y: 45, mapId: 'crypt', entry: {x: 1, y: 9}, fastTravel: false,
      initialKnown: true,
      summary: 'A sealed warden crypt where an ember still moves beneath the stone.',
      maps: ['crypt']
    },
    lantern_road: {
      id: 'lantern_road', regionId: REGION_ID, name: 'The Lantern Road', type: 'road',
      x: 52, y: 66, mapId: 'lantern_road', entry: {x: 1, y: 9}, fastTravel: true,
      initialKnown: true,
      summary: 'The old trade road linking Whisperwood to Aurelia across the Mosswater.',
      maps: ['lantern_road']
    },
    aurelia: {
      id: 'aurelia', regionId: REGION_ID, name: 'Aurelia, City of a Thousand Lanterns', type: 'city',
      x: 77, y: 58, mapId: 'aurelia_gate', entry: {x: 2, y: 9}, fastTravel: true,
      initialKnown: true,
      summary: 'A major surviving city built in districts around markets, river docks, old walls, and the high citadel.',
      maps: ['aurelia_gate','aurelia_market','aurelia_river','aurelia_citadel'],
      districts: [
        ['aurelia_gate','Golden Gate Ward'],
        ['aurelia_market','Market Ward'],
        ['aurelia_river','River Ward'],
        ['aurelia_citadel','Citadel Heights']
      ]
    }
  };

  AO.ATLAS_ROUTES = [
    {id:'haven_whisperwood',from:'haven',to:'whisperwood',hours:6,danger:'Low',label:'Whisperwood Road'},
    {id:'whisperwood_mine',from:'whisperwood',to:'lantern_mine',hours:4,danger:'High',label:'North Trail'},
    {id:'whisperwood_crypt',from:'whisperwood',to:'ashen_crypt',hours:5,danger:'High',label:'Ashen Track'},
    {id:'whisperwood_lanternroad',from:'whisperwood',to:'lantern_road',hours:8,danger:'Moderate',label:'Southwood Track'},
    {id:'lanternroad_aurelia',from:'lantern_road',to:'aurelia',hours:16,danger:'Moderate',label:'Aurelian Causeway'}
  ];

  AO.ATLAS_MAP_INDEX = {};
  for (const location of Object.values(AO.ATLAS_LOCATIONS)) {
    for (const mapId of location.maps || [location.mapId]) AO.ATLAS_MAP_INDEX[mapId] = location.id;
  }

  const ensureAtlas = state => {
    if (!state) return null;
    state.atlas ||= {};
    const atlas = state.atlas;
    atlas.discoveredRegions ||= {[REGION_ID]: true};
    atlas.knownLocations ||= {};
    atlas.visitedLocations ||= {};
    atlas.discoveredRoutes ||= {};
    atlas.travelHistory ||= [];
    atlas.hourRemainder ||= 0;
    for (const location of Object.values(AO.ATLAS_LOCATIONS)) {
      if (location.initialKnown) atlas.knownLocations[location.id] = true;
    }
    return atlas;
  };

  const locationForMap = mapId => AO.ATLAS_MAP_INDEX[mapId] || null;

  const discoverMap = (state, mapId) => {
    const atlas = ensureAtlas(state);
    const locationId = locationForMap(mapId);
    if (!atlas || !locationId) return;
    const location = AO.ATLAS_LOCATIONS[locationId];
    atlas.discoveredRegions[location.regionId] = true;
    atlas.knownLocations[locationId] = true;
    atlas.visitedLocations[locationId] = true;
    atlas.currentLocationId = locationId;
    for (const route of AO.ATLAS_ROUTES) {
      if (route.from === locationId || route.to === locationId) {
        atlas.discoveredRoutes[route.id] = true;
        const other = route.from === locationId ? route.to : route.from;
        atlas.knownLocations[other] = true;
      }
    }
  };

  const pathBetween = (atlas, from, to) => {
    if (!from || !to || from === to) return {routes:[],hours:0,danger:'None'};
    const queue = [{id:from,routes:[]}], seen = new Set([from]);
    while (queue.length) {
      const current = queue.shift();
      for (const route of AO.ATLAS_ROUTES) {
        if (!atlas.discoveredRoutes[route.id] && !atlas.knownLocations[route.from] && !atlas.knownLocations[route.to]) continue;
        let next = null;
        if (route.from === current.id) next = route.to;
        else if (route.to === current.id) next = route.from;
        if (!next || seen.has(next)) continue;
        const routes = [...current.routes, route];
        if (next === to) {
          const dangerRank = {None:0,Low:1,Moderate:2,High:3,Severe:4};
          const danger = routes.reduce((worst,r)=>(dangerRank[r.danger]||0)>(dangerRank[worst]||0)?r.danger:worst,'None');
          return {routes,hours:routes.reduce((sum,r)=>sum+r.hours,0),danger};
        }
        seen.add(next); queue.push({id:next,routes});
      }
    }
    return null;
  };

  const advanceTravelTime = (game, hours) => {
    const atlas = ensureAtlas(game.state);
    atlas.hourRemainder += Math.max(0, hours || 0);
    const days = Math.floor(atlas.hourRemainder / 24);
    if (days > 0) {
      atlas.hourRemainder -= days * 24;
      game.state.rest ||= {day:1,wellRestedBattles:0};
      game.state.rest.day = (game.state.rest.day || 1) + days;
    }
  };

  const baseWildsBuilder = AO.MapBuilders.wilds;
  AO.MapBuilders.wilds = function livingAtlasWilds() {
    const g = baseWildsBuilder.call(this);
    for (let y = 14; y < MAP_HEIGHT(); y++) g[y][24] = 'path';
    g[17][24] = 'path';
    return g;
  };

  AO.MapBuilders.lanternRoad = function lanternRoad() {
    const g = this.border(this.grid('grass'),'tree');
    for (let x=0;x<MAP_WIDTH();x++) for (let y=8;y<=10;y++) g[y][x]='path';
    for (let y=1;y<MAP_HEIGHT()-1;y++) g[y][15]='water';
    for (let x=14;x<=16;x++) for (let y=8;y<=10;y++) g[y][x]='bridge';
    this.rect(g,3,2,8,5,'flower_patch');
    this.rect(g,19,2,8,5,'grass');
    this.rect(g,3,12,8,4,'grass');
    this.rect(g,20,12,7,4,'flower_patch');
    [[3,4],[5,2],[8,5],[21,3],[25,5],[4,14],[9,13],[22,14],[27,12],[12,3],[18,4]].forEach(([x,y])=>g[y][x]='tree');
    [[6,7],[11,11],[19,7],[24,11]].forEach(([x,y])=>g[y][x]='rocks');
    [[12,7],[18,11],[7,11],[23,7]].forEach(([x,y])=>g[y][x]='shrub');
    g[9][0]='path'; g[9][MAP_WIDTH()-1]='path';
    return g;
  };

  AO.MapBuilders.aureliaGate = function aureliaGate() {
    const g = this.border(this.grid('cobble'),'stonewall');
    for (let x=0;x<MAP_WIDTH();x++) for (let y=7;y<=11;y++) g[y][x]='cobble';
    this.rect(g,2,2,8,5,'roof'); this.rect(g,20,2,8,5,'roof');
    this.rect(g,2,12,8,4,'roof'); this.rect(g,20,12,8,4,'roof');
    this.rect(g,11,2,8,4,'stonefloor'); this.rect(g,11,13,8,3,'stonefloor');
    g[9][0]='cobble'; g[9][MAP_WIDTH()-1]='cobble';
    return g;
  };

  AO.MapBuilders.aureliaMarket = function aureliaMarket() {
    const g = this.border(this.grid('cobble'),'stonewall');
    this.rect(g,1,1,28,16,'cobble');
    this.rect(g,2,2,7,5,'roof'); this.rect(g,21,2,7,5,'roof');
    this.rect(g,2,12,7,4,'roof'); this.rect(g,21,12,7,4,'roof');
    this.rect(g,11,5,8,8,'cobble');
    for (let x=0;x<MAP_WIDTH();x++) g[9][x]='cobble';
    for (let y=0;y<MAP_HEIGHT();y++) g[y][15]='cobble';
    g[9][0]='cobble'; g[0][15]='cobble'; g[17][15]='cobble';
    return g;
  };

  AO.MapBuilders.aureliaRiver = function aureliaRiver() {
    const g = this.border(this.grid('cobble'),'stonewall');
    this.rect(g,1,1,28,10,'cobble');
    for (let y=12;y<MAP_HEIGHT();y++) for (let x=1;x<MAP_WIDTH()-1;x++) g[y][x]='water';
    for (let x=3;x<=8;x++) g[12][x]='bridge';
    for (let x=20;x<=26;x++) g[12][x]='bridge';
    this.rect(g,2,2,8,5,'roof'); this.rect(g,20,2,8,5,'roof');
    for (let y=0;y<=11;y++) g[y][15]='cobble';
    g[0][15]='cobble';
    return g;
  };

  AO.MapBuilders.aureliaCitadel = function aureliaCitadel() {
    const g = this.border(this.grid('stonefloor'),'stonewall');
    this.rect(g,1,1,28,16,'stonefloor');
    this.rect(g,7,2,16,5,'roof');
    this.rect(g,4,9,7,6,'grass'); this.rect(g,19,9,7,6,'grass');
    for (let y=7;y<MAP_HEIGHT();y++) g[y][15]=y<11?'stairs':'cobble';
    for (let x=11;x<=19;x++) g[10][x]='cobble';
    g[17][15]='cobble';
    return g;
  };

  const pushUnique = (list, item) => {
    if (!list.some(existing => existing.id === item.id)) list.push(item);
  };

  AO.MAP_DEFS.wilds.portals ||= [];
  pushUnique(AO.MAP_DEFS.wilds.portals,{id:'wilds_to_lantern_road',x:24,y:17,to:'lantern_road',toX:1,toY:9,label:'Lantern Road'});

  AO.MAP_DEFS.lantern_road = {
    id:'lantern_road',name:'The Lantern Road',theme:'wilds',builder:'lanternRoad',start:{x:1,y:9},allowCamp:true,
    portals:[
      {id:'lantern_road_to_wilds',x:0,y:9,to:'wilds',toX:24,toY:16,label:'Whisperwood'},
      {id:'lantern_road_to_aurelia',x:29,y:9,to:'aurelia_gate',toX:2,toY:9,label:'Aurelia — Golden Gate'}
    ],
    npcs:[],
    objects:[
      {id:'lantern_road_sign_west',type:'sign',x:3,y:7,text:'WEST: WHISPERWOOD AND HAVEN • EAST: AURELIA, CITY OF A THOUSAND LANTERNS'},
      {id:'lantern_road_camp',type:'camp',x:10,y:12,blocking:true,text:'A maintained road camp stands beneath an old bronze mile-marker.'},
      {id:'lantern_road_cart',type:'decor',kind:'cart',x:22,y:7,blocking:true,text:'A merchant cart waits for the eastern gate patrol.'},
      {id:'lantern_road_lamp_1',type:'decor',kind:'lamp',x:5,y:7,blocking:false},
      {id:'lantern_road_lamp_2',type:'decor',kind:'lamp',x:12,y:11,blocking:false},
      {id:'lantern_road_lamp_3',type:'decor',kind:'lamp',x:19,y:7,blocking:false},
      {id:'lantern_road_lamp_4',type:'decor',kind:'lamp',x:26,y:11,blocking:false},
      {id:'lantern_road_cache',type:'chest',x:25,y:14,loot:['travel_ration','healing_draught'],gold:24}
    ],
    enemies:[
      {id:'road_bandit_1',type:'bandit',x:7,y:11},
      {id:'road_bandit_2',type:'bandit',x:20,y:7},
      {id:'road_mire_1',type:'mireling',x:12,y:5}
    ]
  };

  Object.assign(AO.NPCS,{
    aurelia_captain:{id:'aurelia_captain',name:'Captain Vela Arden',title:'Commander of the Golden Gate',map:'aurelia_gate',x:15,y:8,visual:{skin:'#b88365',hair:'#342e31',outfit:'#5c6170',accent:'#d1aa57',weapon:'spear'}},
    aurelia_herald:{id:'aurelia_herald',name:'Tomas Bell',title:'Market Herald',map:'aurelia_market',x:14,y:7,visual:{skin:'#c09070',hair:'#6b4934',outfit:'#6e4f3a',accent:'#e0b865'}},
    aurelia_rivermaster:{id:'aurelia_rivermaster',name:'Yona Marr',title:'Rivermaster',map:'aurelia_river',x:15,y:8,visual:{skin:'#956c55',hair:'#24272a',outfit:'#3e6170',accent:'#c49c58'}},
    aurelia_archivist:{id:'aurelia_archivist',name:'Archivist Maelin',title:'Keeper of the High Atlas',map:'aurelia_citadel',x:15,y:8,visual:{skin:'#aa8fc1',hair:'#e0d9e8',outfit:'#4e506b',accent:'#d5b66f',ears:'long',weapon:'staff'}}
  });

  AO.MAP_DEFS.aurelia_gate = {
    id:'aurelia_gate',name:'Aurelia — Golden Gate Ward',theme:'haven',builder:'aureliaGate',start:{x:2,y:9},allowCamp:false,
    portals:[
      {id:'aurelia_gate_to_road',x:0,y:9,to:'lantern_road',toX:28,toY:9,label:'Lantern Road'},
      {id:'aurelia_gate_to_market',x:29,y:9,to:'aurelia_market',toX:1,toY:9,label:'Market Ward'}
    ],npcs:['aurelia_captain'],
    objects:[
      {id:'aurelia_gate_arch',type:'sign',x:15,y:6,text:'AURELIA • LET EVERY LANTERN ANSWER ANOTHER'},
      {id:'aurelia_gate_statue',type:'decor',kind:'statue',x:15,y:12,blocking:true,text:'The first queen holds an unlit lantern toward the eastern road.'},
      {id:'aurelia_gate_fountain',type:'decor',kind:'fountain',x:12,y:9,blocking:true,text:'Travelers wash the road dust from their hands before entering the city.'},
      {id:'aurelia_gate_bench_1',type:'decor',kind:'bench',x:6,y:8,blocking:true},
      {id:'aurelia_gate_bench_2',type:'decor',kind:'bench',x:23,y:10,blocking:true},
      {id:'aurelia_gate_cart_1',type:'decor',kind:'cart',x:5,y:12,blocking:true},
      {id:'aurelia_gate_crates',type:'decor',kind:'crates',x:24,y:5,blocking:true},
      {id:'aurelia_gate_lamp_1',type:'decor',kind:'lamp',x:10,y:7,blocking:false},
      {id:'aurelia_gate_lamp_2',type:'decor',kind:'lamp',x:19,y:11,blocking:false}
    ],enemies:[]
  };

  AO.MAP_DEFS.aurelia_market = {
    id:'aurelia_market',name:'Aurelia — Market Ward',theme:'haven',builder:'aureliaMarket',start:{x:1,y:9},allowCamp:false,
    portals:[
      {id:'aurelia_market_to_gate',x:0,y:9,to:'aurelia_gate',toX:28,toY:9,label:'Golden Gate Ward'},
      {id:'aurelia_market_to_citadel',x:15,y:0,to:'aurelia_citadel',toX:15,toY:16,label:'Citadel Heights'},
      {id:'aurelia_market_to_river',x:15,y:17,to:'aurelia_river',toX:15,toY:1,label:'River Ward'}
    ],npcs:['aurelia_herald'],
    objects:[
      {id:'aurelia_market_fountain',type:'decor',kind:'fountain',x:15,y:9,blocking:true,text:'A ring of bronze lanterns circles the market fountain.'},
      {id:'aurelia_market_stall_1',type:'decor',kind:'stall',x:11,y:7,blocking:true},
      {id:'aurelia_market_stall_2',type:'decor',kind:'stall',x:19,y:7,blocking:true},
      {id:'aurelia_market_stall_3',type:'decor',kind:'stall',x:11,y:12,blocking:true},
      {id:'aurelia_market_stall_4',type:'decor',kind:'stall',x:19,y:12,blocking:true},
      {id:'aurelia_market_board',type:'sign',x:14,y:11,text:'MARKET WARD • RIVER SOUTH • CITADEL NORTH • GOLDEN GATE WEST'},
      {id:'aurelia_market_lamp_1',type:'decor',kind:'lamp',x:10,y:9,blocking:false},
      {id:'aurelia_market_lamp_2',type:'decor',kind:'lamp',x:20,y:9,blocking:false},
      {id:'aurelia_market_bench_1',type:'decor',kind:'bench',x:13,y:5,blocking:true},
      {id:'aurelia_market_bench_2',type:'decor',kind:'bench',x:17,y:13,blocking:true}
    ],enemies:[]
  };

  AO.MAP_DEFS.aurelia_river = {
    id:'aurelia_river',name:'Aurelia — River Ward',theme:'haven',builder:'aureliaRiver',start:{x:15,y:1},allowCamp:false,
    portals:[{id:'aurelia_river_to_market',x:15,y:0,to:'aurelia_market',toX:15,toY:16,label:'Market Ward'}],
    npcs:['aurelia_rivermaster'],
    objects:[
      {id:'aurelia_river_sign',type:'sign',x:15,y:3,text:'RIVER WARD • FERRIES • WAREHOUSES • SOUTHERN QUAYS'},
      {id:'aurelia_river_crates_1',type:'decor',kind:'crates',x:6,y:8,blocking:true},
      {id:'aurelia_river_crates_2',type:'decor',kind:'crates',x:23,y:8,blocking:true},
      {id:'aurelia_river_cart',type:'decor',kind:'cart',x:10,y:6,blocking:true},
      {id:'aurelia_river_lamp_1',type:'decor',kind:'lamp',x:5,y:10,blocking:false},
      {id:'aurelia_river_lamp_2',type:'decor',kind:'lamp',x:24,y:10,blocking:false},
      {id:'aurelia_river_bench',type:'decor',kind:'bench',x:15,y:10,blocking:true},
      {id:'aurelia_river_coast_sign',type:'sign',x:27,y:9,text:'FERRIES TO THE SHATTERED COAST ARE SUSPENDED UNTIL THE STORM BEACONS RETURN.'}
    ],enemies:[]
  };

  AO.MAP_DEFS.aurelia_citadel = {
    id:'aurelia_citadel',name:'Aurelia — Citadel Heights',theme:'haven',builder:'aureliaCitadel',start:{x:15,y:16},allowCamp:false,
    portals:[{id:'aurelia_citadel_to_market',x:15,y:17,to:'aurelia_market',toX:15,toY:1,label:'Market Ward'}],
    npcs:['aurelia_archivist'],
    objects:[
      {id:'aurelia_citadel_atlas',type:'decor',kind:'orb',x:15,y:7,blocking:true,text:'A mechanical atlas turns above a map of seven regions and one blank sea.'},
      {id:'aurelia_citadel_statue_1',type:'decor',kind:'statue',x:9,y:8,blocking:true},
      {id:'aurelia_citadel_statue_2',type:'decor',kind:'statue',x:21,y:8,blocking:true},
      {id:'aurelia_citadel_brazier_1',type:'decor',kind:'brazier',x:12,y:10,blocking:false},
      {id:'aurelia_citadel_brazier_2',type:'decor',kind:'brazier',x:18,y:10,blocking:false},
      {id:'aurelia_citadel_bench_1',type:'decor',kind:'bench',x:7,y:12,blocking:true},
      {id:'aurelia_citadel_bench_2',type:'decor',kind:'bench',x:23,y:12,blocking:true},
      {id:'aurelia_citadel_sign',type:'sign',x:15,y:11,text:'HIGH ATLAS • CIVIC ARCHIVE • COUNCIL CHAMBERS'}
    ],enemies:[]
  };

  AO.MAP_LANDMARKS ||= {};
  AO.MAP_LANDMARKS.wilds ||= [];
  pushUnique(AO.MAP_LANDMARKS.wilds,{id:'landmark_lantern_road',x:24,y:16,label:'Lantern Road',kind:'exit'});
  AO.MAP_LANDMARKS.lantern_road = [
    {x:2,y:9,label:'Whisperwood',kind:'exit'},
    {x:15,y:9,label:'Mosswater Crossing',kind:'bridge'},
    {x:10,y:12,label:'Road Camp',kind:'hearth'},
    {x:28,y:9,label:'Aurelia',kind:'exit'}
  ];
  AO.MAP_LANDMARKS.aurelia_gate = [
    {x:2,y:9,label:'Lantern Road',kind:'exit'},
    {x:15,y:9,label:'Golden Gate',kind:'square'},
    {x:28,y:9,label:'Market Ward',kind:'exit'}
  ];
  AO.MAP_LANDMARKS.aurelia_market = [
    {x:2,y:9,label:'Golden Gate',kind:'exit'},
    {x:15,y:9,label:'Grand Market',kind:'square'},
    {x:15,y:1,label:'Citadel Heights',kind:'stairs'},
    {x:15,y:16,label:'River Ward',kind:'exit'}
  ];
  AO.MAP_LANDMARKS.aurelia_river = [
    {x:15,y:1,label:'Market Ward',kind:'exit'},
    {x:6,y:11,label:'Western Quay',kind:'water'},
    {x:23,y:11,label:'Eastern Quay',kind:'water'}
  ];
  AO.MAP_LANDMARKS.aurelia_citadel = [
    {x:15,y:16,label:'Market Ward',kind:'exit'},
    {x:15,y:7,label:'High Atlas',kind:'arcane'},
    {x:15,y:10,label:'Citadel Court',kind:'square'}
  ];

  const oldWorldLoad = AO.WorldSystem.prototype.load;
  AO.WorldSystem.prototype.load = function livingAtlasLoad(mapId,x=null,y=null) {
    oldWorldLoad.call(this,mapId,x,y);
    discoverMap(this.game.state,mapId);
  };

  const oldNewGame = AO.Game.prototype.newGame;
  AO.Game.prototype.newGame = function livingAtlasNewGame(build) {
    oldNewGame.call(this,build);
    ensureAtlas(this.state);
    discoverMap(this.state,this.state.world.mapId);
    this.saveGame(true);
  };

  const oldMigrateState = AO.Game.prototype.migrateState;
  AO.Game.prototype.migrateState = function livingAtlasMigrateState() {
    oldMigrateState.call(this);
    ensureAtlas(this.state);
    discoverMap(this.state,this.state.world.mapId);
  };

  AO.Game.prototype.atlasTravel = function atlasTravel(locationId) {
    if (!this.state || this.state.mode !== 'explore') {
      this.toast('Finish the current conversation or encounter before traveling.');
      return false;
    }
    const atlas = ensureAtlas(this.state), destination = AO.ATLAS_LOCATIONS[locationId];
    if (!destination || !atlas.knownLocations[locationId]) {
      this.toast('That destination has not been charted yet.');
      return false;
    }
    if (destination.fastTravel === false) {
      this.toast('That site must be entered from the road.');
      return false;
    }
    const current = locationForMap(this.state.world.mapId) || atlas.currentLocationId;
    if (current === locationId) {
      this.toast(`You are already at ${destination.name}.`);
      return false;
    }
    const path = pathBetween(atlas,current,locationId);
    if (!path) {
      this.toast('No known route connects your current location to that destination.');
      return false;
    }
    for (const route of path.routes) atlas.discoveredRoutes[route.id] = true;
    advanceTravelTime(this,path.hours);
    atlas.travelHistory.unshift({from:current,to:locationId,hours:path.hours,day:this.state.rest?.day||1});
    atlas.travelHistory = atlas.travelHistory.slice(0,20);
    const originName = AO.ATLAS_LOCATIONS[current]?.name || 'the road';
    this.log(`Atlas travel: ${originName} → ${destination.name} • ${path.hours} hours • ${path.danger} danger.`);
    this.ui.closePanel();
    this.world.load(destination.mapId,destination.entry?.x,destination.entry?.y);
    this.saveGame(true);
    this.toast(`Arrived at ${destination.name}.`);
    return true;
  };

  const cityDialogue = {
    aurelia_captain: {
      greeting:'“Aurelia is not one city. It is four old cities that learned to share walls.”',
      choices(game,npc){return [
        {label:'Ask how the districts connect.',action:()=>game.ui.dialogue(npc.name,'The Golden Gate opens east into the Market Ward. The River Ward lies south of the market, and Citadel Heights rises to the north. Every district is a full neighborhood with its own people, routes, and troubles.',[{label:'Back',action:()=>game.dialogue(npc)}],npc.visual,'A City in Districts')},
        {label:'Ask about the road to Haven.',action:()=>game.ui.dialogue(npc.name,'The Lantern Road crosses the Mosswater and enters Whisperwood from the south. Haven is smaller than Aurelia, but its ward-lantern is older than our walls.',[{label:'Back',action:()=>game.dialogue(npc)}],npc.visual,'The Eastern Road')}
      ];}
    },
    aurelia_herald: {
      greeting:'“Fresh notices! Guild work, river tariffs, missing heirs, harmless curses, and one curse of disputed harmlessness!”',
      choices(game,npc){return [
        {label:'Ask what can be found in the Market Ward.',action:()=>game.ui.dialogue(npc.name,'Caravans enter from the west. The river brings goods from the south. Scholars and officials descend from the citadel. Whatever you need, someone here sells it—or knows who stole it.',[{label:'Back',action:()=>game.dialogue(npc)}],npc.visual,'The Grand Market')},
        {label:'Mark Aurelia clearly in the atlas.',action:()=>{const atlas=ensureAtlas(game.state);atlas.knownLocations.aurelia=true;atlas.visitedLocations.aurelia=true;game.toast('Aurelia and its districts are marked in the Living Atlas.');game.dialogue(npc);}}
      ];}
    },
    aurelia_rivermaster: {
      greeting:'“Every road ends at water eventually. Smart cities build docks before they build excuses.”',
      choices(game,npc){return [
        {label:'Ask about the Shattered Coast.',action:()=>game.ui.dialogue(npc.name,'The ferries are grounded. Three storm beacons went dark in one night, and no captain has returned from beyond the eastern headland. When the route reopens, this ward will be the road to the coast.',[{label:'Back',action:()=>game.dialogue(npc)}],npc.visual,'The Closed Sea Road')}
      ];}
    },
    aurelia_archivist: {
      greeting:'“The atlas records seven regions. The blank spaces are not empty. They are merely undefeated.”',
      choices(game,npc){return [
        {label:'Ask about the seven regions.',action:()=>game.ui.dialogue(npc.name,'Lantern Vale anchors the east. Beyond it lie the Drowned Fen, Cinder Marches, Frostmere Reach, Shattered Coast, Veiled Highlands, and the desert called the Sunken Crown. Each will become a regional atlas when its roads open.',[{label:'Back',action:()=>game.dialogue(npc)}],npc.visual,'The Known Realm')},
        {label:'Study the High Atlas.',action:()=>{for(const id of Object.keys(AO.ATLAS_REGIONS))game.state.atlas.discoveredRegions[id]=true;game.toast('The seven regions are copied into your world atlas.');game.ui.dialogue(npc.name,'You copy borders, old roads, mountain chains, and the names of lands not yet open to travel.',[{label:'Back',action:()=>game.dialogue(npc)}],npc.visual,'The High Atlas');}}
      ];}
    }
  };

  const oldDialogue = AO.Game.prototype.dialogue;
  AO.Game.prototype.dialogue = function livingAtlasDialogue(npc) {
    const entry = cityDialogue[npc?.id];
    if (!entry) return oldDialogue.call(this,npc);
    this.state.mode='dialogue'; this.state.dialogueNpc=npc.id;
    const choices = entry.choices(this,npc);
    choices.push({label:'Leave.',action:()=>this.ui.closeDialogue()});
    this.ui.dialogue(npc.name,entry.greeting,choices,npc.visual,npc.title);
  };

  const AtlasBaseUI = AO.UI;
  AO.UI = class LivingAtlasUI extends AtlasBaseUI {
    constructor(game){
      super(game);
      this.atlasLayer='region';
      this.atlasSelectedLocation=null;
      this.atlasSelectedRegion=REGION_ID;
    }

    atlasTabs(active){
      return `<nav class="atlas-level-tabs" aria-label="Atlas scale">
        <button data-atlas-layer="world" class="${active==='world'?'active':''}"><span>Ⅰ</span> World</button>
        <button data-atlas-layer="region" class="${active==='region'?'active':''}"><span>Ⅱ</span> Region</button>
        <button data-atlas-layer="local" class="${active==='local'?'active':''}"><span>Ⅲ</span> Local</button>
      </nav>`;
    }

    bindAtlasTabs(){
      for(const button of this.e.panelBody.querySelectorAll('[data-atlas-layer]'))button.onclick=()=>{this.atlasLayer=button.dataset.atlasLayer;this.renderMap();};
    }

    renderMap(){
      ensureAtlas(this.game.state);
      this.e.panelTitle.textContent='The Living Atlas';
      if(this.atlasLayer==='local')this.renderLocalAtlas();
      else if(this.atlasLayer==='world')this.renderWorldAtlas();
      else this.renderRegionAtlas();
    }

    renderLocalAtlas(){
      AtlasBaseUI.prototype.renderMap.call(this);
      this.e.panelTitle.textContent='The Living Atlas — Local Survey';
      this.e.panelBody.insertAdjacentHTML('afterbegin',this.atlasTabs('local'));
      this.bindAtlasTabs();
    }

    renderWorldAtlas(){
      const atlas=ensureAtlas(this.game.state),regions=Object.values(AO.ATLAS_REGIONS),selected=AO.ATLAS_REGIONS[this.atlasSelectedRegion]||AO.ATLAS_REGIONS[REGION_ID];
      this.e.panelBody.innerHTML=`${this.atlasTabs('world')}<div class="living-atlas atlas-world-layout">
        <section class="atlas-illustration atlas-world-map" aria-label="World map of the known realms">
          <div class="atlas-map-caption"><span>THE KNOWN REALM</span><small>Seven regions recorded by the High Atlas</small></div>
          <div class="atlas-world-river" aria-hidden="true"></div>
          ${regions.map(region=>{
            const discovered=!!atlas.discoveredRegions[region.id],locked=region.status!=='open';
            return `<button class="atlas-region-node ${discovered?'discovered':'veiled'} ${locked?'locked':''} ${selected.id===region.id?'selected':''}" style="--atlas-x:${region.x}%;--atlas-y:${region.y}%;--atlas-accent:${region.accent}" data-atlas-region="${region.id}" aria-label="${region.name}">
              <i></i><strong>${discovered?region.name:'Uncharted Region'}</strong><small>${locked?'Roads sealed':'Current region'}</small>
            </button>`;
          }).join('')}
          <div class="atlas-compass" aria-hidden="true"><b>N</b><i></i></div>
        </section>
        <aside class="atlas-detail-card">
          <p class="atlas-kicker">${selected.status==='open'?'CURRENT REGION':'CHARTED FRONTIER'}</p>
          <h3>${selected.name}</h3>
          <p>${selected.description}</p>
          <dl><div><dt>Biome</dt><dd>${selected.biome}</dd></div><div><dt>Status</dt><dd>${selected.status==='open'?'Roads open':'Travel not yet opened'}</dd></div></dl>
          ${selected.id===REGION_ID?'<button class="primary atlas-open-region" data-open-region="last_lantern_vale">Open Regional Atlas</button>':'<p class="atlas-lock-note">This region is part of the planned world expansion. Its border and biome are established, but its travel network is not open yet.</p>'}
          <div class="atlas-page-ornament" aria-hidden="true">✦　✧　✦</div>
        </aside>
      </div>`;
      this.bindAtlasTabs();
      for(const button of this.e.panelBody.querySelectorAll('[data-atlas-region]'))button.onclick=()=>{this.atlasSelectedRegion=button.dataset.atlasRegion;this.renderWorldAtlas();};
      const open=this.e.panelBody.querySelector('[data-open-region]');if(open)open.onclick=()=>{this.atlasLayer='region';this.renderMap();};
    }

    renderRegionAtlas(){
      const atlas=ensureAtlas(this.game.state),locations=Object.values(AO.ATLAS_LOCATIONS).filter(l=>l.regionId===REGION_ID);
      const current=locationForMap(this.game.state.world.mapId)||atlas.currentLocationId||'haven';
      if(!this.atlasSelectedLocation||!AO.ATLAS_LOCATIONS[this.atlasSelectedLocation])this.atlasSelectedLocation=current;
      const selected=AO.ATLAS_LOCATIONS[this.atlasSelectedLocation];
      this.e.panelBody.innerHTML=`${this.atlasTabs('region')}<div class="living-atlas atlas-region-layout">
        <section class="atlas-illustration atlas-region-map" aria-label="Regional map of Last Lantern Vale">
          <div class="atlas-map-caption"><span>LAST LANTERN VALE</span><small>Roads, ruins, settlements, and known crossings</small></div>
          <svg class="atlas-route-network" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            ${AO.ATLAS_ROUTES.map(route=>{const a=AO.ATLAS_LOCATIONS[route.from],b=AO.ATLAS_LOCATIONS[route.to],known=atlas.discoveredRoutes[route.id]||atlas.knownLocations[a.id]||atlas.knownLocations[b.id];return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="${known?'known':'unknown'}"></line>`;}).join('')}
            <path d="M2 82 C28 72, 40 78, 58 64 S82 43, 98 35" class="atlas-river-path"></path>
          </svg>
          <div class="atlas-terrain-mark mountains" aria-hidden="true">△ △ △ △</div>
          <div class="atlas-terrain-mark forest" aria-hidden="true">♠ ♠ ♠ ♠ ♠</div>
          <div class="atlas-terrain-mark city" aria-hidden="true">▥ ▥ ▥</div>
          ${locations.map(location=>{
            const visited=!!atlas.visitedLocations[location.id],known=!!atlas.knownLocations[location.id];
            return `<button class="atlas-location-node type-${location.type} ${visited?'visited':known?'known':'unknown'} ${current===location.id?'current':''} ${selected.id===location.id?'selected':''}" style="--atlas-x:${location.x}%;--atlas-y:${location.y}%" data-atlas-location="${location.id}" aria-label="${known?location.name:'Unknown location'}">
              <i>${location.type==='city'?'♜':location.type==='town'?'⌂':location.type==='dungeon'?'◆':location.type==='road'?'✦':'♠'}</i>
              <strong>${known?location.name:'Unknown'}</strong>
            </button>`;
          }).join('')}
          <div class="atlas-compass" aria-hidden="true"><b>N</b><i></i></div>
        </section>
        ${this.regionDetailMarkup(selected,current,atlas)}
      </div>`;
      this.bindAtlasTabs();
      for(const button of this.e.panelBody.querySelectorAll('[data-atlas-location]'))button.onclick=()=>{this.atlasSelectedLocation=button.dataset.atlasLocation;this.renderRegionAtlas();};
      const travel=this.e.panelBody.querySelector('[data-atlas-travel]');if(travel)travel.onclick=()=>this.game.atlasTravel(travel.dataset.atlasTravel);
      const local=this.e.panelBody.querySelector('[data-open-local]');if(local)local.onclick=()=>{this.atlasLayer='local';this.renderMap();};
    }

    regionDetailMarkup(selected,current,atlas){
      const known=!!atlas.knownLocations[selected.id],visited=!!atlas.visitedLocations[selected.id],same=current===selected.id;
      const path=known?pathBetween(atlas,current,selected.id):null;
      const routeText=path&&path.routes.length?path.routes.map(r=>r.label).join(' → '):same?'Current location':'No charted route';
      const travelAllowed=known&&!same&&selected.fastTravel!==false&&!!path;
      const status=visited?'Visited':known?'Known':'Uncharted';
      return `<aside class="atlas-detail-card atlas-location-detail">
        <p class="atlas-kicker">${selected.type.toUpperCase()} • ${status.toUpperCase()}</p>
        <h3>${known?selected.name:'Unknown Location'}</h3>
        <p>${known?selected.summary:'The atlas contains no reliable description of this place.'}</p>
        <dl>
          <div><dt>Route</dt><dd>${routeText}</dd></div>
          <div><dt>Travel time</dt><dd>${same?'—':path?`${path.hours} hours`:'Unknown'}</dd></div>
          <div><dt>Danger</dt><dd>${same?'Local':path?.danger||'Unknown'}</dd></div>
          <div><dt>Current day</dt><dd>${this.game.state.rest?.day||1}</dd></div>
        </dl>
        ${selected.districts?`<div class="atlas-district-list"><h4>City Districts</h4>${selected.districts.map(([,name])=>`<span>${name}</span>`).join('')}</div>`:''}
        <div class="atlas-detail-actions">
          ${same?'<button class="primary" data-open-local>Open Local Survey</button>':travelAllowed?`<button class="primary" data-atlas-travel="${selected.id}">Travel to ${selected.type==='city'?'Aurelia':selected.name}</button>`:''}
          ${selected.fastTravel===false&&!same?'<p class="atlas-lock-note">Enter this dungeon from its connected local road rather than fast traveling directly.</p>':''}
          ${!known?'<p class="atlas-lock-note">Explore neighboring roads or speak with travelers to reveal this location.</p>':''}
        </div>
        <div class="atlas-page-ornament" aria-hidden="true">✦　✧　✦</div>
      </aside>`;
    }
  };

  window.addEventListener('keydown',event=>{
    if(event.defaultPrevented||event.key.toLowerCase()!=='m'||!window.game?.state)return;
    const tag=document.activeElement?.tagName;if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT')return;
    if(game.state.mode!=='explore')return;
    event.preventDefault();game.ui.openPanel('map');
  });
})();
