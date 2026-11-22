#!/usr/bin/env bash
# Manutencao diaria CentralDark — minimo viavel.
# 1) Trunca logs *-json.log de containers Docker vivos (mantem FD, nao derruba nada)
# 2) Roda `graphify update` como cinto+suspensorio do hook post-commit
# Log da rodada em: /root/CentralDark/logs/manutencao-YYYY-MM-DD.log
set -euo pipefail

REPO="/root/CentralDark"
DATA="$(date +%Y-%m-%d)"
LOG="$REPO/logs/manutencao-$DATA.log"
mkdir -p "$(dirname "$LOG")"

# Redireciona tudo (stdout + stderr) pro log e tambem pro cron capturar
exec > >(tee -a "$LOG") 2>&1

echo ""
echo "===================================================="
echo "  MANUTENCAO DIARIA — $(date '+%Y-%m-%d %H:%M:%S')"
echo "===================================================="

# ---- 1) Truncar logs *-json.log do Docker do host ----
echo ""
echo "[1/2] Truncando *-json.log do Docker (containers ficam vivos)..."
COUNT=0
BEFORE=0
if [ -d /var/lib/docker/containers ]; then
  while IFS= read -r f; do
    SZ=$(stat -c%s "$f" 2>/dev/null || echo 0)
    BEFORE=$((BEFORE + SZ))
    : > "$f"
    COUNT=$((COUNT + 1))
  done < <(find /var/lib/docker/containers -type f -name "*-json.log" 2>/dev/null)
  HUMAN=$(numfmt --to=iec --suffix=B "$BEFORE" 2>/dev/null || echo "$BEFORE bytes")
  echo "  -> $COUNT arquivo(s) truncado(s), $HUMAN liberado(s)"
else
  echo "  -> /var/lib/docker/containers nao existe, pulando"
fi

# ---- 2) Rodar graphify update ----
echo ""
echo "[2/2] Rodando 'graphify update' no repo..."
if command -v graphify >/dev/null 2>&1; then
  cd "$REPO"
  if graphify update . 2>&1 | tail -20; then
    echo "  -> graphify update OK"
  else
    echo "  -> graphify update FALHOU (exit $?)"
    exit 1
  fi
else
  echo "  -> graphify nao encontrado no PATH, pulando"
fi

echo ""
echo "FIM $(date '+%H:%M:%S')"
