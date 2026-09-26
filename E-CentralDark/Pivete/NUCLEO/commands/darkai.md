# COMANDO - darkai.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\centraldark\apps\modulos\mcp\dist\tools\darkai\darkai.js
**SHA:** b9d7d6ef9c346132
**Timestamp:** 2026-08-28T02:54:39.176531
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- prompt: z.string().min(1).describe("Prompt a enviar pro modelo"),
- const body = { prompt: input.prompt, model: input.model ?? "gemini-2.5-flash" };
- const r = await callDarkAI({ prompt: "ping", model: "gemini-2.5-flash" }, 15_000);

### Padroes
- model: z.string().default("gemini-2.5-flash").optional().describe("Modelo (padrão: gemini-2.5-flash)"),

### Ouro Bruto (primeiros 5000 chars)
```
// Tools do DarkAI (Gemini/GPT-5/etc via edge function ai-proxy na Lovable Cloud).
// Chama a edge function protegida com a única chave que fica no servidor — jamais expõe token ao cliente.
// Padrão idêntico ao elite-gateway.js.
import { z } from "zod";

const DARKAI_URL = process.env.DARKAI_URL || "https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/ai-proxy";
const DARKAI_ANON_KEY = process.env.DARKAI_ANON_KEY || "";

function ok(data) {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

async function callDarkAI(body, timeoutMs = 120_000) {
    const res = await fetch(DARKAI_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${DARKAI_ANON_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
    });
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }
    return { status: res.status, ok: res.ok, body: json };
}

export const darkaiTools = [
    {
        name: "darkai_chat",
        description: "Envia um prompt pro DarkAI (edge function ai-proxy na Lovable Cloud, roteando pra Gemini/GPT-5/Claude/etc com uma única chave protegida). Retorna a resposta do modelo. Use pra delegar raciocínio a outro modelo sem expor API keys.",
        annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            title: "DarkAI — Chat",
        },
        inputSchema: z.object({
            prompt: z.string().min(1).describe("Prompt a enviar pro modelo"),
            model: z.string().default("gemini-2.5-flash").optional().describe("Modelo (padrão: gemini-2.5-flash)"),
            system: z.string().optional().describe("System prompt opcional"),
        }),
        handler: async (input) => {
            if (!DARKAI_ANON_KEY) return ok({ status: "erro", erro: "DARKAI_ANON_KEY não configurada no ambiente do MCP" });
            const body = { prompt: input.prompt, model: input.model ?? "gemini-2.5-flash" };
            if (input.system) body.system = input.system;
            try {
                const r = await callDarkAI(body);
                if (!r.ok) return ok({ status: "erro", http: r.status, resposta: r.body });
                const data = r.body ?? {};
                const content = data.text ?? data.content ?? data.choices?.[0]?.message?.content ?? data;
                return ok({ status: "ok", modelo: body.model, resposta: content });
            }
            catch (e) {
                return ok({ status: "erro", erro: e.message });
            }
        },
    },
    {
        name: "darkai_status",
        description: "Verifica saúde do DarkAI (edge function ai-proxy): faz ping com prompt mínimo, mede latência e confirma se a chave está válida. Fonte: HTTP direto na edge function.",
        annotations: {
            readOnlyHint: true,
            title: "DarkAI — Status",
        },
        inputSchema: z.object({}),
        handler: async () => {
            if (!DARKAI_ANON_KEY) return ok({ status: "erro", erro: "DARKAI_ANON_KEY não configurada", url: DARKAI_URL });
            const t0 = Date.now();
            try {
                const r = await callDarkAI({ prompt: "ping", model: "gemini-2.5-flash" }, 15_000);
                return ok({
                    status: r.ok ? "ok" : "erro",
                    http: r.status,
                    latencyMs: Date.now() - t0,
                    url: DARKAI_URL,
                    amostra: r.ok ? "resposta recebida" : r.body,
                });
            }
            catch (e) {
                return ok({ status: "erro", erro: e.message, latencyMs: Date.now() - t0, url: DARKAI_URL });
            }
        },
    },
];

```

---

# COMANDO - darkai.sh
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\backups\2026-07-03-hermes-darkai\darkai.sh
**SHA:** f280266090c37915
**Timestamp:** 2026-08-28T02:56:41.613317
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- PROMPT=""
- PROMPT="$1"; shift ;;
- PROMPT="$PROMPT
- PROMPT="$STDIN_DATA"
- jq -n --arg p "$PROMPT" --arg m "$MODEL" --arg s "$SYSTEM" '{prompt:$p, model:$m, system:$s}'
- jq -n --arg p "$PROMPT" --arg m "$MODEL" '{prompt:$p, model:$m}'

### Padroes
- --model MODELO    Modelo a usar (padrão: google/gemini-3-flash-preview)

### Ouro Bruto (primeiros 5000 chars)
```
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

# ============
```

---

# COMANDO - darkai.sh
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\docs\CONSCIENCIA\DARKAI\darkai.sh
**SHA:** 646fb433d6fdf151
**Timestamp:** 2026-08-28T02:56:54.217162
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- PROMPT=""
- PROMPT="$1"; shift ;;
- PROMPT="$PROMPT
- PROMPT="$STDIN_DATA"
- jq -n --arg p "$PROMPT" --arg m "$MODEL" --arg s "$SYSTEM" '{prompt:$p, model:$m, system:$s}'
- jq -n --arg p "$PROMPT" --arg m "$MODEL" '{prompt:$p, model:$m}'

### Padroes
- --model MODELO    Modelo a usar (padrão: google/gemini-3-flash-preview)

### Ouro Bruto (primeiros 5000 chars)
```
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

```