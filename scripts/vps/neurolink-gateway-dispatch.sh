#!/usr/bin/env bash
# UID validado -> Hermes Kanban nativo; sem segundo gateway, shell arbitrario ou cron.
set -euo pipefail
umask 077
# Publica somente a PONTE MINIMA de UID, nao o HUD inteiro na origem privilegiada.
# O proprio Hermes ja serve arquivos em web_dist por rota SPA autenticada.
if [[ "$#" == 1 && "$1" == --publish-bridge ]]; then
  WEB_DIST=/root/.hermes/hermes-agent/hermes_cli/web_dist
  TARGET="$WEB_DIST/neurolink-dispatch.html"
  [[ -d "$WEB_DIST" && ! -L "$TARGET" ]] || { echo BLOCKED_HERMES_WEB_DIST; exit 2; }
  TMP="$(mktemp "$WEB_DIST/.neurolink.XXXXXXXX")"
  trap 'rm -f "$TMP"' EXIT
  cat > "$TMP" <<'NEUROLINK_HTML'
<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; connect-src 'self'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
<title>CentralDark · NeuroLink → Hermes existente</title>
<style>body{background:#111d28;color:#e0e9ef;font:16px system-ui;margin:2rem auto;max-width:680px;padding:1rem}button{padding:12px;border-radius:8px;background:#19456b;color:#fff;border:1px solid #5290b8;cursor:pointer}pre{white-space:pre-wrap;border:1px solid #536779;padding:14px;overflow-wrap:anywhere}a{color:#9acbff}</style></head>
<body><h1>🪬 NeuroLink → Hermes</h1><p>Mesmo Hermes Gateway / Kanban autenticado. UID: <strong id="uid">?</strong></p>
<p>Esta ação solicita ao executor existente uma receita comprovada; não reexecuta automaticamente scripts históricos nem promove Fixed Point por enfileiramento.</p>
<button type="button" id="submit">⚙ Enviar intenção ao Kanban (clique explícito)</button>
<pre id="status" role="status">AGUARDANDO_CLIQUE</pre>
<a href="/" rel="noopener">Voltar ao Hermes</a>
<script>
(function(){'use strict';
var uid=new URLSearchParams(location.search).get('uid')||'';
var valid=/^L[0-9]{3}(?:A|B)?$/.test(uid);
var status=document.getElementById('status'),button=document.getElementById('submit');
document.getElementById('uid').textContent=valid?uid:'UID_INVALIDO';
if(!valid){button.disabled=true;status.textContent='BLOCKED_INVALID_UID';return}
var busy=false;
button.addEventListener('click',async function(){
 if(busy)return;busy=true;button.disabled=true;status.textContent='GATEWAY_REQUEST_PENDING';
 var body='INTENCAO=NEUROLINK_OPERACIONAL; UID='+uid+
 '\\nSOURCE=docs/CONSCIENCIA/APRENDIZADOS-NEUROLINK-LINEAGE.json@CURRENT_MAIN'+
 '\\nOWNER=HERMES_KANBAN_EXISTENTE; ONE_WRITER_PER_SCOPE=true'+
 '\\nVALIDAR_UID_PREV_NEXT_OWNER_RECEITA_ANTES_DA_EXECUCAO=true'+
 '\\nSE_RECEITA_NAO_PROVADA=BLOCKED_RECIPE_NOT_PROVEN; SEM_SHELL_ARBITRARIO'+
 '\\nPROVA=READBACK_RECEIPT; ENQUEUED_NAO_E_EXECUTED; UNKNOWN!=PASS';
 try{
  var reply=await fetch('/api/kanban/tasks',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:'[NEUROLINK] '+uid+' · receita comprovada',body:body,status:'todo',priority:1})});
  var raw=await reply.text(),j={};try{j=JSON.parse(raw)}catch(_){}
  if(reply.status===401){status.textContent='BLOCKED_LOGIN_REQUIRED · autentique-se no Hermes e retorne aqui';return}
  if(!reply.ok){status.textContent='BLOCKED_GATEWAY_HTTP_'+reply.status;return}
  var id=j.id||j.task_id||(j.task&&j.task.id);
  status.textContent=id?'KANBAN_TASK_CREATED='+String(id).slice(0,70)+' · RUNTIME_EXECUTION_UNKNOWN (verificar Kanban + receipt)':'HTTP_'+reply.status+' · TASK_ID_UNKNOWN / sem prova';
 }catch(e){status.textContent='BLOCKED_GATEWAY_CONNECTION '+(e&&e.name||'UNKNOWN')}
 finally{busy=false;button.disabled=false}
});
})();
</script></body></html>
NEUROLINK_HTML
  chmod 644 "$TMP"
  if [[ -f "$TARGET" ]]; then
    cp -p "$TARGET" "$TARGET.before-$(date -u +%Y%m%dT%H%M%SZ)"
  fi
  mv -f "$TMP" "$TARGET"
  echo "HERMES_GATEWAY_BRIDGE_PUBLISHED=$TARGET"
  echo "BRIDGE_SHA256=$(sha256sum "$TARGET" | cut -d' ' -f1)"
  echo "AUTH_REQUIRED=HERMES_NATIVE_LOGIN; AUTO_EXECUTION=NO"
  exit 0
fi
[[ $# == 2 ]] || { echo "USAGE: $0 --inspect|--dispatch L000|L016A|L170" >&2; exit 64; }
MODE="$1"; NODE_UID="$2"
[[ "$MODE" == --inspect || "$MODE" == --dispatch ]] || { echo INVALID_MODE >&2; exit 64; }
[[ "$NODE_UID" =~ ^L[0-9]{3}[AB]?$ ]] || { echo INVALID_UID >&2; exit 65; }
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
python3 - <(git -C "$ROOT" show "$OBJECT") "$NODE_UID" "$PIN" <<'PY'
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
KEY="centraldark:neurolink:$NODE_UID:$SOURCE"
TITLE="NEUROLINK $NODE_UID - receita comprovada"
python3 - <(git -C "$ROOT" show "$OBJECT") "$NODE_UID" "$PIN" <<'PY' | "$HERMES" kanban create --goal --goal-max-turns 20 --idempotency-key "$KEY" --body-file - --created-by centraldark-genesis-hud --json "$TITLE"
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
