#!/usr/bin/env python3
"""Read-only preflight CentralDark. Stdlib apenas; nao cria recibos na VPS."""
import argparse, json, os, hashlib, subprocess, pathlib, sys, time, shutil, tempfile
from datetime import datetime, timezone
BASE=pathlib.Path(__file__).resolve().parent.parent
PROOF=json.loads((BASE/'EVIDENCIAS/RECEIPTS-20261012.json').read_text(encoding='utf-8'))
p=argparse.ArgumentParser()
p.add_argument('--repo',default=os.environ.get('CENTRALDARK_REPO','/root/CentralDark'))
p.add_argument('--state',default=os.environ.get('CENTRALDARK_INVENTORY_STATE','/var/lib/centraldark/inventory-reconcile'))
p.add_argument('--json',action='store_true')
p.add_argument('--compare-original',nargs=2,metavar=('ORIGINAL','DERIVED'),help='SHA256 prefix match: original intact then append-only delta')
p.add_argument('--record-event',nargs=3,metavar=('STATE','STATUS','DETAIL'),help='append bounded state event to canonical existing JSON; does not execute repairs')
p.add_argument('--next-cursor',default='MEASURE_NEXT_DISCRIMINANT')
p.add_argument('--read-replay',action='store_true')
a=p.parse_args()
repo=pathlib.Path(a.repo);state=pathlib.Path(a.state);checks=[]

def ball(status):
    # Mesmo placar: NAO renomeia PASS/PARTIAL/UNKNOWN/BLOCKED/NOT_ACTIVE.
    if status=='PASS' or status.startswith('PASS_') or status=='CLEAN':return '🟢'
    if status in ('FAIL','BLOCKED','DRIFT'):return '🔴'
    return '🟡'

# Replay append-only and proof checks run BEFORE the offline auditor. No new service.
if a.compare_original:
    left,right=map(pathlib.Path,a.compare_original)
    try:
        old=left.read_bytes();new=right.read_bytes()
    except OSError as exc:
        print('🔴 INPUT_FILE_UNAVAILABLE='+str(exc));sys.exit(2)
    same_prefix=len(new)>=len(old) and new[:len(old)]==old
    report={'schema':'centraldark.papagaio.append-only.v1',
      'status':'PASS' if same_prefix else 'FAIL',
      'original_bytes':len(old),'derived_bytes':len(new),
      'original_sha256':hashlib.sha256(old).hexdigest(),
      'derived_sha256':hashlib.sha256(new).hexdigest(),
      'prefix_sha256':hashlib.sha256(new[:len(old)]).hexdigest(),
      'original_preserved_byte_for_byte':same_prefix,
      'appended_bytes':len(new)-len(old) if same_prefix else None,
      'claim':'APPEND_ONLY' if same_prefix else 'REWRITE_OR_TRUNCATION_NOT_INTEGRAL'}
    if a.json:print(json.dumps(report,ensure_ascii=False,indent=2))
    else:
        print(('🟢 ' if same_prefix else '🔴 ')+'PAPAGAIO_INTEGRAL='+report['status']+' '+report['claim'])
        print('ORIGINAL_BYTES='+str(len(old))+' DERIVED_BYTES='+str(len(new)))
        print('ORIGINAL_SHA256='+report['original_sha256']+' PREFIX_SHA256='+report['prefix_sha256'])
    sys.exit(0 if same_prefix else 3)

receipt=state/'centraldark-inventory-reconcile.json'
if a.read_replay:
    try:
        obj=json.loads(receipt.read_text(encoding='utf8'))
    except (OSError,ValueError,TypeError) as exc:
        print('🔴 REPLAY_RECEIPT_MISSING_OR_INVALID='+str(exc));sys.exit(2)
    rpt=obj.get('replay') or {}
    result={'schema':'centraldark.replay.read.v1','state':rpt.get('state','UNKNOWN'),
     'status':rpt.get('status','UNKNOWN'),'next_cursor':rpt.get('next_cursor','VERIFY_FROM_CURRENT'),
     'event_count':len(rpt.get('events',[])),'head':rpt.get('head'),
     'script_sha256':rpt.get('script_sha256'),'observed_at':rpt.get('observed_at'),
     'proof':'READBACK_ONLY_NOT_CURRENT_RUNTIME_PROOF'}
    print(json.dumps(result,ensure_ascii=False,indent=2) if a.json else ball(result['status'])+' ['+result['status']+'] 🧾 '+json.dumps(result,ensure_ascii=False))
    sys.exit(0)

if a.record_event:
    # The existing .lock serializes a single writer with the original reconciler.
    import fcntl
    stage,status,detail=a.record_event
    valid={'INTENT','RECOVER','OBSERVE','RECONCILE','EXECUTE','VERIFY','DIAGNOSE',
           'REPAIR','RETEST','LEARN','COMPLETE','HALT'}
    if stage not in valid or status not in {'PASS','FAIL','PARTIAL','BLOCKED','UNKNOWN','NOOP','DOCUMENTED'}:
        print('🔴 REPLAY_EVENT_INVALID');sys.exit(2)
    state.mkdir(parents=True,exist_ok=True)
    lock=state/'.lock'
    with lock.open('a+') as handle:
        fcntl.flock(handle,fcntl.LOCK_EX)
        try:
            obj=json.loads(receipt.read_text(encoding='utf8'))
            if not isinstance(obj,dict):raise ValueError('RECEIPT_NOT_OBJECT')
            history=obj.get('replay') or {}
            now=datetime.now(timezone.utc).isoformat()
            try:
                check=(repo/'scripts/centraldark-inventory-reconcile.sh').read_bytes()
                script_hash=hashlib.sha256(check).hexdigest()
            except OSError:script_hash='UNKNOWN'
            head='UNKNOWN'
            try:
                p=subprocess.run(['git','-C',str(repo),'rev-parse','origin/main'],capture_output=True,text=True,timeout=5)
                if p.returncode==0:head=p.stdout.strip()
            except (OSError,subprocess.TimeoutExpired):pass
            entry={'at':now,'state':stage,'status':status,'detail':detail[:600],
                   'main_cached_sha':head,'script_sha256':script_hash,
                   'execution_evidence':'LOCAL_EVENT_ONLY_NOT_GLOBAL_PROOF'}
            all_events=history.get('events') or []
            if not isinstance(all_events,list):raise ValueError('INVALID_REPLAY_HISTORY')
            all_events.append(entry) # preserve every event; never truncate history
            history.update({'schema':'centraldark.replay.state-machine.v1','state':stage,
              'status':status,'next_cursor':a.next_cursor,'events':all_events,
              'event_count':len(all_events),'observed_at':now,
              'head':head,'script_sha256':script_hash,
              'global_pass':False, # no assertion without MCP runtime and pulse live proofs
              'scope':'CURRENT_RECONCILER_JSON_ONLY'})
            obj['replay']=history
            raw=(json.dumps(obj,ensure_ascii=False,indent=2)+'\n').encode('utf-8')
            f=tempfile.NamedTemporaryFile(mode='wb',prefix='.replay-stage-',dir=state,delete=False)
            path=f.name
            try:
                with f:
                    os.fchmod(f.fileno(),0o600)
                    f.write(raw);f.flush();os.fsync(f.fileno())
                os.replace(path,receipt)
            finally:
                if os.path.exists(path):os.unlink(path)
            print(ball(status)+' ['+status+'] REPLAY_EVENT='+stage+' STATUS='+status+' EVENTS='+str(len(all_events))+' NEXT_CURSOR='+a.next_cursor)
        except (OSError,ValueError,TypeError) as exc:
            print('🔴 REPLAY_NOT_RECORDED='+str(exc));sys.exit(2)
        finally:fcntl.flock(handle,fcntl.LOCK_UN)
    sys.exit(0)

def add(name,status,detail,critical=False):
 checks.append({'test':name,'status':status,'detail':str(detail)[:500],'critical':critical})
def call(*args,timeout=9):
 try:
  p=subprocess.run(args,cwd=repo,capture_output=True,text=True,timeout=timeout,check=False)
  return p.returncode,p.stdout.strip(),p.stderr.strip()
 except (OSError,subprocess.TimeoutExpired) as exc:return 124,'',str(exc)
add('repo_git','PASS' if (repo/'.git').exists() else 'BLOCKED',repo,True)
if (repo/'.git').exists():
 code,sha,err=call('git','rev-parse','HEAD');add('vps_head','PASS' if code==0 else 'UNKNOWN',sha or err)
 code,sha,err=call('git','rev-parse','origin/main');add('cached_main','PASS' if code==0 else 'UNKNOWN',sha or err)
 code,status,err=call('git','status','--porcelain','--untracked-files=no');add('tracked_dirty','DIRTY' if code==0 and status else ('CLEAN' if code==0 else 'UNKNOWN'),len(status.splitlines()) if code==0 else err)
 for key in ('mcp_dispatcher','reconciler'):
  item=PROOF['sources'][key]
  code,sha,err=call('git','rev-parse',f"origin/main:{item['path']}")
  want=item['blob_sha']
  # The original pin is historical evidence. Later commits are not automatically errors.
  status='PASS_PINNED' if sha==want else ('EVOLVED_SINCE_PIN' if code==0 else 'UNKNOWN')
  if key=='reconciler' and code==0 and sha==item.get('replay_append_only_blob_sha'):
   status='PASS_REPLAY_APPEND_ONLY_MAIN'
  add('main_blob_'+key,status,f'historical_pin={want}; current={sha or err}',code!=0)
  code,out,err=call('git','cat-file','-e',item.get('creation_commit',item.get('final_patch_commit'))+'^{commit}')
  add('pinned_commit_'+key,'PASS' if code==0 else 'UNKNOWN',item.get('creation_commit',item.get('final_patch_commit')))
 current=repo/PROOF['sources']['reconciler']['path']
 if current.is_file():
  sha=hashlib.sha256(current.read_bytes()).hexdigest();want=PROOF['sources']['reconciler']['sha256_running']
  new_want=PROOF['sources']['reconciler'].get('desired_sha256_main_append_only_replay')
  if sha==new_want:recon_status='PASS_REPLAY_OWNER'
  elif sha==want:recon_status='KNOWN_PREVIOUS_NEEDS_REPLAY_UPGRADE'
  else:recon_status='DRIFT'
  add('vps_reconciler_sha',recon_status,f'current={sha}; historical={want}; replay_owner={new_want}',recon_status=='DRIFT')
  code,out,err=call('bash','-n',str(current));add('reconciler_syntax','PASS' if code==0 else 'FAIL',err or 'bash -n',True)
  code,out,err=call('bash',str(current),'--pulse','--plan',timeout=15)
  add('pulse_readonly_plan','PASS' if code==0 and 'PULSE_PLAN=READ_ONLY' in out else 'FAIL',out or err,True)
 else:add('vps_reconciler_file','BLOCKED','Arquivo não existe na VPS',True)
 mcpfile=repo/'apps/modulos/mcp/src/tools/core/mcp-admin.js'
 if mcpfile.is_file():
  data=mcpfile.read_text(encoding='utf8',errors='replace')
  add('runtime_checkout_mcp_diagnostic_marker','SOURCE_VISIBLE' if 'diagnoseMcpBlock' in data else 'UNKNOWN','Working tree, nao prova do processo ativo')
  if shutil.which('node'):
   code,out,err=call('node','--check',str(mcpfile),timeout=20)
   add('mcp_checkout_node_check','PASS' if code==0 else 'FAIL',err or 'node --check')
 else:add('mcp_code_file','UNKNOWN','Dispatcher local não encontrado')
 receipt=state/'centraldark-inventory-reconcile.json'
 if receipt.is_file():
  try:
   data=json.loads(receipt.read_text(encoding='utf8'))
   add('json_canonical','PASS','json válido, bytes='+str(receipt.stat().st_size),True)
   dup=data.get('duplicates') or {}
   add('scanner_coverage','PARTIAL' if dup.get('partial') else 'UNKNOWN' if not dup else 'PASS',json.dumps({'skipped':dup.get('skipped'),'scripts':dup.get('scanned_script_files')},ensure_ascii=False))
   add('pulse_live_parity','UNKNOWN',str(data.get('pulse')))
  except (OSError,ValueError,TypeError) as exc:add('json_canonical','FAIL',str(exc),True)
 else:add('json_canonical','UNKNOWN','recibo canônico não materializado',True)
 for old in ('latest.json','delta.json'):
  add('legacy_receipt_'+old,'PRESENT_NEEDS_RECONCILIATION' if (state/old).exists() else 'NOT_ACTIVE','não apagar histórico; preservar em backup')
 backup=state/'backups/20261012T225707Z/centraldark-inventory-reconcile.sh'
 if backup.is_file():
  s=hashlib.sha256(backup.read_bytes()).hexdigest()
  add('original_backup','PASS' if s==PROOF['sources']['reconciler']['sha256_backup_old'] else 'DRIFT',s,True)
 else:add('original_backup','UNKNOWN','backup não localizado',True)
 add('mcp_runtime_deploy','UNKNOWN','Commit válido != runtime atualizado')
 add('hakai_allowed','BLOCKED','Pulso real e todos os consumidores ainda não provados')
statuses=[x['status'] for x in checks]
result={'schema':'centraldark.replay.check.v1','at':datetime.now(timezone.utc).isoformat(),'checks':checks,'fatal':any(x['critical'] and x['status'] in {'FAIL','BLOCKED','DRIFT'} for x in checks)}
if a.json:print(json.dumps(result,ensure_ascii=False,indent=2))
else:
 for item in checks:
  sym=ball(item['status'])
  print(f"{sym} [{item['status']}] {item['test']}: {item['detail']}")
 print('⚖️ GLOBAL_PASS=FALSE se runtime MCP ou pulso real UNKNOWN; audited_count='+str(len(checks)))
sys.exit(2 if result['fatal'] else 0)
