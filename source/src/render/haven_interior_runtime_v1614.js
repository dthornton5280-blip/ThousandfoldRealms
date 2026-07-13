/* Thousandfold Realms v1.6.14-dev — approved starter-interior surfaces. */
(() => {
  'use strict';
  if(typeof window==='undefined'||!window.AO||!AO.ThousandfoldArt)return;
  const TILE=32,ATLAS_URL='assets/thousandfold/tiles/haven-interiors-v1614.png?v=1614';
  const tile=index=>({x:(index%8)*TILE,y:Math.floor(index/8)*TILE,w:TILE,h:TILE});
  const IDS=[
    ...Array.from({length:5},(_,i)=>`interior_polished_wood_${i}`),
    ...Array.from({length:5},(_,i)=>`interior_worn_wood_${i}`),
    ...Array.from({length:9},(_,i)=>`interior_rug_p${Math.floor(i/3)}${i%3}`),
    ...Array.from({length:9},(_,i)=>`interior_stone_p${Math.floor(i/3)}${i%3}`)
  ];
  const SPRITES=Object.fromEntries(IDS.map((id,index)=>[id,tile(index)]));
  const hash=(mapId,x,y)=>{
    let seed=2166136261;for(const char of mapId)seed=Math.imul(seed^char.charCodeAt(0),16777619);
    return (seed^Math.imul(x+17,73856093)^Math.imul(y+31,19349663))>>>0;
  };
  const supportedMaps=new Set(['tavern','tavern_cellar','inn','inn_upper','general_store','forge','arcane_shop','chapel']);
  const select=(world,tileName,x,y)=>{
    const mapId=world?.map?.id;if(!supportedMaps.has(mapId))return null;
    const h=hash(mapId,x,y);
    if(tileName==='rug'||tileName==='rune')return `interior_rug_p${((y%3)+3)%3}${((x%3)+3)%3}`;
    if(['stonefloor','forgefloor','chapelfloor','cellarfloor','altar'].includes(tileName))return `interior_stone_p${((y%3)+3)%3}${((x%3)+3)%3}`;
    if(tileName==='woodfloor'||tileName==='magicfloor'||tileName==='stage'){
      const family=mapId==='tavern_cellar'?'worn_wood':(h%7===0?'worn_wood':'polished_wood');
      return `interior_${family}_${h%5}`;
    }
    return null;
  };
  const Art={
    image:null,ready:false,loading:false,failed:false,lastError:null,
    init(){
      if(this.ready||this.loading)return;this.loading=true;document.documentElement.dataset.tfrHavenInteriors='loading';
      const image=new Image();image.decoding='async';
      image.onload=()=>{if(image.naturalWidth!==256||image.naturalHeight!==128){this.fail(new Error(`interior atlas size ${image.naturalWidth}x${image.naturalHeight}`));return;}this.image=image;this.ready=true;this.loading=false;document.documentElement.dataset.tfrHavenInteriors='ready';AO.events?.emit?.('assetsReady');AO.events?.emit?.('worldChanged');};
      image.onerror=()=>this.fail(new Error('starter-interior atlas PNG failed to load'));
      image.src=new URL(ATLAS_URL,document.baseURI).href;
    },
    fail(error){this.failed=true;this.loading=false;this.lastError=String(error?.message||error);document.documentElement.dataset.tfrHavenInteriors='failed';console.error('Approved starter-interior surfaces failed; canonical fallback remains active.',error||'');},
    drawTile(ctx,tileName,x,y,theme){
      const id=select(window.game?.world,tileName,x,y),sprite=SPRITES[id];
      if(!ctx||!sprite||!this.ready||!this.image)return false;
      ctx.save();ctx.imageSmoothingEnabled=false;ctx.drawImage(this.image,sprite.x,sprite.y,TILE,TILE,x*TILE,y*TILE,TILE,TILE);ctx.restore();return true;
    },
    selectTile(tileName,x,y,world=window.game?.world){return select(world,tileName,x,y);}
  };
  const prior=AO.ThousandfoldArt.drawTile.bind(AO.ThousandfoldArt);
  const wrapped=function(ctx,tileName,x,y,theme){if(Art.drawTile(ctx,tileName,x,y,theme))return true;return prior(ctx,tileName,x,y,theme);};
  wrapped.tfrHavenInteriorsV1614=true;AO.ThousandfoldArt.drawTile=wrapped;
  AO.HavenInteriorArtV1614=Art;AO.HavenInteriorContentV1614={installed:true,version:'1.6.14-dev',atlas:ATLAS_URL,assetIds:IDS,maps:[...supportedMaps]};Art.init();
})();
