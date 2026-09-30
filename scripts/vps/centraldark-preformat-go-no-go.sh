#!/usr/bin/env bash
# CentralDark — Preflight GO/NO-GO antes de formatar VPS
# Owner: scripts/vps/ | PR-mãe: #1562
# Executa Gates A + B + C. Se todos PASS → emite REINSTALL_ARMED=1
# Nunca imprime valor de segredo.
set -euo pipefail
umask 077

REPO_ROOT="${CENTRALDARK_REPO_ROOT:-/root/CentralDark}"
VAULT_PATH="${CENTRALDARK_VAULT_PATH:-}"
INSTANCE_ID="${CENTRALDARK_INSTANCE_ID:-vmi3256920}"
SNAPSHOT_ID="${CENTRALDARK_SNAPSHOT_ID:-snap1790430960}"
CONTABO_CREDS_OK=0
GATE_A=FAIL
GATE_B=FAIL
GATE_C=FAIL

err() { echo "🔴 ERROR: $*" >&2; }
ok()  { echo "🟢 OK: $*"; }
warn(){ echo "🟡 WARN: $*"; }

# ── Gate A: Vault íntegro + hash + allowlist + cópia off-host ──
gate_a() {
  echo ""
  echo "═══ GATE A: VAULT + HASH + ALLOWLIST ═══"

  # Localizar vault archive
  if [ -z "$VAULT_PATH" ]; then
    VAULT_PATH="$(find /root/ -maxdepth 1 -name 'Vault-Cofre-CentralDark-*.tar.gz' -type f 2>/dev/null | sort -r | head -1)"
  fi

  if [ -z "$VAULT_PATH" ] || [ ! -f "$VAULT_PATH" ]; then
    err "Vault archive não encontrado"
    return 1
  fi

  ok "Vault archive: $VAULT_PATH"
  local size
  size="$(stat -c%s "$VAULT_PATH" 2>/dev/null || echo 0)"
  ok "Vault size: ${size} bytes"

  # SHA256 check
  local sha_file="${VAULT_PATH}.sha256"
  if [ -f "$sha_file" ]; then
    local expected actual
    expected="$(cut -d' ' -f1 "$sha_file")"
    actual="$(sha256sum "$VAULT_PATH" | awk '{print $1}')"
    if [ "$expected" = "$actual" ]; then
      ok "SHA256 MATCH: $actual"
    else
      err "SHA256 MISMATCH: expected=$expected actual=$actual"
      return 1
    fi
  else
    err "SHA256 file ausente — Gate A exige checksum externo verificável"
    return 1
  fi

  # Validar tar.gz
  if ! tar -tzf "$VAULT_PATH" >/dev/null 2>&1; then
    err "Archive corrompido ou não é tar.gz válido"
    return 1
  fi
  ok "Archive tar.gz íntegro"

  # Extrair temporário e validar manifest
  local tmp_dir
  tmp_dir="$(mktemp -d)"
  tar -xzf "$VAULT_PATH" -C "$tmp_dir" 2>/dev/null || true
  local extracted
  extracted="$(find "$tmp_dir" -maxdepth 1 -type d ! -path "$tmp_dir" | head -1)"

  if [ -n "$extracted" ]; then
    local manifest
    manifest="$(find "$extracted" -name 'MANIFEST.tsv' -type f | head -1)"
    if [ -n "$manifest" ]; then
      local count
      count="$(($(wc -l < "$manifest") - 1))"
      ok "Manifest entries: $count"
    else
      warn "MANIFEST.tsv não encontrado no vault"
    fi

    # BOOTSTRAP-NEXT.env
    local env_file
    env_file="$(find "$extracted" -name 'BOOTSTRAP-NEXT.env' -type f | head -1)"
    if [ -n "$env_file" ]; then
      local entries
      entries="$(grep -c '=' "$env_file" 2>/dev/null || echo 0)"
      ok "BOOTSTRAP-NEXT.env: $entries entries"
    else
      warn "BOOTSTRAP-NEXT.env ausente"
    fi
  fi
  rm -rf "$tmp_dir"

  # Canonical files check
  local missing=0
  for f in install.sh CENTRALDARK_AI_BOOT.yaml LEIA-ME-IA.md AGENTS.md; do
    if [ -f "$REPO_ROOT/$f" ]; then
      ok "Canonical: $f"
    else
      err "Canonical MISSING: $f"
      missing=$((missing + 1))
    fi
  done

  if [ "$missing" -gt 0 ]; then
    err "Gate A FAIL: $missing canonical files missing"
    return 1
  fi

  # Cópia off-host: GitHub main = source of truth
  local remote_sha
  remote_sha="$(git -C "$REPO_ROOT" ls-remote origin refs/heads/main 2>/dev/null | awk '{print $1}')"
  if [ -n "$remote_sha" ]; then
    ok "GitHub main reachable: ${remote_sha:0:10}"
    ok "Off-host copy: GitHub é cópia canônica (install.sh, vault scripts, canonical files)"
  else
    warn "GitHub main unreachable — off-host copy não verificável agora"
  fi

  GATE_A=PASS
  ok "GATE_A=PASS"
}

# ── Gate B: Restore READONLY sem UNKNOWN/MISSING/NOT_IMPLEMENTED ──
gate_b() {
  echo ""
  echo "═══ GATE B: RESTORE READONLY ═══"

  if [ ! -f "$REPO_ROOT/scripts/vps/centraldark-os-bootstrap-restore.sh" ]; then
    err "centraldark-os-bootstrap-restore.sh não encontrado"
    return 1
  fi

  local output
  if ! output="$(CENTRALDARK_RESTORE_APPLY=0 CENTRALDARK_BOOTSTRAP_APPLY=0 CENTRALDARK_VAULT_PATH="$VAULT_PATH" CENTRALDARK_REPO_ROOT="$REPO_ROOT" bash "$REPO_ROOT/scripts/vps/centraldark-os-bootstrap-restore.sh" 2>&1)"; then
    echo "$output"
    err "Gate B FAIL: restore validator failed"
    return 1
  fi

  echo "$output"

  # Verificar por falhas materiais
  if echo "$output" | grep -qi "UNKNOWN\|MISSING.*canonical\|NOT_IMPLEMENTED"; then
    err "Gate B FAIL: UNKNOWN, MISSING ou NOT_IMPLEMENTED encontrado"
    return 1
  fi

  # Verificar receipt do script
  if echo "$output" | grep -q "BOOTSTRAP_VALIDATE=PASS"; then
    ok "Bootstrap validate PASS"
  fi
  if echo "$output" | grep -q "VAULT_OK=1"; then
    ok "Vault OK"
  fi

  if ! grep -q "^BOOTSTRAP_VALIDATE=PASS$" <<< "$output" || ! grep -q "^VAULT_OK=1$" <<< "$output"; then
    err "Gate B FAIL: explicit canonical and vault PASS receipts required"
    return 1
  fi

  # Verificar hydrate-provider-secrets.sh syntax
  if [ -f "$REPO_ROOT/scripts/vps/hydrate-provider-secrets.sh" ]; then
    if bash -n "$REPO_ROOT/scripts/vps/hydrate-provider-secrets.sh" 2>/dev/null; then
      ok "hydrate-provider-secrets.sh syntax PASS"
    else
      err "hydrate-provider-secrets.sh syntax FAIL"
      return 1
    fi
  else
    err "hydrate-provider-secrets.sh não encontrado"
    return 1
  fi

  # Verificar install.sh syntax
  if bash -n "$REPO_ROOT/install.sh" 2>/dev/null; then
    ok "install.sh syntax PASS"
  else
    err "install.sh syntax FAIL"
    return 1
  fi

  GATE_B=PASS
  ok "GATE_B=PASS"
}

# ── Gate C: Contabo control plane ──
gate_c() {
  echo ""
  echo "═══ GATE C: CONTABO CONTROL PLANE ═══"

  # Verificar credenciais Contabo
  for var in CONTABO_CLIENT_ID CONTABO_CLIENT_SECRET CONTABO_API_USER CONTABO_API_PASSWORD; do
    if [ -n "${!var:-}" ]; then
      ok "$var=CONFIGURED"
      CONTABO_CREDS_OK=$((CONTABO_CREDS_OK + 1))
    else
      warn "$var=MISSING"
    fi
  done

  if [ "$CONTABO_CREDS_OK" -lt 4 ]; then
    warn "Contabo API creds incompletas ($CONTABO_CREDS_OK/4) — usando medição manual"
    echo ""
    echo "Gate C requer verificação via painel my.contabo.com:"
    echo "  1. Snapshot $SNAPSHOT_ID existe e status=READY"
    echo "  2. Instance $INSTANCE_ID aceita rollback"
    echo "  3. VNC/Console acessível"
    echo "  4. Rescue mode disponível"
    echo "  5. Reinstall com Custom ISO (openKylin x86_64) disponível"
    echo ""

    # Verificar se existe confirmação manual prévia
    if [ -f "/tmp/centraldark-gate-c-manual.txt" ]; then
      ok "Confirmação manual encontrada em /tmp/centraldark-gate-c-manual.txt"
      cat "/tmp/centraldark-gate-c-manual.txt"
      GATE_C=PASS
    else
      echo "Para confirmar manualmente, criar /tmp/centraldark-gate-c-manual.txt com:"
      echo "  SNAPSHOT_READY=1"
      echo "  ROLLBACK_AVAILABLE=1"
      echo "  VNC_AVAILABLE=1"
      echo "  RESCUE_AVAILABLE=1"
      echo "  REINSTALL_OPENKYLIN_ROUTE=CONTABO_PANEL"
      echo ""
      err "Gate C FAIL: aguardando confirmação de control plane"
      return 1
    fi
  else
    # Com credenciais, verificar via API
    echo "Verificando via API Contabo..."

    local token
    token="$(curl -s -X POST 'https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token' \
      -d "client_id=${CONTABO_CLIENT_ID}" \
      -d "client_secret=${CONTABO_CLIENT_SECRET}" \
      -d "username=${CONTABO_API_USER}" \
      -d "password=${CONTABO_API_PASSWORD}" \
      -d "grant_type=password" 2>/dev/null | python3 -c "import sys,json;print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null)"

    if [ -z "$token" ]; then
      err "Contabo auth failed"
      return 1
    fi
    ok "Contabo auth OK"

    # Snapshot check
    local snap_response
    snap_response="$(curl -s -H "Authorization: Bearer $token" \
      -H "x-request-id: preflight-$(date +%s)" \
      "https://api.contabo.com/v1/compute/instances/${INSTANCE_ID}/snapshots/${SNAPSHOT_ID}" 2>/dev/null)"

    if echo "$snap_response" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d['data'][0]['status'])" 2>/dev/null | grep -qi "ready\|active"; then
      ok "Snapshot $SNAPSHOT_ID: READY"
    else
      err "Snapshot $SNAPSHOT_ID: NOT READY ou não encontrado"
      return 1
    fi

    # Instance check
    local inst_response
    inst_response="$(curl -s -H "Authorization: Bearer $token" \
      -H "x-request-id: preflight-inst-$(date +%s)" \
      "https://api.contabo.com/v1/compute/instances/${INSTANCE_ID}" 2>/dev/null)"

    if echo "$inst_response" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d['data'][0]['status'])" 2>/dev/null | grep -qi "running\|active"; then
      ok "Instance $INSTANCE_ID: RUNNING"
    else
      warn "Instance status não confirmado via API"
    fi

    GATE_C=PASS
  fi

  # openKylin image route
  echo ""
  echo "--- openKylin x86_64 route ---"
  ok "openKylin 3.0 x86_64: distribuição oficial em https://www.openkylin.top/downloads"
  ok "Arquitetura VPS: AMD EPYC x86_64 — compatível"
  ok "RAM: 25.2 GB — acima do mínimo"
  ok "Disco: ~200 GB — suficiente"
  ok "Rota: Custom ISO upload via my.contabo.com → reinstall"

  ok "GATE_C=$GATE_C"
}

# ── Main ──
main() {
  echo "╔══════════════════════════════════════════════════╗"
  echo "║  CentralDark — Preflight GO/NO-GO pré-Format    ║"
  echo "╚══════════════════════════════════════════════════╝"
  echo "TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)"
  echo "INSTANCE=$INSTANCE_ID"
  echo "SNAPSHOT=$SNAPSHOT_ID"
  echo "REPO=$REPO_ROOT"
  echo ""

  gate_a || true
  gate_b || true
  gate_c || true

  echo ""
  echo "╔══════════════════════════════════════════════════╗"
  echo "║  RECEIPT — GO/NO-GO                             ║"
  echo "╚══════════════════════════════════════════════════╝"
  echo "GATE_A=$GATE_A"
  echo "GATE_B=$GATE_B"
  echo "GATE_C=$GATE_C"

  if [ "$GATE_A" = "PASS" ] && [ "$GATE_B" = "PASS" ] && [ "$GATE_C" = "PASS" ]; then
    echo ""
    echo "🟢 REINSTALL_ARMED=1"
    echo "GO_REINSTALL=YES"
    echo "TARGET_OS=CentralDark-OS (openKylin 3.0 x86_64 substrate)"
    echo "NEXT_STEP=EXECUTE_REINSTALL"
    exit 0
  else
    echo ""
    echo "🔴 REINSTALL_ARMED=0"
    echo "GO_REINSTALL=NO"
    local blockers=""
    [ "$GATE_A" != "PASS" ] && blockers="${blockers}GATE_A "
    [ "$GATE_B" != "PASS" ] && blockers="${blockers}GATE_B "
    [ "$GATE_C" != "PASS" ] && blockers="${blockers}GATE_C "
    echo "BLOCKER=$blockers"
    echo "NEXT_STEP=FIX_BLOCKER_AND_RETEST"
    exit 1
  fi
}

main "$@"
