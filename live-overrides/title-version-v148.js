/* Thousandfold Realms — title build label sourced from canonical version.json. */
(() => {
  const label=document.querySelector('.tf-title-version');
  if(!label)return;
  label.textContent='Current development build';
  fetch('./version.json',{cache:'no-store'})
    .then(response=>{
      if(!response.ok)throw new Error(`version metadata ${response.status}`);
      return response.json();
    })
    .then(metadata=>{
      if(metadata?.version)label.textContent=`v${metadata.version}`;
    })
    .catch(error=>console.warn('Could not read the canonical title version; using the development label.',error));
})();
