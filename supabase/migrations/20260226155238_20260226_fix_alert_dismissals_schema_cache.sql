create extension if not exists pgcrypto;

create table if not exists public.alert_dismissals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  alert_key text not null,
  dismissed_on date not null default (now()::date),
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id, alert_key, dismissed_on)
);

create index if not exists alert_dismissals_user_tenant_idx
  on public.alert_dismissals (tenant_id, user_id, dismissed_on);

alter table public.alert_dismissals enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'alert_dismissals'
      and policyname = 'alert_dismissals_select'
  ) then
    create policy alert_dismissals_select
    on public.alert_dismissals
    for select
    using (user_id = auth.uid());
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'alert_dismissals'
      and policyname = 'alert_dismissals_insert'
  ) then
    create policy alert_dismissals_insert
    on public.alert_dismissals
    for insert
    with check (user_id = auth.uid());
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'alert_dismissals'
      and policyname = 'alert_dismissals_delete'
  ) then
    create policy alert_dismissals_delete
    on public.alert_dismissals
    for delete
    using (user_id = auth.uid());
  end if;
end
$$;

select pg_notify('pgrst', 'reload schema');
