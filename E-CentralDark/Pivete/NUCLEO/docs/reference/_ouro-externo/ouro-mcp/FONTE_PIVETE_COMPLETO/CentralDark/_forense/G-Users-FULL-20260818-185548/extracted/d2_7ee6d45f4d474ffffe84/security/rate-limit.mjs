export class TokenBucketLimiter{
 constructor({capacity=60,refillPerSecond=1,now=()=>Date.now()}={}){if(!(capacity>0)||!(refillPerSecond>0))throw Error('invalid_rate_limit');this.capacity=capacity;this.refillPerSecond=refillPerSecond;this.now=now;this.buckets=new Map()}
 consume(key,cost=1){if(!key)return{allowed:false,reason:'missing_key'};const n=this.now(),c=this.buckets.get(key)||{tokens:this.capacity,at:n},e=Math.max(0,(n-c.at)/1000),t=Math.min(this.capacity,c.tokens+e*this.refillPerSecond);if(t<cost){this.buckets.set(key,{tokens:t,at:n});return{allowed:false,retryAfterMs:Math.ceil(((cost-t)/this.refillPerSecond)*1000)}}const r=t-cost;this.buckets.set(key,{tokens:r,at:n});return{allowed:true,remaining:Math.floor(r)}}
}
// Multi-réplica: usar store compartilhado já existente; não criar segundo control-plane.
