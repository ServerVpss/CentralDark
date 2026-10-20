#!/usr/bin/env bash
# CentralDark | Runner post-job cleanup v1
# Fonte: scripts/vps/centraldark-runner-postjob-clean.sh (main do GitHub).
#
# Contrato: o checkout do GitHub Actions e descartavel. Jobs devem publicar
# codigo, artefatos e recibos ANTES de terminar. Nada e sincronizado daqui.
#
# Gatilho: ACTIONS_RUNNER_HOOK_JOB_COMPLETED, apos steps e post-steps do job.
# Escopo: SOMENTE _work/CentralDark/CentralDark dos runners VPS 1..4.
# NUNCA toca /root/CentralDark, /root/.hermes, configuracao .runner,
# _actions, _tool, outros repositorios, snapshots ou secrets.
#
# Modos: --hook (automatico), --dry-run (inspecao),
#        --offline-clean (manutencao com runner PARADO).
# Falha fechada em caminhos inesperados, symlinks, mounts ou timeout.
set -Eeuo pipefail
umask 077

mode="${1:---hook}"
workspace="${GITHUB_WORKSPACE:-}"
log() {
  echo "[CENTRALDARK RUNNER-CLEAN] $*"
  logger -t centraldark-runner-clean -- "$*" 2>/dev/null || true
}
fail() { log "ERROR: $*"; exit 1; }

case "$mode" in --hook|--dry-run|--offline-clean) ;; *) fail "unknown mode";; esac
if [[ -z "$workspace" ]]; then
  log "SKIP: GITHUB_WORKSPACE undefined"
  exit 0
fi

# Lista explicita: sem paths dinamicos, variaveis arbitrarias ou glob destrutivo.
case "$workspace" in
  /root/actions-runners/centraldark-vps-1/_work/CentralDark/CentralDark|\
  /root/actions-runners/centraldark-vps-2/_work/CentralDark/CentralDark|\
  /root/actions-runners/centraldark-vps-3/_work/CentralDark/CentralDark|\
  /root/actions-runners/centraldark-vps-4/_work/CentralDark/CentralDark) ;;
  *) log "SKIP: workspace outside allowlist"; exit 0 ;;
esac

runner_home="${workspace%/_work/CentralDark/CentralDark}"
runner_name="$(basename "$runner_home")"
service="actions.runner.ServerVpss-CentralDark.$runner_name.service"

if [[ "$mode" == "--hook" && "${GITHUB_ACTIONS:-}" != "true" ]]; then
  fail "hook mode only inside GitHub Actions; use --dry-run"
fi
if [[ -n "${RUNNER_NAME:-}" && "$RUNNER_NAME" != "$runner_name" ]]; then
  fail "runner identity mismatch"
fi

# Impede concorrencia entre limpeza manual e hook de um mesmo host.
exec 9>/run/centraldark-runner-postjob-clean.lock
flock -w 15 9 || fail "cleanup lock busy"

if [[ ! -f "$runner_home/.runner" || ! -f "$runner_home/bin/Runner.Listener" ]]; then
  fail "runner installation is not valid"
fi
for dir in /root/actions-runners "$runner_home" "$runner_home/_work" "$runner_home/_work/CentralDark" "$workspace"; do
  [[ ! -L "$dir" ]] || fail "symlink in protected path"
done
if [[ ! -e "$workspace" ]]; then
  log "OK: no workspace to clean ($runner_name)"
  exit 0
fi
[[ -d "$workspace" ]] || fail "workspace is not a directory"
[[ "$(realpath -e -- "$workspace")" == "$workspace" ]] || fail "workspace canonical path mismatch"
[[ "$(stat -c %d -- "$workspace")" == "$(stat -c %d -- "$runner_home/_work")" ]] || fail "different filesystem"

# Em manutencao manual, exige servico realmente parado.
if [[ "$mode" == "--offline-clean" ]]; then
  state="$(systemctl is-active "$service" 2>/dev/null || true)"
  case "$state" in inactive|failed) ;; *) fail "runner not stopped ($state)";; esac
fi

# Nao atravessar volumes montados no checkout, inclusive bind mounts.
while IFS= read -r mount; do
  case "$mount" in "$workspace"|"$workspace"/*) fail "nested mount detected";; esac
done < <(findmnt -rn -o TARGET)

shopt -s dotglob nullglob
entries=("$workspace"/*)
count="${#entries[@]}"
if [[ "$mode" == "--dry-run" ]]; then
  kib="$(du -sk -- "$workspace" | awk '{print $1}')"
  log "DRY_RUN: runner=$runner_name entries=$count kib=$kib (no deletion)"
  exit 0
fi
if (( count == 0 )); then
  log "OK: workspace already empty ($runner_name)"
  exit 0
fi

# Preserva o proprio diretorio de trabalho. Descarta TODO o seu conteudo,
# incluindo .git/objects/pack e node_modules, sem mexer na instalacao do runner.
# Timeout evita prender a finalizacao do job indefinidamente.
log "START: runner=$runner_name entries=$count"
timeout --signal=TERM --kill-after=5s 180s rm -rf --one-file-system -- "${entries[@]}" || fail "cleanup failed or timed out"
entries=("$workspace"/*)
(( ${#entries[@]} == 0 )) || fail "workspace not empty after deletion"
log "OK: checkout ephemeral removed; runner preserved ($runner_name)"
