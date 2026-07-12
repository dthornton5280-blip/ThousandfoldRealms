/* Thousandfold Realms v1.4.7-dev — direct title flow and scenic title screen */
(() => {
  if (window.__TF_TITLE_V147__) return;
  window.__TF_TITLE_V147__ = true;

  const titleMarkup = `
    <div id="tfTitleScreen" class="screen hidden">
      <div class="tf-title-ambience" aria-hidden="true">
        <span class="tf-title-stars"></span>
        <span class="tf-title-mist tf-title-mist-a"></span>
        <span class="tf-title-mist tf-title-mist-b"></span>
        <span class="tf-title-distant-ridges"></span>
        <span class="tf-title-near-ridges"></span>
      </div>

      <main class="tf-title-shell">
        <section class="tf-title-hero">
          <div class="tf-title-brand">
            <p class="tf-title-eyebrow">A SINGLE-PLAYER PIXEL CRPG</p>
            <h1 class="tf-title-logo">
              <span>THOUSANDFOLD</span>
              <span>REALMS</span>
            </h1>
            <p class="tf-title-tagline">A lantern-lit oath. A thousand roads. One hero against the dark between worlds.</p>
          </div>

          <div class="tf-title-scene" aria-hidden="true">
            <span class="tf-title-moon"></span>
            <span class="tf-title-ruin tf-title-ruin-left"></span>
            <span class="tf-title-ruin tf-title-ruin-right"></span>
            <span class="tf-title-gate"></span>
            <span class="tf-title-road"></span>
            <span class="tf-title-pines"></span>
            <span class="tf-title-hero-silhouette"></span>
            <span class="tf-title-lantern-glow"></span>
            <span class="tf-title-lantern-post"></span>
            <span class="tf-title-embers"></span>
          </div>
        </section>

        <section class="tf-title-menu" aria-label="Main menu">
          <div class="tf-title-menu-header">
            <p class="tf-title-eyebrow">THE LAST LANTERN AWAITS</p>
            <h2>Begin your journey</h2>
            <p>Create a hero and enter the realms, or return immediately to your latest save.</p>
          </div>
          <div class="tf-title-menu-buttons">
            <button id="tfTitleStart" class="tf-title-primary">Start Game</button>
            <button id="tfTitleContinue" class="tf-title-continue">Continue Game</button>
          </div>
          <small id="tfTitleSaveHint" class="tf-title-save-hint">Checking for a saved journey…</small>
          <div class="tf-title-version">v1.4.7-dev</div>
        </section>
      </main>
    </div>`;

  function insertTitleMarkup() {
    if (document.getElementById('tfTitleScreen')) return;
    const creator = document.getElementById('creator');
    if (!creator) return;

    creator.insertAdjacentHTML('beforebegin', titleMarkup);
    creator.classList.add('hidden');

    const legacyContinue = document.getElementById('continueBtn');
    if (legacyContinue) {
      legacyContinue.classList.add('hidden');
      legacyContinue.setAttribute('aria-hidden', 'true');
      legacyContinue.tabIndex = -1;
    }

    const header = creator.querySelector('.creator-header');
    if (header && !document.getElementById('tfBackToTitle')) {
      const back = document.createElement('button');
      back.id = 'tfBackToTitle';
      back.className = 'secondary tf-back-to-title';
      back.textContent = 'Back to Title';
      header.append(back);
    }
  }

  function patchUi() {
    if (!window.AO?.UI || AO.UI.prototype.__tfTitleV147Patched) return;
    const proto = AO.UI.prototype;
    proto.__tfTitleV147Patched = true;

    proto.tfRefreshTitleState = function () {
      const hasSave = !!AO.SaveManager?.exists?.();
      const cont = document.getElementById('tfTitleContinue');
      const hint = document.getElementById('tfTitleSaveHint');
      if (cont) cont.disabled = !hasSave;
      if (hint) {
        hint.textContent = hasSave
          ? 'Continue from your latest saved journey.'
          : 'No saved journey found — choose Start Game.';
      }

      const legacyContinue = document.getElementById('continueBtn');
      if (legacyContinue) {
        legacyContinue.classList.add('hidden');
        legacyContinue.setAttribute('aria-hidden', 'true');
        legacyContinue.tabIndex = -1;
      }
    };

    proto.tfShowTitle = function () {
      this.tfRefreshTitleState();
      document.getElementById('creator')?.classList.add('hidden');
      document.getElementById('gameScreen')?.classList.add('hidden');
      document.getElementById('tfTitleScreen')?.classList.remove('hidden');
      document.body.classList.add('tf-title-mode');
      this.game?.audio?.applyVolume?.();
    };

    proto.tfResetCreator = function () {
      this.selectedRace = 'human';
      this.selectedRaceGroup = 'all';
      this.selectedClass = 'vanguard';
      this.selectedBackground = 'outlander';
      this.creatorAppearance = {
        hairColor: '#29252a',
        eyeColor: '#65a8cf',
        accentColor: '#557a96',
        hairStyle: 'natural',
        frame: 'standard',
        mark: 'none'
      };
      this.creatorStats = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };
      if (this.e?.heroName) this.e.heroName.value = 'Alden';
      this.renderCreator?.();
    };

    proto.tfShowCreator = function (reset = true) {
      if (reset) this.tfResetCreator();
      document.getElementById('tfTitleScreen')?.classList.add('hidden');
      document.getElementById('gameScreen')?.classList.add('hidden');
      document.getElementById('creator')?.classList.remove('hidden');
      document.body.classList.remove('tf-title-mode');
      this.tfRefreshTitleState();
      setTimeout(() => this.e?.heroName?.focus?.(), 0);
    };

    const originalInit = proto.init;
    proto.init = function (...args) {
      const result = originalInit.apply(this, args);
      document.getElementById('tfTitleStart')?.addEventListener('click', () => this.tfShowCreator(true));
      document.getElementById('tfTitleContinue')?.addEventListener('click', () => this.game.loadGame());
      document.getElementById('tfBackToTitle')?.addEventListener('click', () => this.tfShowTitle());
      this.tfShowTitle();
      return result;
    };

    const originalShowGame = proto.showGame;
    proto.showGame = function (...args) {
      document.getElementById('tfTitleScreen')?.classList.add('hidden');
      document.body.classList.remove('tf-title-mode');
      const result = originalShowGame.apply(this, args);
      this.tfRefreshTitleState();
      return result;
    };

    const originalBegin = proto.begin;
    proto.begin = function (...args) {
      const result = originalBegin.apply(this, args);
      this.tfRefreshTitleState();
      return result;
    };
  }

  document.addEventListener('DOMContentLoaded', () => {
    insertTitleMarkup();
    patchUi();
  }, { once: true });
})();