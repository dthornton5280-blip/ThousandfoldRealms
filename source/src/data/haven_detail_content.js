/* Thousandfold Realms v1.6.3-dev — final art tags and portrait roles for Haven. */
(() => {
  'use strict';
  if(!window.AO||!AO.MAP_DEFS)return;
  const object=(mapId,id)=>AO.MAP_DEFS?.[mapId]?.objects?.find(entry=>entry.id===id);
  const patch=(mapId,id,values)=>{const entry=object(mapId,id);if(entry)Object.assign(entry,values);};

  patch('chapel','chapel_statue_1',{name:'Lantern-Bearer Statue',artId:'lantern_statue',description:'A weathered traveler shelters a stone lantern against an unseen wind.'});
  patch('chapel','chapel_statue_2',{name:'Lantern-Bearer Statue',artId:'lantern_statue',description:'The second figure faces the first across the nave, hands open beneath its light.'});
  patch('forge','forge_anvil_main',{description:'Borin’s main anvil carries shallow guide marks for blades, hinges, and warded fittings.'});
  patch('forge','weapon_rack',{description:'Finished weapons wait beneath chalk tags naming their owners and final repairs.'});
  patch('forge','forge_weaponrack_1',{description:'Damaged blades and bent tools hang here until Borin approves the work.'});

  const roles={
    mira:'char_warden_1',mara:'char_apothecary_1',borin:'char_smith_1',selene:'char_mage_1',odo:'char_cleric_1',
    nessa:'char_tailor_1',jory:'char_jeweler_1',elowen:'char_innkeeper_1',bran:'char_tavernkeeper_1',lys:'char_bard_1'
  };
  for(const [id,role] of Object.entries(roles))if(AO.NPCS?.[id]){
    AO.NPCS[id].visual.portraitRole=role;
    AO.NPCS[id].visual.artFrames=[role,`${role.replace(/_1$/,'')}_2`];
  }
  const ambientRoles={town_courier:'char_courier_1',town_sweeper:'char_keeper_1',inn_guest:'char_patron_1',inn_attendant:'char_server_1',store_shopper:'char_traveler_1',forge_apprentice:'char_smith_2',arcane_scholar:'char_scholar_1',chapel_pilgrim:'char_pilgrim_1'};
  for(const [id,role] of Object.entries(ambientRoles))if(AO.AMBIENT_ACTORS?.[id]){
    AO.AMBIENT_ACTORS[id].visual.portraitRole=role;
    AO.AMBIENT_ACTORS[id].visual.artFrames=[role,`${role.replace(/_1$/,'')}_2`];
  }
})();
