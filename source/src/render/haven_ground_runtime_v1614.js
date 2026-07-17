/* Thousandfold Realms v1.6.14-dev — approved handcrafted Haven terrain.
   This layer is deliberately restricted to map.id === "haven". It uses only
   deterministic crops/rotations from the approved source sheet and delegates
   every unsupported draw to the v1.6.13/general fallback chain. */
(() => {
  'use strict';
  if(typeof window==='undefined'||!window.AO||!AO.ThousandfoldArt)return;

  const TILE=32;
  const ATLAS_URL='assets/thousandfold/tiles/haven-ground-handcrafted-v1614.png?v=1614';
  const ATLAS_SIZE={w:512,h:384};
  const tile=index=>({x:(index%16)*TILE,y:Math.floor(index/16)*TILE,w:TILE,h:TILE,index});
  const SPRITES={};
  const BASE_FAMILIES=[
    'haven_grass_clean_01','haven_grass_flowers_01','haven_grass_dense_01','haven_grass_rocks_01',
    'haven_grass_worn_01','haven_grass_dense_02','haven_grass_worn_02','haven_grass_flowers_02',
    'haven_grass_rocks_02','haven_grass_clean_02','haven_path_dirt_01','haven_path_dirt_rocks_01',
    'haven_path_dirt_rocks_02','haven_path_dirt_02','haven_path_dirt_worn_01','haven_cobble_01',
    'haven_cobble_moss_01','haven_cobble_cracked_01'
  ];
  const TRANSITIONS=[
    'haven_edge_grass_path_e','haven_edge_grass_path_s','haven_edge_grass_path_w','haven_edge_grass_path_n',
    'haven_corner_grass_path_se','haven_corner_grass_path_sw','haven_corner_grass_path_nw','haven_corner_grass_path_ne',
    'haven_edge_grass_cobble_e','haven_edge_grass_cobble_s','haven_edge_grass_cobble_w','haven_edge_grass_cobble_n',
    'haven_corner_grass_cobble_se','haven_corner_grass_cobble_sw','haven_corner_grass_cobble_nw','haven_corner_grass_cobble_ne',
    'haven_corner_path_cobble_se','haven_corner_path_cobble_sw','haven_corner_path_cobble_nw','haven_corner_path_cobble_ne',
    'haven_junction_grass_path_cobble_se','haven_junction_grass_path_cobble_sw',
    'haven_junction_grass_path_cobble_nw','haven_junction_grass_path_cobble_ne'
  ];
  const ASSET_IDS=[];
  for(const family of BASE_FAMILIES)for(let py=0;py<3;py++)for(let px=0;px<3;px++)ASSET_IDS.push(`${family}_p${py}${px}`);
  ASSET_IDS.push(...TRANSITIONS);
  ASSET_IDS.forEach((id,index)=>{SPRITES[id]=tile(index);});

  const DIRS=[['n',0,-1],['e',1,0],['s',0,1],['w',-1,0]];
  const hash=(mapId,x,y,salt=0)=>{
    let seed=2166136261;
    for(const char of mapId)seed=Math.imul(seed^char.charCodeAt(0),16777619);
    return (seed^Math.imul(x+37,73856093)^Math.imul(y+53,19349663)^Math.imul(salt+11,83492791))>>>0;
  };
  const classify=name=>name==='grass'||name==='path'||name==='cobble'?name:null;
  const cornerFor=dirs=>{
    const set=new Set(dirs);
    if(set.has('s')&&set.has('e'))return 'se';
    if(set.has('s')&&set.has('w'))return 'sw';
    if(set.has('n')&&set.has('w'))return 'nw';
    if(set.has('n')&&set.has('e'))return 'ne';
    return null;
  };
  const neighborTypes=(grid,x,y)=>DIRS.map(([dir,dx,dy])=>({dir,type:classify(grid?.[y+dy]?.[x+dx])}));

  function transitionId(tileName,x,y,grid){
    const neighbors=neighborTypes(grid,x,y);
    if(tileName==='grass'){
      const pathDirs=neighbors.filter(n=>n.type==='path').map(n=>n.dir);
      const cobbleDirs=neighbors.filter(n=>n.type==='cobble').map(n=>n.dir);
      if(pathDirs.length&&cobbleDirs.length){
        const corner=cornerFor([pathDirs[0],cobbleDirs[0]]);
        if(corner)return `haven_junction_grass_path_cobble_${corner}`;
      }
      for(const [material,dirs] of [['cobble',cobbleDirs],['path',pathDirs]]){
        if(dirs.length===1)return `haven_edge_grass_${material}_${dirs[0]}`;
        const corner=cornerFor(dirs);
        if(corner)return `haven_corner_grass_${material}_${corner}`;
      }
    }
    if(tileName==='path'){
      const cobbleDirs=neighbors.filter(n=>n.type==='cobble').map(n=>n.dir);
      const corner=cornerFor(cobbleDirs);
      if(corner)return `haven_corner_path_cobble_${corner}`;
    }
    return null;
  }

  function baseFamily(tileName,x,y,mapId='haven'){
    const h=hash(mapId,Math.floor(x/3),Math.floor(y/3));
    if(tileName==='grass'){
      const roll=h%100;
      if(roll<34)return 'haven_grass_clean_01';
      if(roll<60)return 'haven_grass_clean_02';
      if(roll<75)return h&1?'haven_grass_dense_01':'haven_grass_dense_02';
      if(roll<84)return h&1?'haven_grass_flowers_01':'haven_grass_flowers_02';
      if(roll<93)return h&1?'haven_grass_rocks_01':'haven_grass_rocks_02';
      return h&1?'haven_grass_worn_01':'haven_grass_worn_02';
    }
    if(tileName==='path'){
      const roll=h%100;
      if(roll<42)return 'haven_path_dirt_01';
      if(roll<72)return 'haven_path_dirt_02';
      if(roll<84)return 'haven_path_dirt_rocks_01';
      if(roll<94)return 'haven_path_dirt_rocks_02';
      return 'haven_path_dirt_worn_01';
    }
    if(tileName==='cobble'){
      const roll=h%100;
      if(roll<72)return 'haven_cobble_01';
      if(roll<91)return 'haven_cobble_moss_01';
      return 'haven_cobble_cracked_01';
    }
    return null;
  }
  function baseId(tileName,x,y,mapId='haven'){
    const family=baseFamily(tileName,x,y,mapId);
    return family?`${family}_p${((y%3)+3)%3}${((x%3)+3)%3}`:null;
  }

  const Art={
    image:null,ready:false,loading:false,failed:false,lastError:null,
    init(){
      if(this.ready||this.loading)return;
      this.loading=true;document.documentElement.dataset.tfrHavenGround='loading';
      const image=new Image();image.decoding='async';
      image.onload=()=>{
        if(image.naturalWidth!==ATLAS_SIZE.w||image.naturalHeight!==ATLAS_SIZE.h){
          this.fail(new Error(`Haven terrain atlas size ${image.naturalWidth}x${image.naturalHeight}`));return;
        }
        this.image=image;this.ready=true;this.loading=false;this.failed=false;this.lastError=null;
        document.documentElement.dataset.tfrHavenGround='ready';
        AO.events?.emit?.('assetsReady');AO.events?.emit?.('worldChanged');
      };
      image.onerror=()=>this.fail(new Error('Haven terrain atlas PNG failed to load'));
      image.src=new URL(ATLAS_URL,document.baseURI).href;
    },
    fail(error){
      this.failed=true;this.loading=false;this.lastError=String(error?.message||error||'unknown error');
      document.documentElement.dataset.tfrHavenGround='failed';
      console.error('Approved Haven terrain failed to load; v1.6.13/procedural ground fallback remains active.',error||'');
    },
    selectTile(tileName,x,y,world=window.game?.world){
      if(world?.map?.id!=='haven'||!classify(tileName))return null;
      return transitionId(tileName,x,y,world.grid)||baseId(tileName,x,y,world.map.id);
    },
    drawTile(ctx,tileName,x,y,theme){
      const world=window.game?.world;
      if(theme!=='haven'||world?.map?.id!=='haven')return false;
      const id=this.selectTile(tileName,x,y,world),sprite=SPRITES[id];
      if(!ctx||!sprite||!this.ready||!this.image)return false;
      ctx.save();ctx.imageSmoothingEnabled=false;
      ctx.drawImage(this.image,sprite.x,sprite.y,TILE,TILE,x*TILE,y*TILE,TILE,TILE);
      ctx.restore();return true;
    }
  };

  const prior=AO.ThousandfoldArt.drawTile.bind(AO.ThousandfoldArt);
  if(!AO.ThousandfoldArt.drawTile.tfrHavenGroundV1614){
    const wrapped=function(ctx,tileName,x,y,theme){
      if(Art.drawTile(ctx,tileName,x,y,theme))return true;
      return prior(ctx,tileName,x,y,theme);
    };
    wrapped.tfrHavenGroundV1614=true;AO.ThousandfoldArt.drawTile=wrapped;
  }

  AO.HavenGroundArtV1614=Art;
  AO.HavenGroundContentV1614={
    installed:true,version:'1.6.14-dev',atlas:ATLAS_URL,tileSize:TILE,
    scope:'haven exterior only',assetIds:Object.keys(SPRITES),preservedFallback:true
  };
  Art.init();
})();
