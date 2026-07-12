AO.SaveManager = {
  keys(){ return [AO.CONFIG.saveKey,...(AO.CONFIG.legacySaveKeys||[])]; },
  save(state){
    try {
      localStorage.setItem(AO.CONFIG.saveKey, JSON.stringify({version:AO.VERSION,state}));
      for(const key of AO.CONFIG.legacySaveKeys||[]) localStorage.removeItem(key);
      return true;
    } catch(err){ console.error(err); return false; }
  },
  load(){
    try {
      for(const key of this.keys()){
        const raw=localStorage.getItem(key);
        if(!raw) continue;
        const parsed=JSON.parse(raw);
        if(key!==AO.CONFIG.saveKey){
          localStorage.setItem(AO.CONFIG.saveKey,raw);
          localStorage.removeItem(key);
        }
        return parsed.state;
      }
      return null;
    } catch(err){ console.error(err); return null; }
  },
  exists(){ return this.keys().some(key=>!!localStorage.getItem(key)); },
  clear(){ for(const key of this.keys()) localStorage.removeItem(key); }
};
