const fs=require('fs');
const vm=require('vm');
const assert=(condition,message)=>{if(!condition)throw new Error(message);};

const emitted=[];
global.performance={now:()=>1000};
global.AO={events:{emit:event=>emitted.push(event)}};
global.Image=class{
  constructor(){this.decoding='';this.onload=null;this.onerror=null;this._src='';}
  set src(value){this._src=value;if(typeof this.onload==='function')this.onload();}
  get src(){return this._src;}
};

const assetsPath='source/src/render/assets.js';
const rendererPath='source/src/render/renderer.js';
const noticePath='source/assets/third-party/pixel-crawler/NOTICE.txt';
const assets=fs.readFileSync(assetsPath,'utf8');
const renderer=fs.readFileSync(rendererPath,'utf8');
const notice=fs.readFileSync(noticePath,'utf8');
const version=JSON.parse(fs.readFileSync('version.json','utf8'));

vm.runInThisContext(assets,{filename:assetsPath});

assert(version.version==='1.5.9-dev','Pixel art milestone version was not bumped to 1.5.9-dev.');
assert(AO.PixelCrawlerArt,'Pixel Crawler runtime object was not registered.');
assert(AO.PixelCrawlerArt.ready===true,'Embedded Pixel Crawler runtime did not become ready.');
assert(AO.PixelCrawlerArt.source.startsWith('data:image/png;base64,'),'Runtime art is not embedded as a PNG data URI.');

const encoded=AO.PixelCrawlerArt.source.split(',',2)[1];
const png=Buffer.from(encoded,'base64');
assert(png.length>4000,'Derived runtime atlas is unexpectedly small or corrupt.');
assert(png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'Derived runtime atlas is not a valid PNG payload.');
assert(!assets.includes('TRUNCATED_FOR_BREVITY'),'A truncated placeholder was committed into the embedded atlas.');

const calls=[];
const ctx={drawImage(...args){calls.push(args);}};
assert(AO.PixelCrawlerArt.drawTile(ctx,'woodfloor',3,4,'tavern')===true,'Tavern wood floor did not use the new art runtime.');
assert(AO.PixelCrawlerArt.drawTile(ctx,'woodfloor',3,4,'interior')===false,'Pixel Crawler pilot leaked into non-tavern themes.');
assert(AO.PixelCrawlerArt.drawEntity(ctx,{id:'bran',type:'npc',x:8,y:5},'tavern',1000)===true,'Bran did not use the new tavern sprite.');
assert(AO.PixelCrawlerArt.drawEntity(ctx,{id:'tavern_table_1',type:'decor',kind:'table',x:7,y:9},'tavern',1000)===true,'Tavern furniture did not use the new art runtime.');
assert(AO.PixelCrawlerArt.drawEntity(ctx,{id:'mira',type:'npc',x:13,y:8},'haven',1000)===false,'The tavern pilot replaced unrelated NPC art.');
assert(calls.length>=3,'Expected Pixel Crawler draw calls were not issued.');

assert(renderer.includes('AO.PixelCrawlerArt?.drawTile'),'Renderer does not consult the Pixel Crawler tile layer first.');
assert(renderer.includes('AO.PixelCrawlerArt?.drawEntity'),'Renderer does not consult the Pixel Crawler entity layer first.');
assert(notice.includes('Anokolisa'),'Third-party creator notice is missing.');
assert(notice.includes('small, derived runtime subset'),'Repository redistribution boundary is not documented.');

console.log('Pixel Crawler tavern v1.5.9 harness passed: valid embedded atlas, tavern-only tiles and props, Bran sprite, fallbacks, and creator notice.');
