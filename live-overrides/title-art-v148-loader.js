/* Thousandfold Realms v1.4.8-dev — generated title artwork loader. */
(() => {
  const parts = window.__TF_TITLE_ART_PARTS__;
  if (!Array.isArray(parts) || parts.length !== 5 || parts.some(part => typeof part !== 'string' || !part.length)) {
    console.error('Thousandfold Realms title artwork did not load completely.');
    return;
  }
  const encoded = parts.join('');
  if (encoded.length !== 39540 || !encoded.startsWith('UklG')) {
    console.error('Thousandfold Realms title artwork failed integrity validation.');
    return;
  }
  document.documentElement.style.setProperty('--tf-title-art', `url("data:image/webp;base64,${encoded}")`);
  document.documentElement.classList.add('tf-title-art-ready');
  window.__TF_TITLE_ART_PARTS__ = null;
})();
