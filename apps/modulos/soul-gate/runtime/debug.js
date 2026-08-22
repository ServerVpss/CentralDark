const {loadCanonical, extractRules}=require('./soul-gate.cjs');
const canon = loadCanonical();
console.log('canon keys:', Object.keys(canon));
console.log('canon.administraveis:', canon.administraveis ? typeof canon.administraveis : 'undefined');
if (canon.administraveis) {
  console.log('administraveis keys:', Object.keys(canon.administraveis));
  console.log('administraveis.items length:', Array.isArray(canon.administraveis.items) ? canon.administraveis.items.length : 'not array');
  if (Array.isArray(canon.administraveis.items)) {
    console.log('first item:', JSON.stringify(canon.administraveis.items[0], null, 2));
  }
}
const rules = extractRules(canon);
console.log('rules length:', rules.length);
console.log('rules:', JSON.stringify(rules, null, 2));
const commandRules = rules.filter(r=>r.type==='command');
console.log('command rules:', JSON.stringify(commandRules, null, 2));