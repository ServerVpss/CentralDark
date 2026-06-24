#!/usr/bin/env bash
# ============================================================================
# 078 — Quarentena de pastas inertes em /root/Multizap
# ----------------------------------------------------------------------------
# Move 6 pastas classificadas como inertes (sem refs em código, sem uso em
# PM2, sem mounts ativos) para /root/Multizap/quarantine/<timestamp>/.
#
# Regras de segurança:
#   - NÃO toca em: apps/, api/, gateway/, wuzapi/, guarda/, secrets/,
#     credenciais/, logs/, revisoes/, quarantine/
#   - Faz checagem de processos abertos com lsof (se houver, aborta a pasta)
#   - Gera tar.gz de backup antes do move
#   - Move com `mv` (atômico, mesma partição)
#   - Idempotente: se a pasta já foi movida, só registra no relatório
#   - Relatório completo em /root/Multizap/revisoes/$TS/078-quarentena-pastas-inertes/
# ============================================================================
set -euo pipefail

BASE="/root/Multizap"
QUAR_ROOT="$BASE/quarantine"
TS="$(date +%Y%m%d-%H%M%S)"
REV="$BASE/revisoes/$TS/078-quarentena-pastas-inertes"
DEST="$QUAR_ROOT/$TS"
mkdir -p "$REV/dados" "$DEST"

RESUMO="$REV/resumo.md"

PASTAS=(
  "central-logs"
  "central-notificacoes"
  "consciencia"
  "deploy-hooks"
  "ia"
  "backups"
)

{
  echo "# 078 — Quarentena de pastas inertes"
  echo
  echo "**Timestamp:** $TS"
  echo "**Destino quarentena:** \`$DEST\`"
  echo "**Pastas alvo:** ${PASTAS[*]}"
  echo
  echo "## Resultado por pasta"
  echo
} > "$RESUMO"

MOVIDAS=0
PULADAS=0
ABORTADAS=0

for nome in "${PASTAS[@]}"; do
  origem="$BASE/$nome"
  echo "----- $nome -----" | tee -a "$REV/dados/log.txt"

  if [ ! -e "$origem" ]; then
    echo "- **$nome**: não existe na origem (já movida ou nunca criada) — PULADA" >> "$RESUMO"
    PULADAS=$((PULADAS+1))
    continue
  fi

  if [ ! -d "$origem" ]; then
    echo "- **$nome**: existe mas não é diretório — PULADA por segurança" >> "$RESUMO"
    PULADAS=$((PULADAS+1))
    continue
  fi

  # Checagem 1 — arquivos abertos por processos
  EM_USO=""
  if command -v lsof >/dev/null 2>&1; then
    EM_USO="$(lsof +D "$origem" 2>/dev/null | tail -n +2 || true)"
  fi
  if [ -n "$EM_USO" ]; then
    echo "- **$nome**: ABORTADA — há processos com arquivos abertos nessa pasta" >> "$RESUMO"
    echo "$EM_USO" > "$REV/dados/${nome}-em-uso.txt"
    ABORTADAS=$((ABORTADAS+1))
    continue
  fi

  # Checagem 2 — referências no PM2
  if command -v pm2 >/dev/null 2>&1; then
    if pm2 jlist 2>/dev/null | grep -q "/root/Multizap/$nome"; then
      echo "- **$nome**: ABORTADA — referenciada em processo PM2 ativo" >> "$RESUMO"
      ABORTADAS=$((ABORTADAS+1))
      continue
    fi
  fi

  # Backup tar.gz antes do move
  BKP="$REV/dados/${nome}.tar.gz"
  tar -czf "$BKP" -C "$BASE" "$nome" 2>>"$REV/dados/log.txt" || {
    echo "- **$nome**: ABORTADA — falha ao criar backup tar.gz" >> "$RESUMO"
    ABORTADAS=$((ABORTADAS+1))
    continue
  }

  TAM="$(du -sh "$origem" | awk '{print $1}')"
  TAM_BKP="$(du -sh "$BKP" | awk '{print $1}')"

  # Move atômico
  if mv "$origem" "$DEST/$nome" 2>>"$REV/dados/log.txt"; then
    echo "- **$nome**: MOVIDA (origem $TAM, backup $TAM_BKP) → \`$DEST/$nome\`" >> "$RESUMO"
    MOVIDAS=$((MOVIDAS+1))
  else
    echo "- **$nome**: ERRO no mv — pasta permaneceu na origem" >> "$RESUMO"
    ABORTADAS=$((ABORTADAS+1))
  fi
done

{
  echo
  echo "## Resumo"
  echo "- Movidas: **$MOVIDAS**"
  echo "- Puladas (não existiam): **$PULADAS**"
  echo "- Abortadas (em uso / erro): **$ABORTADAS**"
  echo
  echo "## Estado atual da raiz /root/Multizap"
  echo '```'
  ls -lah "$BASE" | grep -v '^total'
  echo '```'
  echo
  echo "## Conteúdo da nova quarentena"
  echo '```'
  ls -lah "$DEST" 2>/dev/null | grep -v '^total' || echo "(vazio)"
  echo '```'
  echo
  echo "## Reversão"
  echo "Para restaurar qualquer pasta:"
  echo '```bash'
  echo "mv $DEST/<nome> $BASE/<nome>"
  echo '```'
  echo "Ou extrair backup:"
  echo '```bash'
  echo "tar -xzf $REV/dados/<nome>.tar.gz -C $BASE"
  echo '```'
} >> "$RESUMO"

echo "OK — relatório: $RESUMO"
