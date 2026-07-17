/* Thousandfold Realms v1.6.18 Pixel Crawler environment validation. */
const fs=require('fs'),vm=require('vm');
const assert=(value,message)=>{if(!value)throw new Error(message);};
const dimensions=path=>{const data=fs.readFileSync(path);return{w:data.readUInt32BE(16),h:data.readUInt32BE(20)};};

global.window=global;
global.document={baseURI:'http://127.0.0.1:8765/',documentElement:{dataset:{}}};
global.Image=class{
  set src(value){this._src=value;const props=value.includes('props');this.naturalWidth=512;this.naturalHeight=props?122:544;this.onload?.();}
};
global.AO={events:{emit(){}},Renderer:class{},ThousandfoldArt:{drawTile(){return false;},drawEntity(){return false;}}};
const grid=Array.from({length:5},()=>Array(5).fill('grass'));
global.game={world:{map:{id:'mosswater_crossing',theme:'wilds'},grid}};

(async()=>{
  vm.runInThisContext(fs.readFileSync('source/src/render/pixel_crawler_environment_runtime_v1618.js','utf8'));
  await Promise.resolve();await Promise.resolve();
  const art=AO.PixelCrawlerEnvironmentArtV1618;
  assert(art?.ready,'both compact environment atlases must become ready');
  grid[2][2]='water';
  assert(art.selectWater('water',2,2).id.includes('isolated'),'isolated water must select explicit isolated topology');
  grid[1][2]='water';grid[2][3]='shallow_water';grid[3][2]='lilywater';grid[2][1]='bridge';
  assert(art.selectWater('water',2,2).id.includes('open'),'water, shallow, lily, and bridge neighbors must connect without artificial shore caps');
  assert(art.selectWater('lilywater',3,2).family==='lilywater','lily water must use its authored derivative family');
  game.world.map={id:'southwood_trail',theme:'wilds'};
  assert(art.selectWater('water',2,2),'the conversion must serve all wilderness maps, not only Whisperwood');
  game.world.map={id:'haven',theme:'haven'};
  assert(art.selectWater('water',2,2)===null,'Haven must preserve its approved town terrain');
  assert(art.propFor('tree','ambermeadow',3,3).startsWith('pc_tree_'),'region-aware tree selection must remain deterministic');
  assert(art.propFor('rocks','wilds',2,3).startsWith('pc_rock'),'rock tiles must receive a compact authored derivative');

  const terrain=JSON.parse(fs.readFileSync('source/assets/third-party/pixel-crawler/tfr-environment-terrain-v1618.json','utf8'));
  const props=JSON.parse(fs.readFileSync('source/assets/third-party/pixel-crawler/tfr-environment-props-v1618.json','utf8'));
  assert(Object.keys(terrain.tiles).length===260,'terrain manifest must contain 256 connected-water variants and four waterfall phases');
  assert(Object.keys(props.sprites).length===15,'prop manifest must contain only the selected runtime subset');
  const td=dimensions('source/assets/third-party/pixel-crawler/tfr-environment-terrain-v1618.png');
  const pd=dimensions('source/assets/third-party/pixel-crawler/tfr-environment-props-v1618.png');
  assert(td.w===512&&td.h===544&&pd.w===512&&pd.h===122,'runtime atlas dimensions must match the generated manifests');
  const main=fs.readFileSync('source/src/main.js','utf8');
  assert(main.includes('pixel_crawler_environment_runtime_v1618.js?v=1618')&&main.includes('pixelEnvironmentDone'),'startup must load and await the environment conversion');
  assert(!main.includes("loadRuntime('src/render/shared_water_shore_runtime_v1617.js"),'the rejected synthetic water candidate must not remain active');
  console.log('v1.6.18 Pixel Crawler environment passed: compact derivatives, 16-state topology, wilderness-wide selection, logical region props, atlas bounds, and startup readiness are valid.');
})().catch(error=>{console.error(error);process.exitCode=1;});
