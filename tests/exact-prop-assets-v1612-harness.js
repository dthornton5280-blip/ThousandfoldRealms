/* Thousandfold Realms v1.6.12 exact user-provided prop asset validation. */
'use strict';
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const crypto=require('crypto');
const root=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const check=(value,message)=>{if(!value)throw new Error(message);};

(async()=>{
  const atlasText=read('source/assets/thousandfold/generated/generated-props-atlas-v1612.b64').replace(/\s+/g,'');
  const atlas=Buffer.from(atlasText,'base64');
  const runtimeSource=read('source/src/render/prop_furniture_runtime_v1612.js');
  const rendererSource=read('source/src/render/renderer.js');
  const mainSource=read('source/src/main.js');
  const tavernComposition=read('source/src/data/tavern_composition.js');
  const version=JSON.parse(read('version.json'));

  check(version.version==='1.6.12-dev','version must identify v1.6.12-dev');
  check(version.buildName==='Exact User Prop Assets','v1.6.12 build name is incorrect');
  check(atlas.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'exact prop atlas must be a PNG');
  check(atlas.readUInt32BE(16)===512&&atlas.readUInt32BE(20)===192,'exact prop atlas must remain 512x192');
  check(atlas.includes(Buffer.from('tRNS')),'exact prop atlas must contain indexed transparency');
  check(crypto.createHash('sha256').update(atlas).digest('hex')==='390da3e23600283e691bd6134073595c703afb595fcbcb61f828833f0d8a760e','exact prop atlas bytes changed unexpectedly');

  check(mainSource.includes("prop_furniture_runtime_v1612.js?v=1612"),'main must load only the exact v1.6.12 runtime');
  check(mainSource.includes('while(AO.PropFurnitureArtV1612'),'game construction must wait for the exact atlas');
  check(!tavernComposition.includes('prop_furniture_runtime_v169.js'),'the obsolete early prop runtime injection must be removed');
  check(rendererSource.includes('AO.PropFurnitureArtV1612||AO.PropFurnitureArtV1611||AO.PropFurnitureArtV169'),'canonical renderer must prioritize v1.6.12');

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
    "inn_shelf_guestbook:'tavern_shelf_bottles'"
  ])check(runtimeSource.includes(token),`missing exact asset binding ${token}`);
  check(!runtimeSource.includes("tavern_keg_1:'tavern_barrel_oak'"),'single barrel must not replace the multi-cask stack');

  const makeMap=objects=>({objects:objects.map(object=>({...object}))});
  const AO={
    Util:{deepCopy:value=>JSON.parse(JSON.stringify(value))},
    MAP_DEFS:{
      haven:makeMap([
        {id:'haven_delivery_cart',type:'decor',kind:'cart',x:26,y:9,blocking:true},
        {id:'bench_1',type:'decor',kind:'bench',x:11,y:9,blocking:true},
        {id:'bench_2',type:'decor',kind:'bench',x:19,y:9,blocking:true},
        {id:'haven_east_sign',type:'sign',kind:'sign',x:28,y:8,blocking:false}
      ]),
      tavern:makeMap([
        {id:'tavern_shelf_mugs',type:'decor',kind:'shelf',x:3,y:1,blocking:true},
        {id:'tavern_keg_1',type:'decor',kind:'keg',x:3,y:6,blocking:true},
        {id:'tavern_keg_2',type:'decor',kind:'keg',x:6,y:6,blocking:true},
        {id:'tavern_supply_crates',type:'decor',kind:'crates',x:24,y:14,blocking:true},
        {id:'tavern_table_1',type:'decor',kind:'table',x:6,y:8,blocking:true},
        {id:'tavern_table_2',type:'decor',kind:'table',x:17,y:8,blocking:true},
        {id:'tavern_table_3',type:'decor',kind:'table',x:22,y:9,blocking:true},
        {id:'tavern_stage_lamp_1',type:'decor',kind:'lamp',x:22,y:4,blocking:false},
        {id:'tavern_stage_lamp_2',type:'decor',kind:'lamp',x:26,y:4,blocking:false}
      ]),
      tavern_cellar:makeMap([
        {id:'cellar_keg_1',type:'decor',kind:'keg',x:5,y:5,blocking:true},
        {id:'cellar_keg_2',type:'decor',kind:'keg',x:7,y:5,blocking:true},
        {id:'cellar_crates',type:'decor',kind:'crates',x:9,y:5,blocking:true}
      ]),
      inn:makeMap([
        {id:'inn_table_1',type:'decor',kind:'table',x:7,y:12,blocking:true},
        {id:'inn_table_2',type:'decor',kind:'table',x:22,y:12,blocking:true},
        {id:'inn_shelf_guestbook',type:'decor',kind:'shelf',x:18,y:4,blocking:true},
        {id:'inn_crates_linen',type:'decor',kind:'crates',x:25,y:13,blocking:true}
      ]),
      inn_upper:makeMap([{id:'upper_hall_table',type:'decor',kind:'table',x:14,y:10,blocking:true}]),
      general_store:makeMap([{id:'store_shelf_remedy_1',type:'decor',kind:'shelf',x:4,y:5,blocking:true}]),
      arcane_shop:makeMap([{id:'arcane_shelf_1',type:'decor',kind:'shelf',x:2,y:3,blocking:true}])
    },
    events:{emit(){}},
    SpriteFactory:{icon(){return 'fallback';}},
    WorldSystem:class{load(){return true;}}
  };

  const document={baseURI:'https://example.test/ThousandfoldRealms/',documentElement:{dataset:{}}};
  class MockImage{
    constructor(){this.naturalWidth=512;this.naturalHeight=192;}
    set src(value){this._src=value;queueMicrotask(()=>this.onload?.());}
    get src(){return this._src;}
  }
  const window={AO};
  const context={
    window,AO,document,Image:MockImage,URL,
    fetch:async url=>({ok:String(url).includes('generated-props-atlas-v1612.b64?v=1612'),status:200,text:async()=>atlasText}),
    console,setInterval:()=>1,clearInterval(){},queueMicrotask
  };
  vm.runInNewContext(runtimeSource,context);
  await new Promise(resolve=>setImmediate(resolve));
  await new Promise(resolve=>setImmediate(resolve));

  check(AO.PropFurnitureArtV1612?.ready,'exact v1.6.12 runtime must reach ready state');
  check(document.documentElement.dataset.tfrProps==='ready','exact runtime readiness marker must be ready');
  check(AO.MAP_DEFS.haven.objects.find(object=>object.id==='haven_delivery_cart').generatedArtId==='haven_cart_wood_sacks','Haven cart must bind to the exact cart');
  check(AO.MAP_DEFS.tavern.objects.find(object=>object.id==='tavern_keg_2').generatedArtId==='tavern_barrel_oak','standalone tavern keg must bind to the exact barrel');
  check(!AO.MAP_DEFS.tavern.objects.find(object=>object.id==='tavern_keg_1').generatedArtId,'multi-cask stack must remain unchanged');
  check(AO.MAP_DEFS.inn.objects.find(object=>object.id==='inn_shelf_guestbook').generatedArtId==='tavern_shelf_bottles','Lantern Rest shelf must bind to the exact shelf');

  const draws=[];
  const ctx={save(){},restore(){},fillRect(){},createRadialGradient(){return{addColorStop(){}};},drawImage(...args){draws.push(args);}};
  check(AO.PropFurnitureArtV1612.drawEntity(ctx,26*32,9*32,{id:'haven_delivery_cart'},'haven'),'exact cart must draw');
  check(draws[0][1]===4&&draws[0][2]===4&&draws[0][3]===128&&draws[0][4]===96,'cart must use the exact atlas rectangle');
  check(AO.PropFurnitureArtV1612.drawEntity(ctx,3*32,1*32,{id:'tavern_shelf_mugs'},'tavern'),'exact shelf must draw');
  check(draws[1][1]===4&&draws[1][2]===104&&draws[1][3]===96&&draws[1][4]===64,'shelf must use the exact atlas rectangle');

  console.log('v1.6.12 exact prop assets validated: exact atlas bytes, transparency, runtime load, logical bindings, and cart/shelf draw rectangles passed.');
})().catch(error=>{console.error(error);process.exit(1);});
