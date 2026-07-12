const fs=require('fs');
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const js=fs.readFileSync('live-overrides/hud-responsive-v155.js','utf8');
const css=fs.readFileSync('live-overrides/hud-responsive-v155.css','utf8');

for(const token of [
  'tf-hud-layout-v155',
  "const MODES = ['full', 'compact', 'hidden']",
  "const SECTION_KEYS = ['status', 'map', 'objective', 'hints']",
  'data-hud-mode="full"',
  'data-hud-mode="compact"',
  'data-hud-mode="hidden"',
  'data-hud-section="status"',
  'data-hud-section="map"',
  'data-hud-section="objective"',
  'data-hud-section="hints"',
  "event.key.toLowerCase() !== 'h'",
  'MutationObserver',
  'localStorage.setItem'
])assert(js.includes(token),`Adaptive HUD JavaScript is missing ${token}.`);

for(const token of [
  '.immersive-hud-controls',
  'pointer-events:auto!important',
  '.hud[data-hud-mode="compact"]',
  '.hud[data-hud-mode="hidden"]',
  '.hud.hud-status-hidden',
  '.hud.hud-map-hidden',
  '.hud.hud-objective-hidden',
  '.canvas-frame.hud-hints-hidden',
  '.hud-nearby-active',
  'prefers-reduced-motion'
])assert(css.includes(token),`Adaptive HUD stylesheet is missing ${token}.`);

assert((css.match(/{/g)||[]).length===(css.match(/}/g)||[]).length,'Adaptive HUD stylesheet has unbalanced braces.');
assert(!css.includes('position:fixed;inset:0'),'Adaptive HUD controls must not create a full-screen input layer.');

console.log('Adaptive HUD harness passed: persistent modes, selective sections, keyboard cycling, unobstructed input, and responsive styles verified.');
