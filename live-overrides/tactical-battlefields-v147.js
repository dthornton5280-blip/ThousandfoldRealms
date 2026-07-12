/* Thousandfold Realms v1.4.7-dev — isolated biome arenas and full tactical presentation */
(() => {
  if (window.__TF_TACTICAL_V147__) return;
  window.__TF_TACTICAL_V147__ = true;

  const install = () => {
    if (!window.AO?.CombatSystem || !AO.Renderer || !AO.TacticalBattlefields) return;

    const TILE = AO.CONFIG.tile;
    const WIDTH = AO.CONFIG.mapWidth;
    const HEIGHT = AO.CONFIG.mapHeight;
    const BLOCKERS = new Set([
      'tree','stonewall','water','lilywater','roof','woodwall',
      'bar','cliff_face','waterfall','rocks','fence'
    ]);

    Object.assign(AO.TACTICAL_TERRAIN, {
      cavefloor:{cost:1,label:'Cavern floor'},
      cryptfloor:{cost:1,label:'Crypt floor'},
      magicfloor:{cost:1,label:'Arcane floor'},
      crate:{cost:1,cover:1,label:'Supply crate'},
      crystal:{cost:1,cover:1,label:'Crystal outcrop'}
    });

    const hashSeed = value => {
      let h = 2166136261;
      for (const ch of String(value)) {
        h ^= ch.charCodeAt(0);
        h = Math.imul(h, 16777619);
      }
      return h >>> 0;
    };

    const makeRng = seed => {
      let x = hashSeed(seed) || 1;
      return () => {
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;
        return (x >>> 0) / 4294967296;
      };
    };

    const biomeKey = map => {
      if (map?.id === 'haven') return 'haven';
      if (map?.theme === 'mine') return 'mine';
      if (['crypt','cellar'].includes(map?.theme)) return 'crypt';
      if (map?.theme === 'arcane') return 'arcane';
      if (map?.theme === 'wilds' && map?.id !== 'wilds') return 'fen';
      return 'wilds';
    };

    const palettes = {
      haven:{theme:'haven',base:'cobble',road:'path',soft:'grass',cover:'crate',block:'stonewall',accent:'flower_patch',hazard:'shallow_water'},
      wilds:{theme:'wilds',base:'grass',road:'path',soft:'flower_patch',cover:'shrub',block:'tree',accent:'moss_stone',hazard:'shallow_water'},
      fen:{theme:'wilds',base:'grass',road:'path',soft:'reeds',cover:'shrub',block:'water',accent:'flower_patch',hazard:'shallow_water'},
      mine:{theme:'mine',base:'cavefloor',road:'cavefloor',soft:'moss_stone',cover:'rocks',block:'stonewall',accent:'crystal',hazard:'rune'},
      crypt:{theme:'crypt',base:'cryptfloor',road:'cryptfloor',soft:'moss_stone',cover:'stonewall',block:'stonewall',accent:'rune',hazard:'rune'},
      arcane:{theme:'arcane',base:'magicfloor',road:'rune',soft:'moss_stone',cover:'crystal',block:'stonewall',accent:'rune',hazard:'rune'}
    };

    const catalogs = {
      haven:[
        {id:'lantern_square',name:'Lantern Square',kind:'square'},
        {id:'chapel_lane',name:'Chapel Lane',kind:'lane'},
        {id:'market_crossing',name:'Market Crossing',kind:'crossing'},
        {id:'old_wall_court',name:'Old-Wall Court',kind:'hollow'},
        {id:'watch_approach',name:'Watch Approach',kind:'ridge'}
      ],
      wilds:[
        {id:'whisperwood_trail',name:'Whisperwood Trail',kind:'trail'},
        {id:'mossy_clearing',name:'Mossy Clearing',kind:'clearing'},
        {id:'broken_crossing',name:'Broken Stream Crossing',kind:'crossing'},
        {id:'ruined_ridge',name:'Old-Ward Ridge',kind:'ridge'},
        {id:'thorn_hollow',name:'Thorn Hollow',kind:'hollow'}
      ],
      fen:[
        {id:'fen_channels',name:'Fen Channels',kind:'crossing'},
        {id:'reed_clearing',name:'Reed-Cut Clearing',kind:'clearing'},
        {id:'sunken_road',name:'Sunken Causeway',kind:'trail'},
        {id:'drowned_isles',name:'Drowned Isles',kind:'islands'},
        {id:'mire_hollow',name:'Mire Hollow',kind:'hollow'}
      ],
      mine:[
        {id:'mine_gallery',name:'Collapsed Gallery',kind:'ridge'},
        {id:'crystal_cut',name:'Crystal Cut',kind:'clearing'},
        {id:'ore_cart_lane',name:'Ore-Cart Lane',kind:'trail'},
        {id:'split_chamber',name:'Split Chamber',kind:'lane'},
        {id:'flooded_adit',name:'Flooded Adit',kind:'crossing'}
      ],
      crypt:[
        {id:'broken_nave',name:'Broken Nave',kind:'ridge'},
        {id:'burial_crossing',name:'Burial Crossing',kind:'trail'},
        {id:'ash_court',name:'Ash Court',kind:'clearing'},
        {id:'ossuary_rows',name:'Ossuary Rows',kind:'lane'},
        {id:'saints_hollow',name:'Saints Hollow',kind:'hollow'}
      ],
      arcane:[
        {id:'rune_orbit',name:'Rune Orbit',kind:'crossing'},
        {id:'star_chamber',name:'Star Chamber',kind:'clearing'},
        {id:'veil_axis',name:'Veil Axis',kind:'trail'},
        {id:'fractured_ring',name:'Fractured Ring',kind:'hollow'},
        {id:'astral_isles',name:'Astral Isles',kind:'islands'}
      ]
    };

    const arenaBuilder = {
      blockers: BLOCKERS,
      width: WIDTH,
      height: HEIGHT,
      hashSeed,
      rng: makeRng,
      biomeKey,
      catalog(map) {
        return catalogs[biomeKey(map)] || catalogs.wilds;
      },
      palette(map) {
        return palettes[biomeKey(map)] || palettes.wilds;
      },
      blank(tile) {
        return Array.from({ length: HEIGHT }, () => Array.from({ length: WIDTH }, () => tile));
      },
      inBounds(x,y) {
        return x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT;
      },
      set(grid,x,y,tile) {
        if (this.inBounds(x,y)) grid[y][x] = tile;
      },
      rectangle(grid,x1,y1,x2,y2,tile) {
        for (let y=y1; y<=y2; y++) for (let x=x1; x<=x2; x++) this.set(grid,x,y,tile);
      },
      line(grid,x0,y0,x1,y1,tile,radius=1) {
        const dx=Math.abs(x1-x0),dy=Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;
        let err=dx-dy,x=x0,y=y0;
        for (;;) {
          for (let oy=1-radius; oy<radius; oy++) {
            for (let ox=1-radius; ox<radius; ox++) this.set(grid,x+ox,y+oy,tile);
          }
          if (x===x1 && y===y1) break;
          const e2=2*err;
          if (e2>-dy) { err-=dy; x+=sx; }
          if (e2<dx) { err+=dx; y+=sy; }
        }
      },
      ellipse(grid,cx,cy,rx,ry,tile) {
        for (let y=Math.floor(cy-ry); y<=Math.ceil(cy+ry); y++) {
          for (let x=Math.floor(cx-rx); x<=Math.ceil(cx+rx); x++) {
            if (((x-cx)/rx)**2 + ((y-cy)/ry)**2 <= 1) this.set(grid,x,y,tile);
          }
        }
      },
      naturalBorder(grid,palette,rand) {
        const midY=Math.floor(HEIGHT/2);
        for (let x=0; x<WIDTH; x++) {
          grid[0][x]=palette.block;
          grid[HEIGHT-1][x]=palette.block;
        }
        for (let y=0; y<HEIGHT; y++) {
          grid[y][0]=palette.block;
          grid[y][WIDTH-1]=palette.block;
        }

        for (let x=1; x<WIDTH-1; x++) {
          const exitLane=Math.abs(x-Math.floor(WIDTH/2))<3;
          if (!exitLane && rand()<.48) grid[1][x]=rand()<.7?palette.block:palette.cover;
          if (!exitLane && rand()<.42) grid[HEIGHT-2][x]=rand()<.7?palette.block:palette.cover;
        }
        for (let y=1; y<HEIGHT-1; y++) {
          const exitLane=Math.abs(y-midY)<3;
          if (!exitLane && rand()<.48) grid[y][1]=rand()<.7?palette.block:palette.cover;
          if (!exitLane && rand()<.42) grid[y][WIDTH-2]=rand()<.7?palette.block:palette.cover;
        }

        this.rectangle(grid,0,midY-2,2,midY+2,palette.base);
        this.rectangle(grid,WIDTH-3,midY-2,WIDTH-1,midY+2,palette.base);
      },
      carveTemplate(grid,template,palette,rand) {
        const cx=Math.floor(WIDTH/2),cy=Math.floor(HEIGHT/2);

        if (template.kind==='trail') {
          for (let x=1; x<WIDTH-1; x++) {
            const y=cy+Math.round(2.1*Math.sin(.42*(x+(hashSeed(template.id)%7))));
            this.rectangle(grid,x,y-1,x,y+1,palette.road);
            if (rand()<.22) this.set(grid,x,y+(rand()<.5?-3:3),palette.cover);
          }
          this.line(grid,1,cy,5,cy,palette.road,2);
          this.line(grid,WIDTH-6,cy,WIDTH-2,cy,palette.road,2);
        } else if (template.kind==='clearing') {
          this.ellipse(grid,cx,cy,11,6.4,palette.base);
          this.line(grid,1,cy,WIDTH-2,cy,palette.road,1);
          for (let i=0;i<16;i++) {
            const angle=rand()*Math.PI*2;
            const x=Math.round(cx+Math.cos(angle)*(9+rand()*3));
            const y=Math.round(cy+Math.sin(angle)*(4.7+rand()*2));
            this.set(grid,x,y,rand()<.65?palette.cover:palette.soft);
          }
        } else if (template.kind==='crossing') {
          this.rectangle(grid,cx-2,1,cx+2,HEIGHT-2,palette.hazard);
          this.rectangle(grid,1,cy-1,WIDTH-2,cy+1,palette.road);
          this.rectangle(grid,cx-2,cy-1,cx+2,cy+1,'bridge');
          for (let y=2;y<HEIGHT-2;y++) {
            if (rand()<.48) this.set(grid,cx-3,y,palette.soft);
            if (rand()<.48) this.set(grid,cx+3,y,palette.soft);
          }
        } else if (template.kind==='ridge') {
          for (let x=2;x<WIDTH-2;x++) {
            const y=cy+Math.round(1.8*Math.sin(.58*x));
            this.set(grid,x,y,palette.cover);
            if (x%6===0) {
              this.set(grid,x,y,'stairs');
              this.set(grid,x,y+1,palette.road);
            }
          }
          this.line(grid,1,cy+3,WIDTH-2,cy+3,palette.road,1);
          this.line(grid,1,cy-4,WIDTH-2,cy-4,palette.base,1);
        } else if (template.kind==='hollow') {
          for (let y=2;y<HEIGHT-2;y++) {
            for (let x=2;x<WIDTH-2;x++) {
              const d=Math.hypot((x-cx)/10.4,(y-cy)/5.7);
              if (d>.78 && d<1.08) grid[y][x]=rand()<.76?palette.cover:palette.soft;
            }
          }
          this.line(grid,1,cy,WIDTH-2,cy,palette.road,1);
          this.ellipse(grid,cx,cy,6,3.3,palette.base);
        } else if (template.kind==='islands') {
          this.rectangle(grid,1,1,WIDTH-2,HEIGHT-2,palette.hazard);
          const islands=[[5,cy,4,3],[13,4,4,2.7],[15,13,5,2.8],[24,cy,4,3]];
          for (const [x,y,rx,ry] of islands) this.ellipse(grid,x,y,rx,ry,palette.base);
          this.line(grid,2,cy,WIDTH-3,cy,'bridge',1);
          this.line(grid,13,5,15,12,'bridge',1);
        } else if (template.kind==='square') {
          this.rectangle(grid,2,2,WIDTH-3,HEIGHT-3,'cobble');
          this.rectangle(grid,cx-2,cy-2,cx+2,cy+2,palette.accent);
          this.line(grid,1,cy,WIDTH-2,cy,'path',1);
          this.line(grid,cx,1,cx,HEIGHT-2,'path',1);
          for (const [x,y] of [[5,4],[5,HEIGHT-5],[WIDTH-6,4],[WIDTH-6,HEIGHT-5]]) this.set(grid,x,y,'crate');
        } else if (template.kind==='lane') {
          this.rectangle(grid,1,cy-2,WIDTH-2,cy+2,palette.road);
          for (let x=5;x<WIDTH-5;x+=5) {
            this.set(grid,x,cy-3,palette.cover);
            this.set(grid,x,cy+3,palette.cover);
          }
        }
      },
      scatter(grid,palette,rand) {
        const cy=Math.floor(HEIGHT/2);
        for (let y=2;y<HEIGHT-2;y++) {
          for (let x=2;x<WIDTH-2;x++) {
            if (x<8 || x>WIDTH-9 || Math.abs(y-cy)<=2) continue;
            const tile=grid[y][x];
            if (BLOCKERS.has(tile) || ['bridge','path','cobble','cavefloor','cryptfloor','magicfloor','rune'].includes(tile)) continue;
            const roll=rand();
            if (roll<.045) grid[y][x]=palette.cover;
            else if (roll<.095) grid[y][x]=palette.soft;
            else if (roll<.12) grid[y][x]=palette.accent;
          }
        }
      },
      reserveSpawnZones(grid,palette) {
        const cy=Math.floor(HEIGHT/2);
        this.rectangle(grid,1,cy-4,7,cy+4,palette.base);
        this.rectangle(grid,WIDTH-8,cy-4,WIDTH-2,cy+4,palette.base);
        this.rectangle(grid,6,cy-1,WIDTH-7,cy+1,palette.road);
      },
      nearestOpen(grid,start,used=new Set()) {
        const queue=[start],seen=new Set([`${start.x},${start.y}`]);
        while (queue.length) {
          const point=queue.shift(),key=`${point.x},${point.y}`;
          if (this.inBounds(point.x,point.y) && !BLOCKERS.has(grid[point.y][point.x]) && !used.has(key)) return point;
          for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
            const next={x:point.x+dx,y:point.y+dy},nextKey=`${next.x},${next.y}`;
            if (this.inBounds(next.x,next.y) && !seen.has(nextKey)) {
              seen.add(nextKey);
              queue.push(next);
            }
          }
        }
        return {x:2,y:Math.floor(HEIGHT/2)};
      },
      assignSpawns(grid,actors,rand) {
        const cy=Math.floor(HEIGHT/2),used=new Set();
        const player=actors.find(actor=>actor.id==='player' || actor.side==='player');
        const enemies=actors.filter(actor=>actor.side==='enemy');
        const playerStarts=[
          {x:4,y:cy},{x:4,y:cy-2},{x:5,y:cy+2},{x:6,y:cy-1}
        ];
        const enemyStarts=[
          {x:WIDTH-5,y:cy},{x:WIDTH-5,y:cy-3},{x:WIDTH-5,y:cy+3},
          {x:WIDTH-8,y:cy-4},{x:WIDTH-8,y:cy+4},{x:WIDTH-7,y:cy-1}
        ];

        if (player) {
          const point=this.nearestOpen(grid,playerStarts[Math.floor(rand()*playerStarts.length)],used);
          player.x=point.x;
          player.y=point.y;
          used.add(`${point.x},${point.y}`);
        }

        enemies.forEach((enemy,index)=>{
          const base=enemyStarts[index%enemyStarts.length];
          const point=this.nearestOpen(grid,base,used);
          enemy.x=point.x;
          enemy.y=point.y;
          used.add(`${point.x},${point.y}`);
        });
      },
      build(map,_baseGrid,boundary,actors,seed) {
        const rand=this.rng(seed);
        const key=this.biomeKey(map);
        const palette=this.palette(map);
        const catalog=this.catalog(map);
        const template=catalog[Math.floor(rand()*catalog.length)] || catalog[0];
        const grid=this.blank(palette.base);

        this.naturalBorder(grid,palette,rand);
        this.carveTemplate(grid,template,palette,rand);
        this.scatter(grid,palette,rand);
        this.reserveSpawnZones(grid,palette);
        this.assignSpawns(grid,actors,rand);

        const fullBoundary={minX:1,minY:1,maxX:WIDTH-2,maxY:HEIGHT-2};
        if (boundary) Object.assign(boundary,fullBoundary);

        return {
          schema:3,
          isolated:true,
          id:template.id,
          name:template.name,
          biome:key,
          theme:palette.theme,
          sourceMapId:map?.id||null,
          seed:String(seed),
          grid,
          boundary:fullBoundary,
          width:WIDTH,
          height:HEIGHT
        };
      }
    };

    AO.TacticalBattlefields = arenaBuilder;

    const combatProto = AO.CombatSystem.prototype;
    if (!combatProto.__tfIsolatedArenaPatched) {
      combatProto.__tfIsolatedArenaPatched = true;

      const originalStart = combatProto.start;
      const originalResume = combatProto.resume;
      const originalMovePlayerTo = combatProto.movePlayerTo;
      const originalEndEncounter = combatProto.endEncounter;
      const originalSyncWorldActors = combatProto.syncWorldActors;
      const originalHasLineOfSight = combatProto.hasLineOfSight;
      const originalCoverBonus = combatProto.coverBonus;

      combatProto.syncWorldActors = function () {
        if (this.current?.battlefield?.isolated) return;
        return originalSyncWorldActors.apply(this, arguments);
      };

      combatProto.hasLineOfSight = function (a,b) {
        if (!this.current?.battlefield?.isolated) return originalHasLineOfSight.call(this,a,b);
        return !this.lineTiles(a,b).some(point=>AO.TacticalRules.blockingTiles.has(this.tileAt(point.x,point.y)));
      };

      combatProto.coverBonus = function (attacker,target) {
        if (!this.current?.battlefield?.isolated) return originalCoverBonus.call(this,attacker,target);
        const line=this.lineTiles(attacker,target);
        if (!line[line.length-1]) return 0;
        const dx=Math.sign(attacker.x-target.x),dy=Math.sign(attacker.y-target.y);
        const tile=this.tileAt(target.x+dx,target.y+dy);
        return AO.TacticalRules.tileInfo(tile).cover||0;
      };

      combatProto.start = function (spawn) {
        const returnState={
          mapId:this.game.state.world.mapId,
          x:this.game.state.world.x,
          y:this.game.state.world.y
        };
        const result=originalStart.call(this,spawn);
        if (this.current?.battlefield?.isolated) {
          this.current.returnState=returnState;
          this.current.boundary={...this.current.battlefield.boundary};
          this.current.camera={
            x:(this.current.battlefield.width*TILE)/2,
            y:(this.current.battlefield.height*TILE)/2,
            zoom:1
          };
          this.game.state.world.mapId=returnState.mapId;
          this.game.state.world.x=returnState.x;
          this.game.state.world.y=returnState.y;
          this.refresh();
        }
        return result;
      };

      combatProto.resume = function (saved) {
        if (saved && !saved.battlefield?.isolated) {
          saved.returnState ||= {
            mapId:this.game.state.world.mapId,
            x:this.game.state.world.x,
            y:this.game.state.world.y
          };
          saved.boundary ||= {};
          saved.battlefield=arenaBuilder.build(
            this.game.world.map,
            this.game.world.grid,
            saved.boundary,
            Object.values(saved.actors||{}),
            saved.battlefield?.seed||saved.id||Date.now()
          );
          saved.boundary={...saved.battlefield.boundary};
          saved.schema=3;
          saved.camera={
            x:(saved.battlefield.width*TILE)/2,
            y:(saved.battlefield.height*TILE)/2,
            zoom:1
          };
        }

        const result=originalResume.call(this,saved);
        if (result && this.current?.battlefield?.isolated) {
          this.current.returnState ||= {
            mapId:this.game.state.world.mapId,
            x:this.game.state.world.x,
            y:this.game.state.world.y
          };
          this.game.state.world.mapId=this.current.returnState.mapId;
          this.game.state.world.x=this.current.returnState.x;
          this.game.state.world.y=this.current.returnState.y;
          this.current.camera.zoom=AO.Util.clamp(this.current.camera.zoom||1,1,1.9);
          this.refresh();
        }
        return result;
      };

      combatProto.movePlayerTo = function () {
        const returnState=this.current?.battlefield?.isolated
          ? {...(this.current.returnState||this.game.state.world)}
          : null;
        const result=originalMovePlayerTo.apply(this,arguments);
        if (returnState) {
          this.game.state.world.mapId=returnState.mapId;
          this.game.state.world.x=returnState.x;
          this.game.state.world.y=returnState.y;
        }
        return result;
      };

      combatProto.endEncounter = function () {
        const returnState=this.current?.battlefield?.isolated
          ? {...(this.current.returnState||this.game.state.world)}
          : null;
        const result=originalEndEncounter.apply(this,arguments);
        if (returnState) {
          this.game.state.world.mapId=returnState.mapId;
          this.game.state.world.x=returnState.x;
          this.game.state.world.y=returnState.y;
          this.game.world.path=[];
          this.game.updateNearbyPrompt?.();
          AO.events.emit('worldChanged');
        }
        return result;
      };
    }

    const findOwnMethodPrototype = (ctor,name) => {
      let proto=ctor?.prototype;
      while (proto && proto!==Object.prototype) {
        if (Object.prototype.hasOwnProperty.call(proto,name)) return proto;
        proto=Object.getPrototypeOf(proto);
      }
      return null;
    };

    const tacticalRendererProto=findOwnMethodPrototype(AO.Renderer,'drawTacticalOverlay');
    if (!tacticalRendererProto || tacticalRendererProto.__tfArenaRendererPatched) return;
    tacticalRendererProto.__tfArenaRendererPatched=true;

    const baseRendererProto=Object.getPrototypeOf(tacticalRendererProto);
    const baseRender=baseRendererProto.render;

    const arenaDimensions = renderer => {
      const battlefield=renderer.game.combat?.current?.battlefield;
      return {
        width:(battlefield?.width||WIDTH)*TILE,
        height:(battlefield?.height||HEIGHT)*TILE
      };
    };

    const displayMetrics = renderer => {
      const cam=renderer.cameraState();
      const dims=arenaDimensions(renderer);
      const fit=Math.min(renderer.canvas.width/dims.width,renderer.canvas.height/dims.height);
      const zoom=AO.Util.clamp(cam?.zoom||1,1,1.9);
      return {cam,dims,fit,zoom,scale:fit*zoom};
    };

    tacticalRendererProto.clampCamera = function () {
      const cam=this.cameraState();
      if (!cam) return;
      const {dims,scale}=displayMetrics(this);
      const halfW=this.canvas.width/(2*scale);
      const halfH=this.canvas.height/(2*scale);
      cam.zoom=AO.Util.clamp(cam.zoom||1,1,1.9);
      cam.x=halfW>=dims.width/2
        ? dims.width/2
        : AO.Util.clamp(cam.x??dims.width/2,halfW,dims.width-halfW);
      cam.y=halfH>=dims.height/2
        ? dims.height/2
        : AO.Util.clamp(cam.y??dims.height/2,halfH,dims.height-halfH);
    };

    tacticalRendererProto.panCamera = function (dx,dy) {
      const cam=this.cameraState();
      if (!cam) return;
      const fit=displayMetrics(this).fit||1;
      cam.x+=dx/fit;
      cam.y+=dy/fit;
      this.clampCamera();
    };

    tacticalRendererProto.zoomCamera = function (delta) {
      const cam=this.cameraState();
      if (!cam) return;
      cam.zoom=AO.Util.clamp((cam.zoom||1)+delta,1,1.9);
      this.clampCamera();
    };

    tacticalRendererProto.centerOnActor = function (actor=this.game.combat?.activeActor(),hard=true) {
      const cam=this.cameraState();
      if (!cam || !actor) return;
      const x=actor.x*TILE+TILE/2,y=actor.y*TILE+TILE/2;
      if (hard) {
        cam.x=x;
        cam.y=y;
      } else {
        cam.x=cam.x*.62+x*.38;
        cam.y=cam.y*.62+y*.38;
      }
      this.clampCamera();
    };

    tacticalRendererProto.screenToWorld = function (px,py) {
      const cam=this.cameraState();
      if (this.game.state?.mode!=='combat' || !cam) return {x:px,y:py};
      this.clampCamera();
      const {scale}=displayMetrics(this);
      return {
        x:cam.x+(px-this.canvas.width/2)/scale,
        y:cam.y+(py-this.canvas.height/2)/scale
      };
    };

    tacticalRendererProto.drawTacticalOverlay = function (ctx) {
      const combat=this.game.combat,c=combat?.current;
      if (!c) return;
      const playerTurn=combat.isPlayerTurn();
      const reachable=playerTurn?combat.reachableTiles():new Map();
      const pending=AO.ABILITIES[c.pendingAbilityId]||AO.ABILITIES.basic_attack;

      ctx.save();
      ctx.imageSmoothingEnabled=false;

      const b=c.boundary;
      ctx.strokeStyle='rgba(240,190,79,.78)';
      ctx.lineWidth=2;
      const corner=12;
      for (const [x,y,sx,sy] of [
        [b.minX*TILE+3,b.minY*TILE+3,1,1],
        [(b.maxX+1)*TILE-3,b.minY*TILE+3,-1,1],
        [b.minX*TILE+3,(b.maxY+1)*TILE-3,1,-1],
        [(b.maxX+1)*TILE-3,(b.maxY+1)*TILE-3,-1,-1]
      ]) {
        ctx.beginPath();
        ctx.moveTo(x+sx*corner,y);
        ctx.lineTo(x,y);
        ctx.lineTo(x,y+sy*corner);
        ctx.stroke();
      }

      if (playerTurn) {
        for (const [key,cost] of reachable) {
          const [x,y]=key.split(',').map(Number);
          if (x===combat.playerActor().x && y===combat.playerActor().y) continue;
          ctx.fillStyle=`rgba(73,154,203,${Math.max(.1,.29-cost*.018)})`;
          ctx.fillRect(x*TILE+3,y*TILE+3,TILE-6,TILE-6);
          ctx.strokeStyle='rgba(135,215,247,.48)';
          ctx.strokeRect(x*TILE+5,y*TILE+5,TILE-10,TILE-10);
        }

        for (const enemy of combat.livingEnemies()) {
          if (!combat.validTarget(enemy,pending).ok) continue;
          ctx.fillStyle='rgba(194,70,65,.23)';
          ctx.fillRect(enemy.x*TILE+2,enemy.y*TILE+2,TILE-4,TILE-4);
          ctx.strokeStyle='rgba(255,125,112,.92)';
          ctx.lineWidth=2;
          ctx.strokeRect(enemy.x*TILE+3,enemy.y*TILE+3,TILE-6,TILE-6);
        }
      }

      for (const actor of Object.values(c.actors).filter(a=>a.side==='enemy'&&a.hp>0)) {
        AO.SpriteFactory.enemy(ctx,actor.x*TILE,actor.y*TILE,actor.visual,1);
      }

      const selected=combat.actor(c.selectedTargetId),active=combat.activeActor();
      if (selected?.hp>0) {
        const player=combat.playerActor();
        ctx.strokeStyle='#f6df78';
        ctx.lineWidth=3;
        ctx.strokeRect(selected.x*TILE+1,selected.y*TILE+1,TILE-2,TILE-2);
        if (combat.hasLineOfSight(player,selected)) {
          ctx.strokeStyle='rgba(246,223,120,.48)';
          ctx.lineWidth=1;
          ctx.beginPath();
          ctx.moveTo(player.x*TILE+TILE/2,player.y*TILE+TILE/2);
          ctx.lineTo(selected.x*TILE+TILE/2,selected.y*TILE+TILE/2);
          ctx.stroke();
        }
      }

      for (const actor of Object.values(c.actors).filter(a=>combat.actorAlive(a))) {
        const hp=actor.side==='player'?this.game.state.player.hp:actor.hp;
        const max=actor.side==='player'?this.game.state.player.maxHp:actor.maxHp;
        const x=actor.x*TILE+2,y=actor.y*TILE-6,w=TILE-4;
        ctx.fillStyle='rgba(4,6,8,.88)';
        ctx.fillRect(x,y,w,5);
        ctx.fillStyle=actor.side==='player'?'#72ad79':'#c45b55';
        ctx.fillRect(x+1,y+1,Math.max(0,(w-2)*hp/max),3);
        if (active?.id===actor.id) {
          ctx.fillStyle='#f0c66e';
          ctx.font='bold 12px Courier New';
          ctx.textAlign='center';
          ctx.fillText('▼',actor.x*TILE+TILE/2,actor.y*TILE-9);
        }
        const terrain=AO.TacticalRules.tileInfo(combat.tileAt(actor.x,actor.y));
        if (terrain.hazard) {
          ctx.fillStyle='#f0a05d';
          ctx.font='bold 9px Courier New';
          ctx.textAlign='right';
          ctx.fillText('!',actor.x*TILE+TILE-2,actor.y*TILE+10);
        }
      }

      ctx.restore();
    };

    const backdrop = {
      haven:['#0e1114','#171617','#342b1d'],
      wilds:['#07100c','#132019','#27382b'],
      fen:['#071114','#102329','#263c38'],
      mine:['#090a0b','#171a1b','#303437'],
      crypt:['#090a0c','#171617','#30252a'],
      arcane:['#0a0a14','#17152a','#332954']
    };

    const restoreBaseCanvas = renderer => {
      if (!renderer.__tfBaseCanvasSize || !renderer.__tfCombatCanvasSized) return;
      renderer.canvas.width=renderer.__tfBaseCanvasSize.width;
      renderer.canvas.height=renderer.__tfBaseCanvasSize.height;
      renderer.ctx=renderer.canvas.getContext('2d');
      renderer.ctx.imageSmoothingEnabled=false;
      renderer.__tfCombatCanvasSized=false;
    };

    const sizeCombatCanvas = renderer => {
      const canvas=renderer.canvas;
      renderer.__tfBaseCanvasSize ||= {width:canvas.width,height:canvas.height};
      const rect=canvas.getBoundingClientRect();
      const targetWidth=Math.max(renderer.__tfBaseCanvasSize.width,Math.round(rect.width));
      const targetHeight=Math.max(renderer.__tfBaseCanvasSize.height,Math.round(rect.height));
      if (Math.abs(canvas.width-targetWidth)>2 || Math.abs(canvas.height-targetHeight)>2) {
        canvas.width=targetWidth;
        canvas.height=targetHeight;
        renderer.ctx=canvas.getContext('2d');
        renderer.ctx.imageSmoothingEnabled=false;
      }
      renderer.__tfCombatCanvasSized=true;
    };

    tacticalRendererProto.render = function () {
      const combat=this.game.combat,c=combat?.current;
      if (this.game.state?.mode!=='combat' || !c) {
        restoreBaseCanvas(this);
        return baseRender.call(this);
      }

      sizeCombatCanvas(this);
      const visibleCanvas=this.canvas;
      const visibleCtx=this.ctx;
      const battlefield=c.battlefield;
      const worldWidth=(battlefield.width||WIDTH)*TILE;
      const worldHeight=(battlefield.height||HEIGHT)*TILE;

      this.tacticalSurface ||= document.createElement('canvas');
      const surface=this.tacticalSurface;
      if (surface.width!==worldWidth) surface.width=worldWidth;
      if (surface.height!==worldHeight) surface.height=worldHeight;
      const surfaceCtx=surface.getContext('2d');
      surfaceCtx.imageSmoothingEnabled=false;
      surfaceCtx.clearRect(0,0,worldWidth,worldHeight);

      const world=this.game.world;
      const stateWorld=this.game.state.world;
      const original={
        grid:world.grid,
        entities:world.entities,
        map:world.map,
        path:world.path,
        x:stateWorld.x,
        y:stateWorld.y,
        canvas:this.canvas,
        ctx:this.ctx
      };

      try {
        world.grid=battlefield.grid;
        world.entities=[];
        world.path=[];
        world.map={...original.map,theme:battlefield.theme||original.map?.theme,buildings:[]};
        const player=combat.playerActor();
        if (player) {
          stateWorld.x=player.x;
          stateWorld.y=player.y;
        }
        this.canvas=surface;
        this.ctx=surfaceCtx;
        baseRender.call(this);
        this.drawTacticalOverlay(surfaceCtx);
      } finally {
        this.canvas=original.canvas;
        this.ctx=original.ctx;
        world.grid=original.grid;
        world.entities=original.entities;
        world.map=original.map;
        world.path=original.path;
        stateWorld.x=original.x;
        stateWorld.y=original.y;
      }

      this.clampCamera();
      const key=battlefield.biome||'wilds';
      const colors=backdrop[key]||backdrop.wilds;
      const gradient=visibleCtx.createRadialGradient(
        visibleCanvas.width/2,visibleCanvas.height*.46,Math.min(visibleCanvas.width,visibleCanvas.height)*.08,
        visibleCanvas.width/2,visibleCanvas.height*.5,Math.max(visibleCanvas.width,visibleCanvas.height)*.7
      );
      gradient.addColorStop(0,colors[2]);
      gradient.addColorStop(.48,colors[1]);
      gradient.addColorStop(1,colors[0]);
      visibleCtx.fillStyle=gradient;
      visibleCtx.fillRect(0,0,visibleCanvas.width,visibleCanvas.height);

      const {cam,scale}=displayMetrics(this);
      visibleCtx.save();
      visibleCtx.imageSmoothingEnabled=false;
      visibleCtx.translate(visibleCanvas.width/2,visibleCanvas.height/2);
      visibleCtx.scale(scale,scale);
      visibleCtx.translate(-cam.x,-cam.y);
      visibleCtx.drawImage(surface,0,0);
      visibleCtx.restore();

      const fit=Math.min(visibleCanvas.width/worldWidth,visibleCanvas.height/worldHeight);
      const frameWidth=worldWidth*fit,frameHeight=worldHeight*fit;
      const frameX=(visibleCanvas.width-frameWidth)/2,frameY=(visibleCanvas.height-frameHeight)/2;
      if ((cam.zoom||1)===1) {
        visibleCtx.save();
        visibleCtx.strokeStyle='rgba(223,184,94,.58)';
        visibleCtx.lineWidth=2;
        visibleCtx.strokeRect(frameX+.5,frameY+.5,frameWidth-1,frameHeight-1);
        visibleCtx.strokeStyle='rgba(0,0,0,.58)';
        visibleCtx.lineWidth=7;
        visibleCtx.strokeRect(frameX-3.5,frameY-3.5,frameWidth+7,frameHeight+7);
        visibleCtx.restore();
      }

      const edge=visibleCtx.createLinearGradient(0,0,visibleCanvas.width,0);
      edge.addColorStop(0,'rgba(0,0,0,.46)');
      edge.addColorStop(.12,'rgba(0,0,0,0)');
      edge.addColorStop(.88,'rgba(0,0,0,0)');
      edge.addColorStop(1,'rgba(0,0,0,.46)');
      visibleCtx.fillStyle=edge;
      visibleCtx.fillRect(0,0,visibleCanvas.width,visibleCanvas.height);

      visibleCtx.save();
      visibleCtx.fillStyle='rgba(8,10,12,.82)';
      visibleCtx.fillRect(12,12,260,25);
      visibleCtx.strokeStyle='rgba(225,184,92,.64)';
      visibleCtx.strokeRect(12.5,12.5,259,24);
      visibleCtx.fillStyle='#e8c873';
      visibleCtx.font='bold 10px Courier New';
      visibleCtx.fillText(`${battlefield.name||'Battlefield'} • ${Math.round((cam.zoom||1)*100)}%`,21,29);
      visibleCtx.restore();
    };
  };

  document.addEventListener('DOMContentLoaded', install, { once:true });
})();