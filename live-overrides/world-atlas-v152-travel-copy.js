/* Thousandfold Realms v1.5.2-dev — explicit visited-only travel feedback. */
(() => {
  'use strict';
  if (!window.AO || !AO.Game || typeof AO.Game.prototype.atlasTravel !== 'function') return;
  const atlasTravel = AO.Game.prototype.atlasTravel;
  AO.Game.prototype.atlasTravel = function atlasTravelWithExplorationRequirement(locationId) {
    if (!this.state?.atlas?.visitedLocations?.[locationId]) {
      this.toast('You must physically reach that destination before fast travel becomes available.');
      return false;
    }
    return atlasTravel.call(this, locationId);
  };
})();
