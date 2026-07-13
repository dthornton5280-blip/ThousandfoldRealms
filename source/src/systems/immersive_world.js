/* Thousandfold Realms v1.6.2-dev — broad interactions and footprint-safe ambient routines. */
const ImmersiveWorldBase=AO.WorldSystem;
AO.WorldSystem=class extends ImmersiveWorldBase{
  load(mapId,x=null,y=null){
    super.load(mapId,x,y);this.ambientTime=0;
    for(const e of this.entities){
      if(e.ambient){e.blocking=false;e.routeIndex=0;e.activityFrame=0;e.nextAmbientMove=e.moveEvery||1400;}
      if(e.type==='door'&&e.integratedBuildingDoor)e.interactionFootprint||={left:1,right:1,up:1,down:0};
    }
  }
  footprint(entity){
    if(!entity)return null;const f=entity.interactionFootprint||entity.footprint;if(!f)return{x1:entity.x,y1:entity.y,x2:entity.x,y2:entity.y};
    return{x1:entity.x-(f.left||0),y1:entity.y-(f.up||0),x2:entity.x+(f.right||0),y2:entity.y+(f.down||0)};
  }
  containsPoint(entity,x,y){const f=this.footprint(entity);return !!f&&x>=f.x1&&x<=f.x2&&y>=f.y1&&y<=f.y2;}
  doorAtPoint(x,y){return this.entities.find(e=>e.type==='door'&&!e.hidden&&this.containsPoint(e,x,y));}
  entityAt(x,y){
    const broadDoor=this.doorAtPoint(x,y);if(broadDoor)return broadDoor;
    const broad=this.entities.find(e=>!e.hidden&&e.interactionFootprint&&this.containsPoint(e,x,y));if(broad)return broad;
    return super.entityAt(x,y);
  }
  click(x,y){
    if(this.game.state?.mode==='combat'){super.click(x,y);return;}
    const broad=this.doorAtPoint(x,y);if(broad){this.approachAndInteract(broad);return;}super.click(x,y);
  }
  updateAmbient(dt){
    if(this.game.state?.mode!=='explore')return;this.ambientTime+=dt;
    const player=this.playerPos();
    for(const e of this.entities.filter(x=>x.ambient&&!x.hidden)){
      e.activityFrame=((e.activityFrame||0)+dt)%1200;e.nextAmbientMove=(e.nextAmbientMove??e.moveEvery??1400)-dt;
      if(e.nextAmbientMove>0||!e.route?.length)continue;e.nextAmbientMove=e.moveEvery||1400;
      const nextIndex=((e.routeIndex||0)+1)%e.route.length,next=e.route[nextIndex];if(!next)continue;
      const occupied=this.entities.some(o=>o!==e&&!o.hidden&&o.blocking!==false&&(AO.EntityGeometry?.contains?AO.EntityGeometry.contains(o,next[0],next[1]):o.x===next[0]&&o.y===next[1]));
      const blocked=(next[0]===player.x&&next[1]===player.y)||!this.isTerrainWalkable(next[0],next[1])||occupied;
      if(blocked)continue;const dx=next[0]-e.x,dy=next[1]-e.y;e.facing=Math.abs(dx)>Math.abs(dy)?(dx<0?'left':'right'):(dy<0?'up':'down');e.x=next[0];e.y=next[1];e.routeIndex=nextIndex;
    }
  }
  update(dt){super.update(dt);this.updateAmbient(dt);}
  interact(entity){
    if(entity?.ambient){this.game.state.mode='dialogue';this.game.ui.dialogue(entity.name,entity.ambientText||'The resident pauses briefly before returning to their work.',[{label:'Continue',action:()=>this.game.ui.closeDialogue()}],entity.visual,entity.title||'Haven Resident');return;}
    super.interact(entity);
  }
};