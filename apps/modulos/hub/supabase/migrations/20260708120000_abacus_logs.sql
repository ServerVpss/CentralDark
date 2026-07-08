-- Tabela de logs do proxy Abacus (HUB Supabase)
create table if not exists public.abacus_logs (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete set null,
  model         text not null,
  status        int  not null,
  latency_ms    int,
  tokens_in     int,
  tokens_out    int,
  error_snippet text,
  request_hash  text,
  created_at    timestamptz not null default now()
);

create index if not exists abacus_logs_user_created_idx
  on public.abacus_logs (user_id, created_at desc);

grant select, insert on public.abacus_logs to authenticated;
grant all              on public.abacus_logs to service_role;

alter table public.abacus_logs enable row level security;

drop policy if exists "usuario_ve_seus_logs" on public.abacus_logs;
create policy "usuario_ve_seus_logs"
  on public.abacus_logs
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "service_role_escreve" on public.abacus_logs;
create policy "service_role_escreve"
  on public.abacus_logs
  for insert
  to service_role
  with check (true);
