AO.Util = {
  clamp(v,min,max){ return Math.max(min, Math.min(max, v)); },
  rand(min,max){ return Math.floor(Math.random()*(max-min+1))+min; },
  roll(count,sides,bonus=0){ let t=bonus; for(let i=0;i<count;i++) t += AO.Util.rand(1,sides); return t; },
  d20(){ return AO.Util.rand(1,20); },
  deepCopy(v){ return JSON.parse(JSON.stringify(v)); },
  key(x,y){ return `${x},${y}`; },
  dist(a,b){ return Math.abs(a.x-b.x)+Math.abs(a.y-b.y); },
  id(prefix='id'){ return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`; },
  statMod(score){ return Math.floor((score-10)/2); },
  title(s){ return String(s).replace(/_/g,' ').replace(/\b\w/g,m=>m.toUpperCase()); },
  visualFor(base,appearance={}){ const v={...(base||{})}; if(appearance.hairColor)v.hair=appearance.hairColor;if(appearance.accentColor)v.accent=appearance.accentColor;if(appearance.eyeColor)v.eye=appearance.eyeColor;v.hairStyle=appearance.hairStyle||v.hairStyle||'natural';v.frame=appearance.frame||'standard';v.mark=appearance.mark||'none';return v; },
  weightedPick(entries){
    const total=entries.reduce((n,e)=>n+(e.weight||1),0); let r=Math.random()*total;
    for(const e of entries){ r-=e.weight||1; if(r<=0) return e; }
    return entries[entries.length-1];
  }
};
