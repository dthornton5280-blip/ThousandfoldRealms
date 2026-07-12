/* Thousandfold Realms v1.4.3 — user-supplied development music with procedural fallback.
   The MP3 begins only after a player gesture so browser autoplay rules are respected.
   This sample is provisional and must not be treated as cleared for public release
   until its license and attribution requirements are confirmed. */
AO.AudioSystem = class {
  constructor(game){
    this.game=game;this.ctx=null;this.master=null;this.musicGain=null;this.started=false;
    this.sampleFailed=false;this.playBlocked=false;this.trackKey='adventure-sample';this.timer=null;this.nextBar=0;
    this.sampleSrc='assets/audio/fantasy_adventure_quest_sample.mp3';
    this.sample=typeof Audio!=='undefined'?new Audio(this.sampleSrc):null;
    if(this.sample){
      this.sample.loop=true;this.sample.preload='auto';this.sample.setAttribute('playsinline','');
      this.sample.addEventListener('playing',()=>{this.playBlocked=false;this.stopFallback();});
      this.sample.addEventListener('error',()=>{this.sampleFailed=true;this.startFallback();});
    }
    const unlock=()=>this.unlock();
    for(const type of ['pointerdown','keydown','touchstart'])window.addEventListener(type,unlock,{capture:true,passive:true});
    document.addEventListener('visibilitychange',()=>this.applyVolume());
  }
  settings(){
    const s=this.game.state?.settings||{};
    s.musicEnabled??=true;s.musicVolume??=.34;s.effectsVolume??=.65;
    return s;
  }
  unlock(){
    this.started=true;
    if(this.ctx?.state==='suspended')this.ctx.resume().catch(()=>{});
    this.applyVolume();
  }
  ensurePlayback(){
    if(!this.sample||this.sampleFailed||!this.started)return;
    const s=this.settings();
    if(!s.musicEnabled||document.hidden){this.sample.pause();return;}
    this.sample.volume=Math.max(0,Math.min(1,s.musicVolume))*.9;
    if(!this.sample.paused)return;
    const promise=this.sample.play();
    if(promise?.catch)promise.catch(()=>{this.playBlocked=true;});
  }
  applyVolume(){
    const s=this.settings();
    if(this.sample&&!this.sampleFailed){
      this.sample.volume=s.musicEnabled&&!document.hidden?Math.max(0,Math.min(1,s.musicVolume))*.9:0;
      if(s.musicEnabled&&!document.hidden)this.ensurePlayback();else this.sample.pause();
      return;
    }
    if(this.musicGain&&this.ctx){
      const target=s.musicEnabled&&!document.hidden?Math.max(0,Math.min(1,s.musicVolume))*.55:0,now=this.ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);this.musicGain.gain.linearRampToValueAtTime(target,now+.25);
    }
  }
  update(){
    if(!this.started)return;
    if(!this.sampleFailed)this.ensurePlayback();else this.startFallback();
  }
  startFallback(){
    if(!this.started||this.timer)return;
    const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;
    if(!this.ctx){
      this.ctx=new Ctx();this.master=this.ctx.createGain();this.musicGain=this.ctx.createGain();
      this.musicGain.connect(this.master);this.master.connect(this.ctx.destination);
    }
    this.nextBar=this.ctx.currentTime+.08;this.scheduleFallback();this.applyVolume();
  }
  stopFallback(){
    if(this.timer){clearTimeout(this.timer);this.timer=null;}
    if(this.musicGain&&this.ctx){
      const now=this.ctx.currentTime;this.musicGain.gain.cancelScheduledValues(now);this.musicGain.gain.linearRampToValueAtTime(0,now+.2);
    }
  }
  scheduleFallback(){
    if(!this.ctx||!this.musicGain)return;
    const now=this.ctx.currentTime;
    while(this.nextBar<now+4){this.scheduleFallbackBar(this.nextBar);this.nextBar+=3.2;}
    this.timer=setTimeout(()=>this.scheduleFallback(),1100);
  }
  tone(freq,start,duration,volume=.05,type='triangle'){
    const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,start);
    g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(volume,start+.05);g.gain.exponentialRampToValueAtTime(.0001,start+duration);
    o.connect(g);g.connect(this.musicGain);o.start(start);o.stop(start+duration+.05);
  }
  scheduleFallbackBar(t){
    const root=110,notes=[0,3,7,10,7,3],beat=.52;
    this.tone(root/2,t,3,.035,'sine');
    for(let i=0;i<notes.length;i++)this.tone(root*Math.pow(2,notes[i]/12),t+i*beat,.72,.032,i%2?'sine':'triangle');
  }
  setEnabled(value){this.settings().musicEnabled=!!value;this.applyVolume();}
  setVolume(value){this.settings().musicVolume=Math.max(0,Math.min(1,Number(value)||0));this.applyVolume();}
  toggle(){this.setEnabled(!this.settings().musicEnabled);return this.settings().musicEnabled;}
  status(){
    return{
      enabled:this.settings().musicEnabled,
      started:this.started,
      source:this.sampleFailed?'procedural-fallback':'user-supplied-sample',
      playing:!!this.sample&&!this.sample.paused&&!this.sampleFailed,
      blocked:this.playBlocked,
      currentTime:this.sample?.currentTime||0
    };
  }
};
