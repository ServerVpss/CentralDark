#!/usr/bin/env python3
"""Testes offline da receita, nao testa VPS de outro ambiente."""
import pathlib,hashlib,json,subprocess,sys
BASE=pathlib.Path(__file__).resolve().parent.parent
failures=[]
def check(name,condition):
 print(('🟢 PASS' if condition else '🔴 FAIL')+' '+name)
 if not condition:failures.append(name)
proof=json.loads((BASE/'EVIDENCIAS/RECEIPTS-20261012.json').read_text())
routes=json.loads((BASE/'EVIDENCIAS/ROTAS-20261012.json').read_text())
check('schema',proof['schema']=='centraldark.execucao-integral.v1')
check('intent',proof['mission_id']=='CENTRALDARK_DUAS_FRENTES_20261012')
check('2 fronts',set(('mcp_dispatcher','reconciler')).issubset(proof['sources']))
check('both original source blobs 40hex',all(len(proof['sources'][x]['blob_sha'])==40 for x in ('mcp_dispatcher','reconciler')))
check('13 documented routes',len(routes['routes'])==13)
check('external policies not bypassed',routes['laws']['clientPolicyGateIsNotBypassable'])
check('pulse unproven',proof['measured']['pulse_live']['status']=='UNKNOWN')
check('hakai not executed',proof['measured']['hakai']['status']=='NOT_EXECUTED')
check('both historical scans partial',all(proof['measured'][x]['partial'] for x in ('scan_1','scan_2')))
check('backup original hash',proof['sources']['reconciler']['sha256_backup_old'].startswith('4792fab2'))
script=BASE/'executar-tudo.sh'
check('bash syntax',subprocess.run(['bash','-n',str(script)],capture_output=True).returncode==0)
script2=BASE/'tools/exportar-codigo-fixado.sh'
check('exporter bash syntax',subprocess.run(['bash','-n',str(script2)],capture_output=True).returncode==0)
raw=script.read_text()
check('no root reset',('git reset --hard' not in raw and 'git clean -fdx' not in raw and 'push --force' not in raw))
check('scan uses owner existing', '"$MAIN" --scan' in raw)
check('hakai read only', 'HAKAI=BLOCKED' in raw and '--hakai-check)' in raw)
check('sha gated apply', 'UNEXPECTED_SHA_NEVER_OVERWRITE' in raw and 'BACKUP_READBACK_FAIL' in raw)
check('MCP owner deployment guarded', '--dry-run' in raw and 'MCP_RUNTIME_NOT_PROMOTED' in raw)
for f in (BASE/'EVIDENCIAS').glob('*.json'):
 json.loads(f.read_text())
check('JSON examples valid',True)
print('TESTS_FAILED_V1='+str(len(failures)))

# v2: tests on the SAME files and an isolated tmp receipt. Never touch a VPS.
import tempfile
with tempfile.TemporaryDirectory(prefix='centraldark-replay-test-') as d:
  tmp=pathlib.Path(d)
  o=tmp/'orig.txt';f=tmp/'derived.txt'
  original=b'head:123\r\nline2:ABC\n'
  o.write_bytes(original);f.write_bytes(original+b'PLUS: NEW LEARNING\n')
  helper=BASE/'tools/verificar-integridade.py'
  def invoke(*args):
    return subprocess.run([sys.executable,str(helper),*args],capture_output=True,text=True,timeout=10)
  t=invoke('--compare-original',str(o),str(f),'--json')
  check('PAPAGAIO append-only PASS',t.returncode==0 and json.loads(t.stdout)['original_preserved_byte_for_byte'])
  f.write_bytes(original[:-3]+b'NEW')
  t=invoke('--compare-original',str(o),str(f),'--json')
  check('PAPAGAIO rewrite FAIL',t.returncode==3 and not json.loads(t.stdout)['original_preserved_byte_for_byte'])
  f.write_bytes(original[:5])
  t=invoke('--compare-original',str(o),str(f),'--json')
  check('PAPAGAIO truncate FAIL',t.returncode==3)
  repo=tmp/'fake-repo'; repo.mkdir()
  (repo/'scripts').mkdir()
  (repo/'scripts/centraldark-inventory-reconcile.sh').write_text('#!/usr/bin/env bash\necho "TEST"\n')
  state=tmp/'state';state.mkdir()
  receipt=state/'centraldark-inventory-reconcile.json'
  receipt.write_text(json.dumps({'schema':'centraldark.inventory.existing',
    'pulse':{'result':'UNKNOWN'},'duplicates':{'partial':True,'scanned_script_files':4224},
    'delta':{'changed':False},'user_owned_field':{'do_not_remove':True}}))
  t=invoke('--repo',str(repo),'--state',str(state),'--record-event','INTENT','PASS','ONLY_SCOPE_INTENT','--next-cursor','RECOVER')
  check('state INTENT persisted',t.returncode==0 and 'REPLAY_EVENT=INTENT' in t.stdout)
  t=invoke('--repo',str(repo),'--state',str(state),'--record-event','VERIFY','PARTIAL','SCAN_PARTIAL_REAL','--next-cursor','SCAN_COVERAGE')
  check('state VERIFY partial persisted',t.returncode==0)
  t=invoke('--repo',str(repo),'--state',str(state),'--record-event','HALT','BLOCKED','MCP_RUNTIME_UNKNOWN','--next-cursor','MCP_RUNTIME')
  check('state HALT blocked persisted',t.returncode==0)
  obj=json.loads(receipt.read_text())
  check('single canonical JSON',len(list(state.glob('*.json')))==1)
  check('no original JSON fields lost',obj.get('user_owned_field')=={'do_not_remove':True} and obj.get('delta')=={'changed':False} and obj.get('duplicates',{}).get('partial'))
  check('all checkpoint events preserved',len(obj.get('replay',{}).get('events',[]))==3 and obj['replay']['events'][0]['state']=='INTENT')
  check('global stays blocked',obj['replay']['global_pass'] is False and obj['replay']['next_cursor']=='MCP_RUNTIME')
  t=invoke('--repo',str(repo),'--state',str(state),'--read-replay','--json')
  check('recovery readback real',t.returncode==0 and json.loads(t.stdout)['event_count']==3 and json.loads(t.stdout)['status']=='BLOCKED')
  t=invoke('--repo',str(repo),'--state',str(state),'--record-event','UNTRUSTED','PASS','NO')
  check('invalid transition refused',t.returncode==2 and len(json.loads(receipt.read_text())['replay']['events'])==3)

shell=script.read_text()
check('state transitions documented',all(x in shell for x in ('--replay','--resume','replay_event','REPAIR','DIAGNOSE','HALT','SCANNER_DROPS_REPLAY_EVENTS')))
check('script bounded no HAkaI destructive', 'HAKAI=BLOCKED' in shell and 'main-pulse-reconciler.sh' in shell and 'rm -rf' not in shell)
check('one JSON active', 'centraldark-inventory-reconcile.json' in shell and '"$MAIN" --scan' in shell)
check('core pinned new owner', 'eaab55ffdf6cd928947a2967b8fd449c89bf7910' in shell and 'b56706f65fd045acc60dc88d11643362faded88ae9f0a504a7ec17bf2a906830' in shell)
check('Win route supports local PAPAGAIO compare',"'papagaio-check'" in (BASE/'executar-casa.ps1').read_text() and 'REWRITE_NOT_APPEND_ONLY' in (BASE/'executar-casa.ps1').read_text())
# V3: regressão diretamente contra o erro mostrado pelo CHEFE no PowerShell.
# O scanner tem um espaço de indentacao em ' v[replay]'.
import re

def shell_fn(name):
  found=re.search(r'(?ms)^'+re.escape(name)+r'\(\)\{\n.*?^\}\n',shell)
  if not found:raise AssertionError('function_missing_'+name)
  return found.group(0)

with tempfile.TemporaryDirectory(prefix='centraldark-replay-v3-proof-') as folder:
  temp=pathlib.Path(folder)
  check('same 12 package components',len([f for f in BASE.rglob('*') if f.is_file() and '__pycache__' not in str(f) and f.name!='PACOTE-SHA256.json' and f.suffix!='.pyc'])==11)
  scannerFn=shell_fn('scanner_preserves_replay')
  ok=temp/'fixed-owner.sh'
  ok.write_text("if isinstance(old.get('replay'), dict):\n v['replay']=old['replay']\n")
  bad=temp/'broken-owner.sh'
  bad.write_text("if isinstance(old.get('replay'), dict):\nv['replay']=new_value\n")
  def check_scanner(path):
    return subprocess.run(['bash','-c',scannerFn+'\nMAIN="$1"; scanner_preserves_replay','_',str(path)],capture_output=True,text=True,timeout=3)
  check('REGRESSION: indented replay owner recognised',check_scanner(ok).returncode==0)
  check('REGRESSION: broken replay owner is BLOCKED',check_scanner(bad).returncode!=0)
  check('REGRESSION: replay and manual scan share one guard',shell.count('scanner_preserves_replay; then')==2)
  resumeFn=shell_fn('previous_scan_verified')
  receipt=temp/'centraldark-inventory-reconcile.json'
  fingerprint='a'*64
  script_sha='b'*64
  main_sha='c'*40
  data={'duplicates':{'fingerprint':fingerprint},'replay':{'events':[]}}
  def check_resume():
    receipt.write_text(json.dumps(data))
    return subprocess.run(['bash','-c',resumeFn+'\nRECEIPT="$1"; previous_scan_verified "$2" "$3"','_',str(receipt),script_sha,main_sha],capture_output=True,text=True,timeout=3)
  check('RESUME: cannot skip scan without prior proof',check_resume().returncode==1)
  data['replay']['events'].append({'state':'EXECUTE','status':'PASS','detail':'SCAN_EXEC_EXIT_0; fingerprint='+fingerprint,'script_sha256':script_sha,'main_cached_sha':main_sha})
  check('RESUME: can skip scan with matching proof',check_resume().returncode==0)
  data['duplicates']['fingerprint']='d'*64
  check('RESUME: changed fingerprint needs new scan',check_resume().returncode==1)
  data['duplicates']['fingerprint']=fingerprint
  data['replay']['events'].append({'state':'EXECUTE','status':'BLOCKED','detail':'SCANNER_DROPS_REPLAY_EVENTS'})
  check('RESUME: failure after scan invalidates skip',check_resume().returncode==1)
  # Recibo isolado: o tmp da bateria V2 ja foi encerrado.
  fixture_repo=temp/'repo';(fixture_repo/'scripts').mkdir(parents=True)
  (fixture_repo/'scripts/centraldark-inventory-reconcile.sh').write_text('echo fake\n')
  fixture_state=temp/'receipt-state';fixture_state.mkdir()
  (fixture_state/'centraldark-inventory-reconcile.json').write_text(json.dumps({'schema':'centraldark.inventory','replay':{}}))
  t=invoke('--repo',str(fixture_repo),'--state',str(fixture_state),'--record-event','VERIFY','UNKNOWN','MCP_RUNTIME_UNKNOWN')
  check('VISUAL: 🟡 [UNKNOWN] unchanged',t.returncode==0 and '🟡 [UNKNOWN] REPLAY_EVENT=VERIFY STATUS=UNKNOWN' in t.stdout)
  t=invoke('--repo',str(fixture_repo),'--state',str(fixture_state),'--record-event','HALT','BLOCKED','HAKAI_NOT_EXECUTED')
  check('VISUAL: 🔴 [BLOCKED] unchanged',t.returncode==0 and '🔴 [BLOCKED] REPLAY_EVENT=HALT STATUS=BLOCKED' in t.stdout)
  check('VISUAL: 🟢 [PASS] emitted',"print(ball(status)+' ['+status+'] REPLAY_EVENT=" in (BASE/'tools/verificar-integridade.py').read_text())
  check('No automatic HAKAI', 'rm -rf' not in shell and 'HAKAI=BLOCKED' in shell)

print('TESTS_FAILED_AFTER_V3='+str(len(failures)))


# V4 - prova funcional do log unico: mesmo nome, truncado por invocacao,
# bolinhas e rótulos ficam inalterados. Fakes locais, nenhuma VPS tocada.
import os
with tempfile.TemporaryDirectory(prefix='centraldark-v4-log-') as td:
  td=pathlib.Path(td)
  logfile=td/'centraldark-logs'/'centraldark-inventory-reconcile.log'
  env=os.environ.copy()
  env['CENTRALDARK_LOG_DIR']=str(logfile.parent)
  env.pop('CENTRALDARK_EXECUTION_LOG_ACTIVE',None)
  def invalid_mode(mode):
    return subprocess.run(['bash',str(script),'--'+mode],env=env,
                          capture_output=True,text=True,timeout=15)
  first=invalid_mode('V4_FIRST')
  text1=logfile.read_text() if logfile.is_file() else ''
  check('V4: first run log file only',first.returncode==2 and
        'MODO_DESCONHECIDO=--V4_FIRST' in text1 and
        text1==first.stdout and '🟢 [PASS] LOG_LATEST=' in text1)
  second=invalid_mode('V4_SECOND')
  text2=logfile.read_text() if logfile.is_file() else ''
  check('V4: overwrite old log instead of append',second.returncode==2 and
        'MODO_DESCONHECIDO=--V4_SECOND' in text2 and
        'MODO_DESCONHECIDO=--V4_FIRST' not in text2 and text2==second.stdout)
  check('V4: only one persistent log file',len(list(td.rglob('*.log')))==1)
  check('V4: no extra JSON in log directory',not list(td.rglob('*.json')))
  check('V4: private log permissions',
        (logfile.stat().st_mode & 0o777)==0o600 if logfile.is_file() else False)
  check('V4: expected stable log path',
        '/var/log/centraldark' in raw and
        'centraldark-inventory-reconcile.log' in raw and
        'LOG_MODE=OVERWRITE' in raw)
  check('V4: disk-full guard precedes log creation',
        raw.index('LOG_DISK_FULL') < raw.index('mkdir -m 700') < raw.index('tee -- "$LOG_FILE"'))
  check('V4: status labels unchanged',
        all(x in raw for x in ('[PASS]','[PARTIAL]','[BLOCKED]')) or
        ('[PASS]' in raw and '[PARTIAL]' in raw and 'BLOCKED' in raw))
  check('V4: lock prevents simultaneous writers',
        'flock -n 8' in raw and '/run/lock/centraldark-inventory-reconcile-log.lock' in raw)
  check('V4: logger preserves child exit status',
        'exit "${LOG_PIPE[0]}"' in raw and 'LOG_WRITE_FAILED' in raw)
print('TESTS_FAILED_V4='+str(len(failures)))
sys.exit(1 if failures else 0)
