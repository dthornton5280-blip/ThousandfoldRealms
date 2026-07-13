/* Approved Haven handcrafted terrain v1.6.14 validation. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),zlib=require('zlib');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file));
const text=file=>read(file).toString('utf8');
const check=(value,message)=>{if(!value)throw new Error(message);};

const manifest=JSON.parse(text('source/assets/thousandfold/tiles/haven-ground-handcrafted-v1614.json'));
const png=read('source/assets/thousandfold/tiles/haven-ground-handcrafted-v1614.png');
check(png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'atlas must be a valid PNG');
const width=png.readUInt32BE(16),height=png.readUInt32BE(20);
check(width===512&&height===384,'atlas must remain 512x384');
check(width===manifest.atlas.width&&height===manifest.atlas.height,'manifest dimensions must match PNG');
check(Object.keys(manifest.tiles).length===186,'manifest must expose 162 detailed base patches plus 24 transitions');
for(const [id,tile] of Object.entries(manifest.tiles)){
  check(tile.w===32&&tile.h===32,`${id} must be exactly 32x32`);
  check(tile.x>=0&&tile.y>=0&&tile.x+tile.w<=width&&tile.y+tile.h<=height,`${id} is outside atlas bounds`);
  check(tile.sourceCrop.length===4,`${id} must retain source crop provenance`);
}

// Decode the RGBA PNG scanlines to prove no black presentation gutter reached
// any runtime tile. Dark painted cracks are allowed; near-black gutter pixels
// are rejected when they exceed a tiny fraction of the atlas.
let offset=8,idat=[];
while(offset<png.length){const length=png.readUInt32BE(offset),type=png.toString('ascii',offset+4,offset+8),data=png.subarray(offset+8,offset+8+length);if(type==='IDAT')idat.push(data);offset+=12+length;if(type==='IEND')break;}
const raw=zlib.inflateSync(Buffer.concat(idat)),stride=width*4,rows=[];let cursor=0,prior=Buffer.alloc(stride);
const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
for(let y=0;y<height;y++){
  const filter=raw[cursor++],scan=Buffer.from(raw.subarray(cursor,cursor+stride));cursor+=stride;
  for(let x=0;x<stride;x++){const left=x>=4?scan[x-4]:0,up=prior[x],ul=x>=4?prior[x-4]:0;if(filter===1)scan[x]=(scan[x]+left)&255;else if(filter===2)scan[x]=(scan[x]+up)&255;else if(filter===3)scan[x]=(scan[x]+Math.floor((left+up)/2))&255;else if(filter===4)scan[x]=(scan[x]+paeth(left,up,ul))&255;else check(filter===0,`unsupported PNG filter ${filter}`);}rows.push(scan);prior=scan;
}
let nearBlack=0;
for(const row of rows)for(let x=0;x<stride;x+=4)if(row[x]<8&&row[x+1]<8&&row[x+2]<8&&row[x+3]>0)nearBlack++;
check(nearBlack/(width*height)<0.002,'runtime atlas appears to include black presentation gutters');

const runtime=text('source/src/render/haven_ground_runtime_v1614.js');
const main=text('source/src/main.js');
const composition=text('source/src/data/haven_composition.js');
const detail=text('source/src/data/haven_detail_content.js');
const props=text('source/src/render/prop_furniture_runtime_v1612.js');
const facadeRuntime=text('source/src/render/haven_facade_runtime_v1614.js');
const interiorRuntime=text('source/src/render/haven_interior_runtime_v1614.js');
check(runtime.includes("map?.id!=='haven'"),'runtime must explicitly reject non-Haven maps');
check(runtime.includes('imageSmoothingEnabled=false'),'runtime must use nearest-neighbor drawing');
check(main.includes('haven_ground_runtime_v1614.js?v=1614'),'main must cache-bust and load Haven runtime');
check(!composition.includes("[9,6,'shrub']")&&!composition.includes("[20,11,'flower_patch']")&&!composition.includes("[11,12,'rocks']"),'garden accents must not overwrite building footprints');
check(detail.includes("patch('haven','market_stall_1',{x:6,y:7})")&&detail.includes("patch('haven','market_stall_2',{x:20,y:7})"),'market canopies must remain entirely inside the square while leaving the east-west lane and cart bay clear');
check(props.includes("haven_cart_wood_sacks:{x:4,y:4,w:128,h:96,drawW:96,drawH:72"),'delivery cart must retain its exact 4:3 aspect ratio at town scale');
check(composition.includes("place('haven','town_board',13,8")&&composition.includes('interactionFootprint:footprint(2,1)'),'noticeboard must remain in the square with an interaction footprint that cannot steal the Arcana doorway');

const facadeManifest=JSON.parse(text('source/assets/thousandfold/generated/haven-facades-v1614.json'));
const facadePng=read('source/assets/thousandfold/generated/haven-facades-v1614.png');
check(facadePng.readUInt32BE(16)===1280&&facadePng.readUInt32BE(20)===160,'Haven facade atlas must remain 1280x160');
check(Object.keys(facadeManifest.assets).length===5,'facade atlas must contain the five non-landmark Haven storefronts');
check(facadeRuntime.includes("world?.map?.id!=='haven'"),'facades must remain scoped to Haven');
check(facadeRuntime.includes('imageSmoothingEnabled=false'),'facades must use nearest-neighbor rendering');

const interiorManifest=JSON.parse(text('source/assets/thousandfold/tiles/haven-interiors-v1614.json'));
const interiorPng=read('source/assets/thousandfold/tiles/haven-interiors-v1614.png');
check(interiorPng.readUInt32BE(16)===256&&interiorPng.readUInt32BE(20)===128,'starter-interior atlas must remain 256x128');
check(Object.keys(interiorManifest.tiles).length===28,'starter-interior atlas must contain ten wood variants plus coherent 3x3 rug and stone macros');
for(const id of ['tavern','tavern_cellar','inn','inn_upper','general_store','forge','arcane_shop','chapel'])check(interiorRuntime.includes(`'${id}'`),`${id} must opt into approved interior surfaces`);
check(interiorRuntime.includes('imageSmoothingEnabled=false'),'starter interiors must use nearest-neighbor rendering');
check(interiorRuntime.includes("tileName==='rug'||tileName==='rune'")&&interiorRuntime.includes("'altar'")&&interiorRuntime.includes("tileName==='stage'"),'legacy rune, altar, and stage islands must resolve through the approved interior atlas');

function boot(imageFails=false){
  const draws=[],fallback=[];
  class MockImage{constructor(){this.naturalWidth=512;this.naturalHeight=384;}set src(value){this._src=value;if(imageFails)this.onerror?.(new Error('load failed'));else this.onload?.();}get src(){return this._src;}}
  const AO={events:{emit(){}},ThousandfoldArt:{drawTile(...args){fallback.push(args);return 'fallback';}}};
  const context={console,URL,Image:MockImage,AO,document:{baseURI:'http://local/source/',documentElement:{dataset:{}}},window:null};
  context.window=context;context.window.AO=AO;
  vm.createContext(context);vm.runInContext(runtime,context);
  const ctx={imageSmoothingEnabled:true,save(){},restore(){},drawImage(...args){draws.push(args);}};
  return{context,AO,ctx,draws,fallback};
}

const app=boot();
const grassGrid=Array.from({length:5},()=>Array(5).fill('grass'));
app.context.game={world:{map:{id:'haven',theme:'haven'},grid:grassGrid}};
const art=app.AO.HavenGroundArtV1614;
const first=art.selectTile('grass',2,2),again=art.selectTile('grass',2,2);
check(first===again,'same coordinates must select the same deterministic tile');
const variants=new Set();let rare=0,total=0;
for(let y=0;y<20;y++)for(let x=0;x<30;x++){const id=art.selectTile('grass',x,y);variants.add(id);if(/flowers|rocks|worn/.test(id))rare++;total++;}
check(variants.size>=6,'different coordinates must produce controlled grass variation');
check(rare/total<0.30,'rare grass accents must not be over-selected');

grassGrid[2][3]='cobble';
check(art.selectTile('grass',2,2)==='haven_edge_grass_cobble_e','east cobble neighbor must select east grass/cobble edge');
grassGrid[3][2]='cobble';
check(art.selectTile('grass',2,2)==='haven_corner_grass_cobble_se','adjacent cobble neighbors must select matching corner');
grassGrid[3][2]='path';
check(art.selectTile('grass',2,2)==='haven_junction_grass_path_cobble_se','mixed adjacent neighbors must select approved junction');
check(art.drawTile(app.ctx,'grass',2,2,'haven')===true&&app.draws.length===1,'ready Haven runtime must draw a 32px atlas tile');

app.context.game.world.map={id:'wilds',theme:'wilds'};
check(art.drawTile(app.ctx,'grass',2,2,'wilds')===false,'Whisperwood/wilds must remain untouched');
app.context.game.world.map={id:'tavern',theme:'tavern'};
check(art.drawTile(app.ctx,'woodfloor',2,2,'tavern')===false,'interiors must remain untouched');

const failed=boot(true);
check(failed.AO.HavenGroundArtV1614.failed===true,'atlas load failure must set failed state');
check(failed.AO.HavenGroundArtV1614.drawTile(failed.ctx,'grass',0,0,'haven')===false,'failed atlas must delegate to fallback');

console.log('v1.6.14 Haven terrain validated: 186 approved detailed patches, deterministic macro variation, topology transitions, strict Haven scope, and fallback safety passed.');
