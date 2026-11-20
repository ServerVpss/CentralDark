import { applyRoutingStrategy } from './routing-strategy.mjs';
import assert from 'node:assert/strict';

const models = [
  { modelo: 'a', timeout_ms: 30000, cost_weight: 5 },
  { modelo: 'b', timeout_ms: 10000, cost_weight: 1 },
  { modelo: 'c', timeout_ms: 20000, cost_weight: 3 },
];

const prio = applyRoutingStrategy(models, 'priority');
assert.deepEqual(prio.map(m => m.modelo), ['a', 'b', 'c']);

const cost = applyRoutingStrategy(models, 'cost');
assert.deepEqual(cost.map(m => m.modelo), ['b', 'c', 'a']);

const lat = applyRoutingStrategy(models, 'latency');
assert.deepEqual(lat.map(m => m.modelo), ['b', 'c', 'a']);

const rr = applyRoutingStrategy(models, 'round_robin');
assert.equal(rr.length, 3);
assert.ok(rr.every(m => ['a', 'b', 'c'].includes(m.modelo)));

assert.deepEqual(applyRoutingStrategy([], 'cost'), []);
assert.deepEqual(applyRoutingStrategy(null, 'cost'), null);

console.log('routing-strategy.test: PASS');
