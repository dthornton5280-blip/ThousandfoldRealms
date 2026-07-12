/* Thousandfold Realms v1.5.4-dev — final regional geography coordinates. */
(() => {
  'use strict';
  if (!window.AO || !AO.ATLAS_LOCATIONS) return;
  const positions={
    haven:[13,56],
    whisperwood:[25,50],
    lantern_mine:[28,24],
    ashen_crypt:[40,43],
    southwood_trail:[39,56],
    mosswater_crossing:[58,60],
    ambermeadow:[67,62],
    eastwatch_approach:[75,57],
    lantern_road:[82,51],
    aurelia:[89,45]
  };
  for(const [id,[x,y]] of Object.entries(positions)){
    const location=AO.ATLAS_LOCATIONS[id];
    if(location){location.x=x;location.y=y;}
  }
})();
