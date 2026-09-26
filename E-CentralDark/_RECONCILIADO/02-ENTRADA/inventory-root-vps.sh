#!/usr/bin/env bash
# Inventário seguro da raiz da VPS.
# Não apaga nada. Apenas lista, classifica e gera relatório.

set -euo pipefail

TASK_NAME="inventario-root-vps"
TS="$(date +%Y%m%d-%H%M%S)"

if [ -d "/root/Multizap/revisoes" ]; then
  REV_BASE="/root/Multizap/revisoes"
else
  REV_BASE="/root/CentralDark/revisoes"
fi

OUT_DIR="$REV_BASE/$TS/$TASK_NAME"
mkdir -p "$OUT_DIR"
REPORT="$OUT_DIR/resumo.md"
RAW="$OUT_DIR/root-list.txt"
DETAIL="$OUT_DIR/root-detail.txt"

sanitize() {
  sed -E 's/(token|password|authorization|apikey|api_key|secret|bearer|client_secret)[=: ]+[^[:space:]]+/\1=***OCULTO***/Ig'
}

{
  echo "# Inventário seguro da raiz da VPS"
  echo
  echo "Data: $(date -Iseconds)"
  echo "Host: $(hostname)"
  echo "Ação: somente leitura, sem apagar nada."
  echo
  echo "## Regra atual"
  echo
  echo "Manter inicialmente:"
  echo "- /root/Multizap"
  echo "- /root/whatsapp-server"
  echo
  echo "Todo o resto deve ser revisado antes de qualquer limpeza."
  echo
} > "$REPORT"

find /root -mindepth 1 -maxdepth 1 -printf '%M %u %g %s %TY-%Tm-%Td %TH:%TM %p\n' 2>/dev/null | sort | sanitize | tee "$RAW" >/dev/null

{
  echo "## Pastas/arquivos encontrados em /root"
  echo
  echo '```txt'
  cat "$RAW"
  echo '```'
  echo
  echo "## Classificação inicial"
  echo
} >> "$REPORT"

while IFS= read -r path; do
  name="$(basename "$path")"
  case "$name" in
    Multizap|whatsapp-server)
      status="✅ MANTER — pasta protegida do projeto"
      ;;
    .ssh|.config|.cache|.npm|.pm2|.local|snap)
      status="🟡 SISTEMA/USUÁRIO — revisar, não apagar direto"
      ;;
    CentralDark)
      status="🟢 PROJETO NOVO — manter se a migração CentralDark estiver em uso"
      ;;
    *)
      status="🟠 REVISAR — não apagar sem confirmar origem"
      ;;
  esac
  printf -- "- %s — %s\n" "$path" "$status" >> "$REPORT"
done < <(find /root -mindepth 1 -maxdepth 1 -printf '%p\n' 2>/dev/null | sort)

{
  echo
  echo "## Detalhe de tamanho"
  echo
  echo '```txt'
  du -sh /root/* /root/.[!.]* 2>/dev/null | sort -h | sanitize
  echo '```'
} | tee "$DETAIL" >> "$REPORT" >/dev/null

chmod -R go-rwx "$OUT_DIR" 2>/dev/null || true

echo "$OUT_DIR"
