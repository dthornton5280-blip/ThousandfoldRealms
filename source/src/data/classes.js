AO.CLASSES = {
  vanguard: {
    id:'vanguard', name:'Vanguard', role:'Armored frontline warrior', resource:'stamina',
    description:'A durable martial fighter who controls enemies with weapon techniques.',
    primary:'str', hp:16, mana:4, stamina:8, ac:12,
    baseStats:{str:15,dex:11,con:14,int:8,wis:10,cha:10},
    startItems:['iron_sword','oak_shield','brigandine','iron_helm','travel_trousers','trail_boots','travelers_cloak','healing_draught'], abilityIds:['power_strike','guard_stance','sweeping_cut','unyielding','shield_bash','iron_tempest','last_bastion'],
    visual:{outfit:'#59606a', trim:'#b18b48', weapon:'sword'}
  },
  ranger: {
    id:'ranger', name:'Ranger', role:'Mobile hunter and archer', resource:'stamina',
    description:'A wilderness expert who fights with bows, traps, and precise shots.',
    primary:'dex', hp:12, mana:5, stamina:9, ac:11,
    baseStats:{str:10,dex:15,con:12,int:10,wis:14,cha:8},
    startItems:['yew_bow','quiver','leather_armor','leather_cap','travel_trousers','trail_boots','travelers_cloak','healing_draught'], abilityIds:['aimed_shot','field_dressing','snare_trap','volley','hunters_mark','rain_of_thorns','perfect_shot'],
    visual:{outfit:'#4f6b4b', trim:'#8c7443', weapon:'bow'}
  },
  arcanist: {
    id:'arcanist', name:'Arcanist', role:'Elemental spellcaster', resource:'mana',
    description:'A scholarly mage wielding destructive and controlling arcane magic.',
    primary:'int', hp:9, mana:14, stamina:4, ac:9,
    baseStats:{str:8,dex:12,con:10,int:15,wis:12,cha:11},
    startItems:['oak_staff','spellbook','scholar_robes','moon_circlet','mystic_wraps','trail_boots','travelers_cloak','mana_tonic'], abilityIds:['arc_bolt','frost_bind','ember_orb','chain_lightning','mirror_ward','meteor_shard','time_break'],
    visual:{outfit:'#594d78', trim:'#8fb1c7', weapon:'staff'}
  },
  shadow: {
    id:'shadow', name:'Shadow', role:'Critical-strike rogue', resource:'stamina',
    description:'A cunning infiltrator relying on speed, poison, and devastating openings.',
    primary:'dex', hp:11, mana:5, stamina:10, ac:11,
    baseStats:{str:9,dex:15,con:11,int:12,wis:10,cha:14},
    startItems:['twin_daggers','parrying_dagger','leather_armor','hood_of_ways','shadow_leggings','softstep_boots','nightcloak','smoke_bomb'], abilityIds:['backstab','venom_blade','smoke_step','execution','shadowchain','deathmark','nightfall'],
    visual:{outfit:'#3d4148', trim:'#7a4961', weapon:'daggers'}
  },
  warden: {
    id:'warden', name:'Warden', role:'Nature healer and shapecaster', resource:'mana',
    description:'A primal spellcaster who heals wounds and calls the wild to battle.',
    primary:'wis', hp:12, mana:12, stamina:5, ac:10,
    baseStats:{str:10,dex:11,con:13,int:9,wis:15,cha:10},
    startItems:['thorn_staff','ritual_focus','hide_armor','leather_cap','travel_trousers','trail_boots','travelers_cloak','healing_draught'], abilityIds:['thorn_lash','renewal','barkskin','wildshape_bear','grasping_roots','moon_rebirth','elder_beast'],
    visual:{outfit:'#4e694c', trim:'#9d8a50', weapon:'staff'}
  },
  oathkeeper: {
    id:'oathkeeper', name:'Oathkeeper', role:'Holy knight and protector', resource:'mana',
    description:'A charismatic armored champion balancing weapon damage and divine aid.',
    primary:'cha', hp:14, mana:10, stamina:6, ac:12,
    baseStats:{str:14,dex:9,con:13,int:8,wis:11,cha:15},
    startItems:['iron_mace','oak_shield','chain_coat','iron_helm','chain_leggings','iron_boots','travelers_cloak','healing_draught'], abilityIds:['radiant_smite','lay_on_hands','challenge','dawn_judgment','sacred_aegis','sunlance','oath_unbroken'],
    visual:{outfit:'#6a6555', trim:'#d0b35d', weapon:'mace'}
  },
  hexblade: {
    id:'hexblade', name:'Hexblade', role:'Cursed duelist and warlock', resource:'mana',
    description:'A pact-bound warrior combining dark magic with close-range swordplay.',
    primary:'cha', hp:11, mana:12, stamina:6, ac:10,
    baseStats:{str:11,dex:13,con:12,int:10,wis:8,cha:15},
    startItems:['rune_blade','ritual_focus','dark_leathers','hood_of_ways','shadow_leggings','softstep_boots','nightcloak','mana_tonic'], abilityIds:['eldritch_lance','hex_mark','void_step','soul_reap','hungering_edge','abyssal_gate','pact_eclipse'],
    visual:{outfit:'#403a56', trim:'#9a5aa3', weapon:'sword'}
  },
  berserker: {
    id:'berserker', name:'Berserker', role:'High-risk raging bruiser', resource:'rage',
    description:'A brutal warrior who trades defense for escalating physical damage.',
    primary:'str', hp:17, mana:2, stamina:8, ac:10,
    baseStats:{str:15,dex:12,con:15,int:8,wis:10,cha:8},
    startItems:['war_axe','hide_armor','leather_cap','travel_trousers','trail_boots','travelers_cloak','warriors_girdle','healing_draught'], abilityIds:['reckless_swing','battle_rage','blood_roar','earthsplitter','skullbreaker','avalanche','immortal_fury'],
    visual:{outfit:'#69473d', trim:'#a7804d', weapon:'axe'}
  }
};
