/* Thousandfold Realms v1.6.13 collision and ground tile validation. */
'use strict';
const fs=require('fs');
const path=require('path');
const vm=require('vm');
const crypto=require('crypto');
const root=path.resolve(__dirname,'..');
const read=relative=>fs.readFileSync(path.join(root,relative),'utf8');
const check=(value,message)=>{if(!value)throw new Error(message);};

(async()=>{
  const png=fs.readFileSync(path.join(root,'source/assets/thousandfold/tiles/tfr-ground-tiles-v1613.png'));
  const manifest=JSON.parse(read('source/assets/thousandfold/tiles/tfr-ground-tiles-v1613.json'));
  const geometrySource=read('source/src/render/prop_geometry_runtime_v1613.js');
  const groundSource=read('source/src/render/ground_tile_runtime_v1613.js');
  const mainSource=read('source/src/main.js');
  const version=JSON.parse(read('version.json'));

  check(version.version==='1.6.13-dev','version must identify v1.6.13-dev');
  check(png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'ground atlas must be a PNG');
  check(png.readUInt32BE(16)===256&&png.readUInt32BE(20)===128,'ground atlas must remain 256x128');
  check(crypto.createHash('sha256').update(png).digest('hex')==='84bc2db3b75999fef12ad4b687bb54b48349bdb281b7b12d67eaa3f02d932c20','ground atlas bytes changed unexpectedly');
  check(manifest.tileSize===32&&Object.keys(manifest.tiles).length===32,'ground manifest must contain 32 exact 32px tiles');
  check(mainSource.includes("prop_geometry_runtime_v1613.js?v=1613"),'main must load prop geometry normalization');
  check(mainSource.includes("ground_tile_runtime_v1613.js?v=1613"),'main must load the game-ready ground atlas');
  check(mainSource.includes('propsDone&&groundDone'),'first map must wait for both required art systems');

  const AO={
    Util:{deepCopy:value=>JSON.parse(JSON.stringify(value))},
    MAP_DEFS:{
      haven:{objects:[
        {id:'haven_delivery_cart',generatedArtId:'haven_cart_wood_sacks',blocking:true,collisionFootprint:[{x:0,y:0}]},
        {id:'bench_1',generatedArtId:'haven_bench_wood_backrest',blocking:true},
        {id:'haven_east_sign',generatedArtId:'haven_signpost_wood_dual',blocking:true}
      ]},
      tavern:{objects:[
        {id:'tavern_table_1',generatedArtId:'tavern_table_square',blocking:true},
        {id:'tavern_shelf_mugs',generatedArtId:'tavern_shelf_bottles',blocking:true},
        {id:'tavern_stage_lamp_1',generatedArtId:'tavern_hanging_lantern',blocking:true}
      ]}
    },
    events:{emit(){}},
    WorldSystem:class{constructor(){this.entities=[];}load(){return true;}}
  };
  const window={AO,game:null};
  vm.runInNewContext(geometrySource,{window,AO,console});
  const cart=AO.MAP_DEFS.haven.objects.find(entity=>entity.id==='haven_delivery_cart');
  check(cart.collisionFootprint.length===12,'cart must occupy its full 4x3 visible body');
  check(cart.collisionFootprint.some(cell=>cell.x===3&&cell.y===2),'cart collision must include the far wheel/body cell');
  check(cart.interactionFootprint.length===12,'cart interaction must match the visible cart');
  check(AO.MAP_DEFS.haven.objects.find(entity=>entity.id==='bench_1').collisionFootprint.length===2,'bench must retain a two-cell collision');
  check(AO.MAP_DEFS.haven.objects.find(entity=>entity.id==='haven_east_sign').blocking===false,'signpost must remain non-blocking');
  check(AO.MAP_DEFS.tavern.objects.find(entity=>entity.id==='tavern_table_1').collisionFootprint.length===2,'square table must use two-cell collision');
  check(AO.MAP_DEFS.tavern.objects.find(entity=>entity.id==='tavern_shelf_mugs').collisionFootprint.length===3,'shelf must use three-cell collision');
  check(AO.MAP_DEFS.tavern.objects.find(entity=>entity.id==='tavern_stage_lamp_1').blocking===false,'hanging lantern must remain non-blocking');

  const fallbackCalls=[];
  const AO2={
    ThousandfoldArt:{drawTile(...args){fallbackCalls.push(args);return 'fallback';}},
    events:{emit(){}}
  };
  const document={baseURI:'https://example.test/ThousandfoldRealms/',documentElement:{dataset:{}}};
  class MockImage{
    constructor(){this.naturalWidth=256;this.naturalHeight=128;}
    set src(value){this._src=value;queueMicrotask(()=>this.onload?.());}
    get src(){return this._src;}
  }
  const window2={AO:AO2};
  vm.runInNewContext(groundSource,{window:window2,AO:AO2,document,Image:MockImage,URL,console,queueMicrotask});
  await new Promise(resolve=>setImmediate(resolve));
  await new Promise(resolve=>setImmediate(resolve));
  check(AO2.GroundTileArtV1613?.ready,'ground tile runtime must reach ready state');
  check(document.documentElement.dataset.tfrGroundTiles==='ready','ground tile readiness marker must be ready');

  const draws=[];
  const ctx={save(){},restore(){},drawImage(...args){draws.push(args);}};
  check(AO2.GroundTileArtV1613.drawTile(ctx,'grass',2,3,'haven'),'Haven grass must draw from the atlas');
  check(draws[0][3]===32&&draws[0][4]===32&&draws[0][7]===32&&draws[0][8]===32,'ground tiles must draw exact 32px source and destination rectangles');
  check(AO2.GroundTileArtV1613.drawTile(ctx,'woodfloor',4,5,'tavern'),'tavern wood floor must draw from the atlas');
  check(AO2.ThousandfoldArt.drawTile(ctx,'rug',1,1,'tavern')==='fallback','uncovered rug tiles must preserve the procedural fallback');

  console.log('v1.6.13 validated: cart and furniture collision geometry, exact 32px ground atlas, deterministic runtime draw, and procedural fallback all passed.');
})().catch(error=>{console.error(error);process.exit(1);});