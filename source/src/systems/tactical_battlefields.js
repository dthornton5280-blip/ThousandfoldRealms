/* Thousandfold Realms v1.4.1 — seeded biome encounter variations.
   Battlefields are temporary encounter-state overlays. The authored world grid and
   all stable map IDs remain unchanged when combat ends. */
AO.TACTICAL_REGION_PROFILES = {
  haven:{minLevel:1,maxLevel:2,baseBudget:1.2,maxGroup:1},
  wilds:{minLevel:1,maxLevel:5,baseBudget:1.65,maxGroup:3},
  lantern_mine:{minLevel:3,maxLevel:7,baseBudget:2.2,maxGroup:3},
  crypt:{minLevel:3,maxLevel:8,baseBudget:2.2,maxGroup:3},
  sunken_fen:{minLevel:5,maxLevel:10,baseBudget:2.7,maxGroup:4},
  emberwatch_ruins:{minLevel:7,maxLevel:12,baseBudget:3.1,maxGroup:4},
  veil_observatory:{minLevel:9,maxLevel:14,baseBudget:3.4,maxGroup:4}
};
AO.TacticalBattlefields = {
  blockers:new Set(['tree','stonewall','water','lilywater','roof','woodwall','bar','cliff_face','waterfall','rocks','fence']),
  hashSeed(value){let h=2166136261;for(const ch of String(value)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;},
  rng(seed){let x=this.hashSeed(seed)||1;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};},
  catalog(map){
    if(map?.id==='wilds')return[
      {id:'whisperwood_trail',name:'Whisperwood Trail',kind:'trail'},
      {id:'mossy_clearing',name:'Mossy Clearing',kind:'clearing'},
      {id:'broken_crossing',name:'Broken Stream Crossing',kind:'crossing'},
      {id:'ruined_ridge',name:'Old-Ward Ridge',kind:'ridge'}
    ];
    if(map?.theme==='wilds')return[
      {id:'fen_channels',name:'Fen Channels',kind:'crossing'},
      {id:'reed_clearing',name:'Reed-Cut Clearing',kind:'clearing'},
      {id:'sunken_road',name:'Sunken Causeway',kind:'trail'}
    ];
    if(map?.theme==='mine')return[
      {id:'mine_gallery',name:'Collapsed Gallery',kind:'ridge'},
      {id:'crystal_cut',name:'Crystal Cut',kind:'clearing'},
      {id:'ore_cart_lane',name:'Ore-Cart Lane',kind:'trail'}
    ];
    if(['crypt','cellar'].includes(map?.theme))return[
      {id:'broken_nave',name:'Broken Nave',kind:'ridge'},
      {id:'burial_crossing',name:'Burial Crossing',kind:'trail'},
      {id:'ash_court',name:'Ash Court',kind:'clearing'}
    ];
    if(map?.theme==='arcane')return[
      {id:'rune_orbit',name:'Rune Orbit',kind:'crossing'},
      {id:'star_chamber',name:'Star Chamber',kind:'clearing'},
      {id:'veil_axis',name:'Veil Axis',kind:'trail'}
    ];
    return[{id:'local_ground',name:`${map?.name||'Local'} Battlefield`,kind:'clearing'}];
  },
  build(map,baseGrid,boundary,actors,seed){
    const rand=this.rng(seed),catalog=this.catalog(map),template=catalog[Math.floor(rand()*catalog.length)]||catalog[0],grid=baseGrid.map(row=>row.slice()),protectedTiles=new Set(actors.map(a=>AO.Util.key(a.x,a.y))),cx=Math.floor((boundary.minX+boundary.maxX)/2),cy=Math.floor((boundary.minY+boundary.maxY)/2);
    const set=(x,y,tile)=>{if(x<boundary.minX||x>boundary.maxX||y<boundary.minY||y>boundary.maxY||protectedTiles.has(AO.Util.key(x,y)))return;const base=grid[y]?.[x];if(base==null||this.blockers.has(base))return;grid[y][x]=tile;};
    for(let y=boundary.minY;y<=boundary.maxY;y++)for(let x=boundary.minX;x<=boundary.maxX;x++){
      const base=grid[y]?.[x];if(base==null||this.blockers.has(base)||protectedTiles.has(AO.Util.key(x,y)))continue;
      const noise=rand(),dx=x-cx,dy=y-cy;
      if(template.kind==='trail'){
        const lane=Math.abs(dy-Math.round(Math.sin((x+this.hashSeed(seed)%7)*.55)*1.4));
        if(lane<=1)set(x,y,map.theme==='mine'?'cavefloor':map.theme==='crypt'?'cryptfloor':'path');
        else if(noise<.13)set(x,y,map.theme==='wilds'?'shrub':map.theme==='arcane'?'rune':'moss_stone');
      }else if(template.kind==='clearing'){
        const radius=Math.max(3,Math.min(boundary.maxX-boundary.minX,boundary.maxY-boundary.minY)*.34),d=Math.hypot(dx,dy);
        if(d<radius)set(x,y,map.theme==='mine'?'cavefloor':map.theme==='crypt'?'cryptfloor':map.theme==='arcane'?'magicfloor':'grass');
        else if(noise<.18)set(x,y,map.theme==='wilds'?'shrub':'moss_stone');
      }else if(template.kind==='crossing'){
        if(Math.abs(dx)<=1)set(x,y,map.theme==='arcane'?'rune':'shallow_water');
        if(Math.abs(dy)<=1)set(x,y,map.theme==='mine'?'cavefloor':map.theme==='crypt'?'cryptfloor':'bridge');
        else if(noise<.10)set(x,y,map.theme==='wilds'?'reeds':'moss_stone');
      }else if(template.kind==='ridge'){
        const ridge=Math.abs(dy+Math.round(Math.sin(x*.7)*1.6));
        if(ridge===0)set(x,y,'moss_stone');else if(ridge===1&&noise<.7)set(x,y,'stairs');else if(noise<.1)set(x,y,map.theme==='wilds'?'shrub':map.theme==='arcane'?'rune':'moss_stone');
      }
    }
    /* Keep every combatant tile and one orthogonal exit lane walkable. */
    for(const actor of actors){grid[actor.y][actor.x]=this.blockers.has(baseGrid[actor.y]?.[actor.x])?'path':baseGrid[actor.y][actor.x];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=actor.x+dx,y=actor.y+dy;if(x>=boundary.minX&&x<=boundary.maxX&&y>=boundary.minY&&y<=boundary.maxY&&this.blockers.has(grid[y]?.[x]))grid[y][x]='path';}}
    return{schema:1,id:template.id,name:template.name,seed:String(seed),grid};
  }
};
