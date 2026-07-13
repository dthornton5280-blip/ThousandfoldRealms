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
  source:'data:image/png;base64,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',
  frames:{
    floorA:[0,0,32,32],floorB:[32,0,32,32],stone:[64,0,32,32],rug:[96,0,32,32],stageTile:[128,0,32,32],
    counter:[0,40,64,30],table:[72,32,32,48],keg:[112,36,28,38],fireplace:[152,32,48,72],stage:[208,40,44,21],
    bran:[0,128,64,64],lys:[64,128,64,64]
  },
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
  drawEntity(ctx,entity,mapId,time=0){
    if(mapId!=='tavern'||!this.ready||!entity)return false;
    const x=entity.x*32,y=entity.y*32;
    if(entity.type==='npc'&&(entity.id==='bran'||entity.id==='lys')){
      const bob=Math.floor(time/450)%2;return this.drawFrame(ctx,entity.id,x-16,y-32-bob,64,64);
    }
    if(entity.type!=='decor')return false;
    const kinds={
      counter:['counter',-24,-8,80,38],table:['table',-8,-28,48,72],keg:['keg',0,-12,32,44],
      fireplace:['fireplace',-12,-52,56,84],stage:['stage',-16,4,64,31]
    };
    const spec=kinds[entity.kind];if(!spec)return false;
    const [name,ox,oy,w,h]=spec;return this.drawFrame(ctx,name,x+ox,y+oy,w,h);
  }
};
AO.PixelCrawlerArt.init();
