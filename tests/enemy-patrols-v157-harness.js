const fs=require('fs');
const vm=require('vm');
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const listeners={};
global.window=global;
global.addEventListener=(name,fn)=>{(listeners[name]||=[]).push(fn);};
const emitWindow=name=>(listeners[name]||[]).forEach(fn=>fn());
global.performance={now:()=>1000};
const classList={contains:()=>false};
global.document={
  hidden:false,
  hasFocus:()=>false,
  body:{classList},
  querySelector:()=>null,
  getElementById:()=>null,
  addEventListener(){}
};

const key=(x,y)=>`${x},${y}`;
const AO=global.AO={
  CONFIG:{mapWidth:30,mapHeight:18},
  ENEMIES:{bandit:{name:'Bandit'},mireling:{name:'Mireling'},quest_guard:{name:'Quest Guard'},boss:{name:'Boss',boss:true}},
  events:{count:0,emit(){this.count++;}},
  Pathfinder:{
    path(world,start,goal,ignoreId){
      const queue=[start],came=new Map([[key(start.x,start.y),null]]);
      while(queue.length){
        const current=queue.shift();
        if(current.x===goal.x&&current.y===goal.y){
          const path=[];let cursor=current;
          while(cursor&&!(cursor.x===start.x&&cursor.y===start.y)){path.push(cursor);cursor=came.get(key(cursor.x,cursor.y));}
          return path.reverse();
        }
        for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
          const next={x:current.x+dx,y:current.y+dy},id=key(next.x,next.y);
          if(came.has(id)||!world.isTerrainWalkable(next.x,next.y))continue;
          const blocker=world.entities.find(entity=>entity.id!==ignoreId&&!entity.hidden&&entity.blocking!==false&&entity.x===next.x&&entity.y===next.y);
          if(blocker)continue;
          came.set(id,current);queue.push(next);
        }
      }
      return [];
    }
  }
};

AO.WorldSystem=class{
  constructor(game){this.game=game;this.entities=[];this.map=null;}
  load(mapId){
    this.map={id:mapId};
    this.game.state.world.mapId=mapId;
    this.entities=[
      {id:'bandit_1',type:'enemy',enemyType:'bandit',x:17,y:4,blocking:true,routine:[{x:17,y:4},{x:18,y:4}]},
      {id:'mire_1',type:'enemy',enemyType:'mireling',x:6,y:8,blocking:true,routine:[{x:6,y:8},{x:7,y:8}]},
      {id:'quest_enemy',type:'enemy',enemyType:'quest_guard',requiresQuest:'test_quest',x:10,y:10,blocking:true,routine:[{x:10,y:10}]},
      {id:'boss_enemy',type:'enemy',enemyType:'boss',x:22,y:12,blocking:true,routine:[{x:22,y:12}]},
      {id:'test_deer',type:'decor',animalKind:'deer',ambientAnimal:true,x:5,y:5,blocking:true,routinePace:700,routine:[{x:5,y:5},{x:7,y:5}]}
    ];
  }
  update(){
    /* Reproduce the live v1.5.6 failure: document.hasFocus() can be false in an
       embedded/webview context, so the earlier scheduler never advances. */
    if(!document.hasFocus())return;
  }
  isTerrainWalkable(x,y){return x>=0&&y>=0&&x<30&&y<18;}
  playerPos(){return{x:this.game.state.world.x,y:this.game.state.world.y};}
};

vm.runInThisContext(fs.readFileSync('live-overrides/zzzzz-enemy-patrols-v157.js','utf8'),{filename:'zzzzz-enemy-patrols-v157.js'});

const game={
  state:{mode:'explore',rest:{day:1},world:{mapId:'wilds',x:2,y:2,movers:{}}},
  combat:{starts:[],start(entity){this.starts.push(entity);game.state.mode='combat';}}
};
const world=new AO.WorldSystem(game);game.world=world;world.load('wilds');

const bandit=world.entities.find(entity=>entity.id==='bandit_1');
const mire=world.entities.find(entity=>entity.id==='mire_1');
const questEnemy=world.entities.find(entity=>entity.id==='quest_enemy');
const boss=world.entities.find(entity=>entity.id==='boss_enemy');
const deer=world.entities.find(entity=>entity.id==='test_deer');

assert(bandit.patrolRoute.length>1,'Whisperwood bandit did not receive an authored patrol.');
assert(mire.patrolRoute.length>1,'Whisperwood mireling did not receive an authored patrol.');
assert(questEnemy.patrolRoute.length>1,'An ordinary quest-tagged enemy was incorrectly frozen.');
assert(boss.patrolStationary,'Boss enemy should remain stationary by default.');
assert(deer.patrolRoute.length>1,'Existing wildlife routine was not preserved.');

const banditStart={x:bandit.x,y:bandit.y},deerStart={x:deer.x,y:deer.y};
for(let i=0;i<12;i++)world.update(250);
assert(bandit.x!==banditStart.x||bandit.y!==banditStart.y,'Enemy did not patrol when document.hasFocus() was false.');
assert(deer.x!==deerStart.x||deer.y!==deerStart.y,'Wildlife stopped moving under the patrol hotfix.');

const pauseStart={x:bandit.x,y:bandit.y};
game.state.mode='panel';for(let i=0;i<8;i++)world.update(250);
assert(bandit.x===pauseStart.x&&bandit.y===pauseStart.y,'Enemy moved while the player examined a panel.');

game.state.mode='explore';emitWindow('blur');for(let i=0;i<8;i++)world.update(250);
assert(bandit.x===pauseStart.x&&bandit.y===pauseStart.y,'Enemy moved while the game window was blurred.');
emitWindow('focus');for(let i=0;i<8;i++)world.update(250);
assert(bandit.x!==pauseStart.x||bandit.y!==pauseStart.y,'Enemy did not resume after focus returned.');

/* Patrol contact must still launch the existing tactical encounter. */
game.state.mode='explore';game.state.world.x=12;game.state.world.y=12;
bandit.x=11;bandit.y=12;bandit.patrolRoute=[{x:11,y:12},{x:12,y:12}];bandit.patrolIndex=1;bandit.patrolCooldown=0;bandit.patrolPace=700;
world.update(250);
assert(game.combat.starts[0]===bandit,'Enemy entering the player tile did not start combat.');
assert(bandit.routine,'The v1.5.6 routine was not restored after the base update.');

const runtime=fs.readFileSync('live-overrides/zzzzz-enemy-patrols-v157.js','utf8');
for(const token of ['PATROLS','patrolCooldown','window.addEventListener','STATIONARY_IDS','deriveRoute']){
  assert(runtime.includes(token),`Patrol hotfix is missing ${token}.`);
}
assert(!runtime.includes('document.hasFocus()'),'The unreliable per-frame document.hasFocus() gate returned.');
assert(!runtime.includes('entity.requiresQuest'),'Ordinary quest-tagged enemies are still being frozen by the patrol layer.');

console.log('Enemy patrol v1.5.7 harness passed: live focus bug fixed, authored routes move, examination pauses, quest enemies patrol, bosses guard, wildlife persists, and contact starts combat.');
