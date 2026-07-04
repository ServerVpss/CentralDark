#!/usr/bin/env bash
# ------------------------------------------------------------
# popular-webui.sh — script idempotente que garante o estado
# oficial do Open WebUI CentralDark (ui.centralldark.com):
#   - 3 personas (pivete, hermes, fabler) na tabela `model`
#   - Web Search ligado com DuckDuckGo
#   - MCPO já apontado via TOOL_SERVER_CONNECTIONS (env do container)
#
# Roda quantas vezes quiser — usa INSERT OR REPLACE / UPSERT.
# Restart do container ao final pra recarregar config.
# ------------------------------------------------------------
set -euo pipefail

DB="/var/lib/docker/volumes/open-webui/_data/webui.db"
[ -f "$DB" ] || { echo "❌ DB não encontrado em $DB"; exit 1; }

echo "🛠️  Populando WebUI CentralDark…"

python3 - <<'PYEOF'
import sqlite3, json, time
DB='/var/lib/docker/volumes/open-webui/_data/webui.db'
c=sqlite3.connect(DB); c.row_factory=sqlite3.Row
now=int(time.time())
admin_id=list(c.execute("SELECT id FROM user WHERE role='admin' ORDER BY created_at LIMIT 1"))[0][0]

# Prompts vivem em apps/modulos/WebUI/personas/*.md
# Aqui inline pra o script ser standalone. Update via git edita este bloco.
PROMPTS = {
'pivete': open('/root/CentralDark/apps/modulos/WebUI/personas/pivete-system.md').read(),
'hermes': open('/root/CentralDark/apps/modulos/WebUI/personas/hermes-system.md').read(),
'fabler': open('/root/CentralDark/apps/modulos/WebUI/personas/fabler-system.md').read(),
}
BASE = {'pivete':'claude-opus-4-5','hermes':'claude-opus-4-5','fabler':'claude-sonnet-4-5'}

for pid, base in BASE.items():
    meta={'profile_image_url':'/static/favicon.png','description':f'Persona CentralDark: {pid}',
          'suggestion_prompts':[],'tags':[{'name':'centraldark'},{'name':'pivete-ia'}],
          'capabilities':{'vision':True,'file_upload':True,'web_search':True,
                          'image_generation':False,'code_interpreter':True,'citations':True,'usage':True},
          'toolIds':[]}
    params={'system':PROMPTS[pid],'stream_response':True,'temperature':0.7}
    c.execute("""INSERT OR REPLACE INTO model
        (id,user_id,base_model_id,name,params,meta,updated_at,created_at,is_active)
        VALUES (?,?,?,?,?,?,?,?,1)""",
        (pid, admin_id, base, pid, json.dumps(params, ensure_ascii=False),
         json.dumps(meta, ensure_ascii=False), now, now))
    print(f' ✅ persona: {pid} (base={base})')

for k,v in [('web.search.enable','true'),
            ('web.search.engine','"duckduckgo"'),
            ('web.search.result_count','5'),
            ('web.search.concurrent_requests','5'),
            ('web.search.trust_env','true')]:
    c.execute("""INSERT INTO config (key,value,updated_at) VALUES (?,?,?)
                 ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at""",
              (k,v,now))
    print(f' ✅ cfg: {k}={v}')

c.commit(); c.close()
PYEOF

echo "🔄 Restart do container WebUI…"
docker restart CentralDark-WebUI >/dev/null
sleep 5
STATUS=$(docker ps --filter name=CentralDark-WebUI --format '{{.Status}}')
echo "🟢 WebUI: $STATUS"
echo "✅ Feito. Testa em https://ui.centralldark.com"
