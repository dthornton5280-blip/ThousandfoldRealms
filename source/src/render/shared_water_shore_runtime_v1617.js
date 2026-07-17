/* Thousandfold Realms v1.6.17 candidate — reusable natural water/shore topology. */
(() => {
  'use strict';
  if(typeof window==='undefined'||!window.AO||!AO.ThousandfoldArt)return;
  const TILE=32,ATLAS_URL='assets/thousandfold/tiles/shared-natural-water-shore-v1617.png?v=1617-candidate';
  const ATLAS={w:512,h:576},columns=16;
  const TOPOLOGY={0:'isolated',1:'end_n',2:'end_e',4:'end_s',8:'end_w',5:'straight_ns',10:'straight_ew',3:'corner_ne',6:'corner_se',12:'corner_sw',9:'corner_nw',7:'tee_nes',14:'tee_esw',13:'tee_nsw',11:'tee_new',15:'open'};
  const IDS=[];
  for(const name of Object.values(TOPOLOGY))for(let i=0;i<9;i++){
    const phase=`p${Math.floor(i/3)}${i%3}`;IDS.push(`natural_water_${name}_${phase}`,`natural_shallow_${name}_${phase}`);
  }
  const SPRITES=Object.fromEntries(IDS.map((id,index)=>[id,{x:(index%columns)*TILE,y:Math.floor(index/columns)*TILE,w:TILE,h:TILE}]));
  const connected=new Set(['water','shallow_water','waterfall_pool','lilywater','reeds']);
  const supported=new Set(['water','shallow_water','waterfall_pool']);
  const mod=value=>((value%3)+3)%3;
  const select=(world,tileName,x,y)=>{
    if(world?.map?.id!=='wilds'||!supported.has(tileName))return null;
    const grid=world.grid||[],same=(nx,ny)=>connected.has(grid[ny]?.[nx]);
    const bits=(same(x,y-1)?1:0)|(same(x+1,y)?2:0)|(same(x,y+1)?4:0)|(same(x-1,y)?8:0);
    const material=tileName==='water'?'water':'shallow',phase=`p${mod(y)}${mod(x)}`;
    return `natural_${material}_${TOPOLOGY[bits]}_${phase}`;
  };
  const Art={
    image:null,ready:false,loading:false,failed:false,lastError:null,
    init(){
      if(this.ready||this.loading)return;this.loading=true;document.documentElement.dataset.tfrSharedWaterShore='loading';
      const image=new Image();image.decoding='async';
      image.onload=()=>{if(image.naturalWidth!==ATLAS.w||image.naturalHeight!==ATLAS.h){this.fail(new Error(`Natural water/shore atlas size ${image.naturalWidth}x${image.naturalHeight}`));return;}this.image=image;this.ready=true;this.loading=false;document.documentElement.dataset.tfrSharedWaterShore='ready';AO.events?.emit?.('assetsReady');AO.events?.emit?.('worldChanged');};
      image.onerror=()=>this.fail(new Error('Natural water/shore candidate atlas failed to load'));
      image.src=new URL(ATLAS_URL,document.baseURI).href;
    },
    fail(error){this.failed=true;this.loading=false;this.lastError=String(error?.message||error);document.documentElement.dataset.tfrSharedWaterShore='failed';console.error('Natural water/shore candidate failed; established wilderness water remains active.',error||'');},
    selectTile(tileName,x,y,world=window.game?.world){return select(world,tileName,x,y);},
    drawTile(ctx,tileName,x,y){const id=select(window.game?.world,tileName,x,y),sprite=SPRITES[id];if(!ctx||!sprite||!this.ready||!this.image)return false;ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(this.image,sprite.x,sprite.y,TILE,TILE,x*TILE,y*TILE,TILE,TILE);ctx.restore();return true;}
  };
  const prior=AO.ThousandfoldArt.drawTile.bind(AO.ThousandfoldArt);
  const wrapped=function(ctx,tileName,x,y,theme){if(theme==='wilds'&&Art.drawTile(ctx,tileName,x,y))return true;return prior(ctx,tileName,x,y,theme);};
  wrapped.tfrSharedWaterShoreV1617=true;AO.ThousandfoldArt.drawTile=wrapped;
  AO.SharedWaterShoreArtV1617=Art;AO.SharedWaterShoreContentV1617={installed:true,status:'candidate-live-review',atlas:ATLAS_URL,assetIds:IDS,supportedTiles:[...supported],preservedFallback:true};Art.init();
})();
