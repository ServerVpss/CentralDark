#!/usr/bin/env bash
set -euo pipefail

TS="$(date +%Y%m%d-%H%M%S)"
OUT="/root/Multizap/revisoes/$TS/contatos-apply-migration-api"
mkdir -p "$OUT"
chmod 700 "$OUT"
export OUT

cat >"$OUT/migracao-contatos.sql" <<'SQL'
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

python3 <<'PY'
import json, os, pathlib, time, urllib.request, urllib.error
OUT=pathlib.Path(os.environ['OUT'])
REF='lyoigsqluyktoclwdaft'
FILES=['/root/Multizap/secrets/supabase-mcp.env','/root/whatsapp-server/console/.env','/root/Multizap/wuzapi/.env','/root/Multizap/gateway/.env']

def load():
    e={}
    for f in FILES:
        try:
            for line in open(f,encoding='utf-8',errors='ignore'):
                line=line.strip()
                if not line or line.startswith('#') or '=' not in line: continue
                if line.startswith('export '): line=line[7:].strip()
                k,v=line.split('=',1); k=k.strip(); v=v.strip().strip('"').strip("'")
                if k and v and '${' not in v: e.setdefault(k,v)
        except Exception: pass
    e.update(os.environ)
    return e

def call(method,url,headers,body=None):
    data=json.dumps(body).encode() if body is not None else None
    req=urllib.request.Request(url,data=data,method=method,headers=headers)
    try:
        with urllib.request.urlopen(req,timeout=120) as r: return r.status,r.read().decode('utf-8','ignore')
    except urllib.error.HTTPError as ex: return ex.code,ex.read().decode('utf-8','ignore')
    except Exception as ex: return 0,str(ex)

e=load(); sql=(OUT/'migracao-contatos.sql').read_text()
tok=e.get('SUPABASE_ACCESS_TOKEN','')
rest=(e.get('SUPABASE_URL') or e.get('VITE_SUPABASE_URL') or '').rstrip('/')
key=e.get('SUPABASE_SERVICE_ROLE_KEY') or e.get('SUPABASE_SERVICE_KEY') or e.get('SUPABASE_KEY') or ''
summary={'token_set':bool(tok),'rest_set':bool(rest),'key_set':bool(key),'project_ref':REF}
headers={'Authorization':'Bearer '+tok,'Content-Type':'application/json','Accept':'application/json'}
attempts=[]
if tok:
    endpoints=[f'https://api.supabase.com/v1/projects/{REF}/database/migrations',f'https://api.supabase.com/v1/projects/{REF}/database/migrations/apply',f'https://api.supabase.com/v1/projects/{REF}/database/query']
    bodies=[{'name':'criar_contatos_portugues_20260606','query':sql},{'name':'criar_contatos_portugues_20260606','sql':sql},{'query':sql},{'sql':sql}]
    for url in endpoints:
        for body in bodies:
            code,raw=call('POST',url,headers,body)
            attempts.append({'endpoint':url.split('/v1/')[-1],'body':list(body.keys()),'http':code,'preview':raw[:220]})
            if 200 <= code < 300:
                summary['applied']=True
                break
        if summary.get('applied'): break
summary['attempts']=attempts
(OUT/'attempts.json').write_text(json.dumps(attempts,indent=2,ensure_ascii=False),encoding='utf-8')
exists=False; code=0; raw=''
if rest and key:
    for _ in range(12):
        code,raw=call('GET',rest+'/rest/v1/contatos?select=id&limit=1',{'apikey':key,'Authorization':'Bearer '+key})
        if 200 <= code < 300:
            exists=True; break
        time.sleep(5)
summary['contatos_http']=code
summary['contatos_exists']=exists
if not exists: summary['rest_preview']=raw[:240]
summary['ok']=bool(summary.get('applied')) and exists
(OUT/'summary.json').write_text(json.dumps(summary,indent=2,ensure_ascii=False),encoding='utf-8')
chat=f"== RESUMO MIGRACAO CONTATOS ==\nRelatorio: {OUT}\nAplicado: {summary.get('applied',False)}\nHTTP contatos: {code}\nTabela existe: {exists}\nOK: {summary['ok']}\n"
(OUT/'RESUMO_PARA_CHATGPT.txt').write_text(chat,encoding='utf-8')
print(chat)
raise SystemExit(0 if summary['ok'] else 1)
PY
