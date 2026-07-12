/* Thousandfold Realms v1.5.3-dev — supported local-tile compatibility. */
(() => {
  'use strict';
  if (!window.AO || !AO.MapBuilders) return;
  AO.MapBuilders.eastwatchApproach=function eastwatchApproachSupportedTiles(){
    const g=this.border(this.grid('grass'),'rocks');
    for(let y=0;y<=9;y++)for(let x=14;x<=16;x++)g[y][x]='path';
    for(let x=15;x<AO.CONFIG.mapWidth;x++)for(let y=8;y<=10;y++)g[y][x]='path';
    this.rect(g,3,3,8,5,'moss_stone');
    this.rect(g,4,12,9,4,'grass');
    this.rect(g,19,2,8,4,'moss_stone');
    this.rect(g,19,12,8,4,'flower_patch');
    [[5,2],[9,6],[4,11],[11,14],[20,3],[25,5],[21,13],[26,14],[12,4],[18,6]].forEach(([x,y])=>g[y][x]='rocks');
    [[6,9],[10,10],[20,10],[24,8]].forEach(([x,y])=>g[y][x]='shrub');
    g[0][15]='path';g[9][AO.CONFIG.mapWidth-1]='path';
    return g;
  };
})();
