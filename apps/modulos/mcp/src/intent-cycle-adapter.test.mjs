import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,readdirSync,renameSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';

test('API loop: fila original + dedupe + Critic + receipt imutavel (isolado)',async()=>{
  const root=mkdtempSync(join(tmpdir(),'centraldark-cycle-fixture-'));
  process.env.CENTRALDARK_ROOT=root;
  process.env.CENTRALDARK_LOG_ROOT=join(root,'logs');
  mkdirSync(join(root,'logs'),{recursive:true});
  mkdirSync(join(root,'apps/modulos/HERMES-CORE/missions/pendente'),{recursive:true});
  execFileSync('git',['init','-q'],{cwd:root});
  execFileSync('git',['-c','user.name=fixture','-c','user.email=<contato>','commit','--allow-empty','-qm','fixture'],{cwd:root});
  const initHead=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
  execFileSync('git',['update-ref','refs/remotes/origin/main',initHead],{cwd:root});
  writeFileSync(join(root,'logs/auto-sync-status.json'),JSON.stringify({t:new Date().toISOString(),result:'PASS',head:initHead,origin_main:initHead}));
  writeFileSync(join(root,'logs/heartbeat-api.json'),JSON.stringify({t:new Date().toISOString(),self:'alive'}));
  const {runIntentCycle,readIntentState,publicIntentStatus}=await import('./intent-cycle-adapter.js');
  const query={intent:'Executar uma intencao com prova no runtime existente',mode:'AUTONOMO',owner:'docs/HUD/HUD.html',goalId:'t_9040803d'};
  const first=runIntentCycle(query,{dispatch:true});
  assert.equal(first.fixedPoint,false);assert.equal(first.queued,true);assert.equal(first.executionProven,false);
  assert.equal(first.nextCursor,'VERIFY_OBJECTIVE_EFFECT');
  assert.equal(readIntentState().fingerprint,first.fingerprint);
  const queue=join(root,'apps/modulos/HERMES-CORE/missions/pendente');
  const filenames=readdirSync(queue).filter(f=>f.endsWith('.md'));assert.equal(filenames.length,1);
  const again=runIntentCycle(query,{dispatch:true});
  assert.equal(again.queued,true);assert.equal(again.queueReused,true);
  assert.equal(readdirSync(queue).filter(f=>f.endsWith('.md')).length,1);
  const folder=join(root,'apps/modulos/HERMES-CORE/missions/concluidas/2026-10-10',filenames[0].replace(/\.md$/,''));
  mkdirSync(folder,{recursive:true});
  renameSync(join(queue,filenames[0]),join(folder,'missao.md'));
  writeFileSync(join(folder,'state.json'),JSON.stringify({terminal_state:'CONCLUIDA'}));
  writeFileSync(join(folder,'finalization-receipt.json'),JSON.stringify({gate:'HERMES_FINALIZATION_CRITIC',status:'PASS',history_entries:2,unproven_mutations:[]}));
  const third=runIntentCycle(query,{dispatch:true});
  assert.equal(third.fixedPoint,true);assert.equal(third.executionProven,true);assert.equal(third.queued,false);
  assert.equal(third.state,'SEALED');
  assert.equal(publicIntentStatus().fixedPoint,true);
  assert.ok(readdirSync(join(root,'logs/intent-loop-receipts')).length>=3);
  assert.ok(existsSync(join(root,'logs/events')));
  const stale=runIntentCycle({...query,intent:query.intent+' + uma etapa nova'},{dispatch:false});
  assert.equal(stale.fixedPoint,false);assert.equal(stale.executionProven,false);
  execFileSync('git',['-c','user.name=fixture','-c','user.email=<contato>','commit','--allow-empty','-qm','local-drift'],{cwd:root});
  const diverged=runIntentCycle({...query,intent:query.intent+' com drift nova'},{dispatch:false});
  assert.equal(diverged.fixedPoint,false);
  assert.equal(diverged.criteria.find(c=>c.id==='SOURCE_CURRENT').status,'STALE');
  // Teste negativo: status publico nunca promove receipt vencido nem SHA antigo.
  const forged={...readIntentState(), observedAt:'2020-01-01T00:00:00Z',
    state:'SEALED',fixedPoint:true,currentHead:initHead,
    criteria:[{id:'SOURCE_CURRENT',status:'PASS'}]};
  writeFileSync(join(root,'logs/intent-loop-state.json'),JSON.stringify(forged));
  const expired=publicIntentStatus();
  assert.equal(expired.fixedPoint,false);
  assert.equal(expired.state,'STALE');
  assert.equal(expired.criteria[0].status,'STALE');
});
