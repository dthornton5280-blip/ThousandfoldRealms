/* Thousandfold Realms v1.6.2-dev — coherent Black Lantern Tavern composition. */
(() => {
  'use strict';
  if(!window.AO||!AO.MAP_DEFS?.tavern||!AO.MapBuilders)return;

  const footprint=(w,h=1)=>Array.from({length:h},(_,y)=>Array.from({length:w},(_,x)=>({x,y}))).flat();
  const map=AO.MAP_DEFS.tavern;
  const object=id=>map.objects?.find(entry=>entry.id===id);
  const place=(id,x,y,values={})=>{const entry=object(id);if(entry)Object.assign(entry,{x,y,...values});return entry;};

  /* Keep the entrance and centre aisle readable while grouping the room into
     bar, stage, dining, hearth, service, and cellar zones. */
  AO.MapBuilders.tavern=function(){
    const grid=this.room('woodfloor');
    this.rect(grid,21,2,7,3,'stage');
    this.rect(grid,5,11,8,4,'rug');
    this.rect(grid,16,7,5,4,'rug');
    return grid;
  };

  /* North-west service wall and working bar. */
  place('tavern_shelf_mugs',3,1,{artAnchor:'topLeft',artW:96,artH:56,collisionFootprint:footprint(3,1)});
  place('tavern_bar',3,3,{artAnchor:'topLeft',artW:128,artH:64,collisionFootprint:footprint(4,1)});
  place('tavern_serving_counter',7,3,{artAnchor:'topLeft',artW:96,artH:64,collisionFootprint:footprint(3,1)});
  place('job_board',11,1,{blocking:false,artAnchor:'topLeft',artW:64,artH:48,interactionFootprint:footprint(2,2)});
  place('tavern_keg_1',3,6,{artAnchor:'topLeft',artW:96,artH:48,collisionFootprint:footprint(3,1)});
  place('tavern_keg_2',6,6,{artAnchor:'topLeft',artW:32,artH:40,collisionFootprint:footprint(1,1)});
  place('tavern_prep_table',8,6,{artAnchor:'topLeft',artW:64,artH:48,collisionFootprint:footprint(2,1)});
  place('tavern_cookpot',10,6,{artAnchor:'topLeft',artW:32,artH:40,collisionFootprint:footprint(1,1)});
  place('tavern_wall_sign',1,3,{blocking:false,artAnchor:'topLeft',artW:40,artH:56});

  /* North-east performance corner and backstage cache. */
  place('tavern_stage',22,2,{artAnchor:'topLeft',artW:96,artH:64,collisionFootprint:footprint(3,2)});
  place('tavern_stage_lamp_1',22,4,{blocking:false,artAnchor:'topLeft',artW:64,artH:48});
  place('tavern_stage_lamp_2',26,4,{blocking:false,artAnchor:'topLeft',artW:64,artH:48});
  place('tavern_cache',27,7);
  place('tavern_herbs',17,2,{blocking:false,artAnchor:'topLeft',artW:64,artH:32});

  /* Three believable dining clusters around a two-tile-wide centre aisle. */
  place('tavern_table_1',6,8,{artAnchor:'topLeft',artW:64,artH:48,collisionFootprint:footprint(2,1)});
  place('tavern_bench_1',6,10,{artAnchor:'topLeft',artW:64,artH:32,collisionFootprint:footprint(2,1)});
  place('tavern_table_2',17,8,{artAnchor:'topLeft',artW:64,artH:48,collisionFootprint:footprint(2,1)});
  place('tavern_bench_2',17,10,{artAnchor:'topLeft',artW:64,artH:32,collisionFootprint:footprint(2,1)});
  place('tavern_table_3',22,9,{artAnchor:'topLeft',artW:56,artH:48,collisionFootprint:footprint(2,1)});
  place('tavern_bench_3',22,11,{artAnchor:'topLeft',artW:64,artH:32,collisionFootprint:footprint(2,1)});
  place('tavern_table_candles',18,9,{blocking:false,artAnchor:'topLeft',artW:48,artH:32});

  /* Hearth-side common table. Its collision now matches its full visible depth. */
  place('tavern_fire',2,12,{artAnchor:'topLeft',artW:64,artH:64,collisionFootprint:footprint(2,2)});
  place('tavern_long_table',6,12,{artAnchor:'topLeft',artW:192,artH:64,collisionFootprint:footprint(6,2)});

  /* Keep the eastern service passage and cellar approach open. */
  place('tavern_supply_crates',24,14,{artAnchor:'topLeft',artW:32,artH:32,collisionFootprint:footprint(1,1)});
  place('cellar_door',27,14,{artAnchor:'bottomCenter',artW:48,artH:64,interactionFootprint:{left:0,right:0,up:1,down:0}});

  /* Named residents and ambient routes now begin on clear floor beside the
     furniture they logically use, never inside its collision footprint. */
  if(AO.NPCS?.bran)Object.assign(AO.NPCS.bran,{x:7,y:5});
  if(AO.NPCS?.lys)Object.assign(AO.NPCS.lys,{x:18,y:7});
  if(AO.AMBIENT_ACTORS?.tavern_patron_1)Object.assign(AO.AMBIENT_ACTORS.tavern_patron_1,{x:9,y:9,route:[[9,9],[10,9],[10,10],[9,10]]});
  if(AO.AMBIENT_ACTORS?.tavern_patron_2)Object.assign(AO.AMBIENT_ACTORS.tavern_patron_2,{x:24,y:6,route:[[23,6],[24,6],[25,6],[24,6]]});

  /* Dialogue busts use explicit occupations rather than guessing from the
     small top-down sprite family assigned to each resident. */
  const portraitRoles={bran:'tavernkeeper',lys:'bard',elowen:'innkeeper',mara:'apothecary',borin:'smith',selene:'mage',odo:'cleric',mira:'warden',nessa:'tailor',jory:'jeweler'};
  for(const [id,role] of Object.entries(portraitRoles))if(AO.NPCS?.[id]?.visual)AO.NPCS[id].visual.portraitRole=role;
  const ambientRoles={tavern_patron_1:'patron',tavern_patron_2:'bard',inn_guest:'patron',inn_attendant:'innkeeper',store_shopper:'traveler',forge_apprentice:'smith',arcane_scholar:'mage'};
  for(const [id,role] of Object.entries(ambientRoles))if(AO.AMBIENT_ACTORS?.[id]?.visual)AO.AMBIENT_ACTORS[id].visual.portraitRole=role;

  if(AO.MAP_LANDMARKS?.tavern)AO.MAP_LANDMARKS.tavern=[
    {x:6,y:4,label:'Black Lantern Bar',kind:'service'},
    {x:24,y:3,label:'Festival Stage',kind:'stage'},
    {x:9,y:12,label:'Common Table',kind:'rooms'},
    {x:27,y:14,label:'Cellar Stairs',kind:'stairs'}
  ];

  map.composition={version:'v162',entranceAisle:{x1:12,x2:16,y1:7,y2:16},zones:['bar','stage','dining','hearth','service','cellar']};
})();

/* v1.6.7 collision and tactical repair remains isolated and cache-busted. */
(() => {
  'use strict';
  if(typeof document==='undefined'||document.querySelector('script[data-tfr-runtime-v167]'))return;
  const script=document.createElement('script');
  script.src='src/render/runtime_repairs_v167.js?v=167';
  script.async=false;
  script.dataset.tfrRuntimeV167='true';
  document.head.appendChild(script);
})();
