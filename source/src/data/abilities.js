AO.ABILITIES = {
  basic_attack:{id:'basic_attack',name:'Basic Attack',level:1,cost:0,resource:null,target:'enemy',range:'weapon',kind:'attack',power:1,icon:'⚔',description:'Attack with your equipped weapon.'},
  power_strike:{id:'power_strike',name:'Power Strike',level:1,cost:2,resource:'stamina',target:'enemy',kind:'attack',power:1.45,icon:'🗡',description:'A heavy blow with increased damage.'},
  guard_stance:{id:'guard_stance',name:'Guard Stance',level:1,cost:2,resource:'stamina',target:'self',kind:'defend',amount:4,icon:'🛡',description:'Gain 4 guard until your next turn.'},
  sweeping_cut:{id:'sweeping_cut',cooldown:2,name:'Sweeping Cut',level:3,cost:4,resource:'stamina',target:'enemy',kind:'attack',power:1.15,bonusHits:1,icon:'↻',description:'Strike the target and deal splash damage.'},
  unyielding:{id:'unyielding',cooldown:3,name:'Unyielding',level:5,cost:5,resource:'stamina',target:'self',kind:'heal',amount:12,icon:'◆',description:'Recover health and gain guard.'},
  aimed_shot:{id:'aimed_shot',name:'Aimed Shot',level:1,cost:2,resource:'stamina',target:'enemy',kind:'attack',power:1.35,accuracy:3,icon:'➶',description:'A precise ranged attack.'},
  field_dressing:{id:'field_dressing',name:'Field Dressing',level:1,cost:2,resource:'stamina',target:'self',kind:'heal',amount:7,icon:'✚',description:'Restore a small amount of health.'},
  snare_trap:{id:'snare_trap',cooldown:2,name:'Snare Trap',level:3,cost:4,resource:'stamina',target:'enemy',kind:'attack',power:.8,status:'snared',icon:'⌘',description:'Damage and reduce the enemy’s next attack.'},
  volley:{id:'volley',cooldown:3,name:'Volley',level:5,cost:6,resource:'stamina',target:'enemy',kind:'attack',power:1.7,icon:'⇶',description:'A deadly storm of arrows.'},
  backstab:{id:'backstab',name:'Backstab',level:1,cost:2,resource:'stamina',target:'enemy',kind:'attack',power:1.5,critBonus:3,icon:'◢',description:'A vicious strike with increased critical chance.'},
  venom_blade:{id:'venom_blade',name:'Venom Blade',level:1,cost:2,resource:'stamina',target:'enemy',kind:'attack',power:1,status:'poisoned',icon:'☠',description:'Attack and poison the target.'},
  smoke_step:{id:'smoke_step',cooldown:2,name:'Smoke Step',level:3,cost:4,resource:'stamina',target:'self',kind:'defend',amount:6,icon:'☁',description:'Gain guard and advantage on the next attack.'},
  execution:{id:'execution',cooldown:3,name:'Execution',level:5,cost:6,resource:'stamina',target:'enemy',kind:'execute',power:2.2,icon:'†',description:'Massive damage to wounded enemies.'},
  thorn_lash:{id:'thorn_lash',name:'Thorn Lash',level:1,cost:2,resource:'mana',target:'enemy',kind:'spell',power:1.1,stat:'wis',icon:'🌿',description:'Nature magic tears into the foe.'},
  renewal:{id:'renewal',name:'Renewal',level:1,cost:3,resource:'mana',target:'self',kind:'heal',amount:9,stat:'wis',icon:'❈',description:'Restore health with primal magic.'},
  barkskin:{id:'barkskin',cooldown:2,name:'Barkskin',level:3,cost:4,resource:'mana',target:'self',kind:'defend',amount:7,icon:'♣',description:'Gain heavy guard and cleanse poison.'},
  wildshape_bear:{id:'wildshape_bear',cooldown:3,name:'Wildshape: Bear',level:5,cost:6,resource:'mana',target:'self',kind:'transform',amount:10,icon:'🐻',description:'Gain health and empower your next attack.'},
  radiant_smite:{id:'radiant_smite',name:'Radiant Smite',level:1,cost:2,resource:'mana',target:'enemy',kind:'spell',power:1.35,stat:'cha',icon:'☀',description:'Weapon damage infused with radiant power.'},
  lay_on_hands:{id:'lay_on_hands',name:'Lay on Hands',level:1,cost:3,resource:'mana',target:'self',kind:'heal',amount:10,stat:'cha',icon:'✋',description:'Restore health through sacred conviction.'},
  challenge:{id:'challenge',cooldown:2,name:'Sacred Challenge',level:3,cost:4,resource:'mana',target:'enemy',kind:'attack',power:.8,status:'weakened',icon:'⚜',description:'Damage and weaken the enemy.'},
  dawn_judgment:{id:'dawn_judgment',cooldown:3,name:'Dawn Judgment',level:5,cost:7,resource:'mana',target:'enemy',kind:'spell',power:2.1,stat:'cha',icon:'✦',description:'A devastating radiant sentence.'},
  eldritch_lance:{id:'eldritch_lance',name:'Eldritch Lance',level:1,cost:2,resource:'mana',target:'enemy',kind:'spell',power:1.25,stat:'cha',icon:'☄',description:'A bolt of pact-bound force.'},
  hex_mark:{id:'hex_mark',name:'Hex Mark',level:1,cost:2,resource:'mana',target:'enemy',kind:'attack',power:.85,status:'hexed',icon:'⬡',description:'Mark the foe to increase later damage.'},
  void_step:{id:'void_step',cooldown:2,name:'Void Step',level:3,cost:4,resource:'mana',target:'self',kind:'defend',amount:5,icon:'◌',description:'Slip through shadow and prepare an empowered strike.'},
  soul_reap:{id:'soul_reap',cooldown:3,name:'Soul Reap',level:5,cost:7,resource:'mana',target:'enemy',kind:'drain',power:1.8,icon:'☽',description:'Deal dark damage and heal for part of it.'},
  reckless_swing:{id:'reckless_swing',name:'Reckless Swing',level:1,cost:2,resource:'stamina',target:'enemy',kind:'attack',power:1.55,accuracy:-2,icon:'🪓',description:'Huge damage at reduced accuracy.'},
  battle_rage:{id:'battle_rage',name:'Battle Rage',level:1,cost:0,resource:null,target:'self',kind:'rage',amount:3,icon:'🔥',description:'Gain rage, damage, and reduced armor.'},
  blood_roar:{id:'blood_roar',cooldown:2,name:'Blood Roar',level:3,cost:4,resource:'stamina',target:'self',kind:'heal',amount:8,icon:'◉',description:'Heal and frighten the enemy.'},
  earthsplitter:{id:'earthsplitter',cooldown:3,name:'Earthsplitter',level:5,cost:6,resource:'stamina',target:'enemy',kind:'attack',power:2.25,icon:'⛰',description:'A crushing ultimate attack.'}
};
Object.assign(AO.ABILITIES, {
  shield_bash:{id:'shield_bash',name:'Shield Bash',level:7,cost:4,resource:'stamina',target:'enemy',kind:'attack',power:1.15,status:'weakened',accuracy:2,cooldown:2,icon:'⬟',description:'Crush the foe’s guard and weaken its next attack.'},
  iron_tempest:{id:'iron_tempest',name:'Iron Tempest',level:9,cost:7,resource:'stamina',target:'enemy',kind:'attack',power:2.25,bonusHits:1,cooldown:3,icon:'⚔',description:'A punishing sequence of armored strikes.'},
  last_bastion:{id:'last_bastion',name:'Last Bastion',level:12,cost:8,resource:'stamina',target:'self',kind:'heal',amount:28,cooldown:4,icon:'🏰',description:'Recover heavily and raise an unbreakable guard.'},

  hunters_mark:{id:'hunters_mark',name:'Hunter’s Mark',level:7,cost:4,resource:'stamina',target:'enemy',kind:'attack',power:1,status:'hexed',cooldown:2,icon:'◎',description:'Mark a quarry so later attacks bite deeper.'},
  rain_of_thorns:{id:'rain_of_thorns',name:'Rain of Thorns',level:9,cost:7,resource:'stamina',target:'enemy',kind:'attack',power:2,bonusHits:1,status:'snared',cooldown:3,icon:'🌧',description:'Pin the battlefield beneath a storm of barbed arrows.'},
  perfect_shot:{id:'perfect_shot',name:'Perfect Shot',level:12,cost:9,resource:'stamina',target:'enemy',kind:'attack',power:3,accuracy:5,critBonus:4,cooldown:4,icon:'🎯',description:'One breath. One opening. One impossible shot.'},

  shadowchain:{id:'shadowchain',name:'Shadowchain',level:7,cost:4,resource:'stamina',target:'enemy',kind:'attack',power:1.45,status:'snared',critBonus:2,cooldown:2,icon:'⛓',description:'Bind the target’s shadow and strike through it.'},
  deathmark:{id:'deathmark',name:'Deathmark',level:9,cost:7,resource:'stamina',target:'enemy',kind:'attack',power:1.4,status:'hexed',critBonus:4,cooldown:3,icon:'☠',description:'Prepare a target for a decisive finishing blow.'},
  nightfall:{id:'nightfall',name:'Nightfall',level:12,cost:9,resource:'stamina',target:'enemy',kind:'execute',power:3.2,critBonus:5,cooldown:4,icon:'🌑',description:'Disappear, then return where the enemy is weakest.'},

  grasping_roots:{id:'grasping_roots',name:'Grasping Roots',level:7,cost:5,resource:'mana',target:'enemy',kind:'spell',power:1.4,stat:'wis',status:'snared',cooldown:2,icon:'🌱',description:'Ancient roots tear upward and hold the foe.'},
  moon_rebirth:{id:'moon_rebirth',name:'Moon Rebirth',level:9,cost:8,resource:'mana',target:'self',kind:'heal',amount:30,stat:'wis',cooldown:3,icon:'🌙',description:'Moonlight closes wounds and renews the spirit.'},
  elder_beast:{id:'elder_beast',name:'Shape of the Elder Beast',level:12,cost:10,resource:'mana',target:'self',kind:'transform',amount:35,cooldown:4,icon:'🦌',description:'Assume an elder form and empower the next devastating attack.'},

  sacred_aegis:{id:'sacred_aegis',name:'Sacred Aegis',level:7,cost:5,resource:'mana',target:'self',kind:'defend',amount:16,cooldown:2,icon:'🛡',description:'Raise a radiant barrier and steady your oath.'},
  sunlance:{id:'sunlance',name:'Sunlance',level:9,cost:8,resource:'mana',target:'enemy',kind:'spell',power:2.45,stat:'cha',status:'burning',cooldown:3,icon:'☀',description:'Drive a spear of condensed dawn through the foe.'},
  oath_unbroken:{id:'oath_unbroken',name:'Oath Unbroken',level:12,cost:10,resource:'mana',target:'self',kind:'heal',amount:40,stat:'cha',cooldown:4,icon:'⚜',description:'Renew body and conviction through an oath that cannot fail.'},

  hungering_edge:{id:'hungering_edge',name:'Hungering Edge',level:7,cost:5,resource:'mana',target:'enemy',kind:'drain',power:1.75,stat:'cha',cooldown:2,icon:'🩸',description:'The pactblade drinks deeply and returns stolen life.'},
  abyssal_gate:{id:'abyssal_gate',name:'Abyssal Gate',level:9,cost:8,resource:'mana',target:'self',kind:'defend',amount:14,cooldown:3,icon:'◉',description:'Step behind reality and emerge with a charged strike.'},
  pact_eclipse:{id:'pact_eclipse',name:'Pact Eclipse',level:12,cost:10,resource:'mana',target:'enemy',kind:'drain',power:3,stat:'cha',status:'hexed',cooldown:4,icon:'🌘',description:'Call in the oldest clause of the pact.'},

  skullbreaker:{id:'skullbreaker',name:'Skullbreaker',level:7,cost:5,resource:'stamina',target:'enemy',kind:'attack',power:1.9,status:'weakened',cooldown:2,icon:'💥',description:'A brutal overhead blow that leaves the foe reeling.'},
  avalanche:{id:'avalanche',name:'Avalanche',level:9,cost:7,resource:'stamina',target:'enemy',kind:'attack',power:2.5,bonusHits:1,cooldown:3,icon:'🏔',description:'Become the weight of a mountain in motion.'},
  immortal_fury:{id:'immortal_fury',name:'Immortal Fury',level:12,cost:9,resource:'stamina',target:'self',kind:'heal',amount:38,cooldown:4,icon:'🔥',description:'Refuse death, restore health, and deepen the rage.'}
});
