/* World input bridge for v1.4 tactical encounters. */
const LivingWorldSystem = AO.WorldSystem;
AO.WorldSystem = class extends LivingWorldSystem {
  click(x,y){
    if(this.game.state?.mode==='combat'){this.game.combat.handleMapClick(x,y);return;}
    super.click(x,y);
  }
  keyboardMove(dx,dy){
    if(this.game.state?.mode==='combat'){this.game.combat.moveBy(dx,dy);return;}
    super.keyboardMove(dx,dy);
  }
  update(dt){
    if(this.game.state?.mode==='combat')return;
    super.update(dt);
  }
  load(mapId,x=null,y=null){
    super.load(mapId,x,y);
    if(this.game.state?.encounter&&this.game.state.encounter.mapId===mapId)this.game.combat?.syncWorldActors?.();
  }
};
