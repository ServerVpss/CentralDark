#!/usr/bin/env bash
set -euo pipefail

TS="$(date +%Y%m%d-%H%M%S)"
OUT="/root/Multizap/revisoes/$TS/contatos-supabase-query-api"
mkdir -p "$OUT"
chmod 700 "$OUT"

echo "== Aplicar public.contatos via Supabase Query API ==" | tee "$OUT/resumo.txt"
echo "Relatorio: $OUT" | tee -a "$OUT/resumo.txt"

python3 <<'PY'
import json, os, pathlib, urllib.request, urllib.error, urllib.parse, time

OUT = pathlib.Path(os.environ.get('OUT', '/tmp'))
# quando OUT nao vem exportado pelo shell, usa o ultimo diretorio criado pelo nome do script
if str(OUT) == '/tmp':
    import glob
    dirs = sorted(glob.glob('/root/Multizap/revisoes/*/contatos-supabase-query-api'))
    OUT = pathlib.Path(dirs[-1]) if dirs else pathlib.Path('/tmp/contatos-supabase-query-api')
OUT.mkdir(parents=True, exist_ok=True)

REF = 'lyoigsqluyktoclwdaft'
ENV_FILES = [
 '/root/Multizap/secrets/supabase-mcp.env',
 '/root/Multizap/wuzapi/.env',
 '/root/Multizap/gateway/.env',
 '/root/whatsapp-server/console/.env',
 '/root/whatsapp-server/whatsapp-server/.env',
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

def post(url, token, body):
    data=json.dumps(body).encode()
    req=urllib.request.Request(url, data=data, method='POST', headers={'Authorization':'Bearer '+token,'Content-Type':'application/json','Accept':'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.status, r.read().decode('utf-8','ignore')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8','ignore')
    except Exception as e:
        return 0, str(e)

def get(url, key):
    req=urllib.request.Request(url, headers={'apikey':key,'Authorization':'Bearer '+key})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read().decode('utf-8','ignore')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8','ignore')
    except Exception as e:
        return 0, str(e)

env=load_env()
token=env.get('SUPABASE_ACCESS_TOKEN','')
rest=(env.get('SUPABASE_URL') or env.get('VITE_SUPABASE_URL') or '').rstrip('/')
key=env.get('SUPABASE_SERVICE_ROLE_KEY') or env.get('SUPABASE_SERVICE_KEY') or env.get('SUPABASE_KEY') or ''
summary={'token_set':bool(token),'rest_set':bool(rest),'key_set':bool(key),'project_ref':REF}

sql = """
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
"""
(OUT/'create-contatos.sql').write_text(sql, encoding='utf-8')

if not token:
    summary['error']='SUPABASE_ACCESS_TOKEN ausente'
else:
    url=f'https://api.supabase.com/v1/projects/{REF}/database/query'
    attempts=[]
    for body in ({'query':sql}, {'sql':sql}):
        code, raw=post(url, token, body)
        attempts.append({'body_key':list(body.keys())[0], 'http':code, 'preview':raw[:260]})
        if 200 <= code < 300:
            summary['applied']=True
            break
    summary['attempts']=attempts

if rest and key:
    status=0; raw=''
    for _ in range(10):
        status, raw = get(rest + '/rest/v1/contatos?select=id&limit=1', key)
        if 200 <= status < 300: break
        time.sleep(4)
    summary['contatos_rest_http']=status
    summary['contatos_exists']=200 <= status < 300
    if not summary['contatos_exists']:
        summary['rest_preview']=raw[:260]

summary['ok']=bool(summary.get('applied')) and bool(summary.get('contatos_exists'))
(OUT/'summary.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')
chat = [
 '== RESUMO QUERY API CONTATOS ==',
 f'Relatorio: {OUT}',
 f'Token Supabase carregado: {summary.get("token_set")}',
 f'Aplicado: {summary.get("applied", False)}',
 f'REST contatos HTTP: {summary.get("contatos_rest_http")}',
 f'Tabela contatos existe: {summary.get("contatos_exists", False)}',
 f'OK: {summary.get("ok", False)}'
]
(OUT/'RESUMO_PARA_CHATGPT.txt').write_text('\n'.join(chat)+'\n', encoding='utf-8')
print('\n'.join(chat))
raise SystemExit(0 if summary.get('ok') else 1)
PY
