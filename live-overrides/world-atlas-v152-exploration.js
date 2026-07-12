/* Thousandfold Realms v1.5.2-dev — explored atlas, persistent fog, and visited-only travel. */
(() => {
  'use strict';
  if (!window.AO || !AO.UI || !AO.Game || !AO.WorldSystem || !AO.ATLAS_REGIONS || !AO.ATLAS_LOCATIONS) return;

  const REGION_ID = 'last_lantern_vale';
  const COLS = 30;
  const ROWS = 18;
  const dangerRank = {None:0,Low:1,Moderate:2,High:3,Severe:4};

  /* New characters begin with Haven charted. Adjacent destinations are learned
     naturally by the existing discovery system when a location is visited. */
  for (const location of Object.values(AO.ATLAS_LOCATIONS)) location.initialKnown = location.id === 'haven';

  const ensureExplorationAtlas = state => {
    if (!state) return null;
    state.atlas ||= {};
    const atlas = state.atlas;
    atlas.knownLocations ||= {};
    atlas.visitedLocations ||= {};
    atlas.discoveredRoutes ||= {};
    atlas.discoveredRegions ||= {[REGION_ID]:true};
    atlas.revealedMapAreas ||= {world:[],regions:{}};
    atlas.revealedMapAreas.world ||= [];
    atlas.revealedMapAreas.regions ||= {};
    atlas.revealedMapAreas.regions[REGION_ID] ||= [];

    for (const [locationId,visited] of Object.entries(atlas.visitedLocations)) {
      if (visited) revealLocation(atlas,locationId);
    }
    return atlas;
  };

  const addRevealPoint = (list,point) => {
    const existing = list.find(item => item.id === point.id);
    if (existing) Object.assign(existing,point);
    else list.push(point);
  };

  function revealLocation(atlas,locationId) {
    const location = AO.ATLAS_LOCATIONS[locationId];
    if (!atlas || !location) return;
    atlas.discoveredRegions[location.regionId] = true;
    atlas.visitedLocations[locationId] = true;
    atlas.knownLocations[locationId] = true;
    addRevealPoint(atlas.revealedMapAreas.world,{
      id:location.regionId,x:AO.ATLAS_REGIONS[location.regionId]?.x ?? 50,
      y:AO.ATLAS_REGIONS[location.regionId]?.y ?? 50,r:17
    });
    atlas.revealedMapAreas.regions[location.regionId] ||= [];
    addRevealPoint(atlas.revealedMapAreas.regions[location.regionId],{
      id:locationId,x:location.x,y:location.y,r:location.type==='city'?15:location.type==='town'?14:12
    });
  }

  const revealCurrentMap = game => {
    const atlas = ensureExplorationAtlas(game?.state);
    const mapId = game?.state?.world?.mapId;
    const locationId = AO.ATLAS_MAP_INDEX?.[mapId];
    if (atlas && locationId) revealLocation(atlas,locationId);
  };

  const oldWorldLoad = AO.WorldSystem.prototype.load;
  AO.WorldSystem.prototype.load = function exploredAtlasLoad(...args) {
    const result = oldWorldLoad.apply(this,args);
    revealCurrentMap(this.game);
    return result;
  };

  const oldNewGame = AO.Game.prototype.newGame;
  AO.Game.prototype.newGame = function exploredAtlasNewGame(...args) {
    const result = oldNewGame.apply(this,args);
    revealCurrentMap(this);
    return result;
  };

  const oldMigrateState = AO.Game.prototype.migrateState;
  AO.Game.prototype.migrateState = function exploredAtlasMigrate(...args) {
    const result = oldMigrateState.apply(this,args);
    revealCurrentMap(this);
    return result;
  };

  const pathBetweenVisitedRoutes = (atlas,from,to) => {
    if (!from || !to) return null;
    if (from === to) return {routes:[],hours:0,danger:'None'};
    const queue = [{id:from,routes:[]}];
    const seen = new Set([from]);
    while (queue.length) {
      const current = queue.shift();
      for (const route of AO.ATLAS_ROUTES) {
        if (!atlas.discoveredRoutes[route.id]) continue;
        let next = null;
        if (route.from === current.id) next = route.to;
        else if (route.to === current.id) next = route.from;
        if (!next || seen.has(next)) continue;
        const routes = [...current.routes,route];
        if (next === to) {
          const danger = routes.reduce((worst,item)=>(dangerRank[item.danger]||0)>(dangerRank[worst]||0)?item.danger:worst,'None');
          return {routes,hours:routes.reduce((sum,item)=>sum+item.hours,0),danger};
        }
        seen.add(next);
        queue.push({id:next,routes});
      }
    }
    return null;
  };

  const oldAtlasTravel = AO.Game.prototype.atlasTravel;
  AO.Game.prototype.atlasTravel = function visitedAtlasTravel(locationId) {
    const atlas = ensureExplorationAtlas(this.state);
    if (!atlas?.visitedLocations?.[locationId]) {
      this.toast('You must reach that destination in the world before fast travel becomes available.');
      return false;
    }
    return oldAtlasTravel.call(this,locationId);
  };

  const pointSegmentDistance = (px,py,ax,ay,bx,by) => {
    const dx=bx-ax,dy=by-ay;
    const length=dx*dx+dy*dy;
    const t=length?Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/length)):0;
    return Math.hypot(px-(ax+t*dx),py-(ay+t*dy));
  };

  const nearestRegion = (x,y) => Object.values(AO.ATLAS_REGIONS).reduce((best,region)=>{
    const distance=Math.hypot(x-region.x,y-region.y);
    return !best||distance<best.distance?{region,distance}:best;
  },null).region;

  const worldTerrain = (col,row) => {
    const x=(col+.5)/COLS*100,y=(row+.5)/ROWS*100;
    if (col===0 || row===0 || col===COLS-1 || row===ROWS-1 || (col>25&&row<5) || (col>27&&row<13)) return 'sea';
    const region=nearestRegion(x,y);
    const noise=(col*17+row*31)%11;
    if (region.id==='frostmere_reach') return noise<5?'mountain':'snow';
    if (region.id==='veiled_highlands') return noise<4?'highland':noise<7?'mountain':'moor';
    if (region.id==='drowned_fen') return noise<6?'fen':'water';
    if (region.id==='cinder_marches') return noise<5?'ash':'rock';
    if (region.id==='shattered_coast') return noise<5?'coast':noise<8?'sea':'cliff';
    if (region.id==='sunken_crown') return noise<7?'desert':'ruin';
    return noise<5?'forest':noise<8?'grass':'hill';
  };

  const regionCoords = location => ({x:location.x/100*(COLS-1),y:location.y/100*(ROWS-1)});
  const regionTerrain = (col,row) => {
    const x=col+.5,y=row+.5;
    const mine=regionCoords(AO.ATLAS_LOCATIONS.lantern_mine);
    const woods=regionCoords(AO.ATLAS_LOCATIONS.whisperwood);
    const crypt=regionCoords(AO.ATLAS_LOCATIONS.ashen_crypt);
    const city=regionCoords(AO.ATLAS_LOCATIONS.aurelia);
    const riverX=18.2+Math.sin(row*.72)*1.2;
    let terrain='grass';
    if (Math.abs(x-riverX)<.72) terrain='water';
    if (Math.hypot(x-mine.x,y-mine.y)<4.2) terrain=(col+row)%3?'mountain':'rock';
    else if (Math.hypot(x-woods.x,y-woods.y)<5.3) terrain=(col*3+row)%4?'forest':'grass';
    else if (Math.hypot(x-crypt.x,y-crypt.y)<3.2) terrain=(col+row)%2?'rock':'ruin';
    else if (Math.hypot(x-city.x,y-city.y)<3.5) terrain=(col+row)%3?'city':'cobble';

    let roadDistance=Infinity;
    for (const route of AO.ATLAS_ROUTES) {
      const a=regionCoords(AO.ATLAS_LOCATIONS[route.from]);
      const b=regionCoords(AO.ATLAS_LOCATIONS[route.to]);
      roadDistance=Math.min(roadDistance,pointSegmentDistance(x,y,a.x,a.y,b.x,b.y));
    }
    if (roadDistance<.58) terrain=terrain==='water'?'bridge':'road';
    return terrain;
  };

  const terrainGrid = (scope,terrainAt) => {
    const cells=[];
    for(let row=0;row<ROWS;row++)for(let col=0;col<COLS;col++){
      const terrain=terrainAt(col,row);
      const variant=(col*13+row*7)%4;
      cells.push(`<i class="atlas-pixel-tile terrain-${terrain} variant-${variant}"></i>`);
    }
    return `<div class="atlas-pixel-grid atlas-${scope}-terrain" aria-hidden="true">${cells.join('')}</div>`;
  };

  const fogMarkup = (scope,points,segments=[]) => {
    const id=`atlasFog${scope}`;
    const openings=[
      ...points.map(point=>`<circle cx="${point.x}" cy="${point.y}" r="${point.r||12}" fill="black"></circle>`),
      ...segments.map(segment=>`<line x1="${segment.a.x}" y1="${segment.a.y}" x2="${segment.b.x}" y2="${segment.b.y}" stroke="black" stroke-width="8" stroke-linecap="round"></line>`)
    ].join('');
    return `<svg class="atlas-fog-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs><filter id="${id}Blur"><feGaussianBlur stdDeviation="2.4"></feGaussianBlur></filter>
      <mask id="${id}" maskUnits="userSpaceOnUse"><rect width="100" height="100" fill="white"></rect><g filter="url(#${id}Blur)">${openings}</g></mask></defs>
      <rect width="100" height="100" class="atlas-fog-fill" mask="url(#${id})"></rect>
      <rect width="100" height="100" class="atlas-fog-grain" mask="url(#${id})"></rect>
    </svg>`;
  };

  const worldLegend = () => `<section class="atlas-map-key"><h4>World Map Key</h4>
    <span><i class="key-dot current"></i>Current region</span>
    <span><i class="key-dot seen"></i>Region personally explored</span>
    <span><i class="key-dot charted"></i>Charted but unseen</span>
    <span><i class="key-block forest"></i>Forest and settled vale</span>
    <span><i class="key-block mountain"></i>Mountain or highland</span>
    <span><i class="key-block water"></i>Sea, river, or wetland</span>
    <span><i class="key-fog"></i>Unseen territory</span>
  </section>`;

  const regionLegend = () => `<section class="atlas-map-key"><h4>Regional Map Key</h4>
    <span><i class="key-dot current"></i>Current position</span>
    <span><i class="key-dot seen"></i>Visited destination</span>
    <span><i class="key-dot charted"></i>Known but unvisited</span>
    <span><i class="key-block road"></i>Known road</span>
    <span><i class="key-block forest"></i>Forest or dense cover</span>
    <span><i class="key-block mountain"></i>Mountain, ruin, or dungeon</span>
    <span><i class="key-block water"></i>Water crossing</span>
    <span><i class="key-fog"></i>Unseen terrain</span>
  </section>`;

  const regionRouteSegments = atlas => AO.ATLAS_ROUTES.filter(route=>
    atlas.discoveredRoutes[route.id] && atlas.visitedLocations[route.from] && atlas.visitedLocations[route.to]
  ).map(route=>({a:AO.ATLAS_LOCATIONS[route.from],b:AO.ATLAS_LOCATIONS[route.to]}));

  AO.UI.prototype.renderWorldAtlas = function exploredWorldAtlas() {
    const atlas=ensureExplorationAtlas(this.game.state);
    const regions=Object.values(AO.ATLAS_REGIONS);
    const selected=AO.ATLAS_REGIONS[this.atlasSelectedRegion]||AO.ATLAS_REGIONS[REGION_ID];
    const selectedCharted=!!atlas.discoveredRegions[selected.id];
    const selectedSeen=atlas.revealedMapAreas.world.some(point=>point.id===selected.id);
    this.e.panelBody.innerHTML=`${this.atlasTabs('world')}<div class="living-atlas atlas-world-layout atlas-exploration-layout">
      <section class="atlas-illustration atlas-world-map atlas-pixel-map" aria-label="World map of the known realms">
        ${terrainGrid('world',worldTerrain)}
        <div class="atlas-map-caption"><span>THE KNOWN REALM</span><small>Land, water, roads, and regions are revealed through travel</small></div>
        <svg class="atlas-geography-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M4 59 C19 52 29 54 42 60 S67 72 91 48" class="atlas-water-line"></path>
          <path d="M9 36 C23 27 40 25 56 31 S78 42 95 34" class="atlas-ridge-line"></path>
          <path d="M18 56 C35 54 50 60 64 62" class="atlas-old-road"></path>
        </svg>
        <div class="atlas-feature-label feature-frost">Frostmere Spine</div>
        <div class="atlas-feature-label feature-sea">The Shattered Sea</div>
        <div class="atlas-feature-label feature-fen">Blackwater Basin</div>
        ${regions.map(region=>{
          const charted=!!atlas.discoveredRegions[region.id];
          const seen=atlas.revealedMapAreas.world.some(point=>point.id===region.id);
          const current=region.id===REGION_ID;
          const locked=region.status!=='open';
          return `<button class="atlas-region-node ${seen?'discovered':charted?'charted':'veiled'} ${locked?'locked':''} ${current?'current':''} ${selected.id===region.id?'selected':''}" style="--atlas-x:${region.x}%;--atlas-y:${region.y}%;--atlas-accent:${region.accent}" data-atlas-region="${region.id}" ${charted?'':'disabled'} aria-label="${charted?region.name:'Uncharted region'}">
            <i></i><strong>${charted?region.name:'Uncharted Region'}</strong><small>${current?'Current region':seen?'Explored':charted?'Charted only':'Unknown'}</small>
          </button>`;
        }).join('')}
        ${fogMarkup('World',atlas.revealedMapAreas.world)}
        <div class="atlas-compass" aria-hidden="true"><b>N</b><i></i></div>
      </section>
      <aside class="atlas-detail-card">
        <p class="atlas-kicker">${selected.id===REGION_ID?'CURRENT REGION':selectedSeen?'EXPLORED REGION':selectedCharted?'CHARTED FRONTIER':'UNCHARTED'}</p>
        <h3>${selectedCharted?selected.name:'Uncharted Region'}</h3>
        <p>${selectedCharted?selected.description:'No reliable roads, borders, or landmarks have been recorded here.'}</p>
        <dl><div><dt>Biome</dt><dd>${selectedCharted?selected.biome:'Unknown'}</dd></div><div><dt>Status</dt><dd>${selectedSeen?'Personally explored':selectedCharted?'Charted, not visited':'Hidden by fog'}</dd></div></dl>
        ${selected.id===REGION_ID?'<button class="primary atlas-open-region" data-open-region="last_lantern_vale">Open Regional Atlas</button>':'<p class="atlas-lock-note">Travel through connected roads and story routes to reveal this region. A chart alone does not unlock travel.</p>'}
        ${worldLegend()}
      </aside>
    </div>`;
    this.bindAtlasTabs();
    for(const button of this.e.panelBody.querySelectorAll('[data-atlas-region]'))button.onclick=()=>{this.atlasSelectedRegion=button.dataset.atlasRegion;this.renderWorldAtlas();};
    const open=this.e.panelBody.querySelector('[data-open-region]');if(open)open.onclick=()=>{this.atlasLayer='region';this.renderMap();};
  };

  AO.UI.prototype.renderRegionAtlas = function exploredRegionAtlas() {
    const atlas=ensureExplorationAtlas(this.game.state);
    const locations=Object.values(AO.ATLAS_LOCATIONS).filter(location=>location.regionId===REGION_ID);
    const current=AO.ATLAS_MAP_INDEX?.[this.game.state.world.mapId]||atlas.currentLocationId||'haven';
    if(!this.atlasSelectedLocation||!AO.ATLAS_LOCATIONS[this.atlasSelectedLocation])this.atlasSelectedLocation=current;
    const selected=AO.ATLAS_LOCATIONS[this.atlasSelectedLocation];
    const routeSegments=regionRouteSegments(atlas);
    this.e.panelBody.innerHTML=`${this.atlasTabs('region')}<div class="living-atlas atlas-region-layout atlas-exploration-layout">
      <section class="atlas-illustration atlas-region-map atlas-pixel-map" aria-label="Regional map of Last Lantern Vale">
        ${terrainGrid('region',regionTerrain)}
        <div class="atlas-map-caption"><span>LAST LANTERN VALE</span><small>Terrain and roads remain hidden until personally explored</small></div>
        <svg class="atlas-route-network" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          ${AO.ATLAS_ROUTES.map(route=>{const a=AO.ATLAS_LOCATIONS[route.from],b=AO.ATLAS_LOCATIONS[route.to],known=!!atlas.discoveredRoutes[route.id];return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="${known?'known':'unknown'}"></line>`;}).join('')}
          <path d="M58 5 C55 27 65 43 59 60 S63 82 67 98" class="atlas-river-path"></path>
        </svg>
        <div class="atlas-feature-label region-ridge">Lantern Ridge</div>
        <div class="atlas-feature-label region-river">Mosswater</div>
        <div class="atlas-feature-label region-woods">Whisperwood</div>
        ${locations.map(location=>{
          const visited=!!atlas.visitedLocations[location.id],known=!!atlas.knownLocations[location.id];
          return `<button class="atlas-location-node type-${location.type} ${visited?'visited':known?'known':'unknown'} ${current===location.id?'current':''} ${selected.id===location.id?'selected':''}" style="--atlas-x:${location.x}%;--atlas-y:${location.y}%" data-atlas-location="${location.id}" ${known?'':'disabled'} aria-label="${known?location.name:'Unknown location'}">
            <i>${location.type==='city'?'♜':location.type==='town'?'⌂':location.type==='dungeon'?'◆':location.type==='road'?'✦':'♠'}</i>
            <strong>${known?location.name:'Unknown'}</strong><small>${visited?'Visited':known?'Known only':'Uncharted'}</small>
          </button>`;
        }).join('')}
        ${fogMarkup('Region',atlas.revealedMapAreas.regions[REGION_ID],routeSegments)}
        <div class="atlas-compass" aria-hidden="true"><b>N</b><i></i></div>
      </section>
      ${this.regionDetailMarkup(selected,current,atlas)}
    </div>`;
    this.bindAtlasTabs();
    for(const button of this.e.panelBody.querySelectorAll('[data-atlas-location]'))button.onclick=()=>{this.atlasSelectedLocation=button.dataset.atlasLocation;this.renderRegionAtlas();};
    const travel=this.e.panelBody.querySelector('[data-atlas-travel]');if(travel)travel.onclick=()=>this.game.atlasTravel(travel.dataset.atlasTravel);
    const local=this.e.panelBody.querySelector('[data-open-local]');if(local)local.onclick=()=>{this.atlasLayer='local';this.renderMap();};
  };

  AO.UI.prototype.regionDetailMarkup = function exploredRegionDetail(selected,current,atlas) {
    const known=!!atlas.knownLocations[selected.id];
    const visited=!!atlas.visitedLocations[selected.id];
    const same=current===selected.id;
    const path=visited?pathBetweenVisitedRoutes(atlas,current,selected.id):null;
    const routeText=same?'Current location':!visited?'Route not personally traveled':path?.routes?.length?path.routes.map(route=>route.label).join(' → '):'No fully explored route';
    const travelAllowed=visited&&!same&&selected.fastTravel!==false&&!!path;
    const status=visited?'Visited':known?'Known, not visited':'Uncharted';
    return `<aside class="atlas-detail-card atlas-location-detail">
      <p class="atlas-kicker">${selected.type.toUpperCase()} • ${status.toUpperCase()}</p>
      <h3>${known?selected.name:'Unknown Location'}</h3>
      <p>${known?selected.summary:'The atlas contains no reliable description of this place.'}</p>
      <dl>
        <div><dt>Route</dt><dd>${routeText}</dd></div>
        <div><dt>Travel time</dt><dd>${same?'—':visited&&path?`${path.hours} hours`:'Unknown until visited'}</dd></div>
        <div><dt>Danger</dt><dd>${same?'Local':visited?path?.danger||'Unknown':'Unconfirmed'}</dd></div>
        <div><dt>Current day</dt><dd>${this.game.state.rest?.day||1}</dd></div>
      </dl>
      ${selected.districts&&visited?`<div class="atlas-district-list"><h4>City Districts</h4>${selected.districts.map(([,name])=>`<span>${name}</span>`).join('')}</div>`:''}
      <div class="atlas-detail-actions">
        ${same?'<button class="primary" data-open-local>Open Local Survey</button>':travelAllowed?`<button class="primary" data-atlas-travel="${selected.id}">Fast Travel to ${selected.type==='city'?'Aurelia':selected.name}</button>`:''}
        ${known&&!visited?'<p class="atlas-lock-note">This destination is known, but fast travel unlocks only after you physically reach it.</p>':''}
        ${visited&&!same&&!path?'<p class="atlas-lock-note">You have visited this destination, but no completely explored route connects it to your current position.</p>':''}
        ${selected.fastTravel===false&&!same?'<p class="atlas-lock-note">Enter this dungeon from its connected local road rather than fast traveling directly.</p>':''}
        ${!known?'<p class="atlas-lock-note">Explore neighboring roads or speak with travelers to reveal this location.</p>':''}
      </div>
      ${regionLegend()}
    </aside>`;
  };
})();
