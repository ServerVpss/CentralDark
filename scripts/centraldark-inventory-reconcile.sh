#!/usr/bin/env bash
# CentralDark owner unico: inventario, scan, diff, pulse. Um JSON canonico.
set -Eeuo pipefail
if [[ "${1:-}" == "--pulse" ]]; then
  shift
  if [[ "${1:-}" == "--plan" ]]; then
    echo "PULSE_PLAN=READ_ONLY"
    printf "HEAD="; git -C /root/CentralDark rev-parse HEAD
    printf "ORIGIN_MAIN="; git -C /root/CentralDark rev-parse origin/main
    exit 0
  fi
  umask 077
  _json="/var/lib/centraldark/inventory-reconcile/centraldark-inventory-reconcile.json"
  _pulse_state="/var/lib/centraldark/inventory-reconcile/.pulse-$$"
  mkdir -p /var/lib/centraldark/inventory-reconcile
  _saved="$(python3 - "$_json" <<'PY'
import json,sys
try:
 with open(sys.argv[1]) as f:d=json.load(f)
 print((d.get("pulse") or {}).get("sha") or "")
except (OSError,ValueError,TypeError):print("")
PY
)"
  if [[ -z "$_saved" && -s /root/.centraldark/main-pulse/last-seen-sha ]]; then _saved="$(tr -d "[:space:]" </root/.centraldark/main-pulse/last-seen-sha)"; fi
  if [[ "$_saved" =~ ^[a-f0-9]{40}$ ]]; then printf "%s\n" "$_saved" >"$_pulse_state"; fi
  _receipt() {
    local code="$1"
    trap - EXIT
    python3 - "$_json" "$_pulse_state" "$code" <<'PY'
import json,os,sys,pathlib,datetime
p=pathlib.Path(sys.argv[1]);f=pathlib.Path(sys.argv[2]);rc=int(sys.argv[3])
try:d=json.loads(p.read_text())
except (OSError,ValueError):d={"schema":"centraldark.reconcile.v1","sources":{},"owners":{}}
v=d.get("pulse") or {}
if rc==0 and f.is_file():
 x=f.read_text().strip()
 if len(x)==40 and all(c in "abcdef0123456789" for c in x):v["sha"]=x
v["exit_code"]=rc
v["utc"]=datetime.datetime.now(datetime.timezone.utc).isoformat()
v["exit_zero_is_not_deploy_proof"]=True
d["pulse"]=v
tmp=p.with_suffix(".pulse-tmp");tmp.write_text(json.dumps(d,ensure_ascii=False,indent=2)+"\n");os.replace(tmp,p)
PY
    rm -f -- "$_pulse_state"
    return "$code"
  }
REPO="${CENTRALDARK_REPO:-/root/CentralDark}"
STATE_DIR="/var/lib/centraldark/inventory-reconcile"
STATE_FILE="$STATE_DIR/.pulse-$$"
LOG_FILE="/root/.centraldark/main-pulse/pulse.log"
LOCK="$STATE_DIR/.lock"
MICRODEPLOY="${CENTRALDARK_MAIN_PINNED_MICRODEPLOY:-/root/CentralDark/scripts/vps/main-pinned-microdeploy.sh}"
HERMES_INBOX="${CENTRALDARK_HERMES_INBOX:-/root/CentralDark/apps/modulos/HERMES-CORE/missions/pendente}"
HERMES_ANDAMENTO="${CENTRALDARK_HERMES_ANDAMENTO:-/root/CentralDark/apps/modulos/HERMES-CORE/missions/em-andamento}"
HERMES_CONCLUIDAS="${CENTRALDARK_HERMES_CONCLUIDAS:-/root/CentralDark/apps/modulos/HERMES-CORE/missions/concluidas}"
SOURCE=""
TRIGGER="timer"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --source) SOURCE="${2:-}"; shift 2 ;;
    --trigger) TRIGGER="${2:-timer}"; shift 2 ;;
    *) echo "ARG_UNKNOWN=$1"; exit 2 ;;
  esac
done

mkdir -p "$STATE_DIR"
touch "$LOG_FILE"
chmod 700 "$STATE_DIR"
chmod 600 "$LOG_FILE" 2>/dev/null || true

log() {
  printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" | tee -a "$LOG_FILE"
}

exec 9>"$LOCK"
flock -n 9 || { log "PULSE_SKIP=LOCK_HELD trigger=$TRIGGER"; rm -f -- "$_pulse_state"; exit 75; }
trap '_receipt "$?"' EXIT

[[ -d "$REPO/.git" ]] || { log "PULSE_FAIL=REPO_MISSING repo=$REPO"; exit 10; }
[[ -x "$MICRODEPLOY" ]] || { log "PULSE_FAIL=MICRODEPLOY_MISSING path=$MICRODEPLOY"; exit 11; }

export GIT_TERMINAL_PROMPT=0
if [[ -x "$REPO/secrets/github-read-askpass.sh" ]]; then
  export GIT_ASKPASS="$REPO/secrets/github-read-askpass.sh"
fi
export CENTRALDARK_GITHUB_TOKEN_FILE="${CENTRALDARK_GITHUB_TOKEN_FILE:-/root/secrets/GITHUB_TOKEN}"

git -C "$REPO" fetch --prune origin main --quiet || { log "PULSE_FAIL=FETCH"; exit 12; }
MAIN_SHA="$(git -C "$REPO" rev-parse origin/main)"
[[ "$MAIN_SHA" =~ ^[0-9a-f]{40}$ ]] || { log "PULSE_FAIL=MAIN_SHA_INVALID"; exit 13; }

# O checkout vivo pode conter trabalho local legítimo. O reconciliador não
# move HEAD nem apaga tracked dirty; a convergência material é feita por owner,
# com backup/rollback no microdeploy isolado. CURRENT continua explicitamente medido.
LIVE_HEAD="$(git -C "$REPO" rev-parse HEAD)"
if [[ "$LIVE_HEAD" == "$MAIN_SHA" ]]; then
  log "PULSE_LIVE_HEAD=CONVERGED head=$LIVE_HEAD main=$MAIN_SHA"
else
  tracked_dirty=0
  if ! git -C "$REPO" diff --quiet || ! git -C "$REPO" diff --cached --quiet; then
    tracked_dirty=1
  fi
  log "PULSE_LIVE_HEAD=DRIFT head=$LIVE_HEAD main=$MAIN_SHA tracked_dirty=$tracked_dirty note=owner_scoped_microdeploy_handles_convergence"
fi

if [[ -n "$SOURCE" && "$SOURCE" =~ ^[0-9a-f]{40}$ && "$SOURCE" != "$MAIN_SHA" ]]; then
  if git -C "$REPO" merge-base --is-ancestor "$SOURCE" "$MAIN_SHA" 2>/dev/null; then
    log "PULSE_SOURCE_ADVANCED requested=$SOURCE current=$MAIN_SHA"
  else
    log "PULSE_FAIL=SOURCE_NOT_IN_CURRENT_MAIN source=$SOURCE main=$MAIN_SHA"
    exit 14
  fi
fi

if [[ ! -s "$STATE_FILE" ]]; then
  printf '%s\n' "$MAIN_SHA" > "$STATE_FILE"
  chmod 600 "$STATE_FILE"
  log "PULSE_INIT=PASS baseline=$MAIN_SHA trigger=$TRIGGER"
  exit 0
fi

LAST_SHA="$(tr -d '[:space:]' < "$STATE_FILE")"
if [[ "$LAST_SHA" == "$MAIN_SHA" ]]; then
  log "PULSE_NO_CHANGE=1 main=$MAIN_SHA trigger=$TRIGGER"
  exit 0
fi
git -C "$REPO" cat-file -e "$LAST_SHA^{commit}" 2>/dev/null || {
  log "PULSE_FAIL=LAST_SHA_NOT_MATERIALIZED last=$LAST_SHA"
  exit 15
}
git -C "$REPO" merge-base --is-ancestor "$LAST_SHA" "$MAIN_SHA" 2>/dev/null || {
  log "PULSE_FAIL=NON_FAST_FORWARD last=$LAST_SHA main=$MAIN_SHA"
  exit 16
}

mapfile -t CHANGED < <(git -C "$REPO" diff --name-only "$LAST_SHA..$MAIN_SHA")
if [[ "${#CHANGED[@]}" -eq 0 ]]; then
  printf '%s\n' "$MAIN_SHA" > "$STATE_FILE"
  log "PULSE_EMPTY_DELTA=PASS last=$LAST_SHA main=$MAIN_SHA"
  exit 0
fi

declare -a MCP_FILES=() HUB_FILES=() HERMES_FILES=() OAUTH_FILES=() UNHANDLED=()
for rel in "${CHANGED[@]}"; do
  case "$rel" in
    apps/modulos/mcp/*) MCP_FILES+=("$rel") ;;
    apps/bot-telegram/*) HUB_FILES+=("$rel") ;;
    apps/modulos/HERMES-CORE/*|docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/*|.agents/skills/centraldark-operational-method/*) HERMES_FILES+=("$rel") ;;
    apps/modulos/oauth-broker/*) OAUTH_FILES+=("$rel") ;;
    *) UNHANDLED+=("$rel") ;;
  esac
done

deploy_owner() {
  local owner="$1"; shift
  local -a files=("$@")
  [[ "${#files[@]}" -gt 0 ]] || return 0
  local -a args=(--owner "$owner" --source "$MAIN_SHA")
  local f
  for f in "${files[@]}"; do args+=(--file "$f"); done
  log "MICRODEPLOY_BEGIN owner=$owner files=${#files[@]} main=$MAIN_SHA trigger=$TRIGGER"
  "$MICRODEPLOY" "${args[@]}" >>"$LOG_FILE" 2>&1
  log "MICRODEPLOY_PASS owner=$owner files=${#files[@]} main=$MAIN_SHA"
}

# HERMES-CORE pode ser dependência importada pelo MCP. Promove o provider
# antes do consumidor para evitar janela de incompatibilidade entre owners.
deploy_owner hermes "${HERMES_FILES[@]}"
deploy_owner mcp "${MCP_FILES[@]}"
deploy_owner hub_bot "${HUB_FILES[@]}"
if [[ "${#OAUTH_FILES[@]}" -gt 0 ]]; then
  if systemctl is-active --quiet centraldark-oauth-broker.service; then
    deploy_owner oauth_broker "${OAUTH_FILES[@]}"
  else
    log "OAUTH_BROKER_DEPLOY_SKIPPED=1 reason=RUNTIME_NOT_ACTIVE human_frontier=VAULT_KEY_OR_CONFIG_PENDING changed_files=${#OAUTH_FILES[@]} main=$MAIN_SHA"
  fi
fi

if [[ "${#UNHANDLED[@]}" -gt 0 ]]; then
  # HERMES-CORE exige o contrato de continuidade antes de retomar uma missão.
  # Para deltas sem owner conhecido, o pulso cria diretamente uma órfã JSON
  # validável em em-andamento; o Core absorve esse JSON no mesmo executor.
  mkdir -p "$HERMES_ANDAMENTO" "$HERMES_CONCLUIDAS"
  MISSION_ID="main-pulse-${MAIN_SHA:0:12}"
  MISSION="$HERMES_ANDAMENTO/$MISSION_ID.json"
  MISSION_DIR="$HERMES_ANDAMENTO/$MISSION_ID"
  DONE_DIR="$HERMES_CONCLUIDAS/$MISSION_ID"

  if [[ ! -e "$MISSION" && ! -d "$MISSION_DIR" && ! -d "$DONE_DIR" ]]; then
    python3 - "$MISSION" "$MISSION_ID" "$LAST_SHA" "$MAIN_SHA" "$TRIGGER" "${UNHANDLED[@]}" <<'PY'
import json
import sys
from pathlib import Path

mission_path, mission_id, from_sha, to_sha, trigger, *files = sys.argv[1:]
mission_text = (
    "Classificar o delta da main fora dos owners de microdeploy conhecidos. "
    "Identificar owner existente e a menor rota segura de continuidade/deploy. "
    "Não aprovar, promover, inventar owner ou transformar UNKNOWN em PASS sem prova. "
    f"TRIGGER={trigger}; FROM_SHA={from_sha}; TO_SHA={to_sha}; "
    "ARQUIVOS=" + ", ".join(files)
)

state = {
    "objetivo": "Classificar delta da main sem owner de microdeploy conhecido e identificar owner existente/menor rota segura.",
    "autoridade": "SEGREDO/CHEFE",
    "coordenador": "SOL",
    "escritor": "HERMES",
    "escopo": {
        "tipo": "DELTA_MAIN_UNHANDLED",
        "arquivos": files,
        "from_sha": from_sha,
        "to_sha": to_sha,
    },
    "ambiente": "VPS",
    "classe_de_acao": "READ_ONLY_CLASSIFICATION",
    "baseline": {
        "head_sha": to_sha,
        "from_sha": from_sha,
        "fonte": "origin/main",
    },
    "backup": {
        "head_sha": to_sha,
        "strategy": "NO_MUTATION_NO_BACKUP_REQUIRED",
    },
    "rollback": {
        "head_sha": to_sha,
        "strategy": "NO_MUTATION_CLASSIFICATION_ONLY",
    },
    "receipt": {
        "head_sha": to_sha,
        "expected": "HERMES_FINALIZATION_CRITIC",
        "mission_id": mission_id,
    },
    "head_sha": to_sha,
    "terminal_state": "RUNNING",
    "historico": [],
    "retomadas": 0,
    "missao": mission_text,
}

payload = {
    "titulo": mission_id,
    "missao": mission_text,
    "descricao": mission_text,
    "state": state,
}
Path(mission_path).write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
PY
    chmod 600 "$MISSION" 2>/dev/null || true
    log "HERMES_CLASSIFY_QUEUED=1 contract=continuity-v1 file=$MISSION count=${#UNHANDLED[@]}"
  else
    log "HERMES_CLASSIFY_ALREADY_QUEUED=1 mission=$MISSION_ID"
  fi
fi

TMP="$STATE_FILE.tmp.$$"
printf '%s\n' "$MAIN_SHA" > "$TMP"
chmod 600 "$TMP"
mv "$TMP" "$STATE_FILE"
log "PULSE_PASS from=$LAST_SHA to=$MAIN_SHA changed=${#CHANGED[@]} mcp=${#MCP_FILES[@]} hub=${#HUB_FILES[@]} hermes=${#HERMES_FILES[@]} oauth=${#OAUTH_FILES[@]} unhandled=${#UNHANDLED[@]} trigger=$TRIGGER"

  exit 0
fi
# CentralDark ONE_ENTRY inventory/diff; no passwords, no destructive repairs.
set -Eeuo pipefail
export LC_ALL=C
ROOT=/root/CentralDark
STATE=/var/lib/centraldark/inventory-reconcile
MODE="--inventory"
if [ "$#" -gt 0 ];then MODE="$1";fi
case "$MODE" in --inventory|--diff|--scan) ;; --help) echo 'Uso: centraldark-inventory-reconcile.sh [--inventory|--diff|--scan|--pulse --plan]';exit 0;; *) echo 'BLOCKED: repair requer owner e receita autorizada'; exit 64;; esac
for x in git gh python3 flock timeout; do command -v "$x" >/dev/null || { echo "BLOCKED: missing $x";exit 2; }; done
test -d "$ROOT/.git" || { echo 'BLOCKED: repo absent';exit 2; }
umask 077
mkdir -p "$STATE"
exec 9>"$STATE/.lock"
flock -n 9 || { echo 'BLOCKED: another inventory run';exit 75; }
export CD_ROOT="$ROOT" CD_STATE="$STATE"
python3 - <<'PY'
import subprocess,json,os,pathlib,datetime,hashlib
root=pathlib.Path(os.environ['CD_ROOT']);state=pathlib.Path(os.environ['CD_STATE']);repo='ServerVpss/CentralDark'
def call(args,timeout=12):
 try:
  p=subprocess.run(args,cwd=root,text=True,capture_output=True,timeout=timeout)
  return (p.returncode,p.stdout.strip())
 except (OSError,subprocess.TimeoutExpired):return (124,'')
def sector(code):return 'CONNECTED' if code==0 else 'SEM_ACESSO'
v={'schema':'centraldark.reconcile.v1','utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'sources':{},'owners':{}}
s=v['sources']
for field,cmd in [('vps_head',['git','rev-parse','HEAD']),('vps_origin_main',['git','rev-parse','origin/main']),('dirty',['git','status','--porcelain','-uno'])]:
 c,o=call(cmd);s[field]={'status':sector(c),'value':o if field!='dirty' and c==0 else None,'changed_count':len(o.splitlines()) if field=='dirty' and c==0 else None}
c,_=call(['gh','auth','status'],6);s['gh_auth']={'status':sector(c)}
if c==0:
 for field,cmd in [('github_main',['gh','api','repos/ServerVpss/CentralDark/branches/main','--jq','.commit.sha']),('prs',['gh','pr','list','-R',repo,'--state','open','--limit','100','--json','number,headRefOid']),('issues',['gh','issue','list','-R',repo,'--state','open','--limit','100','--json','number']),('workflows',['gh','workflow','list','-R',repo,'--json','id,state'])]:
  k,o=call(cmd,17)
  if field=='github_main':s[field]={'status':sector(k),'sha':o if k==0 and len(o)==40 else None}
  else:
   try:items=json.loads(o) if k==0 else []; assert isinstance(items,list)
   except (ValueError,AssertionError):k=1;items=[]
   s[field]={'status':sector(k),'count':len(items) if k==0 else None,'items':items if field=='prs' and k==0 else []}
else:
 for field in ('github_main','prs','issues','workflows'):s[field]={'status':'SEM_ACESSO'}
c,o=call(['df','-B1','--output=avail','/'],4)
try:free=int(o.splitlines()[-1])
except (ValueError,IndexError):free=None
s['disk']={'status':sector(c),'free_bytes':free}
for service in ('centraldark-instinto-superior-web.service','centraldark-oauth-broker.service','centraldark-native-mcp-http.service'):
 k,o=call(['systemctl','is-active',service],4)
 s.setdefault('systemd',{})[service]={'status':'HEALTHY' if k==0 and o=='active' else 'UNKNOWN','active':o=='active'}
for rel in ('scripts/centraldark-inventory-reconcile.sh','scripts/vps/centraldark-vault-bootstrap-inventory.sh','scripts/trigger-fabric/verify_repo_contract.py','scripts/limpeza-autonoma.sh','apps/instinto-superior/src/lib/conexoes.functions.ts','docs/ARQUITETURA/PORTA-HUB-RUBY-CEREBRO.md'):
 p=root/rel
 try:sha=hashlib.sha256(p.read_bytes()).hexdigest()
 except (OSError,PermissionError):sha=None
 v['owners'][rel]={'status':'EXISTS' if sha else 'UNKNOWN','sha256':sha}
s['gmail']={'status':'SEM_ACESSO','reason':'Gmail is an external authorized connector, not an env to scrape'}

import collections,re,time
from zoneinfo import ZoneInfo
started=time.monotonic()
roots=[pathlib.Path(x) for x in ('/root','/opt','/srv','/home','/usr/local','/var/opt')]
skip={'.git','node_modules','.ssh','.cache','.npm','secrets','private','__pycache__','.venv','venv','build','dist'}
ext={'.sh','.bash','.py','.mjs','.cjs','.js','.ts','.ps1','.bat','.cmd','.rb'}
discovered=[];folders=[];seen=set();excluded=collections.Counter()
for base in roots:
 if not base.is_dir():continue
 for here,subdirs,names in os.walk(base,followlinks=False):
  if len(seen)>40000 or time.monotonic()-started>30:excluded['bounded_scan']+=1;break
  subdirs[:]=[d for d in subdirs if d not in skip]
  try:canonical=str(pathlib.Path(here).resolve())
  except OSError:excluded['directory_error']+=1;continue
  if canonical in seen:subdirs[:]=[];continue
  seen.add(canonical)
  if pathlib.Path(here).name!='scripts':continue
  folders.append(here)
  for name in names:
   file=pathlib.Path(here)/name
   if file.suffix.lower() not in ext:continue
   if len(discovered)>12000:excluded['files_limit']+=1;break
   try:
    if file.is_symlink() or file.stat().st_size>250000:excluded['link_or_large']+=1;continue
    data=file.read_bytes()
    if b'\x00' in data:excluded['binary']+=1;continue
    src=data.decode('utf-8','replace')
   except OSError:excluded['file_error']+=1;continue
   sha=hashlib.sha256(data).hexdigest()
    clean=re.sub(r'\s+', '', re.sub(r'(?m)^\s*(?:#|//).*' + chr(36), '', src)).lower()
   normalized=hashlib.sha256(clean.encode()).hexdigest()
   discovered.append((str(file),sha,normalized))
same=collections.defaultdict(list);norm=collections.defaultdict(list);names=collections.defaultdict(list)
for file,sha,n in discovered:
 same[sha].append(file);norm[n].append((file,sha))
 stem=re.sub(r'(?i)(backup|old|copy|temp|[-_.]v[0-9]+)','',pathlib.Path(file).stem.lower())
 names[stem].append(file)
equal=[sorted(group) for group in same.values() if len(group)>1]
normalized=[sorted(file for file,sha in group) for group in norm.values() if len({sha for file,sha in group})>1]
candidates=[sorted(group) for group in names.values() if len(group)>1]
fp=hashlib.sha256('\n'.join(file+' '+sha for file,sha,n in discovered).encode()).hexdigest()
v['brasilia']=datetime.datetime.now(ZoneInfo('America/Sao_Paulo')).strftime('%Y-%m-%dT%H:%M:%S%z')
v['duplicates']={'policy':'NEVER_DELETE_AUTOMATICALLY','scanned_scripts_folders':len(folders),'scanned_script_files':len(discovered),
'exact_bytes_count':len(equal),'normalized_content_count':len(normalized),'name_candidates_count':len(candidates),
'exact_bytes':equal[:100],'normalized_content':normalized[:100],'name_candidates_not_proven':candidates[:100],
'folders':folders[:200],'scan_roots':[str(x) for x in roots],'fingerprint':fp,
'partial':bool(excluded or len(equal)>100 or len(normalized)>100 or len(candidates)>100),
'skipped':dict(excluded),'seconds':round(time.monotonic()-started,2)}

latest=state/'centraldark-inventory-reconcile.json'
try:old=json.loads(latest.read_text())
except (OSError,ValueError):
 try:old=json.loads((state/'latest.json').read_text())
 except (OSError,ValueError):old={}
v['pulse']=old.get('pulse') or {'status':'UNKNOWN'}
changes={k:{'old':old.get(k),'new':v.get(k)} for k in ('sources','owners') if old.get(k)!=v.get(k)}
def atomic(p,payload):
 temp=p.with_suffix('.tmp');temp.write_text(json.dumps(payload,indent=2,ensure_ascii=False)+'\n');temp.replace(p)
v['delta']={'at':v['utc'],'changed':bool(changes),'sections':changes}
atomic(latest,v)
print('INTENTION=ONE_ENTRY_INCREMENTAL_INVENTORY')
print('RESULT='+('DELTA' if changes else 'NOOP'))
print('📅 BRASILIA='+v['brasilia'])
print('📂 PASTAS_SCRIPTS='+str(v['duplicates']['scanned_scripts_folders']))
print('🔎 ARQUIVOS_SCRIPTS='+str(v['duplicates']['scanned_script_files']))
print('♻️ MESMOS_BYTES='+str(v['duplicates']['exact_bytes_count'])+' NORMALIZADOS='+str(v['duplicates']['normalized_content_count'])+' CANDIDATOS='+str(v['duplicates']['name_candidates_count']))
for k,x in s.items():print('SECTOR='+k+' STATUS='+x.get('status','MIXED'))
print('OWNER_SCRIPTS_DISCOVERED='+str(sum(x['status']=='EXISTS' for x in v['owners'].values())))
print('RECEIPT='+str(latest))
print('NO_MUTATION=TRUE; NO_NEW_GH=TRUE; NO_AUTO_CREDENTIAL_SEARCH=TRUE')
PY
