/* Thousandfold Realms v1.6.15 candidate — explicit Whisperwood grass/road topology. */
(() => {
  'use strict';
  if(typeof window==='undefined'||!window.AO||!AO.ThousandfoldArt)return;
  const TILE=32,ATLAS_URL='assets/thousandfold/tiles/whisperwood-ground-v1615.png?v=1615-candidate';
  const ATLAS={w:512,h:320},columns=16;
  const TOPOLOGY={0:'isolated',1:'end_n',2:'end_e',4:'end_s',8:'end_w',5:'straight_ns',10:'straight_ew',3:'corner_ne',6:'corner_se',12:'corner_sw',9:'corner_nw',7:'tee_nes',14:'tee_esw',13:'tee_nsw',11:'tee_new',15:'cross'};
  const IDS=[...Array.from({length:9},(_,i)=>`whisper_grass_p${Math.floor(i/3)}${i%3}`)];
  for(const name of Object.values(TOPOLOGY))for(let i=0;i<9;i++)IDS.push(`whisper_road_${name}_p${Math.floor(i/3)}${i%3}`);
  const SPRITES=Object.fromEntries(IDS.map((id,index)=>[id,{x:(index%columns)*TILE,y:Math.floor(index/columns)*TILE,w:TILE,h:TILE}]));
  const roadLike=new Set(['path','bridge','stairs']);
  const mod=value=>((value%3)+3)%3;
  const select=(world,tileName,x,y)=>{
    if(world?.map?.theme!=='wilds')return null;
    const phase=`p${mod(y)}${mod(x)}`;
    if(tileName==='grass')return `whisper_grass_${phase}`;
    if(tileName!=='path')return null;
    const grid=world.grid||[],same=(nx,ny)=>roadLike.has(grid[ny]?.[nx]);
    const bits=(same(x,y-1)?1:0)|(same(x+1,y)?2:0)|(same(x,y+1)?4:0)|(same(x-1,y)?8:0);
    return `whisper_road_${TOPOLOGY[bits]}_${phase}`;
  };
  const Art={
    image:null,ready:false,loading:false,failed:false,lastError:null,
    init(){
      if(this.ready||this.loading)return;this.loading=true;document.documentElement.dataset.tfrWhisperwoodGround='loading';
      const image=new Image();image.decoding='async';
      image.onload=()=>{if(image.naturalWidth!==ATLAS.w||image.naturalHeight!==ATLAS.h){this.fail(new Error(`Whisperwood ground atlas size ${image.naturalWidth}x${image.naturalHeight}`));return;}this.image=image;this.ready=true;this.loading=false;document.documentElement.dataset.tfrWhisperwoodGround='ready';AO.events?.emit?.('assetsReady');AO.events?.emit?.('worldChanged');};
      image.onerror=()=>this.fail(new Error('Whisperwood candidate ground atlas failed to load'));
      image.src=new URL(ATLAS_URL,document.baseURI).href;
    },
    fail(error){this.failed=true;this.loading=false;this.lastError=String(error?.message||error);document.documentElement.dataset.tfrWhisperwoodGround='failed';console.error('Whisperwood candidate ground failed; project-owned procedural wilderness remains active.',error||'');},
    selectTile(tileName,x,y,world=window.game?.world){return select(world,tileName,x,y);},
    drawTile(ctx,tileName,x,y){const id=select(window.game?.world,tileName,x,y),sprite=SPRITES[id];if(!ctx||!sprite||!this.ready||!this.image)return false;ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(this.image,sprite.x,sprite.y,TILE,TILE,x*TILE,y*TILE,TILE,TILE);ctx.restore();return true;}
  };
  const prior=AO.ThousandfoldArt.drawTile.bind(AO.ThousandfoldArt);
  const wrapped=function(ctx,tileName,x,y,theme){if(theme==='wilds'&&Art.drawTile(ctx,tileName,x,y))return true;return prior(ctx,tileName,x,y,theme);};
  wrapped.tfrWhisperwoodGroundV1615=true;AO.ThousandfoldArt.drawTile=wrapped;
  AO.WhisperwoodGroundArtV1615=Art;AO.WhisperwoodGroundContentV1615={installed:true,status:'integrated-wilderness-ground',atlas:ATLAS_URL,assetIds:IDS,scope:'all wilds-theme maps'};Art.init();
})();
