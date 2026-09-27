#!/usr/bin/env bash
# ============================================================================
# darkai — CLI universal pra conversar com IAs via edge function ai-proxy
# + perfil opcional Claude Fable 5.1 / CentralDark SOL frequency
# ----------------------------------------------------------------------------
# Compatibilidade: o caminho legado continua sendo o padrão para todos os
# modelos existentes. O caminho Fable 5.1 só é ativado quando esse modelo é
# escolhido explicitamente.
#
# Uso:
#   darkai "sua pergunta"
#   darkai --system "papel" "pergunta"
#   darkai --model openai/gpt-5.4 "pergunta"
#   darkai --model claude-fable-5-1 --effort low "pergunta"
#   darkai --prompt-audit "texto de prompt"
#   darkai --runtime-audit --model claude-fable-5-1
#   cat arquivo | darkai "resuma"
#   darkai --list-models
#   darkai --help
#
# Variáveis existentes:
#   DARKAI_URL       → URL da edge function ai-proxy
#   DARKAI_ANON_KEY  → chave do cliente já configurada no ambiente
#   DARKAI_MODEL     → modelo padrão
#
# Extensões opcionais e não destrutivas:
#   DARKAI_EFFORT             → auto|low|medium|high|xhigh|max
#   CENTRALDARK_SOL_FREQUENCY → LEVE|RAPIDA|MEDIA|PROFUNDA|FORTE|AVANCADA|FRIA|ORQUESTRA
#   DARKAI_ANTHROPIC_URL      → endpoint Anthropic-compatible (default: CentralDark /v1/messages)
#   DARKAI_ANTHROPIC_KEY      → chave já existente no ambiente; nunca impressa
#   DARKAI_MAX_TOKENS         → max_tokens do caminho Fable (default: 4096)
# ============================================================================

set -euo pipefail

DEFAULT_MODEL="${DARKAI_MODEL:-google/gemini-3-flash-preview}"
DEFAULT_EFFORT="${DARKAI_EFFORT:-auto}"
ANTHROPIC_URL="${DARKAI_ANTHROPIC_URL:-${ELITE_URL:-https://api.centralldark.com/v1/messages}}"

show_help() {
  cat <<'EOF_HELP'
darkai — CLI CentralDark pra conversar com IAs

USO:
  darkai "sua pergunta aqui"
  darkai --system "você é um revisor" "revise: ..."
  darkai --model openai/gpt-5.4 "raciocine sobre ..."
  darkai --model claude-fable-5-1 --effort low "tarefa curta"
  darkai --prompt-audit "prompt a auditar"
  darkai --runtime-audit --model claude-fable-5-1
  cat arquivo.log | darkai "resuma"
  darkai --list-models
  darkai --help

FLAGS:
  --system TEXTO       System prompt
  --model MODELO       Modelo a usar
  --effort NIVEL       auto|low|medium|high|xhigh|max (aplicado ao Fable 5.1)
  --prompt-audit       Diagnóstico local read-only do prompt; não remove gates
  --runtime-audit      Mostra rota/effort resolvidos sem imprimir credenciais
  --list-models        Lista modelos disponíveis/conhecidos
  --help, -h           Esta ajuda

MODELOS RECOMENDADOS / CONHECIDOS:
  google/gemini-3-flash-preview
  google/gemini-2.5-pro
  openai/gpt-5
  openai/gpt-5.4
  openai/gpt-5.5
  claude-fable-5-1           → rota Anthropic-compatible, opt-in

REGRA CENTRALDARK:
  O modelo/provider é motor substituível. Hermes/CentralDark continuam sendo o
  organismo/CLI. A otimização de um provider nunca substitui SOUL, owners,
  testes, contraprova ou Reality Judge.
EOF_HELP
}

list_models() {
  cat <<'EOF_MODELS'
Modelos disponíveis via darkai (catálogo local conhecido):

Google Gemini:
  google/gemini-3-flash-preview
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

Anthropic-compatible opt-in:
  claude-fable-5-1
  anthropic/claude-fable-5-1

Uso: darkai --model NOME_DO_MODELO "sua pergunta"
EOF_MODELS
}

normalize_effort() {
  local raw="${1:-auto}"
  raw="$(printf '%s' "$raw" | tr '[:upper:]' '[:lower:]')"
  case "$raw" in
    auto|low|medium|high|xhigh|max) printf '%s' "$raw" ;;
    *) echo "darkai: effort inválido: $raw" >&2; exit 2 ;;
  esac
}

resolve_effort() {
  local requested
  requested="$(normalize_effort "${1:-auto}")"
  if [[ "$requested" != "auto" ]]; then
    printf '%s' "$requested"
    return
  fi

  local freq="${CENTRALDARK_SOL_FREQUENCY:-${SOL_FREQUENCY:-${CENTRALDARK_FREQUENCY:-}}}"
  freq="$(printf '%s' "$freq" | tr '[:lower:]' '[:upper:]')"
  case "$freq" in
    LEVE|RAPIDA) printf 'low' ;;
    MEDIA) printf 'medium' ;;
    AVANCADA) printf 'xhigh' ;;
    PROFUNDA|FORTE|FRIA|ORQUESTRA) printf 'high' ;;
    *) printf 'high' ;; # default oficial do Fable 5.1; reduzir só quando medido
  esac
}

is_fable_51_model() {
  case "${1:-}" in
    claude-fable-5-1|anthropic/claude-fable-5-1) return 0 ;;
    *) return 1 ;;
  esac
}

prompt_audit() {
  local payload="${1:-}"
  if command -v python3 >/dev/null 2>&1; then
    python3 - "$payload" <<'PY'
import collections, re, sys
text = sys.argv[1]
lines = [x.strip() for x in text.splitlines() if x.strip()]
counts = collections.Counter(lines)
dups = sorted((line, n) for line, n in counts.items() if n > 1)
allcaps = [line for line in lines if len(line.split()) >= 4 and sum(c.isalpha() for c in line) and line.upper() == line]
ritual = len(re.findall(r'(?i)\b(verify again|double[- ]check everything|think step by step|scratchpad|chain of thought)\b', text))
boost = len(re.findall(r'!{3,}|\b(?:VERY|EXTREMELY|ABSOLUTELY|MUST MUST)\b', text))
print('PROMPT_AUDIT=OBSERVED')
print(f'DUPLICATE_NONEMPTY_LINES={len(dups)}')
print(f'ALL_CAPS_LONG_LINES={len(allcaps)}')
print(f'SCRATCHPAD_OR_VERIFICATION_RITUAL_HINTS={ritual}')
print(f'EMPHASIS_BOOSTER_HINTS={boost}')
print('AUTO_DELETE_GUARDRAILS=false')
print('DETERMINISTIC_TESTS_AND_PROOF_GATES_ARE_NOT_PROMPT_RITUALS=true')
if dups:
    print('TOP_DUPLICATES=')
    for line, n in dups[:5]:
        print(f'  {n}x {line[:160]}')
PY
  else
    echo "PROMPT_AUDIT=UNKNOWN python3 indisponível"
  fi
}

# ============================================================================
# Parse de argumentos
# ============================================================================
SYSTEM=""
MODEL="$DEFAULT_MODEL"
EFFORT_REQUESTED="$DEFAULT_EFFORT"
PROMPT=""
PROMPT_AUDIT_ONLY=false
RUNTIME_AUDIT=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help|-h)
      show_help; exit 0 ;;
    --list-models)
      list_models; exit 0 ;;
    --system)
      [[ $# -ge 2 ]] || { echo "darkai: --system exige valor" >&2; exit 2; }
      SYSTEM="$2"; shift 2 ;;
    --model)
      [[ $# -ge 2 ]] || { echo "darkai: --model exige valor" >&2; exit 2; }
      MODEL="$2"; shift 2 ;;
    --effort)
      [[ $# -ge 2 ]] || { echo "darkai: --effort exige valor" >&2; exit 2; }
      EFFORT_REQUESTED="$2"; shift 2 ;;
    --prompt-audit)
      PROMPT_AUDIT_ONLY=true; shift ;;
    --runtime-audit)
      RUNTIME_AUDIT=true; shift ;;
    *)
      if [[ -n "$PROMPT" ]]; then
        PROMPT="$PROMPT $1"
      else
        PROMPT="$1"
      fi
      shift ;;
  esac
done

EFFORT_REQUESTED="$(normalize_effort "$EFFORT_REQUESTED")"
EFFORT_RESOLVED="$(resolve_effort "$EFFORT_REQUESTED")"

# ============================================================================
# Suporte a pipe (stdin)
# ============================================================================
if [[ ! -t 0 ]]; then
  STDIN_DATA="$(cat)"
  if [[ -n "$STDIN_DATA" ]]; then
    if [[ -n "$PROMPT" ]]; then
      PROMPT="$PROMPT

--- CONTEÚDO ---
$STDIN_DATA"
    else
      PROMPT="$STDIN_DATA"
    fi
  fi
fi

if [[ "$RUNTIME_AUDIT" == true ]]; then
  if is_fable_51_model "$MODEL"; then route="ANTHROPIC_COMPAT"; else route="LEGACY_AI_PROXY"; fi
  printf 'DARKAI_RUNTIME_AUDIT=OBSERVED\nMODEL=%s\nROUTE=%s\nEFFORT_REQUESTED=%s\nEFFORT_RESOLVED=%s\nPROMPT_CACHE_SESSION_SUPPORT=%s\nPROMPT_AUTO_REWRITE=false\n' \
    "$MODEL" "$route" "$EFFORT_REQUESTED" "$EFFORT_RESOLVED" \
    "$(is_fable_51_model "$MODEL" && printf 'ONE_SHOT_ONLY' || printf 'N/A')"
  if [[ -z "$PROMPT" && "$PROMPT_AUDIT_ONLY" == false ]]; then exit 0; fi
fi

if [[ "$PROMPT_AUDIT_ONLY" == true ]]; then
  [[ -n "$PROMPT" ]] || { echo "darkai: --prompt-audit exige texto/prompt" >&2; exit 2; }
  prompt_audit "$SYSTEM
$PROMPT"
  exit 0
fi

if [[ -z "$PROMPT" ]]; then
  echo "darkai: nenhuma pergunta fornecida. Use 'darkai --help'." >&2
  exit 1
fi

# ============================================================================
# Rota Fable 5.1 — opt-in, sem alterar o caminho legado
# ============================================================================
if is_fable_51_model "$MODEL"; then
  ANTHROPIC_KEY="${DARKAI_ANTHROPIC_KEY:-${ELITE_ANTHROPIC_TOKEN:-${ANTHROPIC_AUTH_TOKEN:-${CENTRALLDARK_API_KEY:-}}}}"
  if [[ -z "$ANTHROPIC_KEY" ]]; then
    echo "darkai: Fable 5.1 selecionado, mas nenhuma credencial Anthropic-compatible já configurada foi encontrada no ambiente." >&2
    echo "darkai: configure pelo mecanismo existente da Casa; nenhuma chave será solicitada ou impressa por este CLI." >&2
    exit 3
  fi

  MAX_TOKENS="${DARKAI_MAX_TOKENS:-4096}"
  [[ "$MAX_TOKENS" =~ ^[0-9]+$ ]] || { echo "darkai: DARKAI_MAX_TOKENS inválido" >&2; exit 2; }

  if command -v python3 >/dev/null 2>&1; then
    BODY="$(python3 - "$PROMPT" "$MODEL" "$SYSTEM" "$EFFORT_RESOLVED" "$MAX_TOKENS" <<'PY'
import json, sys
prompt, model, system, effort, max_tokens = sys.argv[1:]
if model.startswith('anthropic/'):
    model = model.split('/', 1)[1]
body = {
    'model': model,
    'max_tokens': int(max_tokens),
    'messages': [{'role': 'user', 'content': prompt}],
    'output_config': {'effort': effort},
}
if system:
    body['system'] = system
print(json.dumps(body))
PY
)"
  elif command -v jq >/dev/null 2>&1; then
    MODEL_WIRE="${MODEL#anthropic/}"
    BODY="$(jq -n --arg p "$PROMPT" --arg m "$MODEL_WIRE" --arg s "$SYSTEM" --arg e "$EFFORT_RESOLVED" --argjson mt "$MAX_TOKENS" \
      '{model:$m,max_tokens:$mt,messages:[{role:"user",content:$p}],output_config:{effort:$e}} + (if $s != "" then {system:$s} else {} end)')"
  else
    echo "darkai: precisa de python3 ou jq instalado" >&2
    exit 1
  fi

  RESPONSE="$(curl -sS -X POST "$ANTHROPIC_URL" \
    -H "x-api-key: $ANTHROPIC_KEY" \
    -H "anthropic-version: 2023-06-01" \
    -H "Content-Type: application/json" \
    --max-time 180 \
    -d "$BODY")"

  if command -v python3 >/dev/null 2>&1; then
    printf '%s' "$RESPONSE" | python3 -c "
import json, sys
data = json.loads(sys.stdin.read())
if data.get('error'):
    err = data.get('error')
    msg = err.get('message') if isinstance(err, dict) else str(err)
    print('darkai: erro → ' + str(msg), file=sys.stderr)
    raise SystemExit(2)
parts = data.get('content') or []
text = ''.join(p.get('text','') for p in parts if isinstance(p, dict) and p.get('type') == 'text')
print(text if text else json.dumps(data))
"
  elif command -v jq >/dev/null 2>&1; then
    if echo "$RESPONSE" | jq -e '.error' >/dev/null 2>&1; then
      echo "darkai: erro → $(echo "$RESPONSE" | jq -r '.error.message // .error')" >&2
      exit 2
    fi
    echo "$RESPONSE" | jq -r '[.content[]? | select(.type=="text") | .text] | join("")'
  else
    echo "$RESPONSE"
  fi
  exit 0
fi

# ============================================================================
# Caminho legado — preservado para os modelos existentes
# ============================================================================
: "${DARKAI_URL:?darkai: DARKAI_URL não configurada. Veja docs/CONSCIENCIA/DARKAI/04-USANDO-NO-TERMINAL-LOCAL.md}"
: "${DARKAI_ANON_KEY:?darkai: DARKAI_ANON_KEY não configurada.}"

if [[ "$EFFORT_REQUESTED" != "auto" ]]; then
  echo "darkai: aviso: --effort é ignorado no caminho legado; só é enviado no perfil Fable 5.1." >&2
fi

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

BODY="$(build_json)"

RESPONSE="$(curl -sS -X POST "$DARKAI_URL" \
  -H "Authorization: Bearer $DARKAI_ANON_KEY" \
  -H "Content-Type: application/json" \
  --max-time 120 \
  -d "$BODY")"

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