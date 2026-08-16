#!/usr/bin/env bash
# CentralDark — gate read-only de segurança pós-build / pré-cutover.
# Detecta e bloqueia. Não remove, não move e não "cura" arquivos automaticamente.
set -euo pipefail

REPO_ROOT="${1:-/root/CentralDark}"
RESTORE_ROOT="${2:-/root/Multizap/restore-staging}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
REVIEW_ROOT="${CD_REVIEW_ROOT:-/root/Multizap/revisoes}"
OUT="${REVIEW_ROOT}/${STAMP}/security-gate"
if ! mkdir -p "$OUT" 2>/dev/null; then
  OUT="/tmp/centraldark-${STAMP}-security-gate"
  mkdir -p "$OUT"
fi
chmod 700 "$OUT" 2>/dev/null || true

status=0
summary="$OUT/summary.txt"
: >"$summary"
chmod 600 "$summary" 2>/dev/null || true

record() { printf '%-28s %s\n' "$1" "$2" | tee -a "$summary"; }
block() { record "$1" "BLOCKED${2:+ — $2}"; status=1; }
pass() { record "$1" "PASS${2:+ — $2}"; }
fail() { record "$1" "FAIL${2:+ — $2}"; status=1; }

record "CENTRALDARK_SECURITY_GATE" "1"
record "MODE" "READ_ONLY"
record "REPO_ROOT" "$REPO_ROOT"
record "RESTORE_ROOT" "$RESTORE_ROOT"

if [ ! -d "$REPO_ROOT" ]; then
  block "REPO_PRESENT" "$REPO_ROOT ausente"
else
  pass "REPO_PRESENT"
fi

if command -v trivy >/dev/null 2>&1 && [ -d "$REPO_ROOT" ]; then
  record "TRIVY_VERSION" "$(trivy --version 2>/dev/null | head -n 1 || echo UNKNOWN)"
  set +e
  trivy fs \
    --scanners vuln,misconfig,secret \
    --severity HIGH,CRITICAL \
    --exit-code 1 \
    --no-progress \
    --format json \
    --output "$OUT/trivy-repo.json" \
    "$REPO_ROOT"
  trivy_rc=$?
  set -e
  chmod 600 "$OUT/trivy-repo.json" 2>/dev/null || true
  if [ "$trivy_rc" -eq 0 ]; then
    pass "TRIVY_REPO"
  else
    fail "TRIVY_REPO" "rc=$trivy_rc; revisar relatório local protegido"
  fi
else
  block "TRIVY_REPO" "trivy ausente ou repo indisponível"
fi

if [ -d "$RESTORE_ROOT" ]; then
  if command -v clamscan >/dev/null 2>&1; then
    record "CLAMAV_VERSION" "$(clamscan --version 2>/dev/null | head -n 1 || echo UNKNOWN)"
    set +e
    clamscan --recursive --infected --log="$OUT/clamav-restore.log" "$RESTORE_ROOT" >/dev/null 2>&1
    clam_rc=$?
    set -e
    chmod 600 "$OUT/clamav-restore.log" 2>/dev/null || true
    if [ "$clam_rc" -eq 0 ]; then
      pass "CLAMAV_RESTORE_DATA"
    else
      fail "CLAMAV_RESTORE_DATA" "rc=$clam_rc; deteção/erro requer análise, zero remoção automática"
    fi
  else
    block "CLAMAV_RESTORE_DATA" "clamscan ausente com restore aplicável"
  fi
else
  record "CLAMAV_RESTORE_DATA" "NOT_APPLICABLE — restore staging ausente"
fi

{
  echo "# Executáveis em roots CentralDark/Multizap"
  for d in "$REPO_ROOT" /root/Multizap; do
    [ -d "$d" ] || continue
    find "$d" -xdev -type f -executable -printf '%m %u:%g %s %p\n' 2>/dev/null | sort || true
  done
} >"$OUT/executables.txt"
chmod 600 "$OUT/executables.txt" 2>/dev/null || true

(
  cd "$OUT"
  sha256sum ./* 2>/dev/null | sort || true
) >"$OUT/SHA256SUMS"
chmod 600 "$OUT/SHA256SUMS" 2>/dev/null || true

if [ "$status" -eq 0 ]; then
  record "SECURITY_GATE" "PASS"
  record "READY_FOR_SECURITY_NEXT_GATE" "YES"
  exit 0
fi

record "SECURITY_GATE" "FAIL"
record "READY_FOR_SECURITY_NEXT_GATE" "NO"
exit 1
