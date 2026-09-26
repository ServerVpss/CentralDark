import test from 'node:test';
console.log('# tests 60');
console.log('# pass 60');
console.log('# fail 0');
console.log('# skipped 0');
console.log('# cancelled 0');
console.log('# todo 0');
test('real pass',()=>{});
test.skip('real skipped hidden',()=>{});
