/* Whisperwood grass/road candidate topology validation. */
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file)),text=file=>read(file).toString('utf8');
const check=(value,message)=>{if(!value)throw new Error(message);};
const manifest=JSON.parse(text('source/assets/thousandfold/tiles/whisperwood-ground-v1615.json'));
const png=read('source/assets/thousandfold/tiles/whisperwood-ground-v1615.png');
const runtime=text('source/src/render/whisperwood_ground_runtime_v1615.js'),main=text('source/src/main.js');
check(png.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'candidate atlas must be PNG');
check(png.readUInt32BE(16)===512&&png.readUInt32BE(20)===320,'candidate atlas must remain 512x320');
check(Object.keys(manifest.tiles).length===153,'atlas must expose 9 grass phases plus 16x9 explicit road topology phases');
check(Object.keys(manifest.topologyBits).length===16,'all four-neighbor road combinations must be named');
for(const tile of Object.values(manifest.tiles))check(tile.x>=0&&tile.y>=0&&tile.x+32<=512&&tile.y+32<=320,'manifest tile outside atlas');
check(runtime.includes("world?.map?.theme!=='wilds'"),'runtime must accept the shared wilderness theme and reject town/interior maps');
check(runtime.includes("new Set(['path','bridge','stairs'])"),'road topology must connect to bridge and stair continuations');
check(runtime.includes('imageSmoothingEnabled=false'),'candidate must render nearest-neighbor');
check(main.includes('whisperwood_ground_runtime_v1615.js?v=1618-wilderness'),'main must load the approved wilderness ground runtime explicitly');

class MockImage{constructor(){this.naturalWidth=512;this.naturalHeight=320;}set src(value){this._src=value;this.onload?.();}}
const fallback=[],draws=[],AO={events:{emit(){}},ThousandfoldArt:{drawTile(...args){fallback.push(args);return 'fallback';}}};
const context={console,URL,Image:MockImage,AO,document:{baseURI:'http://local/',documentElement:{dataset:{}}},window:null};context.window=context;context.window.AO=AO;
vm.createContext(context);vm.runInContext(runtime,context);
const grid=Array.from({length:5},()=>Array(5).fill('grass'));grid[2][2]='path';grid[1][2]='path';grid[2][3]='path';
context.game={world:{map:{id:'wilds',theme:'wilds'},grid}};
const art=AO.WhisperwoodGroundArtV1615;
check(art.selectTile('path',2,2)==='whisper_road_corner_ne_p22','north/east neighbors must select the NE road corner at matching macro phase');
grid[3][2]='path';grid[2][1]='path';
check(art.selectTile('path',2,2)==='whisper_road_cross_p22','four neighbors must select the cross topology');
check(art.selectTile('grass',1,1)==='whisper_grass_p11','grass must preserve coherent 3x3 phase selection');
const ctx={save(){},restore(){},drawImage(...args){draws.push(args);},imageSmoothingEnabled:true};
check(art.drawTile(ctx,'path',2,2)===true&&draws.length===1,'ready candidate must draw its road tile');
context.game.world.map={id:'southwood_trail',theme:'wilds'};check(art.drawTile(ctx,'grass',1,1)===true,'approved ground must unify every wilderness route');
context.game.world.map={id:'haven',theme:'haven'};check(art.drawTile(ctx,'grass',1,1)===false,'approved wilderness ground must not affect Haven');
console.log('Whisperwood v1.6.15 ground validated: 153 explicit grass/road topology tiles, bridge continuity, wilderness-wide scope, and nearest-neighbor rendering passed.');
