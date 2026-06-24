#!/usr/bin/env bash
set -euo pipefail

TS="$(date +%Y%m%d-%H%M%S)"
OUT="/root/Multizap/revisoes/$TS/apply-contatos-table"
mkdir -p "$OUT"
chmod 700 "$OUT"

log(){ echo "$*" | tee -a "$OUT/resumo.txt"; }

log "== Aplicar tabela public.contatos =="
log "Relatorio: $OUT"
log "Modo: cria tabela em portugues confirmada pelo usuario; nao importa contatos ainda."

SQL_FILE="$OUT/create-contatos.sql"
cat >"$SQL_FILE" <<'SQL'
create table if not exists public.contatos (
  id uuid primary key default gen_random_uuid(),
  espaco_trabalho_id uuid not null,
  nome text not null,
  telefone text not null,
  etiquetas text[] default '{}'::text[],
  observacoes text default '',
  bloqueado boolean default false,
  origem text default 'wuzapi_privado',
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now(),
  unique (espaco_trabalho_id, telefone)
);

create index if not exists idx_contatos_espaco_trabalho_id on public.contatos (espaco_trabalho_id);
create index if not exists idx_contatos_telefone on public.contatos (telefone);
create index if not exists idx_contatos_espaco_telefone on public.contatos (espaco_trabalho_id, telefone);

notify pgrst, 'reload schema';
SQL

python3 <<'PY' > "$OUT/apply.py"
import json, os, pathlib, subprocess, time, urllib.request, urllib.error, urllib.parse

OUT = pathlib.Path(os.environ['OUT'])
SQL_FILE = pathlib.Path(os.environ['SQL_FILE'])
EXPECTED = 'lyoigsqluyktoclwdaft'
ENV_FILES = [
  '/root/Multizap/secrets/supabase-mcp.env',
  '/root/Multizap/wuzapi/.env',
  '/root/Multizap/gateway/.env',
  '/root/whatsapp-server/console/.env',
  '/root/whatsapp-server/whatsapp-server/.env',
  '/root/Multizap/apps/bot/.env',
  '/root/Multizap/apps/bot/.env.production',
]

def load_env():
    env = {}
    for f in ENV_FILES:
        try:
            for line in open(f, encoding='utf-8', errors='ignore'):
                line=line.strip()
                if not line or line.startswith('#') or '=' not in line: continue
                if line.startswith('export '): line=line[7:].strip()
                k,v=line.split('=',1)
                k=k.strip(); v=v.strip().strip('"').strip("'")
                if k and v and '${' not in v: env.setdefault(k,v)
        except Exception:
            pass
    env.update({k:v for k,v in os.environ.items() if isinstance(v,str)})
    return env

def ref_from_url(url):
    try: return urllib.parse.urlparse(url).netloc.split('.',1)[0]
    except Exception: return ''

def http(method, url, headers=None, body=None, timeout=60):
    data=json.dumps(body).encode() if body is not None else None
    req=urllib.request.Request(url, data=data, method=method, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            raw=r.read().decode('utf-8','ignore')
            return r.status, raw
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8','ignore')
    except Exception as e:
        return 0, str(e)

env=load_env()
supa=(env.get('SUPABASE_URL') or env.get('VITE_SUPABASE_URL') or '').rstrip('/')
key=env.get('SUPABASE_SERVICE_ROLE_KEY') or env.get('SUPABASE_SERVICE_KEY') or env.get('SUPABASE_KEY') or ''
db=env.get('DATABASE_URL') or env.get('SUPABASE_DB_URL') or env.get('POSTGRES_URL') or env.get('POSTGRES_PRISMA_URL') or ''
access=env.get('SUPABASE_ACCESS_TOKEN','')
project=env.get('SUPABASE_PROJECT_REF') or EXPECTED
ref=ref_from_url(supa)
summary={'supabase_url_set':bool(supa),'service_key_set':bool(key),'db_url_set':bool(db),'access_token_set':bool(access),'project_ref':project,'rest_project_ref':ref,'project_ref_ok':ref==EXPECTED,'applied':False}

if not supa or not key:
    summary['error']='SUPABASE_URL ou service key ausente'
    (OUT/'summary.json').write_text(json.dumps(summary,indent=2,ensure_ascii=False),encoding='utf-8')
    print(json.dumps(summary,indent=2,ensure_ascii=False)); raise SystemExit(1)
if ref != EXPECTED:
    summary['error']='REST Supabase nao aponta para o projeto esperado'
    (OUT/'summary.json').write_text(json.dumps(summary,indent=2,ensure_ascii=False),encoding='utf-8')
    print(json.dumps(summary,indent=2,ensure_ascii=False)); raise SystemExit(1)

sql=SQL_FILE.read_text()
if db and db.startswith('postgres') and subprocess.run(['bash','-lc','command -v psql >/dev/null 2>&1']).returncode==0:
    p=subprocess.run(['psql', db, '-v', 'ON_ERROR_STOP=1', '-f', str(SQL_FILE)], text=True, capture_output=True, timeout=120)
    (OUT/'psql.stdout.txt').write_text(p.stdout[-4000:],encoding='utf-8')
    (OUT/'psql.stderr.txt').write_text(p.stderr[-4000:],encoding='utf-8')
    summary['method']='psql'; summary['psql_rc']=p.returncode; summary['applied']=p.returncode==0

if not summary.get('applied') and access:
    url=f'https://api.supabase.com/v1/projects/{urllib.parse.quote(project)}/database/query'
    code, raw=http('POST', url, headers={'Authorization':'Bearer '+access,'Content-Type':'application/json','Accept':'application/json'}, body={'query':sql}, timeout=120)
    (OUT/'management.response.head.txt').write_text(raw[:2000],encoding='utf-8')
    summary['method']='management_api'; summary['management_http']=code; summary['applied']=200 <= code < 300

# valida REST
headers={'apikey':key,'Authorization':'Bearer '+key}
last_code=0; last_raw=''
for _ in range(8):
    last_code,last_raw=http('GET', supa+'/rest/v1/contatos?select=id&limit=1', headers=headers, timeout=30)
    if 200 <= last_code < 300: break
    time.sleep(5)
summary['contatos_rest_http']=last_code
summary['contatos_exists_rest']=200 <= last_code < 300
if not summary['contatos_exists_rest']:
    summary['rest_preview']=last_raw[:300]
summary['ok']=bool(summary.get('applied')) and summary['contatos_exists_rest']

(OUT/'summary.json').write_text(json.dumps(summary,indent=2,ensure_ascii=False),encoding='utf-8')
chat='''== RESUMO APPLY CONTATOS ==
Relatorio: {out}
Metodo: {method}
Aplicado: {applied}
REST /contatos HTTP: {http}
Tabela existe no REST: {exists}
OK: {ok}
'''.format(out=OUT, method=summary.get('method'), applied=summary.get('applied'), http=summary.get('contatos_rest_http'), exists=summary.get('contatos_exists_rest'), ok=summary.get('ok'))
if summary.get('error'): chat += 'Erro: '+summary['error']+'\n'
(OUT/'RESUMO_PARA_CHATGPT.txt').write_text(chat,encoding='utf-8')
print(chat)
raise SystemExit(0 if summary['ok'] else 1)
PY

export OUT SQL_FILE
python3 "$OUT/apply.py"
log "OK: tentativa de aplicacao finalizada"
