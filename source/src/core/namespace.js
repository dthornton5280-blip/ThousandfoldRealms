window.AO = window.AO || {};
AO.VERSION = '1.4.4-thousandfold-realms-brand-migration';
AO.CONFIG = {
  tile: 32,
  mapWidth: 30,
  mapHeight: 18,
  saveKey: 'thousandfold_realms_modular_save_v2',
  legacySaveKeys: [['ashen','oath','modular','save','v2'].join('_')],
  tickMs: 105,
  maxLevel: 12
};
AO.EQUIPMENT_SLOTS = [
  'weapon','offhand','head','chest','hands','legs','feet','cloak','belt','amulet','ring1','ring2'
];
AO.Events = class {
  constructor(){ this.listeners = {}; }
  on(name, fn){ (this.listeners[name] ||= []).push(fn); return () => this.off(name, fn); }
  off(name, fn){ this.listeners[name] = (this.listeners[name] || []).filter(x => x !== fn); }
  emit(name, payload){ for(const fn of this.listeners[name] || []) fn(payload); }
};
AO.events = new AO.Events();
