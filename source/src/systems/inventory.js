AO.InventorySystem = class {
  constructor(game){this.game=game;}
  count(itemId){return this.game.state.player.inventory.filter(i=>i.itemId===itemId).reduce((n,i)=>n+i.qty,0);}
  add(itemId,qty=1){
    const p=this.game.state.player,item=AO.ITEMS[itemId];if(!item)return false;
    const stack=p.inventory.find(i=>i.itemId===itemId&&!item.slot);
    if(stack)stack.qty+=qty;else p.inventory.push({uid:AO.Util.id('item'),itemId,qty});
    AO.events.emit('inventoryChanged');this.game.quests.onCollect(itemId,this.count(itemId));return true;
  }
  remove(itemId,qty=1){
    const p=this.game.state.player;let left=qty;
    for(let i=p.inventory.length-1;i>=0&&left>0;i--){const stack=p.inventory[i];if(stack.itemId!==itemId)continue;const take=Math.min(left,stack.qty);stack.qty-=take;left-=take;if(stack.qty<=0)p.inventory.splice(i,1);}
    AO.events.emit('inventoryChanged');return left===0;
  }
  removeUid(uid){const p=this.game.state.player,idx=p.inventory.findIndex(i=>i.uid===uid);if(idx>=0){p.inventory.splice(idx,1);AO.events.emit('inventoryChanged');return true;}return false;}
  equipSlot(item,p){
    if(item.slot==='ring'){if(!p.equipment.ring1)return'ring1';if(!p.equipment.ring2)return'ring2';return'ring1';}
    if(item.slot==='armor')return'chest';
    if(item.slot==='trinket')return'amulet';
    return item.slot;
  }
  equip(uid){
    const p=this.game.state.player,entry=p.inventory.find(i=>i.uid===uid);if(!entry)return false;
    const item=AO.ITEMS[entry.itemId];if(!item?.slot)return false;const slot=this.equipSlot(item,p);if(!slot)return false;
    const previous=p.equipment[slot];p.equipment[slot]=entry.itemId;this.removeUid(uid);
    if(previous)p.inventory.push({uid:AO.Util.id('item'),itemId:previous,qty:1});
    this.game.recalculatePlayer();AO.events.emit('equipmentChanged');this.game.toast(`${item.name} equipped.`);return true;
  }
  unequip(slot){
    const p=this.game.state.player,id=p.equipment[slot];if(!id)return;
    p.equipment[slot]=null;p.inventory.push({uid:AO.Util.id('item'),itemId:id,qty:1});this.game.recalculatePlayer();AO.events.emit('equipmentChanged');
  }
  use(uid,inCombat=false){
    const p=this.game.state.player,entry=p.inventory.find(i=>i.uid===uid);if(!entry)return false;
    const item=AO.ITEMS[entry.itemId];if(item?.type!=='consumable')return false;
    const c=this.game.combat.current;let applied=false;
    if(item.combatDamage){if(!inCombat||!c){this.game.toast('That item can only be used in combat.');return false;}c.enemyHp=Math.max(0,c.enemyHp-item.combatDamage);c.addedByItem=true;this.game.combat.addLog(`${item.name} deals ${item.combatDamage} damage.`);if(item.status&&!c.enemyStatuses.some(s=>s.id===item.status))c.enemyStatuses.push({id:item.status,turns:2});applied=true;}
    if(item.heal){const before=p.hp;p.hp=Math.min(p.maxHp,p.hp+item.heal);this.game.toast(`Recovered ${p.hp-before} health.`);applied=true;}
    if(item.manaRestore){const before=p.mana;p.mana=Math.min(p.maxMana,p.mana+item.manaRestore);this.game.toast(`Recovered ${p.mana-before} mana.`);applied=true;}
    if(item.staminaRestore){const before=p.stamina;p.stamina=Math.min(p.maxStamina,p.stamina+item.staminaRestore);this.game.toast(`Recovered ${p.stamina-before} stamina.`);applied=true;}
    if(item.guard){if(!inCombat||!c){this.game.toast('That item is meant for combat.');return false;}c.playerGuard+=item.guard;this.game.toast(`Gained ${item.guard} guard.`);applied=true;}
    if(item.cleanse){if(inCombat&&c)c.playerStatuses=[];this.game.toast('Harmful effects cleansed.');applied=true;}
    if(!applied)return false;
    entry.qty--;if(entry.qty<=0)this.removeUid(uid);AO.events.emit('playerChanged');return true;
  }
  buy(itemId){const item=AO.ITEMS[itemId],p=this.game.state.player;if(!item)return false;if(p.gold<item.value){this.game.toast('Not enough gold.');return false;}p.gold-=item.value;this.add(itemId,1);this.game.toast(`Purchased ${item.name}.`);return true;}
  sell(uid){
    const p=this.game.state.player,entry=p.inventory.find(i=>i.uid===uid);if(!entry)return false;const item=AO.ITEMS[entry.itemId];
    if(!item||item.type==='quest'){this.game.toast('That item cannot be sold.');return false;}
    const price=Math.max(1,Math.floor(item.value*.5));p.gold+=price;entry.qty--;if(entry.qty<=0)this.removeUid(uid);this.game.toast(`Sold ${item.name} for ${price} gold.`);AO.events.emit('playerChanged');return true;
  }
};
