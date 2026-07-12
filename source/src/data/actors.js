AO.NPCS = {
  mira:{id:'mira',name:'Warden Mira',title:'Captain of the Eastern Road',map:'haven',x:13,y:8,visual:{skin:'#b98a68',hair:'#372b28',outfit:'#496479',accent:'#c4a55d',weapon:'spear'},dialogue:'mira'},
  mara:{id:'mara',name:'Mara Vale',title:'Provisioner & Apothecary',map:'general_store',x:15,y:6,visual:{skin:'#c28f69',hair:'#6c3e2a',outfit:'#735445',accent:'#d1a45b'},dialogue:'mara',shop:'apothecary'},
  borin:{id:'borin',name:'Borin Flint',title:'Master Blacksmith',map:'forge',x:20,y:7,visual:{skin:'#a87554',hair:'#5a3023',outfit:'#5f5b56',accent:'#b16e43',beard:true},dialogue:'borin',shop:'forge'},
  lys:{id:'lys',name:'Lys of the Lantern',title:'Wayfarer & Rumor Broker',map:'tavern',x:18,y:7,visual:{skin:'#aa91c5',hair:'#e4dded',outfit:'#5b536d',accent:'#87a7c0',ears:'long'},dialogue:'lys'},
  bran:{id:'bran',name:'Bran Hollow',title:'Tavernkeeper',map:'tavern',x:8,y:5,visual:{skin:'#bd8964',hair:'#5c382a',outfit:'#6e4b34',accent:'#d39b48',beard:true},dialogue:'bran',shop:'tavern'},
  elowen:{id:'elowen',name:'Elowen Reed',title:'Innkeeper',map:'inn',x:14,y:5,visual:{skin:'#c99a78',hair:'#7b5138',outfit:'#5f6d68',accent:'#c9a85a'},dialogue:'elowen'},
  selene:{id:'selene',name:'Selene Vey',title:'Arcane Antiquarian',map:'arcane_shop',x:15,y:5,visual:{skin:'#a98bc0',hair:'#d7d0df',outfit:'#4d486b',accent:'#80b1c6',ears:'long',weapon:'staff'},dialogue:'selene',shop:'arcane'},
  odo:{id:'odo',name:'Brother Odo',title:'Keeper of the Last Chapel',map:'chapel',x:15,y:5,visual:{skin:'#9d775f',hair:'#d1c2aa',outfit:'#665f54',accent:'#c8ab61',beard:true},dialogue:'odo'},
  nessa:{id:'nessa',name:'Nessa Quill',title:'Tailor & Dyer',map:'haven',x:8,y:9,visual:{skin:'#b87964',hair:'#31313d',outfit:'#6c4f73',accent:'#d68aa0'},dialogue:'nessa',shop:'clothier'},
  jory:{id:'jory',name:'Jory Bright',title:'Jeweler',map:'haven',x:21,y:9,visual:{skin:'#c49a72',hair:'#b58d4f',outfit:'#526878',accent:'#e1c26a'},dialogue:'jory',shop:'jeweler'}
};
AO.ENEMIES = {
  mireling:{id:'mireling',name:'Mireling',level:1,hp:18,ac:10,attack:[1,6,2],xp:24,gold:[2,6],loot:[{id:'mire_gland',chance:.7},{id:'healing_draught',chance:.12}],visual:{kind:'mireling',body:'#536f4f',accent:'#9db15f'}},
  bandit:{id:'bandit',name:'Road Bandit',level:2,hp:28,ac:12,attack:[1,8,3],xp:38,gold:[8,16],loot:[{id:'healing_draught',chance:.25},{id:'copper_charm',chance:.08}],visual:{kind:'humanoid',skin:'#b38364',body:'#5b4842',accent:'#8f744b',weapon:'sword'}},
  cellar_rat:{id:'cellar_rat',name:'Bloated Cellar Rat',level:1,hp:14,ac:10,attack:[1,5,1],xp:18,gold:[0,2],loot:[{id:'rat_tail',chance:1},{id:'travel_ration',chance:.08}],visual:{kind:'mireling',body:'#695647',accent:'#b69262'}},
  rat_king:{id:'rat_king',name:'Cellar King',level:3,hp:52,ac:13,attack:[1,10,4],xp:90,gold:[8,18],boss:true,loot:[{id:'greater_stamina',chance:.6}],visual:{kind:'mireling',body:'#574338',accent:'#c59a53'}},
  restless_guest:{id:'restless_guest',name:'Restless Guest',level:3,hp:46,ac:13,attack:[1,10,4],xp:85,gold:[4,10],boss:true,loot:[{id:'spectral_key',chance:1},{id:'ghost_essence',chance:1}],visual:{kind:'humanoid',skin:'#8bb2bf',body:'#536b78',accent:'#b8e4ec',weapon:'staff'}},
  skeleton:{id:'skeleton',name:'Crypt Skeleton',level:3,hp:32,ac:13,attack:[1,8,4],xp:46,gold:[3,9],loot:[{id:'old_bone',chance:.85},{id:'mana_tonic',chance:.15}],visual:{kind:'skeleton',body:'#d3c9ad',accent:'#6a6760',weapon:'sword'}},
  ember_adept:{id:'ember_adept',name:'Ember Adept',level:4,hp:40,ac:13,attack:[1,10,4],xp:62,gold:[10,22],loot:[{id:'ember_crystal',chance:.28},{id:'greater_healing',chance:.12}],visual:{kind:'humanoid',skin:'#87545e',body:'#503748',accent:'#c35e3d',horns:true,weapon:'staff'}},
  mine_stalker:{id:'mine_stalker',name:'Lantern Mine Stalker',level:4,hp:44,ac:14,attack:[2,6,3],xp:68,gold:[5,12],loot:[{id:'iron_ore',chance:.55},{id:'frost_vial',chance:.08}],visual:{kind:'mireling',body:'#41545c',accent:'#74a8b2'}},
  crystal_wisp:{id:'crystal_wisp',name:'Crystal Wisp',level:5,hp:38,ac:15,attack:[1,12,4],xp:76,gold:[8,16],loot:[{id:'ember_crystal',chance:.75},{id:'greater_mana',chance:.12}],visual:{kind:'golem',body:'#4b566a',accent:'#8fc7df',core:'#c9f5ff'}},
  stone_troll:{id:'stone_troll',name:'Star-Iron Troll',level:7,hp:128,ac:16,attack:[2,10,5],xp:260,gold:[55,90],boss:true,loot:[{id:'masterwork_core',chance:1},{id:'superior_healing',chance:.35}],visual:{kind:'golem',body:'#4d5150',accent:'#8eb3bf',core:'#d0f1ff'}},
  ember_warden:{id:'ember_warden',name:'Ember Warden',level:8,hp:148,ac:17,attack:[2,10,6],xp:320,gold:[70,110],boss:true,loot:[{id:'emberbrand',chance:1},{id:'crypt_heart',chance:.55}],visual:{kind:'golem',body:'#4c4240',accent:'#e16136',core:'#ffb24a'}}
};
