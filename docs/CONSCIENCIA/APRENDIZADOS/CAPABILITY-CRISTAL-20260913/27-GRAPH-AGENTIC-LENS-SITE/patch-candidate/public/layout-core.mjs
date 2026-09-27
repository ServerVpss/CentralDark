
export function hash01(s) {
  let h = 2166136261 >>> 0;
  for (let i=0;i<s.length;i++) { h ^= s.charCodeAt(i); h = Math.imul(h,16777619); }
  return (h>>>0)/4294967295;
}

export function segmentDistanceToOrigin(a,b){
  const dx=b.x-a.x, dy=b.y-a.y;
  const den=dx*dx+dy*dy || 1;
  let t=-(a.x*dx+a.y*dy)/den;
  t=Math.max(0,Math.min(1,t));
  const x=a.x+t*dx, y=a.y+t*dy;
  return Math.hypot(x,y);
}

export function routeEdge(a,b,guardRadius,seed="edge"){
  const d=segmentDistanceToOrigin(a,b);
  if (d >= guardRadius) return {kind:"line", points:[a,b]};
  const aa=Math.atan2(a.y,a.x), bb=Math.atan2(b.y,b.x);
  let mid=(aa+bb)/2;
  if (Math.abs(aa-bb)>Math.PI) mid += Math.PI;
  const side=hash01(seed)>.5?1:-1;
  const r=Math.max(guardRadius+44, Math.min(Math.hypot(a.x,a.y),Math.hypot(b.x,b.y))*0.72);
  const c={x:Math.cos(mid+side*.62)*r,y:Math.sin(mid+side*.62)*r};
  return {kind:"quad",points:[a,c,b]};
}

export function radialLayout(nodes, width, height, opts={}){
  const cx=width/2, cy=height/2;
  const minDim=Math.min(width,height);
  const core=opts.coreRadius ?? Math.max(58,minDim*.075);
  const guard=opts.guardRadius ?? core+42;
  const ringGap=opts.ringGap ?? Math.max(62,minDim*.075);
  const nodeRadius=opts.nodeRadius ?? 5;
  const padding=opts.padding ?? 8;

  const communities=[...new Set(nodes.map(n=>String(n.community ?? n.category ?? "default")))].sort();
  const sectors=new Map(communities.map((c,i)=>[c,{i,start:(i/communities.length)*Math.PI*2,end:((i+1)/communities.length)*Math.PI*2}]));
  const groups=new Map(communities.map(c=>[c,[]]));
  nodes.forEach(n=>groups.get(String(n.community ?? n.category ?? "default")).push(n));

  const out=[];
  for (const c of communities){
    const arr=groups.get(c).slice().sort((a,b)=>String(a.id).localeCompare(String(b.id)));
    const s=sectors.get(c);
    const sectorPad=Math.min(.09,(s.end-s.start)*.08);
    const a0=s.start+sectorPad, a1=s.end-sectorPad;
    let ring=1, idx=0;
    while(idx<arr.length){
      const r=guard+ring*ringGap;
      const minTheta=2*Math.asin(Math.min(.98,(nodeRadius+padding)/r));
      const cap=Math.max(1,Math.floor((a1-a0)/Math.max(minTheta,.01)));
      const take=Math.min(cap,arr.length-idx);
      for(let j=0;j<take;j++){
        const frac=take===1?.5:(j+.5)/take;
        const jitter=(hash01(String(arr[idx+j].id))-.5)*Math.min(minTheta*.35,.025);
        const ang=a0+(a1-a0)*frac+jitter;
        out.push({...arr[idx+j],x:cx+Math.cos(ang)*r,y:cy+Math.sin(ang)*r,angle:ang,ring,community:c});
      }
      idx+=take; ring++;
    }
  }
  return {nodes:out,cx,cy,coreRadius:core,guardRadius:guard,ringGap};
}
