// #OBSERVACOES# | CENTRALDARK.CODE.DOC.SYNC
// @owner: scripts/dependabot/classify-conflict.mjs
// @doc_ref: .agents/skills/git-conflict-resolve-house-standard/SKILL.md
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const classifier=fileURLToPath(new URL('./classify-conflict.mjs',import.meta.url));
function git(dir,...args) {
 const r=spawnSync('git',['-C',dir,...args],{encoding:'utf8',windowsHide:true,timeout:30000});
 assert.equal(r.status,0,r.stderr);return r.stdout.trim();
}
function workspace() {
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'cd-conflict-scan-'));
 git(dir,'init','-q');
 fs.mkdirSync(path.join(dir,'docs'),{recursive:true});
 fs.writeFileSync(path.join(dir,'base'),'base');
 fs.writeFileSync(path.join(dir,'ours'),'ours');
 fs.writeFileSync(path.join(dir,'theirs'),'theirs');
 const oids=['base','ours','theirs'].map(x=>git(dir,'hash-object','-w',x));
 const source=['100644 '+oids[0]+' 1\tdocs/conflict.md',
   '100644 '+oids[1]+' 2\tdocs/conflict.md',
   '100644 '+oids[2]+' 3\tdocs/conflict.md',
   '100644 '+oids[1]+' 2\tpackage-lock.json',
   '100644 '+oids[2]+' 3\tpackage-lock.json',''].join('\n');
 const p=spawnSync('git',['-C',dir,'update-index','--index-info'],
   {input:source,encoding:'utf8',windowsHide:true});
 assert.equal(p.status,0,p.stderr);
 return dir;
}
function diagnose(dir,log) {
 const p=spawnSync(process.execPath,[classifier,'--diagnose'],{
   cwd:dir,input:log,encoding:'utf8',windowsHide:true,timeout:30000});
 assert.equal(p.status,0,p.stderr||p.stdout);
 return JSON.parse(p.stdout);
}
const labels=[
 'content','add/add','modify/delete','delete/modify','rename/delete',
 'rename/rename','rename/rename(1to2)','rename/rename(2to1)',
 'rename involved in collision','rename/add','rename/modify',
 'directory rename suggested','directory rename collision',
 'directory rename unclear split','file in way of directory rename',
 'directory rename file in way','file/directory','directory/file',
 'file location','distinct types','typechange','type change','mode',
 'binary','binary file','submodule','submodule lacks merge base',
 'submodule history not available','submodule multiple merge bases',
 'submodule not fast forward','submodule may have rewinds',
 'submodule has conflict','submodule merge conflict','add/delete',
 'delete/add','rename/rename collision','rename/delete conflict',
 'modify/modify','both modified','both added','both deleted',
 'update/delete','create/create','rename/rename(2to2)'
];
test('44 Git conflict strings recognized; recognition is not authorization',()=>{
 const dir=workspace();
 try {
  const out=diagnose(dir,labels.map(x=>'CONFLICT ('+x+'): synthetic path').join('\n'));
  assert.equal(out.signature_count,44);
  assert.equal(out.recognized_signature_count,44);
  assert.equal(out.risk_status,'REQUIRES_REVIEW');
  assert.equal(out.auto_resolve_allowed,false);
  assert.equal(out.classification_is_resolution,false);
  assert.equal(out.paths.length,2);
  assert.equal(out.paths[0].index_shape,'THREE_WAY');
  assert.equal(out.paths[1].index_shape,'ADD_ADD');
  assert.equal(out.paths[1].path_family,'DEPENDENCY_LOCK');
 } finally {fs.rmSync(dir,{recursive:true,force:true});}
});
test('simple content conflict can still reach existing path registry',()=>{
 const dir=workspace();
 try {
  git(dir,'update-index','--force-remove','package-lock.json');
  const out=diagnose(dir,'CONFLICT (content): Merge conflict in docs/conflict.md');
  assert.equal(out.auto_resolve_allowed,true);
  assert.equal(out.risk_status,'CONTENT_ONLY_CANDIDATE');
  assert.equal(out.paths.length,1);
  assert.equal(out.paths[0].path_family,'DOCUMENTATION');
 } finally {fs.rmSync(dir,{recursive:true,force:true});}
});
test('unknown signature fails closed',()=>{
 const dir=workspace();
 try {
  const out=diagnose(dir,'CONFLICT (future algorithmic collision): foo');
  assert.equal(out.recognized_signature_count,0);
  assert.equal(out.auto_resolve_allowed,false);
 } finally {fs.rmSync(dir,{recursive:true,force:true});}
});
test('merge output without conflict type is never automatic success',()=>{
 const dir=workspace();
 try {
  const out=diagnose(dir,'Auto-merging docs/conflict.md');
  assert.equal(out.auto_resolve_allowed,false);
 } finally {fs.rmSync(dir,{recursive:true,force:true});}
});
test('unknown paths are described but never automatically assigned policy',()=>{
 const dir=workspace();
 try {
  for(const [name,family] of [
    ['apps/a/src/app.tsx','SOURCE_TYPESCRIPT'],
    ['.github/workflows/ci.yml','CI_WORKFLOW'],
    ['.env.local','SECRETS_ENV'],
    ['src/schema.sql','DATABASE_MIGRATION'],
    ['infra/main.tf','INFRA_TERRAFORM'],
    ['k8s/deployment.yaml','INFRA_KUBERNETES'],
    ['Dockerfile','CONTAINER'],
    ['docs/guide.md','DOCUMENTATION'],
    ['src/widget.test.js','TEST_FIXTURE'],
    ['img/icon.png','BINARY_ASSET'],
    ['foo/bar.json','CONFIG_JSON'],
    ['backend/tool.py','SOURCE_PYTHON'],
    ['a.yaml','CONFIG_YAML'],
    ['.gitmodules','GIT_SUBMODULE'],
    ['notebook.ipynb','NOTEBOOK'],
    ['src/run.sh','SOURCE_SHELL'],
  ]) {
    const p=spawnSync(process.execPath,[classifier,name],{
      cwd:dir,encoding:'utf8',windowsHide:true,timeout:30000,
      env:{...process.env,CONFLICT_REGISTRY:path.join(dir,'nonexistent-registry.json')}
    });
    assert.equal(p.status,0,p.stderr);
    const out=JSON.parse(p.stdout);
    assert.equal(out.path_family,family,name);
    assert.equal(out.action,'YELLOW',name);
  }
 } finally {fs.rmSync(dir,{recursive:true,force:true});}
});
