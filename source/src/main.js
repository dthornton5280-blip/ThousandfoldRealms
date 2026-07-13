window.addEventListener('DOMContentLoaded',async()=>{
  const loadRuntime=(src,datasetKey,label)=>new Promise(resolve=>{
    const script=document.createElement('script');
    script.src=src;
    script.async=false;
    script.dataset[datasetKey]='true';
    script.onload=resolve;
    script.onerror=()=>{
      console.error(`Thousandfold Realms ${label} runtime script failed to load.`);
      resolve();
    };
    document.head.appendChild(script);
  });

  /* Load the exact uploaded props first, then normalize their visual footprints,
     then install the game-ready 32px ground/floor atlas. */
  await loadRuntime('src/render/prop_furniture_runtime_v1612.js?v=1612','tfrExactPropsV1612','exact prop');
  await loadRuntime('src/render/prop_geometry_runtime_v1613.js?v=1613','tfrPropGeometryV1613','prop geometry');
  await loadRuntime('src/render/ground_tile_runtime_v1613.js?v=1613','tfrGroundTilesV1613','ground tile');

  /* Build the first map only after required art is ready or has explicitly failed. */
  const started=Date.now();
  while(Date.now()-started<5000){
    const propsDone=!AO.PropFurnitureArtV1612||AO.PropFurnitureArtV1612.ready||AO.PropFurnitureArtV1612.failed;
    const groundDone=!AO.GroundTileArtV1613||AO.GroundTileArtV1613.ready||AO.GroundTileArtV1613.failed;
    if(propsDone&&groundDone)break;
    await new Promise(resolve=>setTimeout(resolve,25));
  }

  window.game=new AO.Game();
  game.start();

  if(!AO.PropFurnitureArtV1612?.ready){
    setTimeout(()=>game.toast?.('Exact prop assets did not load. Check the browser console for the recorded atlas error.'),150);
  }else if(AO.GroundTileArtV1613?.failed){
    setTimeout(()=>game.toast?.('Ground tile atlas did not load; procedural floor art is active.'),150);
  }
});