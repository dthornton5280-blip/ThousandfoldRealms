/* Thousandfold Realms v1.6.13-dev — game-ready ground and floor tile atlas.
   Uses exact 32x32 PNG tiles with nearest-neighbor rendering and preserves the
   existing procedural ThousandfoldArt renderer as a safe fallback. */
(() => {
  'use strict';
  if(typeof window==='undefined'||!window.AO||!AO.ThousandfoldArt)return;

  const TILE=32;
  const ATLAS_URL='assets/thousandfold/tiles/tfr-ground-tiles-v1613.png?v=1613';
  const ATLAS_SIZE={w:256,h:128};
  const tile=(index)=>({x:(index%8)*TILE,y:Math.floor(index/8)*TILE,w:TILE,h:TILE});

  const SPRITES={
    haven_grass_0:tile(0),haven_grass_1:tile(1),haven_grass_2:tile(2),
    haven_cobble_0:tile(3),haven_cobble_1:tile(4),
    haven_path_0:tile(5),haven_path_1:tile(6),haven_dirt_threshold:tile(7),
    tavern_woodfloor_0:tile(8),tavern_woodfloor_1:tile(9),tavern_woodfloor_2:tile(10),tavern_woodfloor_3:tile(11),
    interior_woodfloor_0:tile(12),interior_woodfloor_1:tile(13),interior_woodfloor_2:tile(14),interior_woodfloor_3:tile(15),
    cellar_floor_0:tile(16),cellar_floor_1:tile(17),cellar_floor_2:tile(18),cellar_floor_3:tile(19),
    forge_floor_0:tile(20),forge_floor_1:tile(21),forge_floor_2:tile(22),forge_floor_3:tile(23),
    chapel_floor_0:tile(24),chapel_floor_1:tile(25),chapel_floor_2:tile(26),chapel_floor_3:tile(27),
    arcane_floor_0:tile(28),arcane_floor_1:tile(29),arcane_floor_2:tile(30),arcane_floor_3:tile(31)
  };

  const hash=(x,y,z=0)=>Math.abs(Math.imul(x+17,73856093)^Math.imul(y+31,19349663)^Math.imul(z+7,83492791));
  const spriteId=(tileName,x,y,theme)=>{
    const h=hash(x,y,theme?.length||0);
    if(theme==='haven'){
      if(tileName==='grass')return `haven_grass_${h%3}`;
      if(tileName==='cobble')return `haven_cobble_${h%2}`;
      if(tileName==='path')return `haven_path_${h%2}`;
      return null;
    }
    if(theme==='tavern'&&tileName==='woodfloor')return `tavern_woodfloor_${h%4}`;
    if(theme==='interior'&&tileName==='woodfloor')return `interior_woodfloor_${h%4}`;
    if(theme==='cellar'&&tileName==='cellarfloor')return `cellar_floor_${h%4}`;
    if(theme==='forge'&&['stonefloor','forgefloor'].includes(tileName))return `forge_floor_${h%4}`;
    if(theme==='chapel'&&tileName==='chapelfloor')return `chapel_floor_${h%4}`;
    if(theme==='arcane'&&tileName==='magicfloor')return `arcane_floor_${h%4}`;
    return null;
  };

  const Art={
    image:null,ready:false,loading:false,failed:false,lastError:null,
    init(){
      if(this.ready||this.loading)return;
      this.loading=true;
      document.documentElement.dataset.tfrGroundTiles='loading';
      const image=new Image();
      image.decoding='async';
      image.onload=()=>{
        if(image.naturalWidth!==ATLAS_SIZE.w||image.naturalHeight!==ATLAS_SIZE.h){
          this.fail(new Error(`ground tile atlas size ${image.naturalWidth}x${image.naturalHeight}`));
          return;
        }
        this.image=image;this.ready=true;this.loading=false;this.failed=false;this.lastError=null;
        document.documentElement.dataset.tfrGroundTiles='ready';
        AO.events?.emit?.('assetsReady');AO.events?.emit?.('worldChanged');
      };
      image.onerror=()=>this.fail(new Error('ground tile atlas PNG failed to load'));
      image.src=new URL(ATLAS_URL,document.baseURI).href;
    },
    fail(error){
      this.failed=true;this.loading=false;this.lastError=String(error?.message||error||'unknown error');
      document.documentElement.dataset.tfrGroundTiles='failed';
      console.error('Thousandfold Realms game-ready ground tile atlas failed to load; procedural tile fallback remains active.',error||'');
    },
    drawTile(ctx,tileName,x,y,theme){
      const id=spriteId(tileName,x,y,theme),sprite=SPRITES[id];
      if(!ctx||!sprite||!this.ready||!this.image)return false;
      ctx.save();ctx.imageSmoothingEnabled=false;
      ctx.drawImage(this.image,sprite.x,sprite.y,sprite.w,sprite.h,x*TILE,y*TILE,TILE,TILE);
      ctx.restore();
      return true;
    }
  };

  const prior=AO.ThousandfoldArt.drawTile.bind(AO.ThousandfoldArt);
  if(!AO.ThousandfoldArt.drawTile.tfrGroundTilesV1613){
    const wrapped=function(ctx,tileName,x,y,theme){
      if(Art.drawTile(ctx,tileName,x,y,theme))return true;
      return prior(ctx,tileName,x,y,theme);
    };
    wrapped.tfrGroundTilesV1613=true;
    AO.ThousandfoldArt.drawTile=wrapped;
  }

  AO.GroundTileArtV1613=Art;
  AO.GroundTileContentV1613={
    installed:true,version:'1.6.13-dev',atlas:ATLAS_URL,
    tileSize:TILE,assetIds:Object.keys(SPRITES),
    covered:['haven grass/cobble/path','tavern wood floor','inn/interior wood floor','cellar floor','forge floor','chapel floor','arcane floor']
  };
  Art.init();
})();