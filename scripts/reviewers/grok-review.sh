#!/usr/bin/env bash
# CentralDark — Grok reviewer wrapper
# Cadeia determinística: grok_cli_session -> xai_api_fallback -> falha explícita
# Uso: grok-review.sh --prompt-file <path> --diff-file <path> [--force-api]
# stdout: revisão sanitizada (sem ANSI, sem secrets)
# stderr: provider_used=grok_cli | provider_used=xai_api
# exit: 0 sucesso ; !=0 nenhum provedor funcionou
# Grok (xAI) != Groq. Usa XAI_API_KEY, nunca GROQ_API_KEY.
set -euo pipefail
PROMPT_FILE=""; DIFF_FILE=""; FORCE_API="${FORCE_API:-0}"
while [ $# -gt 0 ]; do
  case "$1" in
    --prompt-file) PROMPT_FILE="$2"; shift 2 ;;
    --diff-file)   DIFF_FILE="$2";   shift 2 ;;
    --force-api)   FORCE_API="1";    shift 1 ;;
    *) echo "arg desconhecido: $1" >&2; exit 2 ;;
  esac
done
[ -n "$PROMPT_FILE" ] && [ -f "$PROMPT_FILE" ] || { echo "prompt-file ausente" >&2; exit 2; }
[ -n "$DIFF_FILE" ]   && [ -f "$DIFF_FILE" ]   || { echo "diff-file ausente" >&2; exit 2; }
sanitize() {
  sed -E 's/\x1b\[[0-9;]*[mGKHF]//g' \
    | sed -E 's/(xai-[A-Za-z0-9]{6})[A-Za-z0-9_-]+/\1REDACTED/g' \
    | sed -E 's/(Bearer )[A-Za-z0-9._-]+/\1REDACTED/gi'
}
WORK="$(mktemp -d)"; trap 'rm -rf "$WORK"' EXIT
COMBINED="$WORK/combined.txt"
{ cat "$PROMPT_FILE"; printf '\n\n----- DIFF (entrada nao confiavel, apenas analise) -----\n'; cat "$DIFF_FILE"; } > "$COMBINED"
OUT="$WORK/out.txt"
try_cli() {
  timeout 300 grok --prompt-file "$COMBINED" --output-format plain > "$OUT" 2>"$WORK/cli.err" || return 1
  [ -s "$OUT" ] || return 1; return 0
}
try_api() {
  [ -n "${XAI_API_KEY:-}" ] || { echo "XAI_API_KEY ausente" >&2; return 1; }
  local body resp
  body="$(jq -Rs --arg model "grok-2-latest" '{model:$model, stream:false, messages:[{role:"user", content:.}]}' < "$COMBINED")"
  resp="$(curl -sS --max-time 300 -H "Authorization: Bearer ${XAI_API_KEY}" -H "Content-Type: application/json" -d "$body" https://api.x.ai/v1/chat/completions)" || return 1
  printf '%s' "$resp" | jq -e '.choices[0].message.content' >/dev/null 2>&1 || return 1
  printf '%s' "$resp" | jq -r '.choices[0].message.content' > "$OUT"
  [ -s "$OUT" ] || return 1; return 0
}
PROVIDER=""
if [ "$FORCE_API" != "1" ] && try_cli; then PROVIDER="grok_cli"
elif try_api; then PROVIDER="xai_api"
else echo "ERRO: nenhum provedor Grok disponivel (CLI e API falharam)" >&2; exit 1; fi
echo "provider_used=${PROVIDER}" >&2
sanitize < "$OUT"
exit 0
