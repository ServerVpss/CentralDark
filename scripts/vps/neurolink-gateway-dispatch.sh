#!/usr/bin/env bash
# UID validado -> Hermes Kanban nativo; sem segundo gateway, shell arbitrario ou cron.
set -euo pipefail
umask 077
[[ $# == 2 ]] || { echo "USAGE: $0 --inspect|--dispatch L000|L016A|L170" >&2; exit 64; }
MODE="$1"; UID="$2"
[[ "$MODE" == --inspect || "$MODE" == --dispatch ]] || { echo INVALID_MODE >&2; exit 64; }
[[ "$UID" =~ ^L[0-9]{3}[AB]?$ ]] || { echo INVALID_UID >&2; exit 65; }
ROOT=/root/CentralDark
HERMES=/root/.hermes/hermes-agent/.hermes/bin/hermes
# Objeto Git pinado: preserva o checkout tracked/untracked da VPS sem reset/stash.
PIN="$(git -C "$ROOT" rev-parse refs/remotes/origin/main 2>/dev/null)" || { echo BLOCKED_ORIGIN_MAIN_UNAVAILABLE; exit 2; }
OBJECT="$PIN:docs/CONSCIENCIA/APRENDIZADOS-NEUROLINK-LINEAGE.json"
SOURCE="$(git -C "$ROOT" rev-parse "$OBJECT" 2>/dev/null)" || { echo BLOCKED_PINNED_MANIFEST_MISSING; exit 2; }
if [[ "$MODE" == --dispatch ]]; then
  [[ -x "$HERMES" ]] || { echo BLOCKED_HERMES_CLI_MISSING; exit 2; }
fi
# Valida a cadeia completa sem inventar numeracao: genese separada + 169 entradas.
if [[ "$MODE" == --inspect ]]; then
python3 - <(git -C "$ROOT" show "$OBJECT") "$UID" "$PIN" <<'PY'
import json,sys
f,uid,sha=sys.argv[1:]
d=json.load(open(f,encoding='utf-8')); a=[d['genesis']]+d['nodes']
v=[(i,x) for i,x in enumerate(a) if x.get('uid')==uid]
if len(v)!=1:sys.exit('BLOCKED_UID_UNIQUE')
i,n=v[0]
if i and n.get('prev_uid')!=a[i-1].get('uid'):sys.exit('BLOCKED_PREV')
if i<len(a)-1 and n.get('next_uid')!=a[i+1].get('uid'):sys.exit('BLOCKED_NEXT')
print(json.dumps({'uid':uid,'title':n.get('title'),'prev':n.get('prev_uid'),'next':n.get('next_uid'),'sha':sha,'runtime':'NOT_EXECUTED'},ensure_ascii=False))
PY
exit 0
fi
KEY="centraldark:neurolink:$UID:$SOURCE"
TITLE="NEUROLINK $UID - receita comprovada"
python3 - <(git -C "$ROOT" show "$OBJECT") "$UID" "$PIN" <<'PY' | "$HERMES" kanban create --goal --goal-max-turns 20 --idempotency-key "$KEY" --body-file - --created-by centraldark-genesis-hud --json "$TITLE"
import json,sys
f,uid,sha=sys.argv[1:]
d=json.load(open(f,encoding='utf-8'));a=[d['genesis']]+d['nodes']
v=[(i,x) for i,x in enumerate(a) if x.get('uid')==uid]
if len(v)!=1:sys.exit('BLOCKED_UID_UNIQUE')
i,n=v[0]
if i and n.get('prev_uid')!=a[i-1].get('uid'):sys.exit('BLOCKED_PREV')
if i<len(a)-1 and n.get('next_uid')!=a[i+1].get('uid'):sys.exit('BLOCKED_NEXT')
print('INTENCAO=NEUROLINK_OPERACIONAL; UID='+uid+'; SOURCE_SHA='+sha)
print('TITLE='+str(n.get('title')))
print('OWNER=HERMES_KANBAN_EXISTENTE; UMA_CANETA_POR_ESCOPO.')
print('PREFLIGHT: validar main CURRENT, UID, receita selada e autorizacao antes de agir.')
print('SE NENHUMA RECEITA PROVADA: BLOCKED_RECIPE_NOT_PROVEN; nao inventar shell.')
print('SE PROVADA: executar menor delta autorizado, verificar efeito, receipt e NEXT_CURSOR.')
print('NAO declarar FIXED_POINT por enqueue ou por replay documental.')
PY
