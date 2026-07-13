window.addEventListener('DOMContentLoaded',async()=>{
  /* Load the approved prop/furniture runtime only after the canonical renderer,
     systems, and map definitions exist. Earlier data-file injection could execute
     before SpriteFactory and WorldSystem were ready, leaving the live game on
     fallback art even though the bindings and tests existed. */
  await new Promise(resolve=>{
    const script=document.createElement('script');
    script.src='src/render/prop_furniture_runtime_v169.js?v=1611';
    script.async=false;
    script.dataset.tfrPropFurnitureV1611='true';
    script.onload=resolve;
    script.onerror=()=>{console.warn('Thousandfold Realms prop runtime failed to load; fallback art remains active.');resolve();};
    document.head.appendChild(script);
  });

  /* Do not construct the first map while the approved atlas is still decoding.
     A bounded wait preserves startup even if the asset request genuinely fails. */
  const started=Date.now();
  while(AO.PropFurnitureArtV1611&&!AO.PropFurnitureArtV1611.ready&&!AO.PropFurnitureArtV1611.failed&&Date.now()-started<5000){
    await new Promise(resolve=>setTimeout(resolve,25));
  }

  window.game=new AO.Game();
  game.start();
});
