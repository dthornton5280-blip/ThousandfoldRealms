AO.ProgressionSystem = class {
  constructor(game){this.game=game;}
  xpForLevel(level){return 90+(level-1)*75;}
  grantXp(amount){
    const p=this.game.state.player;p.xp+=amount;this.game.toast(`+${amount} XP`);
    while(p.level<AO.CONFIG.maxLevel&&p.xp>=this.xpForLevel(p.level)){
      p.xp-=this.xpForLevel(p.level);p.level++;p.unspentPoints+=p.level%4===0?3:2;
      p.baseMaxHp+=4+Math.max(0,AO.Util.statMod(this.game.stat('con')));p.baseMaxMana+=2;p.baseMaxStamina+=2;
      this.game.recalculatePlayer();p.hp=p.maxHp;p.mana=p.maxMana;p.stamina=p.maxStamina;this.game.ui.showLevelUp(p.level);
    }
    AO.events.emit('playerChanged');
  }
  spendPoint(stat){const p=this.game.state.player;if(p.unspentPoints<=0||!p.stats[stat]||p.stats[stat]>=20)return false;p.stats[stat]++;p.unspentPoints--;this.game.recalculatePlayer();AO.events.emit('playerChanged');return true;}
  unlockedAbilities(){const p=this.game.state.player,cls=AO.CLASSES[p.classId];return ['basic_attack',...cls.abilityIds].map(id=>AO.ABILITIES[id]).filter(a=>a&&a.level<=p.level);}
};
