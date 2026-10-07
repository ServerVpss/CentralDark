#!/usr/bin/env bash
# CentralDark Vault Cofre — inventário e empacotamento de estado VPS
# Owner: scripts/vps/ | PR-mãe: #1562
# Uso: sudo bash scripts/vps/centraldark-vault-bootstrap-inventory.sh
# Nunca imprime valor de segredo. Nunca apaga origem.
set -euo pipefail
umask 077

TS="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="/root/Vault-Cofre-CentralDark-$TS"
RAW="$OUT/raw"
PROC="$OUT/process-env"
INV="$OUT/inventory"
MAN="$OUT/MANIFEST.tsv"
LOG="$OUT/README.txt"

mkdir -p "$RAW" "$PROC" "$INV"
chmod 700 "$OUT" "$RAW" "$PROC" "$INV"

cat > "$LOG" <<EOF
VAULT_COFRE_CENTRALDARK
CREATED_UTC=$TS
HOST=$(hostname)
MODE=MVP_SECRET_PRESERVE
SOURCE=VPS_CURRENT
NO_DELETE=1
DEDUP=SHA256
BOOTSTRAP_TARGET=CentralDark-OS
EOF

printf "idx\tsha256\tkind\tsource\tdest\tbytes\n" > "$MAN"

SKIP_PATH="node_modules|/\\.git/|/dist/|/_DIAGNOSTICS/|/logs/|/__pycache__/|/site-packages/|/typeshed/|/\\.cache/|/\\.local/share/uv/|/\\.bun/install/cache/|/\\.vscode-server/extensions/|/\\.vscode-server/data/|/opt/screenpipe/target/|/scratch/grok-build/|/vendor_imports/|/marketplace-cache/|/plugins/cache/|/docs/pr-media/|Trust Tokens|token-map\\.js|tokenize\\.js|TokenProcessor|DOMTokenList|passwordrules|credential-management|protectedTokens"

SECRET_PATTERN="CLOUDFLARE|CF_API|CONTABO|CENTRALDARK|MCP|GITHUB|GH_TOKEN|SUPABASE|SERVICE_ROLE|ANON_KEY|TELEGRAM|BOT_TOKEN|TAILSCALE|TS_AUTHKEY|GOOGLE|GDRIVE|DRIVE|OAUTH|CLIENT_ID|CLIENT_SECRET|API_KEY|API_TOKEN|ACCESS_TOKEN|REFRESH_TOKEN|TOKEN|PASSWORD|PASS|SECRET|PRIVATE_KEY|WEBHOOK|COOKIE|SESSION"

ROOTS="
/root/secrets
/root/.centraldark-secrets
/root/.centraldark
/root/CentralDark/secrets
/root/CentralDark
/root/.cloudflared
/root/.ssh
/root/.pm2
/root/.config
/root/.claude
/root/.claude_conta1
/root/.claude_conta2
/root/.codex
/root/.cline
/root/.gemini
/root/.grok
/root/.cursor
/root/.hermes
/root/.supabase
/root/.docker
"

SEED="$OUT/seed-paths.txt"
: > "$SEED"

for f in \
  /root/secrets/_inventory/latest.txt \
  /root/secrets/_inventory/secret-map-*.txt \
  /root/CentralDark/secrets/_inventory/latest.txt \
  /root/CentralDark/secrets/_inventory/secret-map-*.txt
do
  [ -f "$f" ] || continue
  cp -p "$f" "$INV/$(basename "$f").source"
  grep -Eo "(FILE|SOURCE|SECRET_FILE|CANDIDATE_PATH)=[^ |]+" "$f" \
    | cut -d= -f2- >> "$SEED" || true
done

for d in $ROOTS; do
  [ -e "$d" ] || continue
  find "$d" -maxdepth 7 -type f -size -5M 2>/dev/null
done >> "$SEED"

sort -u "$SEED" \
| grep -Ev "$SKIP_PATH" \
| while read -r f; do
  [ -f "$f" ] || continue
  [ -r "$f" ] || continue

  base="$(basename "$f")"
  case "$base" in
    *.png|*.jpg|*.jpeg|*.webp|*.mp4|*.mp3|*.wav|*.rlib|*.rmeta|*.o|*.so|*.dll) continue ;;
  esac

  if grep -Iq . "$f" 2>/dev/null && grep -Eiq "$SECRET_PATTERN" "$f" 2>/dev/null; then
    sha="$(sha256sum "$f" | awk '{print $1}')"
    dest="$RAW/${sha}__$(echo "$f" | sed 's#^/##; s#[/ ]#_#g')"
    if [ ! -f "$dest" ]; then
      cp -p "$f" "$dest" 2>/dev/null || true
    fi
    bytes="$(stat -c "%s" "$f" 2>/dev/null || echo 0)"
    idx="$(printf "%05d" "$(($(wc -l < "$MAN") ))")"
    printf "%s\t%s\tfile\t%s\t%s\t%s\n" "$idx" "$sha" "$f" "$dest" "$bytes" >> "$MAN"
  fi
done

ps -eo pid=,comm=,args= \
| grep -Ei "CentralDark|mcp|hermes|cloudflare|contabo|supabase|telegram|oauth|pm2|node|bun|python" \
| grep -v grep \
| while read -r pid comm rest; do
  [ -r "/proc/$pid/environ" ] || continue
  out="$PROC/${pid}_${comm}.env"
  tr '\0' '\n' < "/proc/$pid/environ" \
    | grep -Ei "$SECRET_PATTERN|CENTRALDARK|MCP|CLOUDFLARE|CONTABO|GITHUB|SUPABASE|TELEGRAM|TAILSCALE|GOOGLE|DRIVE" \
    > "$out" 2>/dev/null || true

  if [ -s "$out" ]; then
    sha="$(sha256sum "$out" | awk '{print $1}')"
    bytes="$(stat -c "%s" "$out" 2>/dev/null || echo 0)"
    printf "%05d\t%s\tprocess-env\t/proc/%s/environ\t%s\t%s\n" "$(wc -l < "$MAN")" "$sha" "$pid" "$out" "$bytes" >> "$MAN"
  else
    rm -f "$out"
  fi
done

sha256_tmp="$(mktemp --suffix=.txt)"
(cd "$OUT" && find . -type f -print0 | xargs -0 sha256sum | sort) > "$sha256_tmp"
mv "$sha256_tmp" "$OUT/SHA256SUMS.txt"

awk -F"\t" 'NR>1{print $2}' "$MAN" | sort | uniq -c | sort -nr > "$OUT/DEDUP_SHA_COUNTS.txt"

cat > "$OUT/BOOTSTRAP-NEXT.env" <<EOF
CENTRALDARK_BOOTSTRAP_MODE=agentic-os-install
CENTRALDARK_SOURCE_OF_TRUTH=github
CENTRALDARK_RUNTIME_SOURCE=vps
CENTRALDARK_BACKUP_FIRST=1
CENTRALDARK_NO_DELETE_BEFORE_RECEIPT=1
CENTRALDARK_RESTORE_ONLY_PROVEN=1
CENTRALDARK_PRESERVE_GOLD=1
CENTRALDARK_VAULT_CREATE=1
CENTRALDARK_VAULT_ARCHIVE=$OUT.tar.gz
CENTRALDARK_VAULT_SHA256_FILE=$OUT.tar.gz.sha256
EOF

tar -C "$(dirname "$OUT")" -czf "$OUT.tar.gz" "$(basename "$OUT")"
sha256sum "$OUT.tar.gz" > "$OUT.tar.gz.sha256"
chmod 600 "$OUT.tar.gz" "$OUT.tar.gz.sha256"

echo "VAULT_ARCHIVE=$OUT.tar.gz"
echo "VAULT_SHA256=$(cut -d' ' -f1 "$OUT.tar.gz.sha256")"
echo "VAULT_MANIFEST=$MAN"
echo "VAULT_RAW=$RAW"
echo "VAULT_PROCESS_ENV=$PROC"
echo "VAULT_READY=1"
