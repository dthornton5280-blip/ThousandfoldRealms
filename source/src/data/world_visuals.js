/* Thousandfold Realms v1.4.1 — authored exterior presentation, integrated doors, and quiet labels. */
AO.BUILDING_STYLES = {
  inn:{name:'The Lantern Rest',short:'INN',style:'inn',subtitle:'Rooms • Meals • Rest',accent:'#e8bd66',doorFrame:{x:3.48,y:3.18,w:1.08,h:1.74}},
  arcane:{name:'Selene’s Arcana',short:'ARCANA',style:'arcane',subtitle:'Spells • Relics • Scrolls',accent:'#9ed9e5',doorFrame:{x:3.48,y:3.15,w:1.08,h:1.77}},
  tavern:{name:'The Black Lantern',short:'TAVERN',style:'tavern',subtitle:'Contracts • Rumors • Ale',accent:'#e7af62',doorFrame:{x:3.48,y:3.17,w:1.08,h:1.75}},
  provisions:{name:'Mara’s Provisions',short:'PROVISIONS',style:'provisions',subtitle:'Remedies • Supplies • Food',accent:'#b7d27f',doorFrame:{x:3.48,y:3.17,w:1.08,h:1.75}},
  chapel:{name:'Chapel of the Last Light',short:'CHAPEL',style:'chapel',subtitle:'Healing • Blessings • Lore',accent:'#f0d783',doorFrame:{x:3.48,y:3.17,w:1.08,h:1.75}},
  forge:{name:'Borin’s Forge',short:'FORGE',style:'forge',subtitle:'Weapons • Armor • Repairs',accent:'#e3a069',doorFrame:{x:3.48,y:3.17,w:1.08,h:1.75}}
};

if(AO.MAP_DEFS?.haven){
  AO.MAP_DEFS.haven.buildings=[
    {id:'haven_inn',x:2,y:2,w:8,h:5,doorId:'door_inn',...AO.BUILDING_STYLES.inn},
    {id:'haven_arcane',x:11,y:2,w:8,h:5,doorId:'door_arcane',...AO.BUILDING_STYLES.arcane},
    {id:'haven_tavern',x:20,y:2,w:8,h:5,doorId:'door_tavern',...AO.BUILDING_STYLES.tavern},
    {id:'haven_store',x:2,y:11,w:8,h:5,doorId:'door_store',...AO.BUILDING_STYLES.provisions},
    {id:'haven_chapel',x:11,y:11,w:8,h:5,doorId:'door_chapel',...AO.BUILDING_STYLES.chapel},
    {id:'haven_forge',x:20,y:11,w:8,h:5,doorId:'door_forge',...AO.BUILDING_STYLES.forge}
  ];

  /* Preserve door IDs while moving the three south-row interaction anchors into
     the actual rendered doorways. Existing saves continue to reference the same IDs. */
  const exteriorDoorPositions={door_inn:[6,6],door_arcane:[15,6],door_tavern:[24,6],door_store:[6,15],door_chapel:[15,15],door_forge:[24,15]};
  for(const object of AO.MAP_DEFS.haven.objects||[]){
    const pos=exteriorDoorPositions[object.id];
    if(pos){object.x=pos[0];object.y=pos[1];object.integratedBuildingDoor=true;object.autoClose=true;}
  }
  const returnPositions={store_exit:[6,16],chapel_exit:[15,16],forge_exit:[24,16]};
  for(const map of Object.values(AO.MAP_DEFS))for(const object of map.objects||[]){
    const pos=returnPositions[object.id];if(pos){object.toX=pos[0];object.toY=pos[1];}
    if(object.type==='door')object.autoClose??=true;
  }
}

AO.UI_LABELS = {
  npcNamesNearby:true,
  npcTitlesNearby:true,
  npcNameDistance:2,
  buildingTooltips:true,
  buildingNames:false,
  enemyNamesNearby:true,
  enemyNameDistance:3
};
