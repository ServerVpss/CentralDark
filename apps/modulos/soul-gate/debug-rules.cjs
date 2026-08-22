const {SoulGate}=require('./runtime/soul-gate.cjs');
const g=new SoulGate();
console.log('All rules:', JSON.stringify(g.rules, null, 2));
console.log('\nCommand rules:', g.rules.filter(r=>r.type==='command').map(r=>({source:r.source, key:r.key, value:r.value})));