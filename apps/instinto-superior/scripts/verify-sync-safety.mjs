// #OBSERVACOES# @owner: cockpit-sync @doc_ref: apps/instinto-superior/README.md
// @last_updated: 2026-11-01T20:00:00Z @implementado: regressão Git isolada do handler real, sem tocar remoto de produção.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
const source=fs.readFileSync(new URL('../src/lib/sync.functions.ts',import.meta.url),'utf8').replace(/import \{ createServerFn \} from [^;]+;/,'const createServerFn = () => ({handler: fn => fn});');
function fixture(){
 const base=fs.mkdtempSync(path.join(os.tmpdir(),'centraldark-sync-regression-'));
 const repo=path.join(base,'repo'), remote=path.join(base,'remote.git'); fs.mkdirSync(repo);
 const g=(...args)=>execFileSync('git',['-C',repo,...args],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
 execFileSync('git',['init','--bare',remote],{stdio:'ignore'});g('init','-b','main');g('config','user.name','Regression');g('config','user.email','regression@localhost');fs.writeFileSync(path.join(repo,'tracked.txt'),'baseline');g('add','tracked.txt');g('commit','-m','baseline');g('remote','add','origin',remote);g('push','-u','origin','main');
 const old=process.cwd();process.chdir(repo);
 const file=path.join(base,'handler.mjs');fs.writeFileSync(file,ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
 return {base,repo,remote,g,file,cleanup(){process.chdir(old);fs.rmSync(base,{recursive:true,force:true});}};
}
async function run(t,work){const f=fixture();try{const m=await import(pathToFileURL(f.file));await work(f,m);}finally{f.cleanup();}}
test('Main igual é sucesso; consulta divergente não vira mesmo SHA',async t=>run(t,async(f,m)=>{
 assert.equal((await m.executarSync({data:{target:'main'}})).status,'success');
 fs.writeFileSync(path.join(f.repo,'tracked.txt'),'ahead');f.g('add','tracked.txt');f.g('commit','-m','ahead');
 const result=await m.executarSync({data:{target:'main'}});assert.equal(result.status,'conflict');assert.match(result.human_readable,/↑1/);
}));
test('Casa e Tudo preservam arquivo alheio e não criam commit nem stage',async t=>run(t,async(f,m)=>{
 fs.writeFileSync(path.join(f.repo,'alheio.txt'),'do not publish');const head=f.g('rev-parse','HEAD');
 for(const target of ['windows','local','all']) {const result=await m.executarSync({data:{target}});assert.notEqual(result.status,'success');assert.equal(f.g('rev-parse','HEAD'),head);assert.equal(f.g('diff','--cached','--name-only'),'');assert.equal(fs.readFileSync(path.join(f.repo,'alheio.txt'),'utf8'),'do not publish');}
}));
test('Casa limpa publica commit existente e confirma SHA remoto real',async t=>run(t,async(f,m)=>{
 fs.writeFileSync(path.join(f.repo,'tracked.txt'),'approved commit');f.g('add','tracked.txt');f.g('commit','-m','approved');
 const result=await m.executarSync({data:{target:'local'}});assert.equal(result.status,'success');assert.equal(f.g('rev-parse','HEAD'),f.g('rev-parse','FETCH_HEAD'));
}));

test('Falha histórica VPS conserva erro e escopo sem inventar estado atual',async t=>run(t,async(f,m)=>{
 const dir=path.join(f.repo,'.auto-sync');fs.mkdirSync(dir);
 const status=path.join(dir,'status.json');
 fs.writeFileSync(status,JSON.stringify({last_sync:'2026-11-01T23:01:16.662Z',status:'failed',details:'VPS sync erro: hostname segredo-vpss sem resolução'}));
 const antigo=await m.lerStatusSync();
 assert.equal(antigo.status,'failed');assert.equal(antigo.target,'vps');
 assert.match(antigo.human_readable,/Última tentativa VPS falhou/);
 assert.match(antigo.human_readable,/histórico, não estado atual/);
 fs.writeFileSync(status,JSON.stringify({last_sync:'2026-11-02T06:00:00.000Z',status:'success',details:'Casa já está em dia com main'}));
 const main=await m.lerStatusSync();
 assert.equal(main.status,'success');assert.equal(main.target,undefined);
 assert.doesNotMatch(main.human_readable,/VPS/);
}));
