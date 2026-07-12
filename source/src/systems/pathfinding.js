AO.Pathfinder = {
  isWalkable(world,x,y,ignoreEntityId=null){
    if(x<0||y<0||x>=AO.CONFIG.mapWidth||y>=AO.CONFIG.mapHeight)return false;
    const tile=world.grid[y][x];
    if(['tree','stonewall','water','lilywater','roof','woodwall','bar','cliff_face','waterfall','rocks','shrub','fence','reeds'].includes(tile))return false;
    const blocker=world.entities.find(e=>e.id!==ignoreEntityId&&e.blocking!==false&&e.x===x&&e.y===y&&!e.hidden);
    return !blocker;
  },
  neighbors(world,node,ignoreEntityId){
    return [[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({x:node.x+dx,y:node.y+dy})).filter(p=>this.isWalkable(world,p.x,p.y,ignoreEntityId));
  },
  path(world,start,goal,ignoreEntityId=null,allowGoalBlocked=false){
    const k=AO.Util.key,q=[start],came=new Map([[k(start.x,start.y),null]]);
    while(q.length){
      const cur=q.shift();
      if(cur.x===goal.x&&cur.y===goal.y){const result=[];let p=cur;while(p&&!(p.x===start.x&&p.y===start.y)){result.push(p);p=came.get(k(p.x,p.y));}return result.reverse();}
      for(const n of [[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({x:cur.x+dx,y:cur.y+dy}))){
        const nk=k(n.x,n.y);if(came.has(nk))continue;const isGoal=n.x===goal.x&&n.y===goal.y;
        if(!this.isWalkable(world,n.x,n.y,ignoreEntityId)&&!(allowGoalBlocked&&isGoal))continue;
        came.set(nk,cur);q.push(n);
      }
    }
    return [];
  },
  nearestAdjacent(world,start,target,ignoreEntityId=null){
    const spots=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({x:target.x+dx,y:target.y+dy})).filter(p=>this.isWalkable(world,p.x,p.y,ignoreEntityId));
    let best=null;for(const spot of spots){const p=this.path(world,start,spot,ignoreEntityId);if(p.length&&(!best||p.length<best.length))best=p;}return best||[];
  }
};
