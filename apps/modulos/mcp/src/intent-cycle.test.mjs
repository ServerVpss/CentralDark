import test from 'node:test';
import assert from 'node:assert/strict';
import { compileIntent, assessCriteria, reconcileIntent } from './intent-cycle.js';

const SHA = 'a'.repeat(40);
const now = '2026-10-10T03:30:00.000Z';
const input = () => compileIntent({intent:'Reconciliar a saude do MCP com prova de runtime',owner:'apps/modulos/mcp/src/index.js',mode:'AUTOMATICO'});
const world = (evidence = {}, headSha = SHA) => ({observedAt:now,headSha,evidence});
const proof = (status = 'PASS', sha = SHA, t = now) => ({status,source:'fixture:independent-readback',observedAt:t,sha,receipt:'validated-fixture-receipt'});
test('intencao tipada aceita tres modos e deriva criterios pertinentes',()=>{
  for(const mode of ['AUTONOMO','AUTOMATICO','COM_CRITERIOS']) assert.equal(compileIntent({intent:'Verificar o HUD do usuario',owner:'docs/HUD/HUD.html',mode}).mode,mode);
  assert.ok(compileIntent({intent:'Reparar Hermes com CI comprovado',owner:'apps/modulos/HERMES-CORE/core/decisor.mjs',mode:'AUTONOMO'}).criteria.includes('CI_SAME_SHA'));
});
test('modo invalido, owner inseguro, budget excessivo e criterio arbitrario sao rejeitados',()=>{
  assert.throws(()=>compileIntent({intent:'Uma intencao valida',owner:'../.env',mode:'AUTONOMO'}),/OWNER_INVALID/);
  assert.throws(()=>compileIntent({intent:'Uma intencao valida',owner:'docs/HUD/HUD.html',mode:'FAKE'}),/MODE_INVALID/);
  assert.throws(()=>compileIntent({intent:'Uma intencao valida',owner:'docs/HUD/HUD.html',mode:'AUTONOMO',maxIterations:900}),/ITERATION_BUDGET/);
  assert.throws(()=>compileIntent({intent:'Uma intencao valida',owner:'docs/HUD/HUD.html',criteria:['../SECRET']}),/CRITERIA_ID_INVALID/);
});
test('ausencia de evidencia NAO vira verde',()=>{
  const receipt=reconcileIntent(input(),world(),SHA);
  assert.equal(receipt.fixedPoint,false);assert.equal(receipt.state,'NEXT_CURSOR');
  assert.ok(receipt.criteria.every(c=>c.status==='UNKNOWN'));assert.match(receipt.nextCursor,/VERIFY_/);
});
test('evidencia velha e SHA errado invalidam PASS',()=>{
  const i=input(), evidences=Object.fromEntries(i.criteria.map(id=>[id,proof()]));
  evidences.MCP_HEALTH=proof('PASS','b'.repeat(40));
  const found=assessCriteria(i,world(evidences));
  assert.equal(found.find(c=>c.id==='MCP_HEALTH').status,'STALE');
  evidences.MCP_HEALTH=proof('PASS',SHA,'2026-10-09T00:00:00Z');
  assert.equal(assessCriteria(i,world(evidences)).find(c=>c.id==='MCP_HEALTH').status,'STALE');
});
test('reconciliacao PASS so se todos criterios obrigatorios tem prova valida',()=>{
  const i=input(), evidences=Object.fromEntries(i.criteria.map(id=>[id,proof()]));
  const receipt=reconcileIntent(i,world(evidences),SHA);
  assert.equal(receipt.fixedPoint,true);assert.equal(receipt.state,'SEALED');assert.equal(receipt.nextCursor,'FIXED_POINT');
  assert.equal(receipt.executionProven,undefined);
});
test('reuso deterministico requer fingerprint e HEAD identicos',()=>{
  const i=input(), evidence=Object.fromEntries(i.criteria.map(id=>[id,proof()]));
  const previous=reconcileIntent(i,world(evidence),SHA);
  const again=reconcileIntent(i,world(evidence),SHA,previous);
  assert.equal(again.reused,true);assert.equal(again.action,'REUSE_PROOF');
  assert.equal(reconcileIntent(i,world(evidence),'b'.repeat(40),previous).reused,false);
});
test('criterio BLOCKED nao libera Fixed Point mesmo com outros PASS',()=>{
  const i=input(), evidence=Object.fromEntries(i.criteria.map(id=>[id,proof()]));
  evidence.ONE_HEART=proof('BLOCKED');
  const r=reconcileIntent(i,world(evidence),SHA);
  assert.equal(r.state,'BLOCKED');assert.equal(r.fixedPoint,false);
});
test('modo AUTONOMO calcula proximo cursor sem fingir que enfileirou tarefa',()=>{
  const i=compileIntent({intent:'Reparar Hermes que esta com falha de prova',owner:'apps/modulos/HERMES-CORE/core/orchestrator.mjs',mode:'AUTONOMO'});
  const r=reconcileIntent(i,world(),SHA);
  assert.equal(r.action,'HANDOFF_HERMES');assert.equal(r.fixedPoint,false);
});

test('efeito da intencao sem receipt Critic nao pode receber PASS',()=>{
  const i=input(), evidence=Object.fromEntries(i.criteria.map(id=>[id,proof()]));
  evidence.OBJECTIVE_EFFECT={status:'PASS',source:'fake-user-claim',observedAt:now,sha:SHA};
  const r=reconcileIntent(i,world(evidence),SHA);
  assert.equal(r.fixedPoint,false);
  assert.equal(r.criteria.find(c=>c.id==='OBJECTIVE_EFFECT').status,'STALE');
});
