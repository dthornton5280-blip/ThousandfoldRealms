const fs=require('fs');
const vm=require('vm');
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
global.window=global;
global.AO={
  EntityGeometry:{distance(position,entity){return Math.min(...entity.cells.map(cell=>Math.abs(position.x-cell.x)+Math.abs(position.y-cell.y)));}},
  Game:class{}
};
vm.runInThisContext(fs.readFileSync('live-overrides/zzzzzz-footprint-game-v161.js','utf8'));
let interacted=null,toast=null;
const game=new AO.Game();
game.state={mode:'explore'};
game.world={
  playerPos:()=>({x:6,y:5}),
  entities:[{id:'long_table',type:'decor',hidden:false,cells:[{x:4,y:5},{x:5,y:5}]},{id:'portal',type:'portal',hidden:false,cells:[{x:6,y:5}]}],
  interact:entity=>{interacted=entity.id;}
};
game.toast=text=>{toast=text;};
game.interactNearest();
assert(interacted==='long_table','E did not resolve the adjacent secondary footprint cell.');
game.world.entities=[];game.interactNearest();
assert(toast==='Nothing nearby to interact with.','Empty E interaction feedback changed unexpectedly.');
console.log('Multi-tile E interaction bridge passed.');
