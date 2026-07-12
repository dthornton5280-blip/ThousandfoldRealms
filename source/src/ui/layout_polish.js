/* Thousandfold Realms v1.3 — organized HUD, compact navigation, and readable panel layout. */
const WorldPolishUI = AO.UI;
AO.UI = class extends WorldPolishUI {
  constructor(game){super(game);this.hudTab='journey';}
  init(){super.init();this.organizeTopbar();this.organizeHud();this.bindLayoutKeys();}
  organizeTopbar(){
    const nav=document.querySelector('.topbar nav');if(!nav||nav.dataset.organized)return;nav.dataset.organized='true';
    const buttons=[...nav.children],byPanel=id=>buttons.find(b=>b.dataset.panel===id),main=document.createElement('div'),utility=document.createElement('div'),moreWrap=document.createElement('div'),moreMenu=document.createElement('div');
    main.className='nav-main';utility.className='nav-utility';moreWrap.className='more-menu-wrap';moreMenu.className='more-menu hidden';
    for(const id of ['inventory','journal','character','skills','map']){const b=byPanel(id);if(b){b.classList.add('nav-primary');main.append(b);}}
    for(const id of ['crafting','codex','settings']){const b=byPanel(id);if(b){b.classList.add('nav-more-item');moreMenu.append(b);}}
    const more=document.createElement('button');more.id='moreMenuBtn';more.className='nav-more';more.innerHTML='More <span aria-hidden="true">▾</span>';more.setAttribute('aria-expanded','false');
    more.onclick=e=>{e.stopPropagation();const open=moreMenu.classList.toggle('hidden')===false;more.setAttribute('aria-expanded',String(open));};
    moreWrap.append(more,moreMenu);main.append(moreWrap);
    for(const id of ['campBtn','saveBtn','loadBtn']){const b=document.getElementById(id);if(b){b.classList.add('nav-utility-btn');utility.append(b);}}
    nav.innerHTML='';nav.append(main,utility);document.addEventListener('click',e=>{if(!moreWrap.contains(e.target)){moreMenu.classList.add('hidden');more.setAttribute('aria-expanded','false');}});
  }
  organizeHud(){
    const hud=document.querySelector('.hud');if(!hud||hud.dataset.organized)return;hud.dataset.organized='true';
    const hero=hud.querySelector('.hero-card'),meters=hud.querySelector('.meters'),quick=hud.querySelector('.quick-info'),rested=hud.querySelector('.rested-panel'),world=hud.querySelector('.world-panel'),quickbar=hud.querySelector('.quickbar-panel'),objective=hud.querySelector('.objective-panel'),log=hud.querySelector('.event-log'),nearby=this.e.nearbyPrompt;
    if(meters&&!meters.dataset.grouped){meters.dataset.grouped='true';const children=[...meters.children];meters.innerHTML='';for(let i=0;i<children.length;i+=2){const group=document.createElement('div');group.className='meter-group';group.append(children[i]);if(children[i+1])group.append(children[i+1]);meters.append(group);}}
    const core=document.createElement('div');core.className='hud-core';[hero,meters,quick,rested].filter(Boolean).forEach(x=>core.append(x));
    const tabs=document.createElement('div');tabs.className='hud-tabs';tabs.setAttribute('role','tablist');
    const panes=document.createElement('div');panes.className='hud-panes';
    const defs=[['journey','Journey','◆'],['map','Map','◇'],['actions','Actions','⚔'],['log','Chronicle','≡']];
    for(const [id,label,icon] of defs){const b=document.createElement('button');b.className='hud-tab';b.dataset.hudTab=id;b.setAttribute('role','tab');b.innerHTML=`<span>${icon}</span>${label}`;b.onclick=()=>this.activateHudTab(id);tabs.append(b);const pane=document.createElement('section');pane.className='hud-pane';pane.dataset.hudPane=id;pane.setAttribute('role','tabpanel');panes.append(pane);}
    const journey=panes.querySelector('[data-hud-pane="journey"]'),map=panes.querySelector('[data-hud-pane="map"]'),actions=panes.querySelector('[data-hud-pane="actions"]'),chronicle=panes.querySelector('[data-hud-pane="log"]');
    if(nearby){const interaction=document.createElement('div');interaction.className='panel interaction-panel';const h=document.createElement('h3');h.textContent='Nearby';interaction.append(h,nearby);journey.append(interaction);}
    if(objective)journey.append(objective);if(world)map.append(world);if(quickbar)actions.append(quickbar);if(log)chronicle.append(log);
    hud.innerHTML='';hud.append(core,tabs,panes);this.activateHudTab(this.hudTab);
  }
  activateHudTab(id){this.hudTab=id;for(const b of document.querySelectorAll('.hud-tab')){const active=b.dataset.hudTab===id;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));}for(const pane of document.querySelectorAll('.hud-pane'))pane.classList.toggle('active',pane.dataset.hudPane===id);}
  bindLayoutKeys(){document.addEventListener('keydown',e=>{if(e.key==='Escape'){const more=document.querySelector('.more-menu');if(more&&!more.classList.contains('hidden')){more.classList.add('hidden');document.getElementById('moreMenuBtn')?.setAttribute('aria-expanded','false');return;}}});}
  updateHud(){super.updateHud();const prompt=this.e.nearbyPrompt?.textContent||'',tab=document.querySelector('[data-hud-tab="journey"]');if(tab)tab.classList.toggle('attention',prompt&&!/Move near|Nothing nearby/i.test(prompt));}
  openPanel(type){super.openPanel(type);for(const b of document.querySelectorAll('[data-panel]'))b.classList.toggle('active-panel',b.dataset.panel===type);document.querySelector('.more-menu')?.classList.add('hidden');}
  closePanel(){super.closePanel();for(const b of document.querySelectorAll('[data-panel]'))b.classList.remove('active-panel');}
};
