/* Thousandfold Realms v1.6.10 direct prop-render priority validation. */
'use strict';
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const check=(value,message)=>{if(!value)throw new Error(message);};

const rendererSource=read('source/src/render/renderer.js');
const composition=read('source/src/data/tavern_composition.js');
const runtime=read('source/src/render/prop_furniture_runtime_v169.js');
const version=JSON.parse(read('version.json'));

check(version.version==='1.6.10-dev','version must identify v1.6.10-dev');
check(version.buildName==='Direct Prop Renderer Priority','v1.6.10 build name is incorrect');
check(composition.includes("prop_furniture_runtime_v169.js?v=1610"),'composition must force a fresh v1.6.10 prop runtime request');
check(composition.includes("script.dataset.tfrPropFurnitureV1610='true'"),'v1.6.10 runtime marker is missing');
check(composition.includes('script.async=false'),'dynamic repair modules must execute in deterministic insertion order');

const directCall="AO.PropFurnitureArtV169?.drawEntity?.(ctx,e.x*32,e.y*32,e,world.map.id)";
const pixelEntityCall='AO.PixelCrawlerArt?.enabled&&AO.PixelCrawlerArt.drawEntity';
const decorIconCall='AO.SpriteFactory.icon(ctx,e.x*32,e.y*32,e.type,e)';
check(rendererSource.includes(directCall),'canonical renderer must call the approved prop renderer directly');
check(rendererSource.indexOf(directCall)<rendererSource.indexOf(pixelEntityCall),'approved props must render before Pixel Crawler entities');
check(rendererSource.indexOf(directCall)<rendererSource.indexOf(decorIconCall),'approved props must render before decor icon fallbacks');

for(const token of [
  "haven_delivery_cart:'haven_cart_wood_sacks'",
  "bench_1:'haven_bench_wood_backrest'",
  "haven_east_sign:'haven_signpost_wood_dual'",
  "tavern_shelf_mugs:'tavern_shelf_bottles'",
  "tavern_keg_2:'tavern_barrel_oak'",
  "tavern_supply_crates:'haven_crate_wood'",
  "tavern_table_1:'tavern_table_square'",
  "cellar_keg_1:'tavern_barrel_oak'",
  "cellar_crates:'haven_crate_wood'",
  "inn_table_1:'tavern_table_square'",
  "upper_hall_table:'tavern_table_square'"
])check(runtime.includes(token),`missing authoritative binding ${token}`);
check(!runtime.includes("tavern_keg_1:'tavern_barrel_oak'"),'multi-cask stack must not be replaced by one stretched barrel');

/* Execute the real renderer with stubs and prove the approved renderer wins even
   when Pixel Crawler and the ordinary icon renderer are both available. */
const calls=[];
const AO={
  CONFIG:{mapWidth:1,mapHeight:1,tile:32},
  PixelCrawlerArt:{enabled:true,drawTile:()=>false,drawEntity:()=>{calls.push('pixel');return true;}},
  PropFurnitureArtV169:{drawEntity:(ctx,x,y,entity,mapId)=>{calls.push(`prop:${mapId}:${entity.id}`);return true;}},
  Assets:{drawTile:()=>false},
  SpriteFactory:{icon:()=>calls.push('icon'),character:()=>calls.push('player'),npc:()=>calls.push('npc'),enemy:()=>calls.push('enemy')},
  RACES:{human:{visual:{}}},CLASSES:{fighter:{visual:{}}},QUESTS:{},
  Util:{visualFor:value=>value}
};
const gradient={addColorStop(){}};
const ctx={
  imageSmoothingEnabled:false,fillStyle:'',strokeStyle:'',lineWidth:1,font:'',textAlign:'',
  clearRect(){},fillRect(){},strokeRect(){},save(){},restore(){},beginPath(){},arc(){},stroke(){},
  strokeText(){},fillText(){},setLineDash(){},createRadialGradient(){return gradient;}
};
const canvas={width:32,height:32,getContext:()=>ctx};
const game={
  world:{map:{id:'haven',theme:'haven'},grid:[['grass']],path:[],movingUntil:0,entities:[{id:'haven_delivery_cart',type:'decor',kind:'cart',x:0,y:0}]},
  state:{mode:'explore',trackedQuestId:null,quests:{},world:{x:0,y:0},player:{raceId:'human',classId:'fighter',appearance:{}}},
  quests:{state:()=>null,currentStage:()=>null,canStart:()=>false}
};
vm.runInNewContext(rendererSource,{AO,performance:{now:()=>0}});
new AO.Renderer(game,canvas).render();
check(calls.includes('prop:haven:haven_delivery_cart'),'direct renderer did not receive the Haven cart');
check(!calls.includes('pixel'),'Pixel Crawler rendered over an approved prop');
check(!calls.includes('icon'),'ordinary icon fallback rendered over an approved prop');

console.log('v1.6.10 direct prop renderer validated: approved assets win in the canonical render loop before every fallback.');