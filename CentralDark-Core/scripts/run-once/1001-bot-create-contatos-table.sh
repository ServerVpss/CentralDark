#!/usr/bin/env bash
set -euo pipefail

TS="$(date +%Y%m%d-%H%M%S)"
OUT="/root/Multizap/revisoes/$TS/create-contatos-table"
mkdir -p "$OUT"

cat >"$OUT/create-contatos.sql" <<'SQL'
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

echo "SQL gerado em: $OUT/create-contatos.sql"
echo "A aplicar no Supabase confirmado pelo usuario."
