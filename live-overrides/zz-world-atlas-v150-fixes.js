/* Thousandfold Realms v1.5.0-dev — Living Atlas integration fixes. */
(() => {
  'use strict';
  if (!window.AO || !AO.Game || !AO.MapBuilders) return;

  /* Atlas travel is initiated from the open map panel. Temporarily return to
     exploration mode so the core travel method can close the panel, load the
     destination, and preserve its normal safety checks. */
  const atlasTravel = AO.Game.prototype.atlasTravel;
  if (typeof atlasTravel === 'function') {
    AO.Game.prototype.atlasTravel = function atlasTravelFromPanel(locationId) {
      const openedFromPanel = this.state?.mode === 'panel';
      if (openedFromPanel) this.state.mode = 'explore';
      const result = atlasTravel.call(this, locationId);
      if (!result && openedFromPanel && this.state) this.state.mode = 'panel';
      return result;
    };
  }

  /* Continue the authored southern Whisperwood trail all the way from the
     east-west road to the new Lantern Road portal. */
  const wildsBuilder = AO.MapBuilders.wilds;
  if (typeof wildsBuilder === 'function') {
    AO.MapBuilders.wilds = function livingAtlasContinuousSouthTrail() {
      const grid = wildsBuilder.call(this);
      for (let y = 10; y < AO.CONFIG.mapHeight; y++) grid[y][24] = 'path';
      return grid;
    };
  }
})();
