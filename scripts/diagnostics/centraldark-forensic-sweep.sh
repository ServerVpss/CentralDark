#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="${CENTRALDARK_ROOT:-/root/CentralDark}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="$ROOT/_DIAGNOSTICS/FORENSIC-$STAMP"
REPORT="$OUT/REPORT.txt"
LATEST="$ROOT/_DIAGNOSTICS/FORENSIC-LATEST.json"

mkdir -p "$OUT"

exec > >(tee -a "$REPORT") 2>&1

redact() {
  sed -E \
    -e 's/(gh[pousr]_[A-Za-z0-9_]{10,})/[REDACTED_GITHUB_TOKEN]/g' \
    -e 's/(github_pat_[A-Za-z0-9_]{10,})/[REDACTED_GITHUB_PAT]/g' \
    -e 's/(sk-[A-Za-z0-9_-]{10,})/[REDACTED_API_KEY]/g' \
    -e 's/(Bearer[[:space:]]+)[A-Za-z0-9._~+\/=:-]+/\1[REDACTED]/Ig' \
    -e 's/((token|password|passwd|secret|api[_-]?key|authorization)[[:space:]]*[:=][[:space:]]*)[^[:space:]",}]+/\1[REDACTED]/Ig'
}

section() {
  printf '\n\n===== %s =====\n' "$1"
}

run() {
  local title="$1"; shift
  section "$title"
  {
    "$@" 2>&1 || true
  } | redact
}

echo "🔵 CENTRALDARK_FORENSIC_SWEEP"
echo "UTC=$STAMP"
echo "MODE=READ_ONLY"
echo "SECRETS_CONTENT_COLLECTED=false"

cd "$ROOT" 2>/dev/null || {
  echo "ROOT_MISSING=$ROOT"
  exit 10
}

run HOST hostnamectl
run KERNEL uname -a
run UPTIME uptime
run CPU nproc
run MEMORY free -h
run DISK df -hT
run INODES df -ih

run GIT_BRANCH git branch --show-current
run GIT_HEAD git rev-parse HEAD
run GIT_STATUS git status --short --branch
run GIT_RECENT_COMMITS git log --oneline --decorate -30
run GIT_REMOTES git remote -v

section "GIT_REMOTE_MAIN"
git ls-remote origin refs/heads/main 2>&1 |
  awk '{print "REMOTE_MAIN_HEAD="$1}' |
  redact || true

section "GITHUB_AUTH"
if command -v gh >/dev/null 2>&1; then
  gh auth status -h github.com 2>&1 | redact || true
else
  echo "GH_CLI=ABSENT"
fi

if command -v gh >/dev/null 2>&1; then
  section "GITHUB_ACTIONS_RECENT"
  gh run list \
    --repo ServerVpss/CentralDark \
    --limit 100 \
    --json databaseId,name,workflowName,status,conclusion,headSha,headBranch,event,createdAt,updatedAt,url \
    2>&1 | redact || true

  section "GITHUB_ACTIONS_FAILED_LOGS"
  mapfile -t FAIL_RUNS < <(
    gh run list \
      --repo ServerVpss/CentralDark \
      --limit 100 \
      --json databaseId,conclusion \
      --jq '.[] | select(.conclusion=="failure" or .conclusion=="cancelled") | .databaseId' \
      2>/dev/null |
      head -20
  )
  for RID in "${FAIL_RUNS[@]:-}"; do
    [ -n "$RID" ] || continue
    echo
    echo "----- RUN_ID=$RID -----"
    timeout 40s gh run view "$RID" \
      --repo ServerVpss/CentralDark \
      --log-failed 2>&1 |
      tail -1500 |
      redact || true
  done
fi

section "RUNNER_PROCESSES"
pgrep -af 'Runner.Listener|Runner.Worker|runsvc.sh|actions-runner' 2>&1 | redact || true

section "RUNNER_SERVICES"
systemctl list-units --type=service --all 2>/dev/null |
  grep -Ei 'actions\.runner|github.*runner' |
  redact || true

section "RUNNER_DIRECTORIES"
find /root /opt -maxdepth 3 -type d -name 'actions-runner*' -print 2>/dev/null | sort

section "RUNNER_CONFIG_SAFE_METADATA"
for F in /root/CentralDark/actions-runner/.runner /opt/actions-runner-centraldark/.runner; do
  [ -f "$F" ] || continue
  echo "FILE=$F"
  python3 - "$F" <<'PY'
import json,sys
p=sys.argv[1]
try:
    with open(p,encoding="utf-8-sig") as f:
        d=json.load(f)
    for k in ("agentId","agentName","poolId","poolName","serverUrl","gitHubUrl","workFolder"):
        if k in d:
            print(f"{k}={d[k]}")
except Exception as e:
    print("PARSE_ERROR="+str(e))
PY
done

section "RUNNER_DIAG"
for D in /root/CentralDark/actions-runner/_diag /opt/actions-runner-centraldark/_diag; do
  [ -d "$D" ] || continue
  echo "DIR=$D"
  find "$D" -maxdepth 1 -type f -name '*.log' -printf '%T@ %p\n' 2>/dev/null |
    sort -nr |
    head -15 |
    cut -d' ' -f2- |
    while read -r F; do
      echo
      echo "----- $F -----"
      tail -250 "$F" 2>/dev/null | redact
    done
done

if command -v pm2 >/dev/null 2>&1; then
  run PM2_LIST pm2 ls
  section "PM2_LOGS"
  pm2 logs --nostream --lines 250 2>&1 | redact || true
fi

section "FAILED_SYSTEMD"
systemctl --failed --no-pager 2>&1 | redact || true

section "RELEVANT_SYSTEMD_UNITS"
systemctl list-units --type=service --all --no-pager 2>/dev/null |
  grep -Ei 'centraldark|hermes|mcp|runner|docker|caddy|nginx|tailscale' |
  redact || true

section "JOURNAL_RELEVANT_LAST_6H"
journalctl --since '6 hours ago' --no-pager -o short-iso 2>/dev/null |
  grep -Ei 'centraldark|hermes|mcp|runner|github|pm2|docker|caddy|nginx|tailscale|error|fail|fatal|panic|timeout|refused|unauthorized' |
  tail -5000 |
  redact || true

run LISTEN_PORTS ss -lntup

section "CENTRALDARK_PROCESSES"
ps -eo pid,ppid,lstart,%cpu,%mem,rss,cmd --sort=-%cpu |
  grep -Ei 'centraldark|hermes|mcp|node|python|runner|pm2|docker|caddy|nginx|tailscale' |
  grep -v grep |
  head -250 |
  redact || true

if command -v docker >/dev/null 2>&1; then
  run DOCKER_PS docker ps -a --format 'table {{.ID}}\t{{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'
  run DOCKER_STATS docker stats --no-stream --format 'table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.PIDs}}'
fi

section "LOCAL_ENDPOINT_PROBES"
python3 <<'PY'
import urllib.request,urllib.error
for u in (
    "http://127.0.0.1:9100/",
    "http://127.0.0.1:9100/health",
    "http://127.0.0.1:9100/health/deep",
    "http://127.0.0.1:9100/mcp",
    "http://127.0.0.1:11435/health",
):
    try:
        r=urllib.request.urlopen(u,timeout=4)
        print(u,"STATUS",r.status,"TYPE",r.headers.get("content-type"))
    except urllib.error.HTTPError as e:
        print(u,"HTTP",e.code)
    except Exception as e:
        print(u,type(e).__name__,str(e)[:180])
PY

section "ROOT_CRONTAB"
crontab -l 2>&1 |
  sed -E -e '/TOKEN|PASSWORD|SECRET|KEY=/I s/=.*/=[REDACTED]/' |
  redact || true

run SYSTEMD_TIMERS systemctl list-timers --all --no-pager

section "REPO_LOG_INVENTORY"
find "$ROOT" -type f \
  \( -iname '*.log' -o -iname '*receipt*.json' -o -iname 'status.json' -o -iname 'latest.json' \) \
  -not -path "$ROOT/secrets/*" \
  -not -path '*/node_modules/*' \
  -not -path '*/.git/*' \
  -not -path '*/dist/*' \
  -not -path '*/build/*' \
  -size -20M -mtime -14 \
  -printf '%TY-%Tm-%TdT%TH:%TM:%TS %s %p\n' 2>/dev/null |
  sort -r | head -2000 | redact || true

section "REPO_LOG_ERROR_SCAN"
find "$ROOT" -type f -iname '*.log' \
  -not -path "$ROOT/secrets/*" \
  -not -path '*/node_modules/*' \
  -not -path '*/.git/*' \
  -size -10M -mtime -7 -print0 2>/dev/null |
while IFS= read -r -d '' F; do
  MATCHES="$(
    grep -Ein 'error|fail|fatal|panic|timeout|refused|unauthorized|forbidden|queued|blocked|unknown|conflict|stale|expired' "$F" 2>/dev/null |
      tail -80 |
      redact || true
  )"
  if [ -n "$MATCHES" ]; then
    echo
    echo "----- $F -----"
    printf '%s\n' "$MATCHES"
  fi
done

section "SECRET_FILES_METADATA_ONLY"
if [ -d "$ROOT/secrets" ]; then
  find "$ROOT/secrets" -maxdepth 2 -type f \
    -printf '%M %u:%g %s %TY-%Tm-%TdT%TH:%TM:%TS %p\n' 2>/dev/null |
    sort |
    redact
else
  echo "SECRETS_DIR=ABSENT"
fi

section "EXISTING_GITHUB_AUTH_DETECTOR"
if [ -x "$ROOT/secrets/detect-github-auth.sh" ]; then
  "$ROOT/secrets/detect-github-auth.sh" 2>&1 | redact || true
elif [ -f "$ROOT/secrets/detect-github-auth.sh" ]; then
  bash "$ROOT/secrets/detect-github-auth.sh" 2>&1 | redact || true
else
  echo "DETECTOR=ABSENT"
fi

section "SUMMARY"
echo "HOST=$(hostname)"
echo "UTC=$STAMP"
echo "REPO_HEAD=$(git rev-parse HEAD 2>/dev/null || echo UNKNOWN)"
echo "REPO_BRANCH=$(git branch --show-current 2>/dev/null || echo UNKNOWN)"
echo "DIRTY_COUNT=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')"
echo "RUNNER_PROCESSES=$(pgrep -af 'Runner.Listener' 2>/dev/null | wc -l | tr -d ' ')"
echo "PM2_PROCESSES=$(pm2 jlist 2>/dev/null | python3 -c 'import sys,json; print(len(json.load(sys.stdin)))' 2>/dev/null || echo UNKNOWN)"

cd "$ROOT/_DIAGNOSTICS"
ARCHIVE="CENTRALDARK-FORENSIC-$STAMP.tar.gz"
tar -czf "$ARCHIVE" "FORENSIC-$STAMP"
SHA="$(sha256sum "$ARCHIVE" | awk '{print $1}')"

python3 - "$LATEST" "$STAMP" "$REPORT" "$ROOT/_DIAGNOSTICS/$ARCHIVE" "$SHA" <<'PY'
import json,sys,os
path,stamp,report,archive,sha=sys.argv[1:]
payload={
  "schema":"centraldark.forensic.latest.v1",
  "observed_at":stamp,
  "mode":"READ_ONLY",
  "report":report,
  "archive":archive,
  "sha256":sha,
  "secrets_content_collected":False,
}
tmp=path+".tmp"
with open(tmp,"w",encoding="utf-8") as f:
    json.dump(payload,f,ensure_ascii=False,indent=2)
    f.write("\n")
os.replace(tmp,path)
PY

echo
echo "🟢 FORENSIC_SWEEP_COMPLETE"
echo "REPORT=$REPORT"
echo "ARCHIVE=$ROOT/_DIAGNOSTICS/$ARCHIVE"
echo "LATEST=$LATEST"
echo "SHA256=$SHA"
echo "SECRETS_CONTENT_COLLECTED=false"
