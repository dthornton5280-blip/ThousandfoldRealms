const fs=require('fs');
const vm=require('vm');
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

global.window=global;
global.performance={now:(()=>{let time=1000;return()=>time+=250;})()};
const bodyClasses=new Set();
const classList={contains:name=>bodyClasses.has(name),add:name=>bodyClasses.add(name),remove:name=>bodyClasses.delete(name)};
global.document={hidden:false,hasFocus:()=>true,body:{classList},querySelector:()=>null,getElementById:()=>null};
const deep=value=>JSON.parse(JSON.stringify(value));

const AO=global.AO={
  CONFIG:{mapWidth:30,mapHeight:18,tile:32},
  ITEMS:{},
  ENEMIES:{bandit:{name:'Bandit',visual:{kind:'human'}}},
  events:{emit(){}},
  Util:{deepCopy:deep,key:(x,y)=>`${x},${y}`},
  SpriteFactory:{rect(){},decor(){this.baseDecorCalled=true;}},
  Pathfinder:{
    path(world,start,goal,ignoreId){
      const result=[];let x=start.x,y=start.y,guard=100;
      while((x!==goal.x||y!==goal.y)&&guard--){
        const nx=x===goal.x?x:x+Math.sign(goal.x-x);
        const ny=x!==goal.x?y:y+Math.sign(goal.y-y);
        if(!world.isTerrainWalkable(nx,ny))return[];
        const blocker=world.entities.find(entity=>entity.id!==ignoreId&&entity.blocking!==false&&!entity.hidden&&entity.x===nx&&entity.y===ny);
        if(blocker)return[];
        x=nx;y=ny;result.push({x,y});
      }
      return result;
    }
  },
  MAP_DEFS:{
    haven:{id:'haven',name:'Haven',theme:'haven',start:{x:14,y:15},enemies:[],objects:[],portals:[],npcs:[]},
    ambermeadow:{id:'ambermeadow',name:'Ambermeadow',theme:'wilds',start:{x:15,y:1},enemies:[{id:'test_bandit',type:'bandit',x:12,y:8}],objects:[],portals:[],npcs:[]}
  }
};

AO.WorldSystem=class{
  constructor(game){this.game=game;this.entities=[];this.grid=[];this.map=null;}
  load(mapId,x,y){
    this.map=AO.MAP_DEFS[mapId];
    this.grid=Array.from({length:18},()=>Array(30).fill('grass'));
    this.entities=[];
    for(const spawn of this.map.enemies||[]){
      const definition=AO.ENEMIES[spawn.type];
      this.entities.push({...deep(spawn),name:definition.name,type:'enemy',enemyType:spawn.type,blocking:true,visual:definition.visual});
    }
    this.game.state.world.mapId=mapId;
    this.game.state.world.x=x??this.map.start.x;
    this.game.state.world.y=y??this.map.start.y;
  }
  isTerrainWalkable(x,y){return x>=0&&y>=0&&x<30&&y<18;}
  playerPos(){return{x:this.game.state.world.x,y:this.game.state.world.y};}
  update(){}
  interact(entity){this.baseInteracted=entity;}
};

vm.runInThisContext(fs.readFileSync('live-overrides/zzzz-visible-patrols-wildlife-v156.js','utf8'));

const game={
  state:{mode:'explore',rest:{day:1},world:{mapId:'haven',x:14,y:15},player:{}},
  combat:{starts:[],start(entity){this.starts.push(entity);game.state.mode='combat';}},
  inventory:{added:[],add(itemId,quantity){this.added.push([itemId,quantity]);}},
  progression:{xp:0,grantXp(amount){this.xp+=amount;}},
  ui:{dialogue(){},closeDialogue(){game.state.mode='explore';}},
  check(){return{success:true};},
  toast(){},
  log(){}
};

const world=new AO.WorldSystem(game);game.world=world;
world.load('haven');
const cat=world.entities.find(entity=>entity.animalKind==='cat');
assert(cat,'Contextual town cat was not added.');
assert(cat.huntable===false,'Town flavor animal must not be huntable.');
assert(world.maybeEncounter()===false,'Ordinary random encounters were not disabled.');

let hare=null;
for(let day=1;day<=100&&!hare;day++){
  game.state.rest.day=day;game.state.mode='explore';world.load('ambermeadow');
  hare=world.entities.find(entity=>entity.animalKind==='rabbit');
}
assert(hare,'Occasional wilderness wildlife never appeared across deterministic days.');
assert(hare.huntable===true,'Wilderness wildlife is not huntable.');

const enemy=world.entities.find(entity=>entity.type==='enemy');
assert(enemy&&enemy.routine?.length,'Visible enemy did not receive a predictable routine.');
const before={x:enemy.x,y:enemy.y};
enemy.nextRoutineAt=0;game.state.mode='panel';world.update(1000);
assert(enemy.x===before.x&&enemy.y===before.y,'Enemy moved while the player was examining a panel.');
game.state.mode='explore';enemy.nextRoutineAt=0;world.update(1000);
assert(enemy.x!==before.x||enemy.y!==before.y,'Enemy routine did not advance in real time.');

world.huntAnimal(hare);
assert(hare.hidden,'Successful hunt did not remove the animal.');
assert(game.inventory.added.some(([itemId])=>itemId==='wild_game_meat'),'Hunting did not award game resources.');
assert(game.state.world.huntedAnimals[hare.id]>game.state.rest.day,'Hunted-animal persistence was not recorded.');

/* A patrol crossing the player starts the existing tactical encounter. */
game.state.mode='explore';
const player=world.playerPos();
enemy.hidden=false;enemy.x=player.x-1;enemy.y=player.y;
enemy.routine=[{x:player.x,y:player.y},{x:player.x-1,y:player.y}];
enemy.routineIndex=0;enemy.nextRoutineAt=0;world.update(1000);
assert(game.combat.starts.length===1,'Enemy patrol collision did not start tactical combat.');

for(const itemId of ['wild_game_meat','animal_hide','wild_feathers'])assert(AO.ITEMS[itemId],`Missing wildlife resource item ${itemId}.`);
for(const token of ['maybeEncounter()','Observe its routine.','Track and hunt it.','document.hasFocus','huntedAnimals','ROUTINE_OVERRIDES']){
  assert(fs.readFileSync('live-overrides/zzzz-visible-patrols-wildlife-v156.js','utf8').includes(token),`Runtime is missing ${token}.`);
}
console.log('Visible entity harness passed: random battles disabled, timed patrols pause in menus, collision starts combat, and wildlife can be observed and hunted.');
