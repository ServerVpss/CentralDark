#!/usr/bin/env bash
# ============================================================================
# darkai — CLI universal pra conversar com IAs via edge function ai-proxy
# ----------------------------------------------------------------------------
# Uso:
#   darkai "sua pergunta"
#   darkai --system "papel" "pergunta"
#   darkai --model openai/gpt-5.4 "pergunta"
#   cat arquivo | darkai "resuma"
#   darkai --list-models
#   darkai --help
#
# Variáveis de ambiente necessárias:
#   DARKAI_URL       → URL da edge function (ex: https://xxx.supabase.co/functions/v1/ai-proxy)
#   DARKAI_ANON_KEY  → anon key pública do Supabase
#   DARKAI_MODEL     → (opcional) modelo padrão. Default: google/gemini-3-flash-preview
#
# Compatível com: Mac, Linux, Windows (WSL, Git Bash)
# ============================================================================

set -euo pipefail

DEFAULT_MODEL="${DARKAI_MODEL:-google/gemini-3-flash-preview}"

show_help() {
  cat <<'EOF'
darkai — CLI pra conversar com IAs (Gemini, GPT-5, etc.)

USO:
  darkai "sua pergunta aqui"
  darkai --system "você é um revisor" "revise: ..."
  darkai --model openai/gpt-5.4 "raciocine sobre ..."
  cat arquivo.log | darkai "resuma"
  darkai --list-models
  darkai --help

FLAGS:
  --system TEXTO    System prompt (papel/instrução da IA)
  --model MODELO    Modelo a usar (padrão: google/gemini-3-flash-preview)
  --list-models     Lista modelos disponíveis
  --help, -h        Esta ajuda

MODELOS RECOMENDADOS:
  google/gemini-3-flash-preview  → padrão, rápido e barato
  google/gemini-2.5-pro          → multimodal, contexto grande
  openai/gpt-5                   → all-rounder forte
  openai/gpt-5.4                 → raciocínio avançado
  openai/gpt-5.5                 → estado da arte

VARIÁVEIS DE AMBIENTE:
  DARKAI_URL       (obrigatória) URL da edge function
  DARKAI_ANON_KEY  (obrigatória) anon key do Supabase
  DARKAI_MODEL     (opcional) modelo padrão
EOF
}

list_models() {
  cat <<'EOF'
Modelos disponíveis via darkai:

Google Gemini:
  google/gemini-3-flash-preview  ← padrão
  google/gemini-3.1-flash-lite
  google/gemini-3.5-flash
  google/gemini-3.1-pro-preview
  google/gemini-2.5-pro
  google/gemini-2.5-flash
  google/gemini-2.5-flash-lite

OpenAI GPT:
  openai/gpt-5
  openai/gpt-5-mini
  openai/gpt-5-nano
  openai/gpt-5.2
  openai/gpt-5.4
  openai/gpt-5.4-mini
  openai/gpt-5.4-nano
  openai/gpt-5.4-pro
  openai/gpt-5.5
  openai/gpt-5.5-pro

Uso: darkai --model NOME_DO_MODELO "sua pergunta"
EOF
}

# ============================================================================
# Parse de argumentos
# ============================================================================
SYSTEM=""
MODEL="$DEFAULT_MODEL"
PROMPT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help|-h)
      show_help; exit 0 ;;
    --list-models)
      list_models; exit 0 ;;
    --system)
      SYSTEM="$2"; shift 2 ;;
    --model)
      MODEL="$2"; shift 2 ;;
    *)
      PROMPT="$1"; shift ;;
  esac
done

# ============================================================================
# Suporte a pipe (stdin)
# ============================================================================
if [[ ! -t 0 ]]; then
  STDIN_DATA="$(cat)"
  if [[ -n "$PROMPT" ]]; then
    PROMPT="$PROMPT

--- CONTEÚDO ---
$STDIN_DATA"
  else
    PROMPT="$STDIN_DATA"
  fi
fi

if [[ -z "$PROMPT" ]]; then
  echo "darkai: nenhuma pergunta fornecida. Use 'darkai --help'." >&2
  exit 1
fi

# ============================================================================
# Validação de env
# ============================================================================
: "${DARKAI_URL:?darkai: DARKAI_URL não configurada. Veja docs/CONSCIENCIA/DARKAI/04-USANDO-NO-TERMINAL-LOCAL.md}"
: "${DARKAI_ANON_KEY:?darkai: DARKAI_ANON_KEY não configurada.}"

# ============================================================================
# Monta o JSON de forma segura (usa python ou jq se disponível)
# ============================================================================
build_json() {
  if command -v python3 >/dev/null 2>&1; then
    python3 -c "
import json, sys
body = {'prompt': sys.argv[1], 'model': sys.argv[2]}
if sys.argv[3]:
    body['system'] = sys.argv[3]
print(json.dumps(body))
" "$PROMPT" "$MODEL" "$SYSTEM"
  elif command -v jq >/dev/null 2>&1; then
    if [[ -n "$SYSTEM" ]]; then
      jq -n --arg p "$PROMPT" --arg m "$MODEL" --arg s "$SYSTEM" '{prompt:$p, model:$m, system:$s}'
    else
      jq -n --arg p "$PROMPT" --arg m "$MODEL" '{prompt:$p, model:$m}'
    fi
  else
    echo "darkai: precisa de python3 ou jq instalado" >&2
    exit 1
  fi
}

# ============================================================================
# Chamada HTTP
# ============================================================================
BODY="$(build_json)"

RESPONSE="$(curl -sS -X POST "$DARKAI_URL" \
  -H "Authorization: Bearer $DARKAI_ANON_KEY" \
  -H "Content-Type: application/json" \
  --max-time 120 \
  -d "$BODY")"

# ============================================================================
# Extração do conteúdo
# ============================================================================
extract_content() {
  if command -v python3 >/dev/null 2>&1; then
    python3 -c "
import json, sys
try:
    data = json.loads(sys.stdin.read())
except Exception:
    print(sys.argv[1] if len(sys.argv) > 1 else '', file=sys.stderr)
    sys.exit(1)
if data.get('error'):
    print('darkai: erro →', data.get('error'), data.get('message',''), file=sys.stderr)
    sys.exit(2)
print(data.get('text') or data.get('content') or data.get('choices',[{}])[0].get('message',{}).get('content') or json.dumps(data))
" <<< "$RESPONSE"
  elif command -v jq >/dev/null 2>&1; then
    if echo "$RESPONSE" | jq -e '.error' >/dev/null 2>&1; then
      echo "darkai: erro → $(echo "$RESPONSE" | jq -r '.error, .message')" >&2
      exit 2
    fi
    echo "$RESPONSE" | jq -r '.text // .content // .choices[0].message.content // .'
  else
    echo "$RESPONSE"
  fi
}

extract_content
