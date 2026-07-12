/* Thousandfold Realms v1.4.1 — music controls and accessibility settings. */
const AudioBaseUI = AO.UI;
AO.UI = class extends AudioBaseUI {
  init(){super.init();this.createAudioControl();}
  createAudioControl(){
    if(document.getElementById('musicToggle'))return;const nav=document.querySelector('.topbar nav'),button=document.createElement('button');button.id='musicToggle';button.title='Toggle background music';button.setAttribute('aria-label','Toggle background music');button.onclick=()=>{const enabled=this.game.audio.toggle();button.textContent=enabled?'Music ♪':'Music ×';this.game.toast(enabled?'Background music enabled.':'Background music muted.');};button.textContent=this.game.state?.settings?.musicEnabled===false?'Music ×':'Music ♪';nav?.append(button);this.e.musicToggle=button;
  }
  renderSettings(){
    super.renderSettings();const s=this.game.state.settings,grid=this.e.panelBody.querySelector('.settings-grid');if(!grid)return;
    const music=document.createElement('label');music.innerHTML=`Music volume<input id="musicVolumeSetting" type="range" min="0" max="1" step="0.05" value="${s.musicVolume??.34}"><span id="musicVolumeValue">${Math.round((s.musicVolume??.34)*100)}%</span>`;
    const enabled=document.createElement('label');enabled.className='toggle';enabled.innerHTML=`<input id="musicEnabledSetting" type="checkbox" ${s.musicEnabled===false?'':'checked'}> Background music`;
    grid.append(music,enabled);const slider=music.querySelector('input'),value=music.querySelector('span'),toggle=enabled.querySelector('input');slider.oninput=()=>{s.musicVolume=Number(slider.value);value.textContent=`${Math.round(s.musicVolume*100)}%`;this.game.audio.setVolume(s.musicVolume);};toggle.onchange=()=>{s.musicEnabled=toggle.checked;this.game.audio.setEnabled(toggle.checked);if(this.e.musicToggle)this.e.musicToggle.textContent=toggle.checked?'Music ♪':'Music ×';};
  }
};
