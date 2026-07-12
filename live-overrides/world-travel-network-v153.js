/* Thousandfold Realms v1.5.3-dev — physical wilderness road network. */
(() => {
  'use strict';
  if (!window.AO || !AO.MapBuilders || !AO.MAP_DEFS || !AO.ATLAS_LOCATIONS || !AO.ATLAS_ROUTES) return;

  const REGION_ID = 'last_lantern_vale';
  const W = () => AO.CONFIG.mapWidth;
  const H = () => AO.CONFIG.mapHeight;

  const upsert = (list,item) => {
    const index=list.findIndex(existing=>existing.id===item.id);
    if(index>=0)list[index]=item;else list.push(item);
  };
  const replacePortal = (mapId,oldId,portal) => {
    const def=AO.MAP_DEFS[mapId];
    if(!def)return;
    def.portals ||= [];
    const index=def.portals.findIndex(existing=>existing.id===oldId||existing.id===portal.id);
    if(index>=0)def.portals[index]=portal;else def.portals.push(portal);
  };
  const addObject = (mapId,object) => {
    const def=AO.MAP_DEFS[mapId];
    if(!def)return;
    def.objects ||= [];
    upsert(def.objects,object);
  };

  /* Make the existing exits clearly point toward the new physical road chain. */
  addObject('haven',{id:'haven_east_road_sign',type:'sign',x:27,y:7,text:'EAST ROAD • WHISPERWOOD • SOUTHWOOD TRAIL • MOSSWATER CROSSING • AURELIA'});
  addObject('wilds',{id:'whisperwood_south_sign',type:'sign',x:23,y:12,text:'SOUTH: THE OLD AURELIAN ROAD • Follow the lantern-cut trail through Southwood.'});
  replacePortal('wilds','wilds_to_lantern_road',{id:'wilds_to_southwood',x:24,y:17,to:'southwood_trail',toX:15,toY:1,label:'Southwood Trail'});
  replacePortal('lantern_road','lantern_road_to_wilds',{id:'lantern_road_to_eastwatch',x:0,y:9,to:'eastwatch_approach',toX:28,toY:9,label:'Eastwatch Approach'});
  const roadSign=AO.MAP_DEFS.lantern_road?.objects?.find(object=>object.id==='lantern_road_sign_west');
  if(roadSign)roadSign.text='WEST: EASTWATCH, AMBERMEADOW, MOSSWATER, AND WHISPERWOOD • EAST: AURELIA';

  AO.MapBuilders.southwoodTrail=function southwoodTrail(){
    const g=this.border(this.grid('grass'),'tree');
    for(let y=0;y<H();y++)for(let x=14;x<=16;x++)g[y][x]='path';
    for(let y=3;y<=5;y++)for(let x=11;x<=19;x++)if(x<14||x>16)g[y][x]=(x+y)%3?'grass':'flower_patch';
    for(let y=10;y<=13;y++)for(let x=9;x<=20;x++)if(x<14||x>16)g[y][x]=(x+y)%4?'grass':'moss_stone';
    [[3,2],[5,4],[8,3],[21,2],[25,4],[4,8],[7,11],[24,9],[27,12],[5,15],[10,14],[20,15],[25,14],[11,7],[19,6]].forEach(([x,y])=>g[y][x]='tree');
    [[9,5],[21,5],[8,13],[22,12],[11,15],[19,14]].forEach(([x,y])=>g[y][x]='shrub');
    [[12,8],[18,9],[10,11],[20,11]].forEach(([x,y])=>g[y][x]='flower_patch');
    g[0][15]='path';g[H()-1][15]='path';
    return g;
  };

  AO.MapBuilders.mosswaterCrossing=function mosswaterCrossing(){
    const g=this.border(this.grid('grass'),'tree');
    for(let y=0;y<H();y++)for(let x=14;x<=16;x++)g[y][x]='path';
    for(let y=7;y<=10;y++)for(let x=1;x<W()-1;x++)g[y][x]='water';
    for(let y=7;y<=10;y++)for(let x=13;x<=17;x++)g[y][x]='bridge';
    for(let x=2;x<W()-2;x+=4){g[6][x]='reeds';g[11][Math.min(W()-2,x+1)]='reeds';}
    [[4,3],[8,5],[22,3],[26,5],[5,14],[9,12],[22,13],[26,15]].forEach(([x,y])=>g[y][x]='tree');
    [[11,5],[20,5],[10,13],[21,12]].forEach(([x,y])=>g[y][x]='rocks');
    g[0][15]='path';g[H()-1][15]='path';
    return g;
  };

  AO.MapBuilders.ambermeadow=function ambermeadow(){
    const g=this.border(this.grid('grass'),'tree');
    for(let y=0;y<H();y++)for(let x=14;x<=16;x++)g[y][x]='path';
    this.rect(g,2,2,10,5,'flower_patch');this.rect(g,18,2,10,5,'grass');
    this.rect(g,2,11,10,5,'grass');this.rect(g,18,11,10,5,'flower_patch');
    for(let x=2;x<=11;x++){g[8][x]='fence';g[9][x]='grass';}
    for(let x=18;x<=27;x++){g[8][x]='fence';g[9][x]='grass';}
    [[3,3],[10,5],[20,4],[27,3],[4,13],[10,14],[20,13],[27,15]].forEach(([x,y])=>g[y][x]='tree');
    [[7,9],[22,9],[11,7],[19,10]].forEach(([x,y])=>g[y][x]='shrub');
    g[0][15]='path';g[H()-1][15]='path';
    return g;
  };

  AO.MapBuilders.eastwatchApproach=function eastwatchApproach(){
    const g=this.border(this.grid('grass'),'rocks');
    for(let y=0;y<=9;y++)for(let x=14;x<=16;x++)g[y][x]='path';
    for(let x=15;x<W();x++)for(let y=8;y<=10;y++)g[y][x]='path';
    this.rect(g,3,3,8,5,'highland');this.rect(g,4,12,9,4,'grass');
    this.rect(g,19,2,8,4,'rock');this.rect(g,19,12,8,4,'grass');
    [[5,2],[9,6],[4,11],[11,14],[20,3],[25,5],[21,13],[26,14],[12,4],[18,6]].forEach(([x,y])=>g[y][x]='rocks');
    [[6,9],[10,10],[20,10],[24,8]].forEach(([x,y])=>g[y][x]='shrub');
    g[0][15]='path';g[9][W()-1]='path';
    return g;
  };

  AO.MAP_DEFS.southwood_trail={
    id:'southwood_trail',name:'Southwood Trail',theme:'wilds',builder:'southwoodTrail',start:{x:15,y:1},allowCamp:true,
    portals:[
      {id:'southwood_to_whisperwood',x:15,y:0,to:'wilds',toX:24,toY:16,label:'Whisperwood'},
      {id:'southwood_to_mosswater',x:15,y:17,to:'mosswater_crossing',toX:15,toY:1,label:'Mosswater Crossing'}
    ],npcs:[],
    objects:[
      {id:'southwood_marker',type:'sign',x:17,y:4,text:'SOUTHWOOD MILE IV • Haven lies north. Mosswater lies south.'},
      {id:'southwood_camp',type:'camp',x:11,y:12,blocking:true,text:'A sheltered travelers’ camp sits beneath three old lantern pines.'},
      {id:'southwood_lamp_1',type:'decor',kind:'lamp',x:13,y:5,blocking:false},
      {id:'southwood_lamp_2',type:'decor',kind:'lamp',x:17,y:11,blocking:false},
      {id:'southwood_herb_1',type:'resource',resource:'moon_herb',x:8,y:8},
      {id:'southwood_bloom_1',type:'resource',resource:'dusk_bloom',x:21,y:13}
    ],
    enemies:[{id:'southwood_bandit_1',type:'bandit',x:8,y:6},{id:'southwood_mire_1',type:'mireling',x:22,y:12}]
  };

  AO.MAP_DEFS.mosswater_crossing={
    id:'mosswater_crossing',name:'Mosswater Crossing',theme:'wilds',builder:'mosswaterCrossing',start:{x:15,y:1},allowCamp:true,
    portals:[
      {id:'mosswater_to_southwood',x:15,y:0,to:'southwood_trail',toX:15,toY:16,label:'Southwood Trail'},
      {id:'mosswater_to_ambermeadow',x:15,y:17,to:'ambermeadow',toX:15,toY:1,label:'Ambermeadow'}
    ],npcs:[],
    objects:[
      {id:'mosswater_bridge_sign',type:'sign',x:18,y:6,text:'MOSSWATER BRIDGE • Built in the reign of the Third Lantern Queen.'},
      {id:'mosswater_camp',type:'camp',x:8,y:13,blocking:true,text:'A raised camp platform stands above the wet bank.'},
      {id:'mosswater_cart',type:'decor',kind:'cart',x:20,y:5,blocking:true,text:'A wheel-deep merchant cart waits for the water to fall.'},
      {id:'mosswater_herb_1',type:'resource',resource:'moon_herb',x:6,y:5},
      {id:'mosswater_bloom_1',type:'resource',resource:'dusk_bloom',x:24,y:13}
    ],
    enemies:[{id:'mosswater_mire_1',type:'mireling',x:7,y:6},{id:'mosswater_mire_2',type:'mireling',x:24,y:12}]
  };

  AO.MAP_DEFS.ambermeadow={
    id:'ambermeadow',name:'Ambermeadow',theme:'wilds',builder:'ambermeadow',start:{x:15,y:1},allowCamp:true,
    portals:[
      {id:'ambermeadow_to_mosswater',x:15,y:0,to:'mosswater_crossing',toX:15,toY:16,label:'Mosswater Crossing'},
      {id:'ambermeadow_to_eastwatch',x:15,y:17,to:'eastwatch_approach',toX:15,toY:1,label:'Eastwatch Approach'}
    ],npcs:[],
    objects:[
      {id:'ambermeadow_sign',type:'sign',x:17,y:5,text:'AMBERMEADOW • Aurelia’s western grain road. Keep to the marked path after dusk.'},
      {id:'ambermeadow_camp',type:'camp',x:10,y:9,blocking:true,text:'A stone fire ring overlooks the fields.'},
      {id:'ambermeadow_cart',type:'decor',kind:'cart',x:21,y:9,blocking:true},
      {id:'ambermeadow_lamp_1',type:'decor',kind:'lamp',x:13,y:7,blocking:false},
      {id:'ambermeadow_lamp_2',type:'decor',kind:'lamp',x:17,y:13,blocking:false},
      {id:'ambermeadow_herb_1',type:'resource',resource:'moon_herb',x:5,y:10}
    ],
    enemies:[{id:'amber_bandit_1',type:'bandit',x:8,y:5},{id:'amber_bandit_2',type:'bandit',x:23,y:13}]
  };

  AO.MAP_DEFS.eastwatch_approach={
    id:'eastwatch_approach',name:'Eastwatch Approach',theme:'wilds',builder:'eastwatchApproach',start:{x:15,y:1},allowCamp:true,
    portals:[
      {id:'eastwatch_to_ambermeadow',x:15,y:0,to:'ambermeadow',toX:15,toY:16,label:'Ambermeadow'},
      {id:'eastwatch_to_lantern_road',x:29,y:9,to:'lantern_road',toX:1,toY:9,label:'Lantern Road'}
    ],npcs:[],
    objects:[
      {id:'eastwatch_ruin',type:'decor',kind:'statue',x:9,y:6,blocking:true,text:'The broken Eastwatch guardian faces Aurelia with an empty lantern raised.'},
      {id:'eastwatch_sign',type:'sign',x:18,y:7,text:'AURELIA: ONE LAST MARCH EAST • Travelers must enter through the Golden Gate.'},
      {id:'eastwatch_camp',type:'camp',x:8,y:13,blocking:true,text:'An old patrol camp looks down over the eastern road.'},
      {id:'eastwatch_cache',type:'chest',x:24,y:14,loot:['travel_ration','healing_draught'],gold:26}
    ],
    enemies:[{id:'eastwatch_bandit_1',type:'bandit',x:7,y:10},{id:'eastwatch_bandit_2',type:'bandit',x:22,y:6}]
  };

  Object.assign(AO.ATLAS_LOCATIONS,{
    southwood_trail:{id:'southwood_trail',regionId:REGION_ID,name:'Southwood Trail',type:'wilderness',x:39,y:53,mapId:'southwood_trail',entry:{x:15,y:1},fastTravel:true,initialKnown:false,summary:'A lantern-marked forest road descending from Whisperwood toward the Mosswater.' ,maps:['southwood_trail']},
    mosswater_crossing:{id:'mosswater_crossing',regionId:REGION_ID,name:'Mosswater Crossing',type:'road',x:44,y:58,mapId:'mosswater_crossing',entry:{x:15,y:1},fastTravel:true,initialKnown:false,summary:'A broad river crossing where the old bridge carries the eastern road over black water.',maps:['mosswater_crossing']},
    ambermeadow:{id:'ambermeadow',regionId:REGION_ID,name:'Ambermeadow',type:'wilderness',x:50,y:63,mapId:'ambermeadow',entry:{x:15,y:1},fastTravel:true,initialKnown:false,summary:'Open fields and abandoned farm roads lying between Mosswater and the city marches.',maps:['ambermeadow']},
    eastwatch_approach:{id:'eastwatch_approach',regionId:REGION_ID,name:'Eastwatch Approach',type:'road',x:58,y:64,mapId:'eastwatch_approach',entry:{x:15,y:1},fastTravel:true,initialKnown:false,summary:'Rocky patrol country beneath the ruined western watch of Aurelia.',maps:['eastwatch_approach']}
  });
  AO.ATLAS_LOCATIONS.lantern_road.x=67;AO.ATLAS_LOCATIONS.lantern_road.y=62;

  AO.ATLAS_ROUTES = AO.ATLAS_ROUTES.filter(route=>!['whisperwood_lanternroad','lanternroad_aurelia'].includes(route.id));
  [
    {id:'whisperwood_southwood',from:'whisperwood',to:'southwood_trail',hours:4,danger:'Moderate',label:'Southwood Track'},
    {id:'southwood_mosswater',from:'southwood_trail',to:'mosswater_crossing',hours:5,danger:'Moderate',label:'Lantern Pine Road'},
    {id:'mosswater_ambermeadow',from:'mosswater_crossing',to:'ambermeadow',hours:5,danger:'Moderate',label:'Mosswater Causeway'},
    {id:'ambermeadow_eastwatch',from:'ambermeadow',to:'eastwatch_approach',hours:4,danger:'Low',label:'Amber Road'},
    {id:'eastwatch_lanternroad',from:'eastwatch_approach',to:'lantern_road',hours:3,danger:'Moderate',label:'Eastwatch Descent'},
    {id:'lanternroad_aurelia',from:'lantern_road',to:'aurelia',hours:3,danger:'Low',label:'Aurelian Causeway'}
  ].forEach(route=>upsert(AO.ATLAS_ROUTES,route));

  for(const location of Object.values(AO.ATLAS_LOCATIONS))for(const mapId of location.maps||[location.mapId])AO.ATLAS_MAP_INDEX[mapId]=location.id;

  AO.MAP_LANDMARKS ||= {};
  AO.MAP_LANDMARKS.wilds ||= [];
  const oldSouth=AO.MAP_LANDMARKS.wilds.find(item=>item.id==='landmark_lantern_road');
  if(oldSouth)Object.assign(oldSouth,{id:'landmark_southwood',label:'Southwood Trail'});
  else AO.MAP_LANDMARKS.wilds.push({id:'landmark_southwood',x:24,y:16,label:'Southwood Trail',kind:'exit'});
  AO.MAP_LANDMARKS.southwood_trail=[{x:15,y:1,label:'Whisperwood',kind:'exit'},{x:11,y:12,label:'Travelers’ Camp',kind:'hearth'},{x:15,y:16,label:'Mosswater Crossing',kind:'exit'}];
  AO.MAP_LANDMARKS.mosswater_crossing=[{x:15,y:1,label:'Southwood Trail',kind:'exit'},{x:15,y:9,label:'Mosswater Bridge',kind:'bridge'},{x:15,y:16,label:'Ambermeadow',kind:'exit'}];
  AO.MAP_LANDMARKS.ambermeadow=[{x:15,y:1,label:'Mosswater Crossing',kind:'exit'},{x:10,y:9,label:'Meadow Camp',kind:'hearth'},{x:15,y:16,label:'Eastwatch Approach',kind:'exit'}];
  AO.MAP_LANDMARKS.eastwatch_approach=[{x:15,y:1,label:'Ambermeadow',kind:'exit'},{x:9,y:6,label:'Eastwatch Ruin',kind:'ruin'},{x:28,y:9,label:'Lantern Road',kind:'exit'}];
})();
