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
