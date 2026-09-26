#!/usr/bin/env bash
set -euo pipefail
umask 077

TS="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="${OUT_DIR:-artifacts/discovery-${TS}}"
mkdir -p "$OUT"
REPO="${CENTRALDARK_ROOT:-}"

have() { command -v "$1" >/dev/null 2>&1; }
run_safe() {
  local name="$1"; shift
  { printf 'COMMAND='; printf '%q ' "$@"; printf '\n'; "$@"; } >"$OUT/${name}.txt" 2>&1 || true
}

printf '{"timestamp":"%s","mode":"READ_ONLY","secrets_read":false,"runtime_mutated":false}\n' "$(date -u +%FT%TZ)" > "$OUT/manifest.json"

run_safe system-uname uname -a
run_safe system-uptime uptime
run_safe memory-free free -h
run_safe disk-df df -hT
have lscpu && run_safe cpu-lscpu lscpu
have ss && run_safe network-listeners ss -lntup
have systemctl && run_safe systemd-running systemctl --no-pager --state=running --type=service
have docker && run_safe docker-ps docker ps --no-trunc --format '{{json .}}'

have pm2 && pm2 jlist | node -e '
let s=""; process.stdin.on("data",d=>s+=d).on("end",()=>{
  const p=JSON.parse(s); const sensitive=/token|secret|password|passwd|key|cookie|auth|credential/i;
  const out=p.map(x=>{const e=x.pm2_env||{}; const keys=Object.keys(e.env||{}).map(k=>sensitive.test(k)?"[SENSITIVE_KEY]":k);
  return {name:x.name,pm_id:x.pm_id,pid:x.pid,status:e.status,restart_time:e.restart_time,pm_uptime:e.pm_uptime,script:e.pm_exec_path,cwd:e.pm_cwd,interpreter:e.exec_interpreter,exec_mode:e.exec_mode,env_keys_sanitized:[...new Set(keys)].sort()}});
  console.log(JSON.stringify(out,null,2));}) > "$OUT/pm2-topology.json"

ps -eo pid,ppid,etime,cmd --sort=pid | grep -Ei 'ollama|vllm|sglang|llama[-_ ]?server|lmstudio|text-generation|qwen|transformers' | grep -v grep > "$OUT/model-runtime-processes.txt" || true

if [[ -n "$REPO" && -d "$REPO/.git" ]]; then
  git -C "$REPO" remote -v > "$OUT/git-remotes.txt" 2>&1 || true
  git -C "$REPO" branch --show-current > "$OUT/git-branch.txt" 2>&1 || true
  git -C "$REPO" rev-parse HEAD > "$OUT/git-head.txt" 2>&1 || true
  git -C "$REPO" status --short > "$OUT/git-status-short.txt" 2>&1 || true
  git -C "$REPO" rev-list --left-right --count HEAD...@{upstream} > "$OUT/git-ahead-behind.txt" 2>&1 || true
fi

find "$OUT" -type f -print0 | sort -z | xargs -0 sha256sum > "$OUT/SHA256SUMS"

echo "DISCOVERY_OUT=$OUT"
echo "MODE=READ_ONLY"
