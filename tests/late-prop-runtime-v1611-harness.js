/* Thousandfold Realms v1.6.11 late-loaded prop runtime execution test. */
'use strict';
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const check=(value,message)=>{if(!value)throw new Error(message);};

(async()=>{
  const runtimeSource=read('source/src/render/prop_furniture_runtime_v169.js');
  const encoded=read('source/assets/thousandfold/generated/generated-props-atlas-v166.b64').replace(/\s+/g,'');
  const png=Buffer.from(encoded,'base64');
  check(png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'approved prop atlas must be a valid PNG');
  check(png.readUInt32BE(16)===512&&png.readUInt32BE(20)===192,'approved prop atlas must remain 512x192');

  const makeMap=objects=>({objects:objects.map(object=>({...object}))});
  const AO={
    Util:{deepCopy:value=>JSON.parse(JSON.stringify(value))},
    MAP_DEFS:{
      haven:makeMap([
        {id:'haven_delivery_cart',type:'decor',kind:'cart',x:24,y:10,blocking:true},
        {id:'bench_1',type:'decor',kind:'bench',x:10,y:9,blocking:true},
        {id:'bench_2',type:'decor',kind:'bench',x:18,y:9,blocking:true},
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
        {id:'inn_table_1',type:'decor',kind:'table',x:5,y:10,blocking:true},
        {id:'inn_table_2',type:'decor',kind:'table',x:22,y:10,blocking:true},
        {id:'inn_shelf_guestbook',type:'decor',kind:'shelf',x:18,y:4,blocking:true},
        {id:'inn_crates_linen',type:'decor',kind:'crates',x:25,y:13,blocking:true}
      ]),
      inn_upper:makeMap([
        {id:'upper_hall_table',type:'decor',kind:'table',x:14,y:10,blocking:true},
        {id:'upper_shelf_1',type:'decor',kind:'shelf',x:3,y:13,blocking:true},
        {id:'upper_shelf_2',type:'decor',kind:'shelf',x:15,y:13,blocking:true}
      ]),
      general_store:makeMap([{id:'store_shelf_remedy_1',type:'decor',kind:'shelf',x:4,y:5,blocking:true}]),
      arcane_shop:makeMap([{id:'arcane_shelf_1',type:'decor',kind:'shelf',x:2,y:3,blocking:true}])
    },
    events:{emit(){}},
    SpriteFactory:{icon(){return 'fallback';}},
    WorldSystem:class{load(){return true;}}
  };
  const document={documentElement:{dataset:{}}};
  class MockImage{
    set src(value){this._src=value;queueMicrotask(()=>this.onload?.());}
    get src(){return this._src;}
  }
  const window={AO};
  const context={
    window,AO,document,Image:MockImage,
    fetch:async url=>({ok:url.includes('generated-props-atlas-v166.b64?v=1611'),status:200,text:async()=>encoded}),
    console,setInterval:()=>1,clearInterval(){},queueMicrotask
  };
  vm.runInNewContext(runtimeSource,context);
  await new Promise(resolve=>setImmediate(resolve));
  await new Promise(resolve=>setImmediate(resolve));

  check(AO.PropFurnitureArtV1611?.ready,'late-loaded v1.6.11 prop runtime must reach ready state');
  check(document.documentElement.dataset.tfrProps==='ready','runtime readiness marker must be ready');
  check(AO.MAP_DEFS.haven.objects.find(object=>object.id==='haven_delivery_cart').generatedArtId==='haven_cart_wood_sacks','Haven cart must bind to the approved cart');
  check(AO.MAP_DEFS.inn.objects.find(object=>object.id==='inn_shelf_guestbook').generatedArtId==='tavern_shelf_bottles','Lantern Rest guestbook shelf must bind to the approved shelf');
  check(AO.MAP_DEFS.inn_upper.objects.find(object=>object.id==='upper_shelf_1').generatedArtId==='tavern_shelf_bottles','upper inn shelf must bind to the approved shelf');
  check(!AO.MAP_DEFS.tavern.objects.find(object=>object.id==='tavern_keg_1').generatedArtId,'multi-cask stack must remain on its established renderer');
  check(AO.MAP_DEFS.tavern.objects.find(object=>object.id==='tavern_keg_2').generatedArtId==='tavern_barrel_oak','standalone tavern keg must bind to the approved barrel');

  const draws=[];
  const ctx={save(){},restore(){},fillRect(){},createRadialGradient(){return{addColorStop(){}};},drawImage(...args){draws.push(args);}};
  check(AO.PropFurnitureArtV1611.drawEntity(ctx,0,0,{id:'haven_delivery_cart'},'haven'),'approved cart must draw successfully');
  check(draws[0][1]===4&&draws[0][2]===4&&draws[0][3]===128&&draws[0][4]===96,'cart must draw the correct atlas rectangle');
  check(AO.PropFurnitureArtV1611.drawEntity(ctx,0,0,{id:'inn_shelf_guestbook',kind:'shelf'},'inn'),'approved Lantern Rest shelf must draw successfully');
  check(draws[1][1]===4&&draws[1][2]===104&&draws[1][3]===96&&draws[1][4]===64,'shelf must draw the correct atlas rectangle');

  console.log('v1.6.11 late prop runtime executed successfully: real atlas, cart, barrel, shelves, map bindings, and draw rectangles are verified.');
})().catch(error=>{console.error(error);process.exit(1);});
