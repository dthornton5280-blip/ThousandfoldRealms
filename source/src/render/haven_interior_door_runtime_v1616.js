/* Thousandfold Realms v1.6.16-dev — approved starter-interior door family.
   Reuses the checksum-locked Haven facade derivative so interior thresholds
   share the same wood, stone, outline weight, and pixel density. */
(() => {
  'use strict';
  if(typeof window==='undefined'||!window.AO||!AO.ThousandfoldArt)return;

  const TILE=32,URL='assets/thousandfold/generated/haven-facades-v1614.png?v=1616-doors';
  const MAP_VARIANT={inn:0,inn_upper:0,tavern:0,tavern_cellar:0,general_store:2,arcane_shop:1,chapel:3,forge:4};
  const CROP={x:104,y:96,w:48,h:64},DRAW={w:36,h:48};

  const Art={
    image:null,ready:false,loading:false,failed:false,lastError:null,
    init(){
      if(this.ready||this.loading)return;this.loading=true;
      document.documentElement.dataset.tfrHavenInteriorDoors='loading';
      let attempts=0;const adopt=()=>{
        const source=AO.HavenFacadeArtV1614;
        if(source?.ready&&source.image){
          clearInterval(timer);this.image=source.image;this.ready=true;this.loading=false;this.failed=false;this.lastError=null;
          document.documentElement.dataset.tfrHavenInteriorDoors='ready';AO.events?.emit?.('assetsReady');AO.events?.emit?.('worldChanged');return;
        }
        if(source?.failed||++attempts>400){clearInterval(timer);this.fail(new Error('approved Haven facade source was unavailable'));}
      };
      const timer=setInterval(adopt,25);adopt();
    },
    fail(error){
      this.failed=true;this.loading=false;this.lastError=String(error?.message||error||'unknown error');
      document.documentElement.dataset.tfrHavenInteriorDoors='failed';
      console.error('Approved interior doors failed to load; project-owned procedural doors remain active.',error||'');
    },
    draw(ctx,entity,mapId){
      const variant=MAP_VARIANT[mapId];
      if(!ctx||!entity||entity.type!=='door'||entity.integratedBuildingDoor||variant==null||!this.ready||!this.image)return false;
      const dx=Math.round(entity.x*TILE+TILE/2-DRAW.w/2),dy=Math.round(entity.y*TILE+TILE-DRAW.h),sx=variant*256+CROP.x;
      ctx.save();ctx.imageSmoothingEnabled=false;
      ctx.drawImage(this.image,sx,CROP.y,CROP.w,CROP.h,dx,dy,DRAW.w,DRAW.h);
      if(entity.open){
        ctx.fillStyle='#080a0b';ctx.fillRect(dx+7,dy+10,22,34);
        ctx.fillStyle='#593824';ctx.fillRect(dx+25,dy+12,3,30);
        ctx.fillStyle='#d0a44f';ctx.fillRect(dx+25,dy+27,2,2);
      }
      ctx.restore();return true;
    }
  };

  const prior=AO.ThousandfoldArt.drawEntity.bind(AO.ThousandfoldArt);
  AO.ThousandfoldArt.drawEntity=function(ctx,entity,mapId,time){
    if(Art.draw(ctx,entity,mapId))return true;
    return prior(ctx,entity,mapId,time);
  };
  AO.HavenInteriorDoorArtV1616=Art;
  AO.HavenInteriorDoorContentV1616={version:'1.6.16-dev',maps:Object.keys(MAP_VARIANT),source:URL,draw:DRAW};
  Art.init();
})();
