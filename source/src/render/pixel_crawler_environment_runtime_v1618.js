/* Thousandfold Realms v1.6.18 — compact Pixel Crawler environment conversion. */
(() => {
  'use strict';
  if(typeof window==='undefined'||!window.AO||!AO.ThousandfoldArt)return;

  const TILE=32;
  const TERRAIN_URL='assets/third-party/pixel-crawler/tfr-environment-terrain-v1618.png?v=1618';
  const PROPS_URL='assets/third-party/pixel-crawler/tfr-environment-props-v1618.png?v=1618';
  const TERRAIN_SIZE={w:512,h:544},PROPS_SIZE={w:512,h:122};
  const topology={0:'isolated',1:'end_n',2:'end_e',3:'corner_ne',4:'end_s',5:'straight_ns',6:'corner_se',7:'tee_nes',8:'end_w',9:'corner_nw',10:'straight_ew',11:'tee_new',12:'corner_sw',13:'tee_nsw',14:'tee_esw',15:'open'};
  const families=['water','shallow_water','lilywater','reeds'];
  const connectedWater=new Set(['water','shallow_water','lilywater','reeds','waterfall_pool','waterfall','bridge']);
  const propTiles=new Set(['tree','shrub','flower_patch','rocks','moss_stone']);
  const props={
    pc_shrub_round_green:{x:4,y:4,w:38,h:43},pc_shrub_round_olive:{x:46,y:4,w:38,h:43},
    pc_shrub_low_green:{x:88,y:4,w:42,h:48},pc_shrub_low_olive:{x:134,y:4,w:42,h:48},
    pc_flower_wild_a:{x:180,y:4,w:26,h:41},pc_flower_wild_b:{x:210,y:4,w:24,h:41},
    pc_marsh_plants:{x:238,y:4,w:48,h:45},pc_dead_tree:{x:290,y:4,w:54,h:47},
    pc_rock_cluster_gray:{x:348,y:4,w:46,h:43},pc_rocks_gray_small:{x:398,y:4,w:48,h:44},
    pc_tree_green:{x:4,y:56,w:59,h:62},pc_tree_olive:{x:67,y:56,w:59,h:62},pc_tree_autumn:{x:130,y:56,w:59,h:62},
    pc_fire_ring:{x:193,y:56,w:28,h:27},pc_fire_ring_stone:{x:225,y:56,w:29,h:28}
  };
  const hash=(x,y,salt=0)=>{let v=(Math.imul(x,374761393)+Math.imul(y,668265263)+Math.imul(salt,1442695041))|0;v=Math.imul(v^(v>>>13),1274126177);return (v^(v>>>16))>>>0;};
  const phase=(x,y)=>hash(x,y)%4;
  const familyFor=tile=>tile==='waterfall_pool'?'water':families.includes(tile)?tile:null;
  const terrainSprite=(family,bits,p)=>{
    const familyIndex=families.indexOf(family),index=familyIndex*64+bits*4+p;
    return{x:(index%16)*TILE,y:Math.floor(index/16)*TILE,w:TILE,h:TILE};
  };
  const waterfallSprite=(x,y)=>{const index=256+phase(x,y);return{x:(index%16)*32,y:Math.floor(index/16)*32,w:32,h:32};};
  const selectWater=(world,tile,x,y)=>{
    if(world?.map?.theme!=='wilds')return null;
    const family=familyFor(tile);if(!family)return null;
    const grid=world.grid||[],same=(nx,ny)=>connectedWater.has(grid[ny]?.[nx]);
    const bits=(same(x,y-1)?1:0)|(same(x+1,y)?2:0)|(same(x,y+1)?4:0)|(same(x-1,y)?8:0);
    return{family,bits,phase:phase(x,y),id:`pc_${family}_${topology[bits]}_p${phase(x,y)}`};
  };

  const Art={
    terrain:null,props:null,terrainReady:false,propsReady:false,ready:false,failed:false,loading:false,lastError:null,
    init(){
      if(this.ready||this.loading)return;this.loading=true;document.documentElement.dataset.tfrPixelCrawlerEnvironment='loading';
      const load=(src,size,key)=>new Promise((resolve,reject)=>{const image=new Image();image.decoding='async';image.onload=()=>{if(image.naturalWidth!==size.w||image.naturalHeight!==size.h){reject(new Error(`${key} atlas size ${image.naturalWidth}x${image.naturalHeight}`));return;}this[key]=image;this[`${key}Ready`]=true;resolve();};image.onerror=()=>reject(new Error(`${key} atlas failed to load`));image.src=new URL(src,document.baseURI).href;});
      Promise.all([load(TERRAIN_URL,TERRAIN_SIZE,'terrain'),load(PROPS_URL,PROPS_SIZE,'props')]).then(()=>{this.ready=true;this.loading=false;document.documentElement.dataset.tfrPixelCrawlerEnvironment='ready';AO.events?.emit?.('assetsReady');AO.events?.emit?.('worldChanged');}).catch(error=>this.fail(error));
    },
    fail(error){this.failed=true;this.loading=false;this.lastError=String(error?.message||error);document.documentElement.dataset.tfrPixelCrawlerEnvironment='failed';console.error('Pixel Crawler environment conversion failed; established project art remains active.',error||'');},
    selectWater(tile,x,y,world=window.game?.world){return selectWater(world,tile,x,y);},
    drawAtlas(ctx,image,sprite,dx,dy,dw=sprite.w,dh=sprite.h){if(!ctx||!image||!sprite)return false;ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(image,sprite.x,sprite.y,sprite.w,sprite.h,Math.round(dx),Math.round(dy),Math.round(dw),Math.round(dh));ctx.restore();return true;},
    drawWater(ctx,tile,x,y){if(!this.terrainReady)return false;if(tile==='waterfall'&&window.game?.world?.map?.theme==='wilds')return this.drawAtlas(ctx,this.terrain,waterfallSprite(x,y),x*TILE,y*TILE,TILE,TILE);const selected=selectWater(window.game?.world,tile,x,y);if(!selected)return false;return this.drawAtlas(ctx,this.terrain,terrainSprite(selected.family,selected.bits,selected.phase),x*TILE,y*TILE,TILE,TILE);},
    propFor(tile,mapId,x,y){
      const h=hash(x,y,mapId?.length||0);
      if(tile==='tree'){
        if(mapId==='ambermeadow')return h%3===0?'pc_tree_autumn':'pc_tree_olive';
        if(mapId==='sunken_fen'&&h%4===0)return'pc_dead_tree';
        return h%3===0?'pc_tree_olive':'pc_tree_green';
      }
      if(tile==='shrub')return h%4===0?'pc_shrub_low_olive':h%2?'pc_shrub_round_green':'pc_shrub_low_green';
      if(tile==='flower_patch')return h%2?'pc_flower_wild_a':'pc_flower_wild_b';
      if(tile==='rocks'||tile==='moss_stone')return h%2?'pc_rock_cluster_gray':'pc_rocks_gray_small';
      return null;
    },
    drawProp(ctx,id,tileX,tileY,scale=1){const sprite=props[id];if(!this.propsReady||!sprite)return false;const w=sprite.w*scale,h=sprite.h*scale,dx=tileX*TILE+TILE/2-w/2,dy=tileY*TILE+TILE-h;return this.drawAtlas(ctx,this.props,sprite,dx,dy,w,h);},
    drawEntity(ctx,entity,mapId){
      if(!this.propsReady||!entity)return false;
      const isCamp=entity.type==='camp';
      const isBrazier=entity.kind==='brazier'&&['crypt','emberwatch_ruins'].includes(mapId);
      if(!isCamp&&!isBrazier)return false;
      const id=isBrazier?'pc_fire_ring_stone':'pc_fire_ring';
      const sprite=props[id],scale=isCamp?1.18:1;
      return this.drawAtlas(ctx,this.props,sprite,entity.x*TILE+TILE/2-sprite.w*scale/2,entity.y*TILE+TILE-sprite.h*scale,sprite.w*scale,sprite.h*scale);
    }
  };

  const priorTile=AO.ThousandfoldArt.drawTile.bind(AO.ThousandfoldArt);
  AO.ThousandfoldArt.drawTile=function(ctx,tile,x,y,theme){
    if(theme==='wilds'){
      if(Art.drawWater(ctx,tile,x,y))return true;
      if(propTiles.has(tile))return priorTile(ctx,'grass',x,y,theme);
    }
    return priorTile(ctx,tile,x,y,theme);
  };

  const priorEntity=AO.ThousandfoldArt.drawEntity.bind(AO.ThousandfoldArt);
  AO.ThousandfoldArt.drawEntity=function(ctx,entity,mapId,time){if(Art.drawEntity(ctx,entity,mapId))return true;return priorEntity(ctx,entity,mapId,time);};

  /* Tile props must render after every ground cell, otherwise a wide tree is
     sliced off by the next tile in the row.  The renderer already exposes an
     under-entity terrain pass, so this changes only paint order, not collision. */
  const rendererProto=AO.Renderer?.prototype;
  if(rendererProto&&!rendererProto.tfrPixelCrawlerEnvironmentV1618){
    const priorEffects=rendererProto.renderTerrainEffects;
    rendererProto.renderTerrainEffects=function(ctx,stage){
      if(typeof priorEffects==='function')priorEffects.call(this,ctx,stage);
      if(stage!=='under'||!Art.propsReady||this.game?.world?.map?.theme!=='wilds')return;
      const world=this.game.world,mapId=world.map.id,grid=world.grid||[];
      for(let y=0;y<grid.length;y++)for(let x=0;x<(grid[y]?.length||0);x++){
        const tile=grid[y][x];if(!propTiles.has(tile))continue;
        const id=Art.propFor(tile,mapId,x,y);if(id)Art.drawProp(ctx,id,x,y);
      }
    };
    rendererProto.tfrPixelCrawlerEnvironmentV1618=true;
  }

  AO.PixelCrawlerEnvironmentArtV1618=Art;
  AO.PixelCrawlerEnvironmentContentV1618={
    installed:true,version:'1.6.18',status:'integrated',terrainAtlas:TERRAIN_URL,propsAtlas:PROPS_URL,
    liveThemes:['wilds'],waterFamilies:[...families],propTiles:[...propTiles],
    sourcePack:'Pixel Crawler - Free Pack 2.11 by Anokolisa',preservedFallback:true
  };
  Art.init();
})();
