/* Thousandfold Realms v1.4.2 — world-first HUD and full-page RPG menus. */
const ImmersiveUIBase=AO.UI;
AO.UI=class extends ImmersiveUIBase{
  init(){super.init();this.buildRpgMenus();this.buildImmersiveHud();this.ensureRpgPageNavigation();}
  buildRpgMenus(){
    const nav=document.querySelector('.topbar nav');if(!nav||nav.dataset.rpgMenu==='true')return;nav.dataset.rpgMenu='true';
    const panelButtons=[...document.querySelectorAll('.topbar [data-panel]')],find=id=>panelButtons.find(b=>b.dataset.panel===id);
    const makeWrap=(id,label)=>{const wrap=document.createElement('div');wrap.className='rpg-menu-wrap';const toggle=document.createElement('button');toggle.id=id;toggle.className='rpg-menu-toggle';toggle.innerHTML=`${label} <span>▾</span>`;toggle.setAttribute('aria-expanded','false');const menu=document.createElement('div');menu.className='rpg-menu-dropdown hidden';toggle.onclick=e=>{e.stopPropagation();for(const other of document.querySelectorAll('.rpg-menu-dropdown'))if(other!==menu){other.classList.add('hidden');other.closest('.rpg-menu-wrap')?.querySelector('.rpg-menu-toggle')?.setAttribute('aria-expanded','false');}const open=menu.classList.toggle('hidden')===false;toggle.setAttribute('aria-expanded',String(open));document.body.classList.toggle('rpg-menu-open',open);if(open)this.fitRpgMenu(toggle,menu);};wrap.append(toggle,menu);return{wrap,toggle,menu};};
    const adventurer=makeWrap('rpgMenuBtn','Menu'),system=makeWrap('rpgSystemBtn','System');
    adventurer.wrap.classList.add('menu-adventurer');system.wrap.classList.add('menu-system');
    const addHeading=(menu,text)=>{const h=document.createElement('div');h.className='rpg-menu-heading';h.textContent=text;menu.append(h);};
    addHeading(adventurer.menu,'Adventurer');for(const [id,label,icon] of [['character','Character Sheet','◆'],['inventory','Inventory & Equipment','▣'],['skills','Skills, Spells & Talents','✦'],['journal','Quest Journal','!'],['map','World Map','◇']]){const b=find(id);if(b){b.innerHTML=`<span>${icon}</span>${label}`;b.className='rpg-menu-item';adventurer.menu.append(b);}}
    addHeading(adventurer.menu,'Records & Craft');for(const [id,label,icon] of [['crafting','Crafting','⚒'],['codex','Codex & Bestiary','⌘']]){const b=find(id);if(b){b.innerHTML=`<span>${icon}</span>${label}`;b.className='rpg-menu-item';adventurer.menu.append(b);}}
    const chronicle=document.createElement('button');chronicle.className='rpg-menu-item';chronicle.innerHTML='<span>≡</span>Chronicle';chronicle.onclick=()=>this.openPanel('chronicle');adventurer.menu.append(chronicle);
    addHeading(system.menu,'Journey');for(const id of ['campBtn','saveBtn','loadBtn']){const b=document.getElementById(id);if(b){b.className='rpg-menu-item';system.menu.append(b);}}
    addHeading(system.menu,'Options');const settings=find('settings');if(settings){settings.innerHTML='<span>⚙</span>Settings & Accessibility';settings.className='rpg-menu-item';system.menu.append(settings);}const music=document.getElementById('musicToggle');if(music){music.className='rpg-menu-item';system.menu.append(music);}
    nav.innerHTML='';nav.append(adventurer.wrap,system.wrap);document.addEventListener('click',e=>{if(!nav.contains(e.target)){for(const m of nav.querySelectorAll('.rpg-menu-dropdown'))m.classList.add('hidden');for(const t of nav.querySelectorAll('.rpg-menu-toggle'))t.setAttribute('aria-expanded','false');document.body.classList.remove('rpg-menu-open');}});window.addEventListener('resize',()=>{for(const m of nav.querySelectorAll('.rpg-menu-dropdown:not(.hidden)'))this.fitRpgMenu(m.closest('.rpg-menu-wrap')?.querySelector('.rpg-menu-toggle'),m);});
  }
  fitRpgMenu(toggle,menu){
    if(!toggle||!menu||menu.classList.contains('hidden'))return;
    const margin=8,rect=toggle.getBoundingClientRect(),system=toggle.id==='rpgSystemBtn';
    const narrow=innerWidth<720,short=innerHeight<700;
    const desired=system?300:(narrow?Math.min(360,innerWidth-margin*2):Math.min(520,innerWidth-margin*2));
    const width=Math.max(240,Math.min(desired,innerWidth-margin*2));
    let left=system?rect.right-width:rect.left;
    left=Math.max(margin,Math.min(left,innerWidth-width-margin));
    const top=Math.min(rect.bottom+6,innerHeight-margin);
    menu.style.position='fixed';menu.style.left=`${Math.round(left)}px`;menu.style.right='auto';menu.style.top=`${Math.round(top)}px`;
    menu.style.width=`${Math.round(width)}px`;menu.style.maxHeight=`${Math.max(160,Math.floor(innerHeight-top-margin))}px`;
    menu.classList.toggle('menu-two-column',!system&&!narrow&&!short);
    menu.classList.toggle('menu-compact',short);
  }
  buildImmersiveHud(){
    const hud=document.querySelector('.hud'),frame=document.querySelector('.canvas-frame');if(!hud||!frame||hud.dataset.immersive==='true')return;hud.dataset.immersive='true';
    const hero=hud.querySelector('.hero-card'),meters=hud.querySelector('.meters'),rested=hud.querySelector('.rested-panel'),world=hud.querySelector('.world-panel'),objective=hud.querySelector('.objective-panel'),nearby=this.e.nearbyPrompt,quickInfo=hud.querySelector('.quick-info'),tabs=hud.querySelector('.hud-tabs'),panes=hud.querySelector('.hud-panes');if(quickInfo)quickInfo.classList.add('immersive-hidden');
    const left=document.createElement('section');left.className='immersive-hud-left';const right=document.createElement('section');right.className='immersive-hud-right';const bottom=document.createElement('section');bottom.className='immersive-hud-bottom';
    [hero,meters,rested].filter(Boolean).forEach(e=>left.append(e));if(world)right.append(world);if(objective)bottom.append(objective);if(nearby){const near=document.createElement('div');near.className='immersive-nearby';near.append(nearby);bottom.append(near);}
    hud.innerHTML='';hud.append(left,right,bottom);const toggle=document.createElement('button');toggle.className='immersive-hud-toggle';toggle.title='Hide or show the world HUD';toggle.textContent='HUD';toggle.onclick=()=>hud.classList.toggle('hud-collapsed');hud.append(toggle);frame.append(hud);tabs?.remove();panes?.remove();
  }
  ensureRpgPageNavigation(){
    const shell=this.e.panel?.querySelector('.large-panel');if(!shell||shell.querySelector('.rpg-page-tabs'))return;const tabs=document.createElement('nav');tabs.className='rpg-page-tabs';const defs=[['character','Character'],['inventory','Inventory'],['skills','Skills & Spells'],['journal','Journal'],['map','Map'],['crafting','Crafting'],['codex','Codex'],['chronicle','Chronicle']];for(const [id,label] of defs){const b=document.createElement('button');b.dataset.rpgPage=id;b.textContent=label;b.onclick=()=>this.openPanel(id);tabs.append(b);}shell.insertBefore(tabs,this.e.panelBody);
  }
  decorateRpgPage(type){this.ensureRpgPageNavigation();this.e.panel?.classList.add('rpg-page-overlay');this.e.panel?.setAttribute('data-current-page',type);for(const b of this.e.panel.querySelectorAll('[data-rpg-page]'))b.classList.toggle('active',b.dataset.rpgPage===type);for(const m of document.querySelectorAll('.rpg-menu-dropdown'))m.classList.add('hidden');document.body.classList.remove('rpg-menu-open');}
  openPanel(type){
    if(type==='chronicle'){
      if(!this.game.state||this.game.state.mode==='combat')return;this.game.state.mode='panel';this.e.panel.classList.remove('hidden');this.renderChronicle();
    }else super.openPanel(type);if(this.e.panel&&!this.e.panel.classList.contains('hidden'))this.decorateRpgPage(type);
  }
  closePanel(){super.closePanel();this.e.panel?.classList.remove('rpg-page-overlay');}
  openShop(shopId){super.openShop(shopId);this.decorateRpgPage('shop');}
  renderChronicle(){
    this.e.panelTitle.textContent='Journey Chronicle';const entries=this.game.state.log||[];this.e.panelBody.innerHTML=`<div class="chronicle-page"><header><div><span>DAY ${this.game.state.rest?.day||1}</span><h3>${this.game.state.story?.title||'The Last Lantern'}</h3></div><p>A persistent account of discoveries, battles, travel, quests, and important decisions.</p></header><div class="chronicle-list">${entries.length?entries.map((line,i)=>`<article><span>${String(entries.length-i).padStart(3,'0')}</span><p>${line}</p></article>`).join(''):'<p>No events have been recorded.</p>'}</div></div>`;
  }
};
