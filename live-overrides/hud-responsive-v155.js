/* Thousandfold Realms v1.5.5-dev — adaptive, selective, persistent exploration HUD. */
(() => {
  'use strict';
  if (!window.AO || !AO.UI) return;

  const STORAGE_KEY = 'tf-hud-layout-v155';
  const MODES = ['full', 'compact', 'hidden'];
  const SECTION_KEYS = ['status', 'map', 'objective', 'hints'];

  const defaultState = () => ({
    mode: (window.innerWidth < 1360 || window.innerHeight < 820) ? 'compact' : 'full',
    sections: {
      status: true,
      map: window.innerWidth >= 760,
      objective: true,
      hints: true
    }
  });

  const normalizeState = value => {
    const fallback = defaultState();
    const state = value && typeof value === 'object' ? value : {};
    const sections = state.sections && typeof state.sections === 'object' ? state.sections : {};
    return {
      mode: MODES.includes(state.mode) ? state.mode : fallback.mode,
      sections: Object.fromEntries(SECTION_KEYS.map(key => [key, typeof sections[key] === 'boolean' ? sections[key] : fallback.sections[key]]))
    };
  };

  const loadState = () => {
    try {
      return normalizeState(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'));
    } catch (_) {
      return defaultState();
    }
  };

  const saveState = state => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  };

  const modeLabel = mode => mode === 'full' ? 'Full' : mode === 'hidden' ? 'Hidden' : 'Compact';

  const originalBuildImmersiveHud = AO.UI.prototype.buildImmersiveHud;
  AO.UI.prototype.buildImmersiveHud = function responsiveImmersiveHud() {
    if (typeof originalBuildImmersiveHud === 'function') originalBuildImmersiveHud.call(this);

    const hud = document.querySelector('.hud');
    const frame = document.querySelector('.canvas-frame');
    if (!hud || !frame || hud.dataset.responsiveHud === 'true') return;
    hud.dataset.responsiveHud = 'true';

    hud.querySelector('.immersive-hud-toggle')?.remove();

    const controls = document.createElement('div');
    controls.className = 'immersive-hud-controls';
    controls.innerHTML = `
      <button type="button" class="hud-control-trigger" aria-expanded="false" aria-controls="hudControlMenu" title="HUD layout controls (H cycles view)">
        <span>HUD</span><small data-hud-mode-label>Compact</small>
      </button>
      <section id="hudControlMenu" class="hud-control-menu hidden" aria-label="HUD layout controls">
        <header><strong>Field View</strong><button type="button" class="hud-control-close" aria-label="Close HUD controls">×</button></header>
        <div class="hud-control-group" aria-label="HUD size">
          <span>Display</span>
          <div class="hud-mode-buttons">
            <button type="button" data-hud-mode="full">Full</button>
            <button type="button" data-hud-mode="compact">Compact</button>
            <button type="button" data-hud-mode="hidden">Hide</button>
          </div>
        </div>
        <div class="hud-control-group" aria-label="Visible HUD sections">
          <span>Visible sections</span>
          <div class="hud-section-buttons">
            <button type="button" data-hud-section="status">Vitals</button>
            <button type="button" data-hud-section="map">Map</button>
            <button type="button" data-hud-section="objective">Objective</button>
            <button type="button" data-hud-section="hints">Hints</button>
          </div>
        </div>
        <footer><span><kbd>H</kbd> cycles views</span><button type="button" data-hud-reset>Reset</button></footer>
      </section>
      <div class="hud-layout-announcement" role="status" aria-live="polite"></div>`;
    hud.append(controls);

    const trigger = controls.querySelector('.hud-control-trigger');
    const menu = controls.querySelector('.hud-control-menu');
    const close = controls.querySelector('.hud-control-close');
    const label = controls.querySelector('[data-hud-mode-label]');
    const announcement = controls.querySelector('.hud-layout-announcement');
    let state = loadState();
    let announceTimer = 0;

    const closeMenu = () => {
      menu.classList.add('hidden');
      trigger.setAttribute('aria-expanded', 'false');
    };

    const announce = text => {
      announcement.textContent = text;
      announcement.classList.add('visible');
      clearTimeout(announceTimer);
      announceTimer = setTimeout(() => announcement.classList.remove('visible'), 1200);
    };

    const updateNearbyState = () => {
      const nearby = hud.querySelector('.nearby-prompt');
      const text = nearby?.textContent?.trim() || '';
      const inactive = !text || /move near something to interact/i.test(text);
      hud.classList.toggle('hud-nearby-active', !inactive);
    };

    const applyState = ({persist = true, speak = false} = {}) => {
      state = normalizeState(state);
      hud.classList.remove('hud-collapsed');
      hud.dataset.hudMode = state.mode;
      frame.dataset.hudMode = state.mode;
      for (const key of SECTION_KEYS) {
        const visible = state.sections[key];
        hud.classList.toggle(`hud-${key}-hidden`, !visible);
        if (key === 'hints') frame.classList.toggle('hud-hints-hidden', !visible);
        const button = controls.querySelector(`[data-hud-section="${key}"]`);
        if (button) {
          button.classList.toggle('active', visible);
          button.setAttribute('aria-pressed', String(visible));
        }
      }
      for (const button of controls.querySelectorAll('[data-hud-mode]')) {
        const active = button.dataset.hudMode === state.mode;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      }
      label.textContent = modeLabel(state.mode);
      trigger.setAttribute('aria-label', `HUD view: ${modeLabel(state.mode)}. Open layout controls.`);
      updateNearbyState();
      if (persist) saveState(state);
      if (speak) announce(`HUD ${modeLabel(state.mode).toLowerCase()} view`);
    };

    const setMode = mode => {
      state.mode = MODES.includes(mode) ? mode : 'compact';
      applyState({speak: true});
    };

    const cycleMode = () => {
      const index = MODES.indexOf(state.mode);
      setMode(MODES[(index + 1) % MODES.length]);
    };

    trigger.onclick = event => {
      event.stopPropagation();
      const open = menu.classList.toggle('hidden') === false;
      trigger.setAttribute('aria-expanded', String(open));
    };
    close.onclick = closeMenu;

    for (const button of controls.querySelectorAll('[data-hud-mode]')) {
      button.onclick = () => setMode(button.dataset.hudMode);
    }

    for (const button of controls.querySelectorAll('[data-hud-section]')) {
      button.onclick = () => {
        const key = button.dataset.hudSection;
        state.sections[key] = !state.sections[key];
        if (state.sections[key] && state.mode === 'hidden') state.mode = 'compact';
        applyState();
      };
    }

    controls.querySelector('[data-hud-reset]').onclick = () => {
      state = defaultState();
      applyState({speak: true});
    };

    controls.addEventListener('click', event => event.stopPropagation());
    document.addEventListener('click', closeMenu);
    window.addEventListener('keydown', event => {
      const tag = document.activeElement?.tagName;
      if (event.key === 'Escape' && !menu.classList.contains('hidden')) {
        closeMenu();
        return;
      }
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key.toLowerCase() !== 'h' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (!window.game?.state || window.game.state.mode !== 'explore') return;
      event.preventDefault();
      cycleMode();
    });

    const nearby = hud.querySelector('.nearby-prompt');
    if (nearby && window.MutationObserver) new MutationObserver(updateNearbyState).observe(nearby, {childList: true, characterData: true, subtree: true});

    applyState({persist: false});
  };
})();
