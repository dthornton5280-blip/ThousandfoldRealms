/* Thousandfold Realms v1.6.14-dev — approved modular Haven storefronts. */
(() => {
  'use strict';
  if(typeof window==='undefined'||!window.AO)return;
  const TILE=32;
  const ATLAS_URL='assets/thousandfold/generated/haven-facades-v1614.png?v=1614';
  const ATLAS_SIZE={w:1280,h:160};
  const IDS=['haven_inn_exterior','haven_arcane_exterior','haven_provisions_exterior','haven_chapel_exterior','haven_forge_exterior'];
  const SPRITES=Object.fromEntries(IDS.map((id,index)=>[id,{x:index*256,y:0,w:256,h:160}]));
  const BUILDINGS={
    haven_inn:'haven_inn_exterior',haven_arcane:'haven_arcane_exterior',
    haven_store:'haven_provisions_exterior',haven_chapel:'haven_chapel_exterior',
    haven_forge:'haven_forge_exterior'
  };
  const patchDefinitions=()=>{
    for(const building of AO.MAP_DEFS?.haven?.buildings||[]){
      if(BUILDINGS[building.id])building.facadeArtId=BUILDINGS[building.id];
    }
  };
  const Art={
    image:null,ready:false,loading:false,failed:false,lastError:null,
    init(){
      if(this.ready||this.loading)return;
      this.loading=true;document.documentElement.dataset.tfrHavenFacades='loading';
      const image=new Image();image.decoding='async';
      image.onload=()=>{
        if(image.naturalWidth!==ATLAS_SIZE.w||image.naturalHeight!==ATLAS_SIZE.h){
          this.fail(new Error(`Haven facade atlas size ${image.naturalWidth}x${image.naturalHeight}`));return;
        }
        this.image=image;this.ready=true;this.loading=false;this.failed=false;this.lastError=null;
        document.documentElement.dataset.tfrHavenFacades='ready';
        patchDefinitions();AO.events?.emit?.('assetsReady');AO.events?.emit?.('worldChanged');
      };
      image.onerror=()=>this.fail(new Error('Haven facade atlas PNG failed to load'));
      image.src=new URL(ATLAS_URL,document.baseURI).href;
    },
    fail(error){
      this.failed=true;this.loading=false;this.lastError=String(error?.message||error||'unknown error');
      document.documentElement.dataset.tfrHavenFacades='failed';
      console.error('Approved Haven facades failed to load; canonical building fallback remains active.',error||'');
    },
    drawBuilding(ctx,building,world){
      if(world?.map?.id!=='haven'||!this.ready||!this.image)return false;
      const id=building?.facadeArtId||BUILDINGS[building?.id],sprite=SPRITES[id];
      if(!sprite)return false;
      const dx=building.x*TILE,dy=building.y*TILE,dw=(building.w||8)*TILE,dh=(building.h||5)*TILE;
      ctx.save();ctx.imageSmoothingEnabled=false;
      ctx.drawImage(this.image,sprite.x,sprite.y,sprite.w,sprite.h,dx,dy,dw,dh);
      ctx.restore();
      const door=world.entities?.find(entity=>entity.id===building.doorId);
      if(door?.open)AO.GeneratedSpriteArt?.drawDoorOverlay?.(ctx,building,world,dx,dy);
      return true;
    }
  };
  patchDefinitions();
  AO.HavenFacadeArtV1614=Art;
  AO.HavenFacadeContentV1614={installed:true,version:'1.6.14-dev',atlas:ATLAS_URL,assetIds:IDS,scope:'Haven storefronts'};
  Art.init();
})();
