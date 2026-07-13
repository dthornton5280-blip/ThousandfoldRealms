window.addEventListener('DOMContentLoaded',async()=>{
  /* Load the exact user-provided prop runtime only after every canonical renderer,
     map definition, and world system has been evaluated. */
  await new Promise(resolve=>{
    const script=document.createElement('script');
    script.src='src/render/prop_furniture_runtime_v1612.js?v=1612';
    script.async=false;
    script.dataset.tfrExactPropsV1612='true';
    script.onload=resolve;
    script.onerror=()=>{
      document.documentElement.dataset.tfrProps='failed';
      console.error('Thousandfold Realms exact prop runtime script failed to load.');
      resolve();
    };
    document.head.appendChild(script);
  });

  /* Build the first map only after the exact atlas is ready or has explicitly failed. */
  const started=Date.now();
  while(AO.PropFurnitureArtV1612&&!AO.PropFurnitureArtV1612.ready&&!AO.PropFurnitureArtV1612.failed&&Date.now()-started<5000){
    await new Promise(resolve=>setTimeout(resolve,25));
  }

  window.game=new AO.Game();
  game.start();

  if(!AO.PropFurnitureArtV1612?.ready){
    setTimeout(()=>game.toast?.('Exact prop assets did not load. Check the browser console for the recorded atlas error.'),150);
  }
});
