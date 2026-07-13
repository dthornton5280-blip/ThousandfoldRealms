/* Thousandfold Realms v1.6.1-dev — generated Haven art renderer integration. */
(() => {
  'use strict';
  if(!window.AO||!AO.Renderer||!AO.SpriteFactory)return;

  const baseIcon=AO.SpriteFactory.icon.bind(AO.SpriteFactory);
  AO.SpriteFactory.icon=function(ctx,x,y,type,entity={}){
    const mapId=window.game?.world?.map?.id;
    if(AO.ThousandfoldArt?.drawEntity(ctx,entity,mapId,performance.now()))return;
    return baseIcon(ctx,x,y,type,entity);
  };

  const baseNpc=AO.SpriteFactory.npc.bind(AO.SpriteFactory);
  AO.SpriteFactory.npc=function(ctx,x,y,visual,scale=1,options={}){
    if(AO.ThousandfoldArt?.drawNpc(ctx,x,y,visual,scale,options))return;
    return baseNpc(ctx,x,y,visual,scale,options);
  };

  const PreviousRenderer=AO.Renderer;
  AO.Renderer=class extends PreviousRenderer{
    tile(ctx,x,y,tile,theme){
      if(AO.ThousandfoldArt?.drawTile(ctx,tile,x,y,theme))return true;
      return super.tile(ctx,x,y,tile,theme);
    }
    renderBuildings(ctx){
      const buildings=this.game.world.map?.buildings||[];
      if(!buildings.length)return;
      const night=(this.game.state.world.time??8)<6||(this.game.state.world.time??8)>18;
      ctx.save();ctx.imageSmoothingEnabled=false;
      for(const b of buildings){
        const drawn=AO.ThousandfoldArt?.drawBuilding(ctx,b,this.game.world)||AO.Assets?.drawBuilding(ctx,b);
        if(!drawn)continue;
        const dx=b.x*32,dy=b.y*32,dw=b.w*32,dh=b.h*32;
        ctx.fillStyle='rgba(7,8,10,.20)';ctx.fillRect(dx+8,dy+dh-7,dw-4,9);
        if(night){
          const cx=dx+dw/2,cy=dy+dh-30,g=ctx.createRadialGradient(cx,cy,4,cx,cy,78);
          g.addColorStop(0,'rgba(255,205,105,.20)');g.addColorStop(1,'rgba(255,185,70,0)');ctx.fillStyle=g;ctx.fillRect(cx-78,cy-78,156,156);
        }
      }
      ctx.restore();
    }
    render(){
      super.render();
      if(this.game.state?.mode!=='explore'||!AO.EntityGeometry)return;
      const nearby=this.game.world.entities.find(entity=>!entity.hidden&&entity.type!=='portal'&&AO.EntityGeometry.distance(this.game.world.playerPos(),entity)<=1);
      if(!nearby)return;
      const bounds=AO.EntityGeometry.bounds(nearby);
      if(bounds.w<=1&&bounds.h<=1)return;
      const ctx=this.ctx;ctx.save();ctx.strokeStyle='rgba(240,198,110,.72)';ctx.lineWidth=1;
      ctx.setLineDash([4,3]);ctx.strokeRect(bounds.x*32+2,bounds.y*32+2,bounds.w*32-4,bounds.h*32-4);ctx.restore();
    }
  };
})();
