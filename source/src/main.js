const startThousandfoldRealms=async()=>{
  if(window.__tfrGameStarting||window.game)return;
  window.__tfrGameStarting=true;
  const loadRuntime=(src,datasetKey,label)=>new Promise(resolve=>{
    const script=document.createElement('script');
    let settled=false;
    const finish=()=>{if(settled)return;settled=true;window.clearTimeout(timeout);resolve();};
    const timeout=window.setTimeout(()=>{
      console.warn(`Thousandfold Realms ${label} runtime load event timed out; continuing with its recorded ready/failed state.`);
      finish();
    },3000);
    script.src=src;
    script.async=false;
    script.dataset[datasetKey]='true';
    script.onload=finish;
    script.onerror=()=>{
      console.error(`Thousandfold Realms ${label} runtime script failed to load.`);
      finish();
    };
    document.head.appendChild(script);
  });

  /* Load the exact uploaded props first, normalize their visual footprints,
     install the general ground/floor atlas, then layer the approved Haven-only
     terrain above it. */
  await loadRuntime('src/render/prop_furniture_runtime_v1612.js?v=1612','tfrExactPropsV1612','exact prop');
  await loadRuntime('src/render/prop_geometry_runtime_v1613.js?v=1613','tfrPropGeometryV1613','prop geometry');
  await loadRuntime('src/render/ground_tile_runtime_v1613.js?v=1613','tfrGroundTilesV1613','ground tile');
  await loadRuntime('src/render/haven_ground_runtime_v1614.js?v=1614','tfrHavenGroundV1614','Haven ground');
  await loadRuntime('src/render/haven_facade_runtime_v1614.js?v=1614','tfrHavenFacadesV1614','Haven facade');
  await loadRuntime('src/render/haven_interior_runtime_v1614.js?v=1614','tfrHavenInteriorsV1614','starter interior');

  /* Build the first map only after required art is ready or has explicitly failed. */
  const started=Date.now();
  while(Date.now()-started<5000){
    const propsDone=!AO.PropFurnitureArtV1612||AO.PropFurnitureArtV1612.ready||AO.PropFurnitureArtV1612.failed;
    const groundDone=!AO.GroundTileArtV1613||AO.GroundTileArtV1613.ready||AO.GroundTileArtV1613.failed;
    const havenDone=!AO.HavenGroundArtV1614||AO.HavenGroundArtV1614.ready||AO.HavenGroundArtV1614.failed;
    const facadesDone=!AO.HavenFacadeArtV1614||AO.HavenFacadeArtV1614.ready||AO.HavenFacadeArtV1614.failed;
    const interiorsDone=!AO.HavenInteriorArtV1614||AO.HavenInteriorArtV1614.ready||AO.HavenInteriorArtV1614.failed;
    if(propsDone&&groundDone&&havenDone&&facadesDone&&interiorsDone)break;
    await new Promise(resolve=>setTimeout(resolve,25));
  }

  try{
    window.game=new AO.Game();
    window.game.start();
  }catch(error){
    window.__tfrGameStarting=false;
    console.error('Thousandfold Realms failed during game startup.',error);
    throw error;
  }

  if(!AO.PropFurnitureArtV1612?.ready){
    setTimeout(()=>game.toast?.('Exact prop assets did not load. Check the browser console for the recorded atlas error.'),150);
  }else if(AO.HavenGroundArtV1614?.failed||AO.GroundTileArtV1613?.failed){
    setTimeout(()=>game.toast?.('Ground tile atlas did not load; procedural floor art is active.'),150);
  }
};

/* Script ordering is intentionally synchronous, but local servers, cached
   documents, and future bundlers may execute this file after DOMContentLoaded.
   Start immediately in that case instead of leaving the boot shield active. */
if(document.readyState==='loading'){
  window.addEventListener('DOMContentLoaded',startThousandfoldRealms,{once:true});
  /* Some embedded preview surfaces can report `loading` after their one-shot
     DOM event has already crossed the script boundary. The startup guard makes
     this zero-delay fallback safe in ordinary browsers and closes that race. */
  window.setTimeout(startThousandfoldRealms,0);
}else{
  startThousandfoldRealms();
}
