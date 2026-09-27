
import assert from "node:assert/strict";
import {radialLayout,routeEdge,segmentDistanceToOrigin} from "../patch-candidate/public/layout-core.mjs";

const nodes=Array.from({length:500},(_,i)=>({id:`n${i}`,community:`c${i%8}`}));
const L=radialLayout(nodes,1400,900,{coreRadius:70,guardRadius:115,ringGap:70,nodeRadius:5,padding:9});
assert.equal(L.nodes.length,500);
for(const n of L.nodes){
  const d=Math.hypot(n.x-L.cx,n.y-L.cy);
  assert.ok(d > L.guardRadius, `node ${n.id} invaded nucleus`);
}
const byRing=new Map();
for(const n of L.nodes){
  const k=`${n.community}:${n.ring}`; if(!byRing.has(k))byRing.set(k,[]); byRing.get(k).push(n);
}
for(const arr of byRing.values()){
  for(let i=0;i<arr.length;i++)for(let j=i+1;j<arr.length;j++){
    const d=Math.hypot(arr[i].x-arr[j].x,arr[i].y-arr[j].y);
    assert.ok(d>=10,`nodes cramped ${arr[i].id}/${arr[j].id}: ${d}`);
  }
}
const a={x:-300,y:0},b={x:300,y:0};
assert.ok(segmentDistanceToOrigin(a,b)<115);
const r=routeEdge(a,b,115,"x");
assert.equal(r.kind,"quad");
const c=r.points[1];
assert.ok(Math.hypot(c.x,c.y)>115,"control point must stay outside guard");
console.log("PASS layout-core: nucleus protected, ring spacing, edge detour");
