AO.QUESTS = {
  fog_lanterns:{
    id:'fog_lanterns',name:'Lanterns in the Fog',giver:'mira',minLevel:1,
    summary:'Mirelings have extinguished the road lanterns outside Haven.',
    stages:[
      {text:'Speak with Warden Mira in Lantern Square.',type:'talk',target:'mira',count:1},
      {text:'Defeat 3 Mirelings in Whisperwood.',type:'kill',target:'mireling',count:3},
      {text:'Return to Warden Mira.',type:'return',target:'mira',count:1}
    ],reward:{xp:110,gold:40,items:['wolf_tooth','wardens_mantle']}
  },
  herbal_remedy:{
    id:'herbal_remedy',name:'A Herbal Remedy',giver:'mara',minLevel:1,
    summary:'Mara needs fresh Moon Herb for wounded travelers.',
    stages:[
      {text:'Speak with Mara inside her provision shop.',type:'talk',target:'mara',count:1},
      {text:'Gather 4 Moon Herbs in Whisperwood.',type:'collect',target:'moon_herb',count:4},
      {text:'Bring the herbs to Mara.',type:'return',target:'mara',count:1}
    ],consume:[{id:'moon_herb',count:4}],reward:{xp:90,gold:28,items:['greater_healing','alchemist_belt']}
  },
  cellar_vermin:{
    id:'cellar_vermin',name:'Something Beneath the Ale',giver:'bran',minLevel:1,
    summary:'The Black Lantern cellar is overrun, and Bran’s patrons are beginning to notice.',
    stages:[
      {text:'Ask Bran about the noises below the tavern.',type:'talk',target:'bran',count:1},
      {text:'Defeat 4 Cellar Rats beneath the tavern.',type:'kill',target:'cellar_rat',count:4},
      {text:'Defeat the Cellar King.',type:'kill',target:'rat_king',count:1},
      {text:'Return to Bran.',type:'return',target:'bran',count:1}
    ],reward:{xp:150,gold:45,items:['tavernkeepers_belt','cellar_ring']}
  },
  missing_shipment:{
    id:'missing_shipment',name:'The Missing Eastern Shipment',giver:'lys',minLevel:2,
    summary:'Bandits took a merchant crate somewhere along the eastern road.',
    stages:[
      {text:'Hear Lys’s account in the Black Lantern Tavern.',type:'talk',target:'lys',count:1},
      {text:'Recover the Missing Trade Crate in Whisperwood.',type:'collect',target:'trade_crate',count:1},
      {text:'Return the crate to Lys.',type:'return',target:'lys',count:1}
    ],consume:[{id:'trade_crate',count:1}],reward:{xp:160,gold:70,items:['roadwarden_cloak','hunter_bow']}
  },
  dusk_dye:{
    id:'dusk_dye',name:'Color of the Last Sunset',giver:'nessa',minLevel:2,
    summary:'Nessa needs Dusk Blooms to finish a commission worthy of Haven’s festival.',
    stages:[
      {text:'Ask Nessa about her unfinished commission.',type:'talk',target:'nessa',count:1},
      {text:'Gather 5 Dusk Blooms in Whisperwood.',type:'collect',target:'dusk_bloom',count:5},
      {text:'Bring the blooms to Nessa.',type:'return',target:'nessa',count:1}
    ],consume:[{id:'dusk_bloom',count:5}],reward:{xp:125,gold:45,items:['moonwoven_boots','nightcloak']}
  },
  room_seven:{
    id:'room_seven',name:'The Guest in Room Seven',giver:'elowen',minLevel:3,
    summary:'A locked room at the Lantern Rest has begun answering questions no one asked.',
    stages:[
      {text:'Speak with Elowen inside the Lantern Rest.',type:'talk',target:'elowen',count:1},
      {text:'Defeat the Restless Guest upstairs.',type:'kill',target:'restless_guest',count:1},
      {text:'Recover the Spectral Room Key.',type:'collect',target:'spectral_key',count:1},
      {text:'Return to Elowen.',type:'return',target:'elowen',count:1}
    ],consume:[{id:'spectral_key',count:1}],reward:{xp:220,gold:75,items:['ghostlight_amulet','scroll_mending']}
  },
  broken_seal:{
    id:'broken_seal',name:'The Broken Seal',giver:'borin',minLevel:2,
    summary:'A fragment of Haven’s old ward lies somewhere inside the Ashen Crypt.',
    stages:[
      {text:'Ask Borin about the old crypt.',type:'talk',target:'borin',count:1},
      {text:'Recover the Ember Shard from the Ashen Crypt.',type:'collect',target:'ember_shard',count:1},
      {text:'Return the shard to Borin.',type:'return',target:'borin',count:1}
    ],reward:{xp:190,gold:65,items:['moon_lens','iron_shield']}
  },
  forgotten_prayer:{
    id:'forgotten_prayer',name:'Words for the Unremembered',giver:'odo',minLevel:3,
    summary:'Brother Odo believes an old prayer survived inside the crypt.',
    stages:[
      {text:'Speak with Brother Odo in the chapel.',type:'talk',target:'odo',count:1},
      {text:'Recover the Forgotten Prayer from the Ashen Crypt.',type:'collect',target:'forgotten_prayer',count:1},
      {text:'Return the prayer to Brother Odo.',type:'return',target:'odo',count:1}
    ],consume:[{id:'forgotten_prayer',count:1}],reward:{xp:180,gold:55,items:['saint_odo_ring','sun_hammer']}
  },
  miners_echo:{
    id:'miners_echo',name:'Echoes of the Lantern Mine',giver:'borin',minLevel:4,prerequisites:['broken_seal'],
    summary:'Borin needs rich ore and a star-iron core from the abandoned mine.',
    stages:[
      {text:'Ask Borin about his unfinished masterwork.',type:'talk',target:'borin',count:1},
      {text:'Defeat 3 Lantern Mine Stalkers.',type:'kill',target:'mine_stalker',count:3},
      {text:'Gather 4 pieces of Rich Iron Ore.',type:'collect',target:'iron_ore',count:4},
      {text:'Defeat the Star-Iron Troll.',type:'kill',target:'stone_troll',count:1},
      {text:'Recover the Star-Iron Core.',type:'collect',target:'masterwork_core',count:1},
      {text:'Return to Borin.',type:'return',target:'borin',count:1}
    ],consume:[{id:'iron_ore',count:4},{id:'masterwork_core',count:1}],reward:{xp:380,gold:140,items:['starforged_gauntlets','lantern_guard_blade']}
  },
  arcane_resonance:{
    id:'arcane_resonance',name:'Resonance of Fallen Stars',giver:'selene',minLevel:5,
    summary:'Selene believes the old mine contains crystals capable of holding star-magic.',
    stages:[
      {text:'Speak with Selene in the arcane shop.',type:'talk',target:'selene',count:1},
      {text:'Collect 3 Ember Crystals.',type:'collect',target:'ember_crystal',count:3},
      {text:'Return the crystals to Selene.',type:'return',target:'selene',count:1}
    ],consume:[{id:'ember_crystal',count:3}],reward:{xp:300,gold:110,items:['starfall_focus','moonweave_robe']}
  },
  heart_of_cinders:{
    id:'heart_of_cinders',name:'Heart of Cinders',giver:'mira',minLevel:6,prerequisites:['fog_lanterns','broken_seal'],
    summary:'The Ember Warden is awakening beneath the Ashen Crypt.',
    stages:[
      {text:'Learn what stirs beneath the crypt.',type:'talk',target:'mira',count:1},
      {text:'Defeat the Ember Warden.',type:'kill',target:'ember_warden',count:1},
      {text:'Return to Haven.',type:'return',target:'mira',count:1}
    ],reward:{xp:520,gold:220,items:['ashward_plate','ashward_helm','ashward_greaves','cinder_cape']}
  }
};
