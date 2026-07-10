-- apps/modulos/hub/supabase/migrations/20260710_super_admin_lock.sql
-- Trava de super_admin imutável.
-- Regras:
--   1. Enum `app_role` com super_admin, admin, user.
--   2. Tabela `public.user_roles` (id, user_id, role) com FK pra auth.users.
--   3. RLS habilitado + policies mínimas.
--   4. Trigger que bloqueia INSERT de segundo super_admin.
--   5. Trigger que bloqueia UPDATE/DELETE de super_admin existente.
--   6. Função `has_role(uuid, app_role)` SECURITY DEFINER pra usar em RLS sem recursão.
--   7. Função `is_super_admin_locked()` que devolve boolean pra edge/front.
--
-- Nada aqui expõe email, id ou dado sensível — só bool.
-- Rodar UMA VEZ no HUB Supabase (lyoigsqluyktoclwdaft).

-- 1. Enum de roles
do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('super_admin', 'admin', 'user');
  end if;
end $$;

-- 2. Tabela user_roles
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

-- 3. Grants + RLS
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

drop policy if exists "user_roles_self_read" on public.user_roles;
create policy "user_roles_self_read"
  on public.user_roles for select
  to authenticated
  using (auth.uid() = user_id);

-- 4. Função has_role (SECURITY DEFINER pra RLS não recursar)
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- 5. Trava de INSERT — segundo super_admin é bloqueado
create or replace function public.prevent_second_super_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.role = 'super_admin' then
    if exists (select 1 from public.user_roles where role = 'super_admin' and user_id <> NEW.user_id) then
      raise exception 'super_admin já existe — apenas 1 permitido (bootstrap trava)';
    end if;
  end if;
  return NEW;
end
$$;

drop trigger if exists trg_prevent_second_super_admin on public.user_roles;
create trigger trg_prevent_second_super_admin
  before insert on public.user_roles
  for each row execute function public.prevent_second_super_admin();

-- 6. Trava de UPDATE/DELETE — super_admin não pode ser removido nem trocado
create or replace function public.protect_super_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'DELETE' and OLD.role = 'super_admin' then
    raise exception 'super_admin não pode ser removido (trava selada)';
  end if;
  if TG_OP = 'UPDATE' and OLD.role = 'super_admin' and NEW.role <> 'super_admin' then
    raise exception 'super_admin não pode ser rebaixado (trava selada)';
  end if;
  return coalesce(NEW, OLD);
end
$$;

drop trigger if exists trg_protect_super_admin on public.user_roles;
create trigger trg_protect_super_admin
  before update or delete on public.user_roles
  for each row execute function public.protect_super_admin();

-- 7. Helper pro endpoint/edge
create or replace function public.is_super_admin_locked()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where role = 'super_admin')
$$;

-- 8. Grants nas funções pra edges/anon poderem só ler o helper (sem ver dados)
grant execute on function public.is_super_admin_locked() to anon, authenticated, service_role;
grant execute on function public.has_role(uuid, app_role) to authenticated, service_role;
