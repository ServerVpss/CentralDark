#!/usr/bin/env bash
set -uo pipefail

BASE="/root/Multizap"
REPO="$BASE/apps/clone-deck"
REV_BASE="$BASE/revisoes"
MEMORIA="$REPO/conexao-ia/MEMORIA_OPERACIONAL_IA.md"
CHECKLIST="$REPO/conexao-ia/CHECKLIST_EXECUCAO.md"

INICIO="${1:-069-plano-apps-bot-qr}"
MAX_STEPS="${MAX_STEPS:-10}"

mkdir -p "$REV_BASE" "$REPO/conexao-ia"

TS="$(date +%Y%m%d-%H%M%S)"
ORQ_REV="$REV_BASE/$TS/auto-orquestrador"
mkdir -p "$ORQ_REV/dados"

exec > >(tee -a "$ORQ_REV/execucao.log") 2>&1

sanitize() {
  sed -E \
    -e 's/(token|password|authorization|apikey|api_key|secret)[=: ]+[^ ,"]+/\1=***OCULTO***/Ig' \
    -e 's/(Bearer )[A-Za-z0-9._-]+/\1***OCULTO***/Ig'
}

is_sensitive_task() {
  case "$1" in
    *crm*|*CRM*|*caddy*|*Caddy*|*docker*|*Docker*|*wuzapi*|*WuzAPI*|*pm2*|*PM2*|*banco*|*database*|*logout*|*reset*|*sessao*|*session*)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

next_task() {
  case "$1" in
    069-plano-apps-bot-qr) echo "070-consolidar-qr-temporario" ;;
    070-consolidar-qr-temporario) echo "071-validar-chat-ao-vivo" ;;
    071-validar-chat-ao-vivo) echo "072-validar-contatos-fotos-grupos" ;;
    072-validar-contatos-fotos-grupos) echo "073-organizacao-vps-auditoria" ;;
    073-organizacao-vps-auditoria) echo "074-diagnostico-pm2-crash" ;;
    074-diagnostico-pm2-crash) echo "075-plano-migracao-gateway" ;;
    075-plano-migracao-gateway) echo "076-plano-migracao-wuzapi" ;;
    076-plano-migracao-wuzapi) echo "077-classificar-pastas-suporte" ;;
    077-classificar-pastas-suporte) echo "" ;;
    *) echo "" ;;
  esac
}


create_safe_task_script() {
  local task="$1"
  local script="$REPO/scripts/run-once/$task.sh"

  case "$task" in
    070-consolidar-qr-temporario)
      cat > "$script" <<'EOS'
#!/usr/bin/env bash
set -uo pipefail

BASE="/root/Multizap"
REPO="$BASE/apps/clone-deck"
QR_DIR="$BASE/api/whatsapp/qrcode"
TS="$(date +%Y%m%d-%H%M%S)"
REV="$BASE/revisoes/$TS/070-consolidar-qr-temporario"
REPORT="$REV/resumo.md"

mkdir -p "$REV/dados" "$QR_DIR"
exec > >(tee -a "$REV/execucao.log") 2>&1

sanitize() {
  sed -E \
    -e 's/(token|password|authorization|apikey|api_key|secret)[=: ]+[^ ,"]+/\1=***OCULTO***/Ig' \
    -e 's/(Bearer )[A-Za-z0-9._-]+/\1***OCULTO***/Ig'
}

echo "=== RUN-ONCE 070: CONSOLIDAR QR TEMPORARIO - DIAGNOSTICO ==="
echo "Revisao: $REV"
echo "QR_DIR: $QR_DIR"

cd "$REPO" || {
  echo "FALHA: repo nao encontrado: $REPO"
  exit 0
}

grep -RInE "qrcode|qr-code|qrCode|QRCode|getqr|get-qr|connect|connections|whatsapp|wuzapi" apps/bot 2>/dev/null \
  | sanitize \
  | sed -n '1,800p' > "$REV/dados/referencias-qr-bot.txt" || true

find . -path './node_modules' -prune -o -path './.git' -prune -o -type f \( \
  -iname '*qr*' -o -iname '*qrcode*' -o -iname '*whatsapp*' -o -iname '*connection*' \
\) -print | sort > "$REV/dados/arquivos-candidatos-qr.txt"

find "$QR_DIR" -maxdepth 3 -type f 2>/dev/null | sort > "$REV/dados/qrcode-dir-arquivos.txt"

grep -RInE "fetch\(|axios|/api/|/whatsapp|/qrcode|/qr|connect|connection" apps/bot 2>/dev/null \
  | sanitize \
  | sed -n '1,800p' > "$REV/dados/possiveis-endpoints-bot.txt" || true

BUILD_STATUS="nao_rodou"
if [ -f "$REPO/apps/bot/package.json" ]; then
  (cd "$REPO/apps/bot" && npm run build) > "$REV/dados/build-bot.log" 2>&1
  if [ "$?" -eq 0 ]; then
    BUILD_STATUS="ok"
  else
    BUILD_STATUS="falhou"
  fi
fi

REFS_QR=$(wc -l < "$REV/dados/referencias-qr-bot.txt" | tr -d ' ')
FILES_QR=$(wc -l < "$REV/dados/arquivos-candidatos-qr.txt" | tr -d ' ')
QR_DIR_FILES=$(wc -l < "$REV/dados/qrcode-dir-arquivos.txt" | tr -d ' ')
ENDPOINTS=$(wc -l < "$REV/dados/possiveis-endpoints-bot.txt" | tr -d ' ')

cat > "$REPORT" <<MD
# Run-once 070 - Consolidar QR temporario

Data: $(date)
Revisao: $REV

## Resultado

- Referencias QR/WhatsApp em apps/bot: $REFS_QR
- Arquivos candidatos QR/WhatsApp no repo: $FILES_QR
- Arquivos atuais em $QR_DIR: $QR_DIR_FILES
- Possiveis endpoints detectados: $ENDPOINTS
- Build apps/bot: $BUILD_STATUS

## Seguranca

- CRM movido: nao
- Banco alterado: nao
- Caddy alterado: nao
- PM2 reiniciado: nao
- Docker/WuzAPI reiniciado: nao
- WhatsApp reset/logout: nao
- Arquivos apagados: nao
- Mudancas aplicadas em QR: nao, apenas diagnostico

## Evidencias

- Referencias QR/Bot: $REV/dados/referencias-qr-bot.txt
- Arquivos candidatos QR: $REV/dados/arquivos-candidatos-qr.txt
- QR dir arquivos: $REV/dados/qrcode-dir-arquivos.txt
- Possiveis endpoints: $REV/dados/possiveis-endpoints-bot.txt
- Build bot: $REV/dados/build-bot.log

## Proxima acao recomendada

Analisar os endpoints e arquivos candidatos para definir a alteracao minima que fará o QR temporario usar $QR_DIR sem reiniciar servicos sensiveis.
MD

cat "$REPORT"

echo "=== RUN-ONCE 070 DONE ==="
exit 0
EOS
      chmod +x "$script"
      echo "CRIADO: script seguro para $task"
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

find_latest_summary() {
  local task="$1"
  find "$REV_BASE" -maxdepth 3 -type f -path "*/$task/resumo.md" 2>/dev/null | sort | tail -1 || true
}

append_memoria() {
  local msg="$1"
  {
    echo
    echo "---"
    echo
    echo "## Auto-orquestrador"
    echo
    echo "Data: $(date)"
    echo "$msg"
  } >> "$MEMORIA"
}

append_checklist() {
  local msg="$1"
  {
    echo
    echo "- $(date): $msg"
  } >> "$CHECKLIST"
}

echo "=== AUTO-ORQUESTRADOR MULTIZAP ==="
echo "Inicio: $INICIO"
echo "Revisao: $ORQ_REV"
echo "Max steps: $MAX_STEPS"

cd "$REPO" || {
  echo "FALHA: repo nao encontrado: $REPO"
  exit 1
}

touch "$MEMORIA" "$CHECKLIST"

TASK="$INICIO"
STEP=1
STATUS_FINAL="ok"

while [ -n "$TASK" ] && [ "$STEP" -le "$MAX_STEPS" ]; do
  echo
  echo "=== STEP $STEP / TASK $TASK ==="

  if is_sensitive_task "$TASK"; then
    echo "BLOQUEADO: tarefa sensivel exige confirmacao manual: $TASK"
    echo "$TASK" >> "$ORQ_REV/dados/pendencias.txt"
    append_memoria "- Tarefa bloqueada por seguranca: $TASK"
    append_checklist "[BLOQUEADA] $TASK exige confirmacao manual"
    STATUS_FINAL="pendente_confirmacao"
    break
  fi

  SCRIPT="$REPO/scripts/run-once/$TASK.sh"

  if [ ! -f "$SCRIPT" ]; then
    echo "PENDENTE: script nao encontrado: $SCRIPT"
    echo "$TASK - script nao encontrado" >> "$ORQ_REV/dados/pendencias.txt"
    append_memoria "- Tarefa pendente: $TASK. Motivo: script run-once nao encontrado."
    append_checklist "[PENDENTE] $TASK sem script run-once"
    STATUS_FINAL="pendente_script"
    break
  fi

  if [ ! -s "$SCRIPT" ]; then
    echo "FALHA: script existe mas esta vazio: $SCRIPT"
    echo "$TASK - script vazio" >> "$ORQ_REV/dados/pendencias.txt"
    append_memoria "- Tarefa falhou: $TASK. Motivo: script vazio."
    append_checklist "[FALHOU] $TASK script vazio"
    STATUS_FINAL="falhou_script_vazio"
    break
  fi

  chmod +x "$SCRIPT"

  echo "Executando: $SCRIPT"
  if bash "$SCRIPT"; then
    echo "OK: $TASK executado"
  else
    echo "FALHA: $TASK retornou erro"
    echo "$TASK - erro de execucao" >> "$ORQ_REV/dados/pendencias.txt"
    append_memoria "- Tarefa falhou: $TASK. Ver log: $ORQ_REV/execucao.log"
    append_checklist "[FALHOU] $TASK erro de execucao"
    STATUS_FINAL="falhou_execucao"
    break
  fi

  SUMMARY="$(find_latest_summary "$TASK")"
  if [ -n "$SUMMARY" ] && [ -f "$SUMMARY" ]; then
    echo "Resumo encontrado: $SUMMARY"
    sed -n '1,220p' "$SUMMARY" | sanitize > "$ORQ_REV/dados/${TASK}-resumo.md"

    if grep -qiE "Build apps/bot: falhou|FALHA|ERRO" "$SUMMARY"; then
      echo "FALHA detectada no resumo da tarefa."
      echo "$TASK - resumo indicou falha" >> "$ORQ_REV/dados/pendencias.txt"
      append_memoria "- Tarefa $TASK executada, mas resumo indicou falha. Resumo: $SUMMARY"
      append_checklist "[FALHOU] $TASK resumo indicou falha"
      STATUS_FINAL="falhou_resumo"
      break
    fi

    append_memoria "- Tarefa concluida: $TASK. Resumo: $SUMMARY"
    append_checklist "[OK] $TASK concluida"
  else
    echo "ATENCAO: resumo.md nao encontrado para $TASK"
    echo "$TASK - resumo nao encontrado" >> "$ORQ_REV/dados/pendencias.txt"
    append_memoria "- Tarefa $TASK executada, mas resumo.md nao foi encontrado."
    append_checklist "[ATENCAO] $TASK sem resumo.md"
    STATUS_FINAL="sem_resumo"
    break
  fi

  NEXT="$(next_task "$TASK")"
  if [ -z "$NEXT" ]; then
    echo "Nao ha proxima tarefa automatica configurada apos $TASK."
    break
  fi

  echo "Proxima tarefa detectada: $NEXT"

  if [ ! -f "$REPO/scripts/run-once/$NEXT.sh" ]; then
    echo "Proxima tarefa ainda nao tem script: $NEXT"
    echo "Tentando criar script seguro automaticamente para: $NEXT"
    if create_safe_task_script "$NEXT"; then
      append_memoria "- Script seguro criado automaticamente para: $NEXT"
      append_checklist "[CRIADO] Script seguro para $NEXT"
    else
      append_memoria "- Proxima tarefa detectada, mas ainda sem script seguro automatico: $NEXT"
      append_checklist "[PENDENTE] Criar script para $NEXT"
      break
    fi
  fi

  TASK="$NEXT"
  STEP=$((STEP + 1))
done

cat > "$ORQ_REV/resumo.md" <<MD
# Auto-orquestrador MultiZap

Data: $(date)
Revisao: $ORQ_REV

## Resultado

- Inicio: $INICIO
- Status final: $STATUS_FINAL
- Steps executados/tentados: $STEP
- Max steps: $MAX_STEPS

## Seguranca

- CRM mexido: nao
- Banco alterado: nao
- Caddy alterado: nao
- PM2 reiniciado: nao
- Docker/WuzAPI reiniciado: nao
- WhatsApp reset/logout: nao
- Arquivos apagados: nao

## Evidencias

- Log: $ORQ_REV/execucao.log
- Pendencias: $ORQ_REV/dados/pendencias.txt
- Resumos copiados: $ORQ_REV/dados/
MD

cat "$ORQ_REV/resumo.md"

echo
echo "=== AUTO-ORQUESTRADOR DONE ==="
exit 0
