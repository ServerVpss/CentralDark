// #OBSERVACOES# | CENTRALDARK.CODE.DOC.SYNC
// @owner: .agents/skills/centraldark-operational-method/SKILL.md
// @doc_ref: .agents/skills/centraldark-operational-method/SKILL.md
// @last_updated: 2026-10-28T00:45:20.454Z
import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const gate = fileURLToPath(new URL('./worktree-teardown-gate.mjs', import.meta.url));
function exec(exe,args,cwd) {
  const p = spawnSync(exe,args,{cwd,encoding:'utf8',windowsHide:true,timeout:30000});
  if(p.status !== 0) throw Error(exe + ' failed: ' + p.stderr);
  return p.stdout.trim();
}
function fixture() {
  const top=fs.mkdtempSync(path.join(os.tmpdir(),'cd-wtgate-'));
  const main=path.join(top,'main'), remote=path.join(top,'origin.git'),
    allowed=path.join(top,'worktrees'), target=path.join(allowed,'scratch');
  fs.mkdirSync(main);fs.mkdirSync(allowed);
  exec('git',['init','--bare',remote],top);
  exec('git',['init','-b','main',main],top);
  exec('git',['config','user.email','test@example.invalid'],main);
  exec('git',['config','user.name','Gate Test'],main);
  fs.mkdirSync(path.join(main,'evidence'));
  fs.writeFileSync(path.join(main,'evidence','proof.md'),'receipt\n');
  exec('git',['add','.'],main);exec('git',['commit','-m','base'],main);
  exec('git',['remote','add','origin',remote],main);
  exec('git',['push','-u','origin','main'],main);
  exec('git',['worktree','add','-b','feature',target],main);
  fs.writeFileSync(path.join(target,'feature.txt'),'feature');
  exec('git',['add','.'],target);exec('git',['commit','-m','feature'],target);
  exec('git',['push','-u','origin','feature'],target);
  return {top,main,allowed,target};
}
function check(f, options={}) {
  const args=[gate,'--repo',f.main,'--target',options.target||f.target,
    '--allowed-root',f.allowed,'--receipt-ref',options.receipt||'evidence/proof.md'];
  if(options.apply)args.push('--apply');
  const r=spawnSync(process.execPath,args,{encoding:'utf8',windowsHide:true,timeout:30000});
  return {status:r.status, data:JSON.parse(r.stdout)};
}
for(const [name,body] of [
  ['dry run makes no mutation',f=>{
    const x=check(f);assert.equal(x.status,0);assert.equal(x.data.status,'CANDIDATE_SAFE');
    assert.equal(fs.existsSync(f.target),true);
  }],
  ['apply removes only clean published worktree',f=>{
    const x=check(f,{apply:true});assert.equal(x.status,0);
    assert.equal(x.data.status,'REMOVED_VERIFIED');
    assert.equal(fs.existsSync(f.target),false);
    assert.equal(fs.existsSync(path.join(f.main,'evidence','proof.md')),true);
  }],
  ['unique untracked data is protected',f=>{
    fs.writeFileSync(path.join(f.target,'unique.txt'),'do not delete');
    const x=check(f,{apply:true});assert.equal(x.status,2);
    assert.equal(x.data.reason,'UNCOMMITTED_OR_UNTRACKED_CONTENT');
    assert.equal(fs.existsSync(f.target),true);
  }],
  ['local-only commit is protected',f=>{
    fs.writeFileSync(path.join(f.target,'feature.txt'),'local');
    exec('git',['add','.'],f.target);exec('git',['commit','-m','local'],f.target);
    const x=check(f,{apply:true});assert.equal(x.status,2);
    assert.equal(x.data.reason,'REMOTE_COMMIT_NOT_IDENTICAL');
  }],
  ['missing receipt is protected',f=>{
    const x=check(f,{apply:true,receipt:'evidence/missing.md'});
    assert.equal(x.status,2);assert.equal(x.data.status,'KEEP_ACTIVE');
  }],
  ['locked worktree is protected',f=>{
    exec('git',['worktree','lock',f.target,'--reason','active'],f.main);
    const x=check(f,{apply:true});assert.equal(x.status,2);
    assert.equal(x.data.reason,'WORKTREE_LOCKED_OR_PRUNABLE');
  }],
  ['main repo is protected',f=>{
    const x=check(f,{apply:true,target:f.main});
    assert.equal(x.status,2);assert.equal(fs.existsSync(f.main),true);
  }],
]){
  test(name,()=>{const f=fixture();try{body(f);}
    finally{fs.rmSync(f.top,{recursive:true,force:true,maxRetries:5,retryDelay:100});}});
}
