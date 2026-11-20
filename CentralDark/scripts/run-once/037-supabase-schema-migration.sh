#!/bin/bash
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
REV="/root/Multizap/revisoes/${TIMESTAMP}/037-supabase-schema-migration"
mkdir -p "$REV"/{logs,sql,diagnostico,historico}
exec > >(tee -a "$REV/logs/execucao.log") 2>&1

GW_ENV="/root/Multizap/gateway/.env"
WABOT_ENV="/root/Multizap/secrets/wabot.env"

echo "=================================================="
echo " 037 - PREPARAÇÃO DO BANCO PRÓPRIO E HISTÓRICO"
echo "=================================================="

# 1. Carregar variáveis do banco próprio
S_URL=""
S_KEY=""

if [ -f "$GW_ENV" ]; then
    S_URL=$(grep "SUPABASE_URL=" "$GW_ENV" | cut -d '=' -f2-)
    S_KEY=$(grep "SUPABASE_SERVICE_ROLE_KEY=" "$GW_ENV" | cut -d '=' -f2-)
fi

if [ -z "$S_URL" ] || [ -z "$S_KEY" ]; then
    if [ -f "$WABOT_ENV" ]; then
        echo "Lendo secrets do wabot.env..."
        S_URL=$(grep "SUPABASE_URL=" "$WABOT_ENV" | cut -d '=' -f2-)
        S_KEY=$(grep "SUPABASE_SERVICE_ROLE_KEY=" "$WABOT_ENV" | cut -d '=' -f2-)
    fi
fi

if [ -z "$S_URL" ] || [ -z "$S_KEY" ]; then
    echo "❌ CRÍTICO: Não foi possível localizar as variáveis do Supabase (URL e KEY) nos arquivos de ambiente na VPS."
    exit 1
fi

echo "✅ Banco de Dados conectado: $(echo "$S_URL" | sed 's|https://||' | cut -d. -f1).supabase.co"

# 2. Diagnóstico de Tabelas Existentes
echo -e "\n--- VERIFICANDO TABELAS EXISTENTES ANTES DA MIGRATION ---"
for TABLE in contacts tickets ticket_messages messages whatsapp_connections workspaces; do
    TEST=$(curl -s -w "\nHTTP:%{http_code}" -H "apikey: $S_KEY" -H "Authorization: Bearer $S_KEY" "$S_URL/rest/v1/$TABLE?select=id&limit=1" || echo "HTTP:000")
    CODE=$(echo "$TEST" | grep "HTTP:" | cut -d: -f2)
    if [ "$CODE" = "200" ]; then
        echo "✅ $TABLE existe."
    else
        echo "❌ $TABLE NAO existe ou inacessivel (HTTP $CODE)."
    fi
done > "$REV/diagnostico/tabelas_antes.txt"
cat "$REV/diagnostico/tabelas_antes.txt"

# 3. Gerar SQL Seguro para o Banco Próprio (Criação de Tabelas/Colunas e Robô)
cat << 'SQL' > "$REV/sql/037_SCHEMA_PROPRIO.sql"
-- 1. Tabela: workspaces
CREATE TABLE IF NOT EXISTS public.workspaces (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. Tabela: whatsapp_connections
CREATE TABLE IF NOT EXISTS public.whatsapp_connections (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id uuid REFERENCES public.workspaces(id),
    name text NOT NULL,
    phone_last4 text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 3. Tabela: contacts
CREATE TABLE IF NOT EXISTS public.contacts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id uuid REFERENCES public.workspaces(id),
    phone text NOT NULL,
    jid text,
    name text,
    name_source text DEFAULT 'whatsapp_sync',
    name_locked boolean DEFAULT false,
    push_name text,
    full_name text,
    business_name text,
    first_name text,
    verified_name text,
    avatar_url text,
    avatar_id text,
    avatar_type text,
    avatar_direct_path text,
    is_own_number boolean DEFAULT false,
    bot_name text,
    tags text[] DEFAULT '{}',
    is_blocked boolean DEFAULT false,
    avatar_updated_at timestamp with time zone,
    remote_updated_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(workspace_id, phone)
);
CREATE INDEX IF NOT EXISTS idx_contacts_jid ON public.contacts(jid);

-- 4. Tabela: tickets
CREATE TABLE IF NOT EXISTS public.tickets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id uuid REFERENCES public.workspaces(id),
    contact_id uuid REFERENCES public.contacts(id),
    connection_id uuid REFERENCES public.whatsapp_connections(id),
    status text DEFAULT 'open',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 5. Tabela: messages (ou ticket_messages)
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id uuid REFERENCES public.workspaces(id),
    ticket_id uuid REFERENCES public.tickets(id),
    contact_id uuid REFERENCES public.contacts(id),
    connection_id uuid REFERENCES public.whatsapp_connections(id),
    direction text,
    status text,
    message_type text,
    body text,
    media_url text,
    external_id text,
    wa_message_id text,
    from_phone text,
    to_phone text,
    raw jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_wa_id ON public.messages(wa_message_id);
CREATE INDEX IF NOT EXISTS idx_messages_ext_id ON public.messages(external_id);

-- 6. Habilitar Publicação Realtime
BEGIN;
  DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
      CREATE PUBLICATION supabase_realtime;
    END IF;
  END
  $$;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
COMMIT;

-- 7. Registrar Conexão do Robô (Evitar Tickets do próprio robô)
-- Vamos inserir uma Row Default de Workspace e a Conexão Recargas Brasil
INSERT INTO public.workspaces (id, name) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Default Workspace') ON CONFLICT (id) DO NOTHING;

INSERT INTO public.whatsapp_connections (workspace_id, name, phone_last4, is_active)
SELECT '00000000-0000-0000-0000-000000000000', 'Recargas Brasil', '5676', true
WHERE NOT EXISTS (SELECT 1 FROM public.whatsapp_connections WHERE phone_last4 = '5676');

-- Marcar contato do bot se existir
UPDATE public.contacts SET is_own_number = true, bot_name = 'Recargas Brasil' WHERE phone LIKE '%5676%';
SQL

echo -e "\n--- ENVIANDO MIGRATION VIA RPC ---"
# Tenta rodar por API REST caso a função RPC execute_sql exista. Se falhar, registra necessidade manual.
RPC_RES=$(curl -s -X POST "$S_URL/rest/v1/rpc/execute_sql" \
  -H "apikey: $S_KEY" \
  -H "Authorization: Bearer $S_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"sql_string\": $(jq -Rs . < "$REV/sql/037_SCHEMA_PROPRIO.sql")}" || echo '{"error":"rpc_fail"}')

if echo "$RPC_RES" | grep -q "error"; then
   echo "⚠️ A API do Supabase recusou a query (RPC não configurado/não autorizado via REST)."
   echo "AÇÃO OBRIGATÓRIA: Execute o script SQL em $REV/sql/037_SCHEMA_PROPRIO.sql no SQL Editor do Supabase Studio."
else
   echo "✅ Schema aplicado com sucesso via RPC."
fi

# 4. Busca de Histórico (Lovable/Antigo ou Backups)
echo -e "\n--- PROCURANDO HISTÓRICO DE MENSAGENS ANTIGAS ---"
cat << 'PY' > "$REV/find_history.py"
import os, json, glob
print("Procurando arquivos .json de backup em /root/Multizap...")
paths = glob.glob("/root/Multizap/**/*.json", recursive=True)
count_msgs = 0
count_contacts = 0
for p in paths:
    if "node_modules" in p or "package.json" in p or "gateway" in p: continue
    try:
        with open(p, 'r') as f:
            data = json.load(f)
            if isinstance(data, list) and len(data) > 0 and 'wa_message_id' in str(data[0]):
                count_msgs += len(data)
                print(f" -> Encontrado {len(data)} msgs em {p}")
            elif isinstance(data, list) and len(data) > 0 and 'jid' in str(data[0]):
                count_contacts += len(data)
                print(f" -> Encontrado {len(data)} contatos em {p}")
    except:
        pass
print(f"Total Histórico Detectado (Local Disk): {count_msgs} mensagens e {count_contacts} contatos.")
PY
python3 "$REV/find_history.py" > "$REV/diagnostico/history_scan.txt"
cat "$REV/diagnostico/history_scan.txt"

# 5. Tabelas Existentes APÓS a Migration
echo -e "\n--- VERIFICANDO TABELAS APÓS MIGRATION ---"
for TABLE in contacts tickets messages whatsapp_connections workspaces; do
    TEST=$(curl -s -w "\nHTTP:%{http_code}" -H "apikey: $S_KEY" -H "Authorization: Bearer $S_KEY" "$S_URL/rest/v1/$TABLE?select=id&limit=1" || echo "HTTP:000")
    CODE=$(echo "$TEST" | grep "HTTP:" | cut -d: -f2)
    if [ "$CODE" = "200" ]; then echo "✅ $TABLE funcional."; else echo "❌ $TABLE inacessivel (HTTP $CODE)."; fi
done > "$REV/diagnostico/tabelas_depois.txt"
cat "$REV/diagnostico/tabelas_depois.txt"

echo -e "\n--- FIM RUN-ONCE 037 ---"
