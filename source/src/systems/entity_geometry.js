/* Thousandfold Realms v1.6.1-dev — multi-tile collision and interaction geometry. */
(() => {
  'use strict';
  if(!window.AO)return;

  const normalizeOffsets=value=>{
    if(Array.isArray(value))return value.map(cell=>Array.isArray(cell)?{x:Number(cell[0])||0,y:Number(cell[1])||0}:{x:Number(cell.x)||0,y:Number(cell.y)||0});
    if(value&&typeof value==='object'&&['left','right','up','down'].some(key=>key in value)){
      const cells=[];for(let y=-(value.up||0);y<=(value.down||0);y++)for(let x=-(value.left||0);x<=(value.right||0);x++)cells.push({x,y});return cells;
    }
    return[{x:0,y:0}];
  };

  AO.EntityGeometry={
    offsets(entity,interaction=false){
      if(!entity)return[{x:0,y:0}];
      if(interaction&&entity.interactionFootprint)return normalizeOffsets(entity.interactionFootprint);
      return normalizeOffsets(entity.collisionFootprint||entity.footprint);
    },
    cells(entity,interaction=false){
      return this.offsets(entity,interaction).map(offset=>({x:entity.x+offset.x,y:entity.y+offset.y}));
    },
    contains(entity,x,y,interaction=false){
      return this.cells(entity,interaction).some(cell=>cell.x===x&&cell.y===y);
    },
    bounds(entity,interaction=false){
      const cells=this.cells(entity,interaction),xs=cells.map(c=>c.x),ys=cells.map(c=>c.y),x=Math.min(...xs),y=Math.min(...ys),right=Math.max(...xs),bottom=Math.max(...ys);
      return{x,y,w:right-x+1,h:bottom-y+1,right,bottom};
    },
    center(entity,interaction=false){
      const b=this.bounds(entity,interaction);return{x:b.x+(b.w-1)/2,y:b.y+(b.h-1)/2};
    },
    distance(point,entity,interaction=false){
      return Math.min(...this.cells(entity,interaction).map(cell=>Math.abs(point.x-cell.x)+Math.abs(point.y-cell.y)));
    },
    adjacentCells(world,entity,range=1,ignoreEntityId=null){
      const occupied=new Set(this.cells(entity).map(cell=>`${cell.x},${cell.y}`)),out=new Map();
      for(const cell of this.cells(entity)){
        for(let dy=-range;dy<=range;dy++)for(let dx=-range;dx<=range;dx++){
          if(Math.abs(dx)+Math.abs(dy)!==range)continue;const x=cell.x+dx,y=cell.y+dy,key=`${x},${y}`;
          if(occupied.has(key)||out.has(key))continue;
          if(AO.Pathfinder.isWalkable(world,x,y,ignoreEntityId))out.set(key,{x,y});
        }
      }
      return[...out.values()];
    }
  };
})();
