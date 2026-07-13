(() => {
  'use strict';

  const body = document.body;
  const boot = document.getElementById('tfBootScreen');
  if (!body || !boot) return;

  const visibleScreen = () => {
    const ids = ['tfTitleScreen', 'creator', 'gameScreen'];
    return ids.some(id => {
      const element = document.getElementById(id);
      return element && !element.classList.contains('hidden');
    });
  };

  const release = () => {
    if (!visibleScreen()) {
      requestAnimationFrame(release);
      return;
    }

    body.classList.remove('tf-booting');
    document.documentElement.dataset.tfReady = 'true';
    boot.hidden = true;
  };

  const failOpen = () => {
    if (!body.classList.contains('tf-booting')) return;
    const copy = boot.querySelector('.tf-boot-copy');
    if (copy) copy.textContent = 'The realm is taking longer than expected';
  };

  window.setTimeout(failOpen, 5000);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', release, { once: true });
  } else {
    release();
  }
})();
