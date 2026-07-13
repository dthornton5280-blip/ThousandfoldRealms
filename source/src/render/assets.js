/* Thousandfold Realms v1.2: in-game pixel-art atlas loader. */
AO.AssetCatalog = {
  tileSize: 32,
  atlasColumns: 8,
  worldAtlasSrc: 'assets/tiles/world_atlas.png',
  objectAtlasSrc: 'assets/tiles/object_atlas.png',
  buildingAtlasSrc: 'assets/tiles/building_atlas.png',
  tiles: {
    grass_a:0, grass_b:1, path_a:2, path_edge:3, cobble_a:4, cobble_b:5,
    water_0:6, water_1:7, water_2:8, water_3:9, bridge:10, tree:11,
    cliff_top:12, cliff_face:13, cliff_left:14, cliff_right:15, stairs:16,
    waterfall_0:17, waterfall_1:18, waterfall_2:19, waterfall_3:20,
    roof_blue:21, stonewall:22, woodwall:23, woodfloor:24, cavefloor:25,
    cryptfloor:26, sand:27, reeds:28, flower_patch:29, rocks:30, moss_stone:31,
    shallow_water:32, dock:33, dirt:34, magicfloor:35, chapelfloor:36,
    forgefloor:37, cellarfloor:38, stage:39, rug:40, bar:41, altar:42,
    rune:43, tree_autumn:44, tree_dead:45, cliff_moss:46, stone_path:47,
    roof_red:48, brickwall:49, waterfall_pool:50, fence:51, shrub:52,
    lilywater:53, snow:54, snow_cliff:55
  },
  buildings:{inn:0,arcane:1,tavern:2,provisions:3,chapel:4,forge:5},
  objects: {
    chest:0, sign:1, portal:2, door_closed:3, door_open:4, camp:5, fountain:6,
    stall:7, bench:8, lamp:9, flowers:10, counter:11, table:12, fireplace:13,
    bed:14, stage:15, keg:16, crates:17, shelf:18, anvil:19, weaponrack:20,
    crystal:21, altar:22, cart:23, minecart:24, statue:25, sarcophagus:26,
    shrub_big:27, tree_big:28, rocks_big:29, bridge_post:30, camp_tent:31
  }
};
AO.Assets = {
  images:{}, ready:false, failed:false, loaded:0,
  init(){
    if(this.loading||this.ready)return; this.loading=true;this.loaded=0;
    const load=(key,src)=>{const image=new Image();image.decoding='async';image.onload=()=>{this.images[key]=image;this.loaded++;if(this.loaded===3){this.ready=true;this.loading=false;AO.events.emit('assetsReady');AO.events.emit('worldChanged');}};image.onerror=()=>{this.failed=true;this.loading=false;console.warn(`Thousandfold Realms ${key} atlas failed to load; procedural fallback active.`);};image.src=src;};
    load('world',AO.AssetCatalog.worldAtlasSrc);load('objects',AO.AssetCatalog.objectAtlasSrc);load('buildings',AO.AssetCatalog.buildingAtlasSrc);
  },
  tileName(tile,x=0,y=0,theme=''){
    const frame=Math.floor(performance.now()/180)%4;
    if(tile==='grass')return ((x*13+y*7)%3===0)?'grass_b':'grass_a';
    if(tile==='path')return ((x+y)%4===0)?'path_edge':'path_a';
    if(tile==='cobble')return ((x*3+y)%2)?'cobble_a':'cobble_b';
    if(tile==='water')return `water_${frame}`;
    if(tile==='waterfall')return `waterfall_${frame}`;
    if(tile==='roof')return theme==='haven'&&((x<10)||(x>=20&&y>=11))?'roof_red':'roof_blue';
    if(tile==='stonefloor')return 'stone_path';
    return tile;
  },
  drawTile(ctx,tile,x,y,theme=''){
    if(!this.ready||!this.images.world)return false;
    const name=this.tileName(tile,x,y,theme),idx=AO.AssetCatalog.tiles[name];if(idx==null)return false;
    const s=AO.AssetCatalog.tileSize,draw=(tileName)=>{const n=AO.AssetCatalog.tiles[tileName],sx=(n%AO.AssetCatalog.atlasColumns)*s,sy=Math.floor(n/AO.AssetCatalog.atlasColumns)*s;ctx.drawImage(this.images.world,sx,sy,s,s,x*s,y*s,s,s);};
    if(['shrub','fence'].includes(name))draw(((x+y)%3===0)?'grass_b':'grass_a');draw(name);return true;
  },
  iconName(type,entity={}){
    if(type==='door')return entity.open?'door_open':'door_closed';
    if(type==='decor'){
      const m={pew:'bench',brazier:'lamp',herbs:'flowers',bar:'counter',forge:'fireplace',orb:'crystal'};
      return m[entity.kind]||entity.kind;
    }
    return type;
  },
  drawIcon(ctx,x,y,type,entity={}){
    if(!this.ready||!this.images.objects)return false;
    const name=this.iconName(type,entity),idx=AO.AssetCatalog.objects[name];if(idx==null)return false;
    const cell=48,sx=(idx%8)*cell,sy=Math.floor(idx/8)*cell;
    const compact=['door_closed','door_open','portal'].includes(name),dx=compact?x:x-8,dy=compact?y-12:y-16,dw=compact?32:48,dh=compact?48:48;
    ctx.drawImage(this.images.objects,sx,sy,cell,cell,dx,dy,dw,dh);
    if(type==='camp'){const tent=AO.AssetCatalog.objects.camp_tent,tx=(tent%8)*cell,ty=Math.floor(tent/8)*cell;ctx.drawImage(this.images.objects,tx,ty,cell,cell,x-26,y-20,48,48);}
    return true;
  },

  drawBuilding(ctx,building){
    if(!this.ready||!this.images.buildings||!building)return false;
    const idx=AO.AssetCatalog.buildings[building.style];if(idx==null)return false;
    const cw=256,ch=160,cols=3,sx=(idx%cols)*cw,sy=Math.floor(idx/cols)*ch;
    const dx=building.x*32,dy=building.y*32,dw=(building.w||8)*32,dh=(building.h||5)*32;
    ctx.drawImage(this.images.buildings,sx,sy,cw,ch,dx,dy,dw,dh);
    return true;
  },
  drawObjectByName(ctx,name,x,y,size=48){
    if(!this.ready||!this.images.objects)return false;const idx=AO.AssetCatalog.objects[name];if(idx==null)return false;const cell=48,sx=(idx%8)*cell,sy=Math.floor(idx/8)*cell;ctx.drawImage(this.images.objects,sx,sy,cell,cell,x,y,size,size);return true;
  }
};
AO.Assets.init();

/* Thousandfold Realms v1.5.9-dev — Pixel Crawler tavern pilot.
   Contains only a derived runtime subset from Pixel Crawler - Free Pack by Anokolisa. */
AO.PixelCrawlerArt = {
  ready:false,failed:false,image:null,
  source:'data:image/png;base64,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[TRUNCATED_FOR_BREVITY]i8DAr+f6FSEufoAAAAASUVORK5CYII=',
  frames:{
    floorA:[0,0,32,32],floorB:[32,0,32,32],stone:[64,0,32,32],rug:[96,0,32,32],stageTile:[128,0,32,32],
    counter:[0,40,64,30],table:[72,32,32,48],keg:[112,36,28,38],fireplace:[152,32,48,72],stage:[208,40,44,21],
    shelf:[264,40,30,32],door:[312,24,22,71],chest:[352,32,24,45],window:[392,40,24,25],board:[432,48,30,12]
  },
  npcRows:{bran:[0,128],lys:[256,128]},
  init(){
    if(this.image||typeof Image==='undefined')return;
    const image=new Image();image.decoding='async';
    image.onload=()=>{this.image=image;this.ready=true;AO.events?.emit?.('worldChanged');};
    image.onerror=()=>{this.failed=true;console.warn('Pixel Crawler tavern runtime failed to load; procedural fallback active.');};
    image.src=this.source;this.image=image;
  },
  drawFrame(ctx,name,dx,dy,dw=null,dh=null){
    if(!this.ready||!this.image)return false;const frame=this.frames[name];if(!frame)return false;
    const [sx,sy,sw,sh]=frame;ctx.drawImage(this.image,sx,sy,sw,sh,Math.round(dx),Math.round(dy),Math.round(dw??sw),Math.round(dh??sh));return true;
  },
  drawTile(ctx,tile,x,y,theme){
    if(theme!=='tavern'||!this.ready)return false;
    const map={woodfloor:((x*7+y*11)%4===0?'floorB':'floorA'),stonewall:'stone',bar:'floorB',stage:'stageTile',rug:'rug'};
    const name=map[tile];if(!name)return false;return this.drawFrame(ctx,name,x*32,y*32,32,32);
  },
  drawNpc(ctx,entity,time){
    const row=this.npcRows[entity.id];if(!row||!this.ready)return false;
    const frame=Math.floor(time/260+entity.x+entity.y)%4;
    const sx=row[0]+frame*64,sy=row[1],dx=entity.x*32-16,dy=entity.y*32-32;
    ctx.drawImage(this.image,sx,sy,64,64,dx,dy,64,64);return true;
  },
  drawEntity(ctx,entity,mapId,time=0){
    if(mapId!=='tavern'||!this.ready||!entity)return false;
    if(entity.type==='npc')return this.drawNpc(ctx,entity,time);
    const x=entity.x*32,y=entity.y*32;
    if(entity.type==='door')return this.drawFrame(ctx,'door',x,y-32,32,64);
    if(entity.type==='chest')return this.drawFrame(ctx,'chest',x,y-20,32,52);
    if(entity.type==='sign')return this.drawFrame(ctx,'board',x-8,y+3,48,19);
    if(entity.type!=='decor')return false;
    const kinds={
      counter:['counter',-24,-8,80,38],table:['table',-8,-28,48,72],keg:['keg',0,-12,32,44],
      fireplace:['fireplace',-12,-52,56,84],stage:['stage',-16,4,64,31],shelf:['shelf',1,-8,30,32]
    };
    const spec=kinds[entity.kind];if(!spec)return false;
    const [name,ox,oy,w,h]=spec;return this.drawFrame(ctx,name,x+ox,y+oy,w,h);
  }
};
AO.PixelCrawlerArt.init();
