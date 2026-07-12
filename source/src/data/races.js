/* Thousandfold Realms v1.1 — Bloodlines. Stable IDs are save-critical. */
AO.RACES = {
  human: {
    id:'human', name:'Human', subtitle:'Adaptable and ambitious', category:'common', lineage:'Free Peoples', size:'medium',
    description:'Humans gain flexible talents and thrive in every calling.',
    bonuses:{cha:1,wis:1}, trait:'Versatile: +1 to every skill check.', mechanics:{allChecks:1},
    visual:{silhouette:'human',size:'medium',skin:'#c9956f',hair:'#4a3429',eye:'#3d2720',accent:'#4c6d85',ears:'round'}
  },
  moon_elf: {
    id:'moon_elf', name:'Moon Elf', subtitle:'Keen-eyed children of twilight', category:'elven', lineage:'Elven Kindreds', size:'tall',
    description:'Moon Elves favor speed, precision, and arcane study.',
    bonuses:{dex:2,int:1}, trait:'Twilight Sight: +2 Perception and Insight.', mechanics:{skillBonuses:{perception:2,insight:2}},
    visual:{silhouette:'elf',size:'tall',skin:'#b9a9d7',hair:'#e8e3f2',eye:'#9ed8ff',accent:'#596ca8',ears:'long',glowEyes:true}
  },
  sun_elf: {
    id:'sun_elf', name:'Sun Elf', subtitle:'Golden heirs of the sky courts', category:'elven', lineage:'Elven Kindreds', size:'tall',
    description:'Sun Elves preserve luminous magic, ceremony, and impossible histories.',
    bonuses:{int:2,cha:1}, trait:'Solar Memory: +6 mana; +1 Arcana and History.', mechanics:{maxMana:6,skillBonuses:{arcana:1,history:1}},
    visual:{silhouette:'elf',size:'tall',skin:'#d7ad73',hair:'#f2d98f',eye:'#fff0a2',accent:'#c58b36',ears:'long',crownMark:true}
  },
  wood_elf: {
    id:'wood_elf', name:'Wood Elf', subtitle:'Wardens of root and hidden trail', category:'elven', lineage:'Elven Kindreds', size:'tall',
    description:'Wood Elves move lightly through wild country and read living landscapes.',
    bonuses:{dex:2,wis:1}, trait:'Greenstrider: +6 stamina; +2 Survival and Nature.', mechanics:{maxStamina:6,skillBonuses:{survival:2,nature:2}},
    visual:{silhouette:'elf',size:'tall',skin:'#b98e67',hair:'#4f6036',eye:'#8fd079',accent:'#6c8b4f',ears:'long',leafHair:true,freckles:true}
  },
  deep_elf: {
    id:'deep_elf', name:'Deep Elf', subtitle:'Silent folk beneath the old roads', category:'elven', lineage:'Elven Kindreds', size:'medium',
    description:'Deep Elves are shaped by cavern cities, shadow politics, and cold starlight.',
    bonuses:{dex:2,cha:1}, trait:'Underveil: +1 critical range; +2 Stealth.', mechanics:{crit:1,skillBonuses:{stealth:2,deception:1}},
    visual:{silhouette:'elf',size:'medium',skin:'#675f86',hair:'#d6d0e7',eye:'#d77cff',accent:'#76598f',ears:'long',glowEyes:true,darkVeins:true}
  },
  stone_dwarf: {
    id:'stone_dwarf', name:'Stone Dwarf', subtitle:'Unyielding mountain folk', category:'stout', lineage:'Dwarven Holds', size:'short',
    description:'Stone Dwarves are hardy, stubborn, and built for close combat.',
    bonuses:{con:2,str:1}, trait:'Stoneblood: +4 maximum health.', mechanics:{maxHp:4},
    visual:{silhouette:'dwarf',size:'short',skin:'#b37d58',hair:'#6b3928',eye:'#4f3426',accent:'#8b6c3a',ears:'round',beard:true,braids:true}
  },
  forge_dwarf: {
    id:'forge_dwarf', name:'Forge Dwarf', subtitle:'Children of hammer and furnace', category:'stout', lineage:'Dwarven Holds', size:'short',
    description:'Forge Dwarves temper body and spirit beside ancestral furnaces.',
    bonuses:{str:2,int:1}, trait:'Masterwork Blood: +1 armor and +1 damage.', mechanics:{ac:1,bonusDamage:1},
    visual:{silhouette:'dwarf',size:'short',skin:'#a9684e',hair:'#3d2d29',eye:'#ef9d4e',accent:'#b75b32',ears:'round',beard:true,braids:true,soot:true}
  },
  frost_dwarf: {
    id:'frost_dwarf', name:'Frost Dwarf', subtitle:'Keepers of the glacier vaults', category:'stout', lineage:'Dwarven Holds', size:'short',
    description:'Frost Dwarves endure white wastes and carve halls beneath living ice.',
    bonuses:{con:2,wis:1}, trait:'Rimeheart: +3 health; frost attacks deal +1 damage.', mechanics:{maxHp:3,elementBonus:{frost:1},skillBonuses:{survival:1}},
    visual:{silhouette:'dwarf',size:'short',skin:'#aa806f',hair:'#d8e3e6',eye:'#8ed8ef',accent:'#5d8aa0',ears:'round',beard:true,iceCrystals:true}
  },
  ashborn: {
    id:'ashborn', name:'Ashborn', subtitle:'Marked by ember and shadow', category:'infernal', lineage:'Cinder-Touched', size:'medium',
    description:'Ashborn carry infernal-looking horns and a natural command of flame.',
    bonuses:{cha:2,int:1}, trait:'Emberkin: fire attacks deal +1 damage.', mechanics:{elementBonus:{fire:1}},
    visual:{silhouette:'horned',size:'medium',skin:'#8f5862',hair:'#231f26',eye:'#ffb45f',accent:'#c25b3e',ears:'point',horns:true,tail:'spade',glowEyes:true}
  },
  mosskin: {
    id:'mosskin', name:'Mosskin', subtitle:'Living heirs of the deep green', category:'primal', lineage:'Greenborn', size:'medium',
    description:'Mosskin blend plant and mortal traits, excelling at healing and survival.',
    bonuses:{wis:2,con:1}, trait:'Regrowth: recover 1 HP after each battle.', mechanics:{postBattleHeal:1},
    visual:{silhouette:'plant',size:'medium',skin:'#6f9366',hair:'#425a36',eye:'#d4f39d',accent:'#8fb45f',ears:'leaf',antlers:true,leafHair:true,bark:true}
  },
  drakeblood: {
    id:'drakeblood', name:'Drakeblood', subtitle:'Scaled descendants of elder wyrms', category:'draconic', lineage:'Wyrm-Blooded', size:'large',
    description:'Drakeblood are imposing, powerful, and resistant to physical punishment.',
    bonuses:{str:2,cha:1}, trait:'Scaled Hide: +1 armor class.', mechanics:{ac:1},
    visual:{silhouette:'dragon',size:'large',skin:'#7f704f',hair:'#332d28',eye:'#e7b34d',accent:'#b88a3f',ears:'fin',horns:true,scales:true,snout:true,tail:'dragon'}
  },
  elder_dragonkin: {
    id:'elder_dragonkin', name:'Elder Dragonkin', subtitle:'Towering heirs of true dragons', category:'draconic', lineage:'Wyrm-Blooded', size:'giant',
    description:'Elder Dragonkin carry vestigial wings, heavy tails, and the presence of ancient wyrms.',
    bonuses:{str:2,con:2}, trait:'Wyrmframe: +8 health, +1 armor, and +2 damage.', mechanics:{maxHp:8,ac:1,bonusDamage:2},
    visual:{silhouette:'dragon',size:'giant',skin:'#8e3f32',hair:'#2d2020',eye:'#ffd064',accent:'#d27a37',ears:'fin',horns:true,scales:true,snout:true,tail:'dragon',wings:true,crest:true}
  },
  koboldkin: {
    id:'koboldkin', name:'Koboldkin', subtitle:'Clever sparks beneath dragon shadows', category:'draconic', lineage:'Wyrm-Blooded', size:'small',
    description:'Koboldkin survive through quick hands, traps, daring, and inconvenient luck.',
    bonuses:{dex:2,int:1}, trait:'Scuttlewit: +1 critical range; +2 Sleight of Hand.', mechanics:{crit:1,skillBonuses:{sleight:2}},
    visual:{silhouette:'kobold',size:'small',skin:'#a6633f',hair:'#3a2924',eye:'#f9d65c',accent:'#d28a45',ears:'fin',scales:true,snout:true,tail:'dragon',crest:true}
  },
  duskling: {
    id:'duskling', name:'Duskling', subtitle:'Small folk of hidden roads', category:'smallfolk', lineage:'Smallfolk', size:'small',
    description:'Dusklings are nimble, lucky, and difficult to pin down.',
    bonuses:{dex:2,cha:1}, trait:'Fortune: reroll one natural 1 each battle.', mechanics:{rerollNaturalOne:true},
    visual:{silhouette:'halfling',size:'small',skin:'#c59b72',hair:'#5b3e28',eye:'#4c6c4c',accent:'#6d8c57',ears:'round',curlyHair:true}
  },
  tinker_gnome: {
    id:'tinker_gnome', name:'Tinker Gnome', subtitle:'Tiny builders of impossible devices', category:'smallfolk', lineage:'Gnomish Enclaves', size:'small',
    description:'Tinker Gnomes approach magic as engineering and engineering as mischief.',
    bonuses:{int:2,dex:1}, trait:'Brightspark: +6 mana; +1 Arcana and Sleight of Hand.', mechanics:{maxMana:6,skillBonuses:{arcana:1,sleight:1}},
    visual:{silhouette:'gnome',size:'small',skin:'#d09a72',hair:'#e6e0cc',eye:'#5dbcd2',accent:'#b75b72',ears:'point',goggles:true,hat:'tinker'}
  },
  deep_gnome: {
    id:'deep_gnome', name:'Deep Gnome', subtitle:'Gem-cutters of the lightless deep', category:'smallfolk', lineage:'Gnomish Enclaves', size:'small',
    description:'Deep Gnomes navigate silent tunnels and sense danger through stone.',
    bonuses:{dex:1,wis:2}, trait:'Stonewhisper: +1 armor; +2 Perception underground.', mechanics:{ac:1,skillBonuses:{perception:2}},
    visual:{silhouette:'gnome',size:'small',skin:'#7a747e',hair:'#b6b0bd',eye:'#93e3ca',accent:'#4d8a79',ears:'point',goggles:true,crystalHair:true}
  },
  revenant: {
    id:'revenant', name:'Revenant', subtitle:'A soul returned with unfinished purpose', category:'undead', lineage:'Deathless', size:'medium',
    description:'Revenants walk through memory, cold flesh, and a vow death could not end.',
    bonuses:{wis:2,cha:1}, trait:'Grave Resolve: +4 health and recover 2 HP after battle.', mechanics:{maxHp:4,postBattleHeal:2},
    visual:{silhouette:'undead',size:'medium',skin:'#9ba6a0',hair:'#e1e5df',eye:'#7be2d8',accent:'#5a817c',ears:'round',undead:true,glowEyes:true,stitches:true}
  },
  bonebound: {
    id:'bonebound', name:'Bonebound', subtitle:'An awakened skeleton in borrowed armor', category:'undead', lineage:'Deathless', size:'medium',
    description:'Bonebound spirits inhabit articulated remains held together by oath-metal and will.',
    bonuses:{dex:1,int:2}, trait:'Hollow Frame: +1 armor and +1 critical range.', mechanics:{ac:1,crit:1},
    visual:{silhouette:'skeleton',size:'medium',skin:'#d8d1b2',hair:'#3a3430',eye:'#a86bff',accent:'#765a91',skeleton:true,glowEyes:true,runeBones:true}
  },
  iron_orc: {
    id:'iron_orc', name:'Iron Orc', subtitle:'Disciplined heirs of war clans', category:'monstrous', lineage:'Warborn', size:'large',
    description:'Iron Orcs combine raw strength with fierce endurance.',
    bonuses:{str:2,con:1}, trait:'Relentless: survive one lethal blow at 1 HP.', mechanics:{surviveLethal:true},
    visual:{silhouette:'orc',size:'large',skin:'#71906d',hair:'#262a25',eye:'#d5c66a',accent:'#7b4b3b',ears:'point',tusks:true,warBraids:true}
  },
  giantkin: {
    id:'giantkin', name:'Giantkin', subtitle:'Broad-shouldered children of the old peaks', category:'giant', lineage:'Titan-Blooded', size:'giant',
    description:'Giantkin tower over most folk and carry the patience and force of mountains.',
    bonuses:{str:2,con:2}, trait:'Mountain Frame: +10 health and +2 damage.', mechanics:{maxHp:10,bonusDamage:2},
    visual:{silhouette:'giant',size:'giant',skin:'#a98067',hair:'#4a3b33',eye:'#6d8790',accent:'#6c7882',ears:'round',giantRunes:true,braids:true}
  }
};

AO.RACE_CATEGORIES = {
  all:'All Bloodlines', common:'Free Peoples', elven:'Elven Kindreds', stout:'Dwarven Holds', smallfolk:'Smallfolk',
  draconic:'Wyrm-Blooded', undead:'Deathless', monstrous:'Warborn', giant:'Titan-Blooded', primal:'Greenborn', infernal:'Cinder-Touched'
};
