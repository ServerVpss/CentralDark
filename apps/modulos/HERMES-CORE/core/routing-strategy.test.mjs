import { applyRoutingStrategy, resolveHermesExecutionMode } from './routing-strategy.mjs';
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


const knownRecipe = resolveHermesExecutionMode({ proven_recipe: true, command: '/status_vps' });
assert.equal(knownRecipe.mode, 'HERMES_TYPED_CORE');
assert.equal(knownRecipe.requires_ai, false);
assert.equal(knownRecipe.action, 'RUN_PROVEN_RECIPE');

const machineMeasured = resolveHermesExecutionMode({ recipe_status: 'UNKNOWN', machine_resolvable: true });
assert.equal(machineMeasured.mode, 'HERMES_TYPED_CORE');
assert.equal(machineMeasured.requires_ai, false);
assert.equal(machineMeasured.action, 'MEASURE_AND_CONTINUE');

const oracleRequested = resolveHermesExecutionMode({ command: '/intelligence', recipe_status: 'UNKNOWN' });
assert.equal(oracleRequested.mode, 'HERMES_INTELLIGENCE_MODE');
assert.equal(oracleRequested.requires_ai, true);
assert.equal(oracleRequested.action, 'CALL_ORACLE_OR_LOCAL_MODEL');

const liveOrganRecipe = resolveHermesExecutionMode({ proven_recipe: true, live_organ_mutation: true });
assert.equal(liveOrganRecipe.mode, 'HERMES_TYPED_CORE');
assert.equal(liveOrganRecipe.gate_required, true);
assert.equal(liveOrganRecipe.owner_required, true);

console.log('routing-strategy.test: PASS');
