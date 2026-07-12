AO.SPELLS = {
  arc_bolt:{id:'arc_bolt',name:'Arc Bolt',level:1,cost:2,resource:'mana',target:'enemy',kind:'spell',power:1.2,stat:'int',element:'arcane',icon:'✧',description:'A reliable bolt of arcane force.'},
  frost_bind:{id:'frost_bind',cooldown:2,name:'Frost Bind',level:1,cost:3,resource:'mana',target:'enemy',kind:'spell',power:.9,stat:'int',status:'snared',element:'frost',icon:'❄',description:'Cold damage that hinders the enemy.'},
  ember_orb:{id:'ember_orb',cooldown:2,name:'Ember Orb',level:3,cost:5,resource:'mana',target:'enemy',kind:'spell',power:1.65,stat:'int',status:'burning',element:'fire',icon:'●',description:'A volatile sphere of fire.'},
  chain_lightning:{id:'chain_lightning',cooldown:3,name:'Chain Lightning',level:5,cost:8,resource:'mana',target:'enemy',kind:'spell',power:2.35,stat:'int',element:'storm',icon:'ϟ',description:'A master spell of violent lightning.'}
};
Object.assign(AO.ABILITIES, AO.SPELLS);
Object.assign(AO.ABILITIES, {
  mirror_ward:{id:'mirror_ward',name:'Mirror Ward',level:7,cost:5,resource:'mana',target:'self',kind:'defend',amount:14,cooldown:2,icon:'◇',description:'Split incoming force across a lattice of mirrored air.'},
  meteor_shard:{id:'meteor_shard',name:'Meteor Shard',level:9,cost:8,resource:'mana',target:'enemy',kind:'spell',power:2.6,stat:'int',status:'burning',element:'fire',cooldown:3,icon:'☄',description:'Call down a fragment of burning sky.'},
  time_break:{id:'time_break',name:'Time Break',level:12,cost:11,resource:'mana',target:'enemy',kind:'spell',power:3.25,stat:'int',status:'weakened',element:'arcane',cooldown:4,icon:'⌛',description:'Shatter a second of time around the target.'}
});
