/* Thousandfold Realms v1.4.6-dev — title scene and title-menu wiring */
(() => {
  if (window.__TF_TITLE_V146__) return;
  window.__TF_TITLE_V146__ = true;

  const titleMarkup = `
    <div id="tfTitleScreen" class="screen">
      <div class="tf-title-ambience" aria-hidden="true">
        <span class="tf-title-starfield"></span>
        <span class="tf-title-fog tf-title-fog-a"></span>
        <span class="tf-title-fog tf-title-fog-b"></span>
        <span class="tf-title-runes"></span>
        <span class="tf-title-sparks"></span>
        <span class="tf-title-lantern"></span>
        <span class="tf-title-lantern tf-title-lantern-right"></span>
        <span class="tf-title-horizon"></span>
        <span class="tf-title-silhouette"></span>
      </div>
      <div class="tf-title-shell">
        <section class="tf-title-copy">
          <p class="tf-title-eyebrow">PIXEL CRPG • TACTICAL FANTASY • PERSISTENT JOURNEY</p>
          <h1 class="tf-title-logo">THOUSANDFOLD REALMS</h1>
          <p class="tf-title-tagline">A lantern-lit oath. A thousand roads. One hero against the dark between worlds.</p>
          <div class="tf-title-feature-row">
            <span>Explore living towns</span>
            <span>Fight tactical battles</span>
            <span>Forge your own legend</span>
          </div>
        </section>
        <section class="tf-title-menu">
          <div class="tf-title-menu-header">
            <p class="tf-title-eyebrow">ADVENTURER'S GATE</p>
            <h2>Choose your path</h2>
            <p>Begin a new saga, shape a hero, or return to your last lantern-lit save.</p>
          </div>
          <div class="tf-title-menu-buttons">
            <button id="tfTitleStart" class="tf-title-primary">Start Game</button>
            <button id="tfTitleNew">Create New Character</button>
            <button id="tfTitleLoad">Load Game</button>
          </div>
          <div class="tf-title-continue-wrap">
            <button id="tfTitleContinue" class="tf-title-continue">Continue Game</button>
            <small id="tfTitleSaveHint">Continue from your latest save.</small>
          </div>
        </section>
      </div>
    </div>`;

  function insertTitleMarkup() {
    if (document.getElementById('tfTitleScreen')) return;
    const creator = document.getElementById('creator');
    if (!creator) return;
    creator.insertAdjacentHTML('beforebegin', titleMarkup);
    creator.classList.add('hidden');

    const header = creator.querySelector('.creator-header');
    if (header && !document.getElementById('tfBackToTitle')) {
      const oldContinue = document.getElementById('continueBtn');
      const actions = document.createElement('div');
      actions.className = 'tf-creator-header-actions';
      const back = document.createElement('button');
      back.id = 'tfBackToTitle';
      back.className = 'secondary';
      back.textContent = 'Back to Title';
      if (oldContinue) {
        oldContinue.parentNode.insertBefore(actions, oldContinue);
        actions.append(back, oldContinue);
      } else {
        header.append(actions);
        actions.append(back);
      }
    }
  }

  function patchUi() {
    if (!window.AO?.UI || AO.UI.prototype.__tfTitlePatched) return;
    const proto = AO.UI.prototype;
    proto.__tfTitlePatched = true;

    proto.tfRefreshTitleState = function () {
      const hasSave = !!AO.SaveManager?.exists?.();
      const load = document.getElementById('tfTitleLoad');
      const cont = document.getElementById('tfTitleContinue');
      const hint = document.getElementById('tfTitleSaveHint');
      if (load) load.disabled = !hasSave;
      if (cont) cont.disabled = !hasSave;
      if (hint) hint.textContent = hasSave
        ? 'Continue from your latest save.'
        : 'No save found yet — begin a new journey first.';
      if (this.e?.continueBtn) this.e.continueBtn.classList.toggle('hidden', !hasSave);
    };

    proto.tfShowTitle = function () {
      this.tfRefreshTitleState();
      document.getElementById('creator')?.classList.add('hidden');
      document.getElementById('gameScreen')?.classList.add('hidden');
      document.getElementById('tfTitleScreen')?.classList.remove('hidden');
      document.body.classList.add('tf-title-mode');
      this.game?.audio?.applyVolume?.();
    };

    proto.tfShowCreator = function (reset = false) {
      if (reset) {
        this.selectedRace = 'human';
        this.selectedRaceGroup = 'all';
        this.selectedClass = 'vanguard';
        this.selectedBackground = 'outlander';
        this.creatorAppearance = {
          hairColor: '#29252a', eyeColor: '#65a8cf', accentColor: '#557a96',
          hairStyle: 'natural', frame: 'standard', mark: 'none'
        };
        this.creatorStats = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };
        if (this.e?.heroName) this.e.heroName.value = 'Alden';
        this.renderCreator?.();
      }
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
      document.getElementById('tfTitleStart')?.addEventListener('click', () => this.tfShowCreator(false));
      document.getElementById('tfTitleNew')?.addEventListener('click', () => this.tfShowCreator(true));
      document.getElementById('tfTitleLoad')?.addEventListener('click', () => this.game.loadGame());
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
