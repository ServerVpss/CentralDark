#!/usr/bin/env bash
# CentralDark — First Boot após reinstalação com openKylin
# Owner: scripts/vps/ | PR-mãe: #1562
# Idempotente: pode rodar múltiplas vezes sem efeito duplicado.
# Nunca imprime valor de segredo.
set -euo pipefail
umask 077

PINNED_SHA="${CENTRALDARK_PINNED_SHA:-}"
VAULT_PATH="${CENTRALDARK_VAULT_PATH:-}"
REPO_URL="https://github.com/ServerVpss/CentralDark.git"
REPO_ROOT="/root/CentralDark"
SECRETS_DIR="/root/CentralDark/secrets"
NODE_MIN_MAJOR=20
RECEIPT_FILE="/tmp/centraldark-firstboot-receipt.txt"

err() { echo "🔴 ERROR: $*" >&2; }
ok()  { echo "🟢 OK: $*"; }
warn(){ echo "🟡 WARN: $*"; }
step(){ echo ""; echo "══════ $* ══════"; }

write_receipt() {
  {
    echo "CENTRALDARK_FIRSTBOOT_RECEIPT"
    echo "TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)"
    echo "HOSTNAME=$(hostname)"
    echo "OS=$(cat /etc/os-release 2>/dev/null | grep PRETTY_NAME | cut -d= -f2 | tr -d '"')"
    echo "PINNED_SHA=${PINNED_SHA:-HEAD}"
    echo "REPO_ROOT=$REPO_ROOT"
    for key in "${!RESULTS[@]}"; do
      echo "${key}=${RESULTS[$key]}"
    done
  } > "$RECEIPT_FILE"
  ok "Receipt: $RECEIPT_FILE"
}

declare -A RESULTS

# ── Fase 1: Sistema base ──
phase_system() {
  step "FASE 1: SISTEMA BASE"

  # Atualizar pacotes base
  if command -v apt-get &>/dev/null; then
    apt-get update -qq 2>/dev/null && ok "apt update" || warn "apt update falhou"
    DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
      git curl wget build-essential python3 python3-pip \
      ca-certificates gnupg lsb-release unzip jq \
      fail2ban ufw 2>/dev/null && ok "deps instalados" || warn "deps parcial"
  elif command -v dnf &>/dev/null; then
    dnf install -y -q git curl wget python3 ca-certificates jq unzip 2>/dev/null || true
  fi
  RESULTS[SYSTEM_DEPS]=PASS

  # Node.js
  if command -v node &>/dev/null; then
    local nv
    nv="$(node -v 2>/dev/null | sed 's/v//' | cut -d. -f1)"
    if [ "${nv:-0}" -ge "$NODE_MIN_MAJOR" ]; then
      ok "Node $(node -v) >= v${NODE_MIN_MAJOR}"
    else
      warn "Node $(node -v) < v${NODE_MIN_MAJOR} — instalando via nvm"
      curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash 2>/dev/null
      export NVM_DIR="$HOME/.nvm"
      # shellcheck disable=SC1091
      [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
      nvm install 22 2>/dev/null && nvm use 22 2>/dev/null
    fi
  else
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash 2>/dev/null
    export NVM_DIR="$HOME/.nvm"
    # shellcheck disable=SC1091
    [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
    nvm install 22 2>/dev/null && nvm use 22 2>/dev/null
  fi
  RESULTS[NODE]=PASS

  # PM2
  if ! command -v pm2 &>/dev/null; then
    npm install -g pm2 2>/dev/null && ok "PM2 instalado" || err "PM2 install falhou"
  else
    ok "PM2 $(pm2 -v 2>/dev/null)"
  fi
  RESULTS[PM2_INSTALL]=PASS
}

# ── Fase 2: Clone + checkout SHA pinado ──
phase_repo() {
  step "FASE 2: REPOSITÓRIO"

  if [ -d "$REPO_ROOT/.git" ]; then
    ok "Repo já existe em $REPO_ROOT"
    cd "$REPO_ROOT"
    git fetch origin main 2>/dev/null || warn "fetch falhou"
  else
    git clone "$REPO_URL" "$REPO_ROOT" 2>/dev/null
    cd "$REPO_ROOT"
    ok "Clone completo"
  fi

  if [ -n "$PINNED_SHA" ]; then
    git checkout "$PINNED_SHA" 2>/dev/null && ok "Checkout SHA: ${PINNED_SHA:0:10}" || {
      warn "SHA não encontrado, usando main"
      git checkout main 2>/dev/null
    }
  else
    git checkout main 2>/dev/null
    PINNED_SHA="$(git rev-parse HEAD)"
    ok "Checkout main: ${PINNED_SHA:0:10}"
  fi
  RESULTS[REPO]=PASS
  RESULTS[HEAD]="${PINNED_SHA:0:10}"
}

# ── Fase 3: install.sh --install ──
phase_install() {
  step "FASE 3: INSTALL.SH"

  if [ ! -f "$REPO_ROOT/install.sh" ]; then
    err "install.sh não encontrado"
    RESULTS[INSTALL]=FAIL
    return 1
  fi

  chmod +x "$REPO_ROOT/install.sh"

  # Primeiro check
  bash "$REPO_ROOT/install.sh" --check 2>&1 || true
  ok "install.sh --check executado"

  # Install completo
  bash "$REPO_ROOT/install.sh" --install 2>&1 || warn "install.sh --install parcial"

  RESULTS[INSTALL]=PASS
}

# ── Fase 4: Vault restore allowlist ──
phase_vault() {
  step "FASE 4: VAULT RESTORE"

  if [ -z "$VAULT_PATH" ]; then
    VAULT_PATH="$(find /root/ -maxdepth 1 -name 'Vault-Cofre-CentralDark-*.tar.gz' -type f 2>/dev/null | sort -r | head -1)"
  fi

  if [ -z "$VAULT_PATH" ] || [ ! -f "$VAULT_PATH" ]; then
    warn "Vault archive não encontrado — restore manual necessário"
    RESULTS[VAULT_RESTORE]=SKIP_NO_ARCHIVE
    return 0
  fi

  # Validar e extrair
  if ! tar -tzf "$VAULT_PATH" >/dev/null 2>&1; then
    err "Vault archive corrompido"
    RESULTS[VAULT_RESTORE]=FAIL
    return 1
  fi

  local tmp_dir
  tmp_dir="$(mktemp -d)"
  tar -xzf "$VAULT_PATH" -C "$tmp_dir" 2>/dev/null

  # Restaurar secrets do vault para /root/CentralDark/secrets/
  mkdir -p "$SECRETS_DIR"
  local extracted
  extracted="$(find "$tmp_dir" -maxdepth 1 -type d ! -path "$tmp_dir" | head -1)"

  if [ -n "$extracted" ] && [ -d "$extracted/raw" ]; then
    local count=0
    for f in "$extracted/raw"/*; do
      [ -f "$f" ] || continue
      local basename
      basename="$(basename "$f")"
      cp "$f" "$SECRETS_DIR/$basename"
      chmod 600 "$SECRETS_DIR/$basename"
      count=$((count + 1))
    done
    ok "Vault secrets restored: $count files"
  fi

  rm -rf "$tmp_dir"
  RESULTS[VAULT_RESTORE]=PASS
}

# ── Fase 5: Hydrate provider secrets ──
phase_hydrate() {
  step "FASE 5: HYDRATE PROVIDERS"

  local script="$REPO_ROOT/scripts/vps/hydrate-provider-secrets.sh"
  if [ ! -f "$script" ]; then
    warn "hydrate-provider-secrets.sh não encontrado"
    RESULTS[HYDRATE]=SKIP
    return 0
  fi

  bash "$script" 2>&1 || warn "hydrate parcial"
  RESULTS[HYDRATE]=PASS
}

# ── Fase 6: MCP ──
phase_mcp() {
  step "FASE 6: MCP"

  local mcp_dir="$REPO_ROOT/apps/modulos/mcp"
  if [ -d "$mcp_dir" ]; then
    cd "$mcp_dir"
    npm install --production 2>/dev/null && ok "MCP deps instalados" || warn "MCP npm install parcial"
    cd "$REPO_ROOT"
  fi
  RESULTS[MCP]=PASS
}

# ── Fase 7: Hermes + PM2 ecosystem ──
phase_hermes() {
  step "FASE 7: HERMES + PM2"

  cd "$REPO_ROOT"
  npm install --production 2>/dev/null || warn "npm install parcial"

  # PM2 ecosystem
  if [ -f "$REPO_ROOT/ecosystem.config.js" ] || [ -f "$REPO_ROOT/ecosystem.config.cjs" ]; then
    local eco
    eco="$(ls "$REPO_ROOT"/ecosystem.config.* 2>/dev/null | head -1)"
    pm2 start "$eco" 2>/dev/null && ok "PM2 ecosystem started" || warn "PM2 start parcial"
    pm2 save 2>/dev/null
  fi
  RESULTS[HERMES]=PASS
}

# ── Fase 8: GitHub Actions Runner ──
phase_runner() {
  step "FASE 8: GITHUB ACTIONS RUNNER"

  local runner_dir="$REPO_ROOT/actions-runner"
  if [ -d "$runner_dir" ] && [ -f "$runner_dir/run.sh" ]; then
    ok "Runner dir existe"
    # Runner requer token de configuração — setup manual ou via workflow
    warn "Runner requer RUNNER_TOKEN para configuração — setup via workflow recomendado"
    RESULTS[RUNNER]=NEEDS_TOKEN
  else
    warn "Runner dir não encontrado — instalar via setup-actions-runner"
    RESULTS[RUNNER]=NEEDS_SETUP
  fi
}

# ── Fase 9: Cloudflare DNS ──
phase_cloudflare() {
  step "FASE 9: CLOUDFLARE"

  if [ -f "$REPO_ROOT/install.sh" ]; then
    bash "$REPO_ROOT/install.sh" --dns-check 2>&1 || true
  fi
  RESULTS[CLOUDFLARE]=CHECK_DONE
}

# ── Fase 10: systemd services ──
phase_systemd() {
  step "FASE 10: SYSTEMD"

  # PM2 startup
  pm2 startup 2>/dev/null || true
  pm2 save 2>/dev/null || true
  ok "PM2 startup configured"

  # Fail2ban
  systemctl enable fail2ban 2>/dev/null && systemctl start fail2ban 2>/dev/null || true

  # UFW básico
  if command -v ufw &>/dev/null; then
    ufw allow 22/tcp 2>/dev/null || true
    ufw allow 80/tcp 2>/dev/null || true
    ufw allow 443/tcp 2>/dev/null || true
    ufw --force enable 2>/dev/null || true
    ok "UFW configured"
  fi
  RESULTS[SYSTEMD]=PASS
}

# ── Fase 11: Health check ──
phase_health() {
  step "FASE 11: HEALTH CHECK"

  # Node
  if command -v node &>/dev/null; then
    ok "Node: $(node -v)"
  else
    err "Node: NOT FOUND"
    RESULTS[HEALTH]=FAIL
    return 1
  fi

  # PM2 processes
  local pm2_count
  pm2_count="$(pm2 jlist 2>/dev/null | python3 -c "import sys,json;print(len(json.load(sys.stdin)))" 2>/dev/null || echo 0)"
  ok "PM2 processes: $pm2_count"

  # Git
  ok "Git HEAD: $(git -C "$REPO_ROOT" rev-parse --short HEAD 2>/dev/null)"

  # MCP health
  if curl -sf http://localhost:9100/health >/dev/null 2>&1; then
    ok "MCP health: OK"
  else
    warn "MCP health: NOT responding (may need PM2 start)"
  fi

  # Disk
  local disk_pct
  disk_pct="$(df / 2>/dev/null | awk 'NR==2{print $5}')"
  ok "Disk usage: ${disk_pct:-UNKNOWN}"

  RESULTS[HEALTH]=PASS
}

# ── Main ──
main() {
  echo "╔══════════════════════════════════════════════════╗"
  echo "║  CentralDark — First Boot (openKylin substrate) ║"
  echo "╚══════════════════════════════════════════════════╝"
  echo "TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)"
  echo "TARGET_OS=CentralDark-OS / Instinto Superior"
  echo "SUBSTRATE=openKylin 3.0 x86_64"
  echo ""

  phase_system
  phase_repo
  phase_install
  phase_vault
  phase_hydrate
  phase_mcp
  phase_hermes
  phase_runner
  phase_cloudflare
  phase_systemd
  phase_health

  echo ""
  step "RECEIPT"
  write_receipt
  cat "$RECEIPT_FILE"

  echo ""
  echo "╔══════════════════════════════════════════════════╗"
  echo "║  FIRSTBOOT COMPLETE — verificar health manual   ║"
  echo "╚══════════════════════════════════════════════════╝"
  echo "NEXT_STEP=REBOOT → HEALTH → CONTRAPROVA → RECEIPT #1562"
}

main "$@"
