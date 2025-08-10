-- Create user_modules to manage feature access per user
create extension if not exists pgcrypto;

create table if not exists public.user_modules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  module text not null check (module in ('ACCOUNTING','TAX_FILING','PRAL_INVOICING')),
  enabled boolean not null default true,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  unique (user_id, module)
);

create index if not exists idx_user_modules_user on public.user_modules(user_id);

-- Simple billing events audit trail
create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  module text not null,
  action text not null check (action in ('MODULE_ENABLED','MODULE_DISABLED')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_billing_events_user on public.billing_events(user_id);

-- Trigger to update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger user_modules_set_updated_at
before update on public.user_modules
for each row execute function public.set_updated_at();

-- Enable Row Level Security
alter table public.user_modules enable row level security;
alter table public.billing_events enable row level security;

-- Policies for user_modules
-- Users can read their own module states
create policy user_modules_select_own
on public.user_modules
for select
using (auth.uid() is not null and user_id = auth.uid());

-- Admins can read any module states
create policy user_modules_admin_select
on public.user_modules
for select
using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- Admins can insert module states for any user
create policy user_modules_admin_insert
on public.user_modules
for insert
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- Admins can update module states for any user
create policy user_modules_admin_update
on public.user_modules
for update
using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- Optionally allow admins to delete (not used, but provided for completeness)
create policy user_modules_admin_delete
on public.user_modules
for delete
using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- Policies for billing_events
-- Users can read their own billing events
create policy billing_events_select_own
on public.billing_events
for select
using (auth.uid() is not null and user_id = auth.uid());

-- Admins can read any billing events
create policy billing_events_admin_select
on public.billing_events
for select
using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- Admins can insert billing events
create policy billing_events_admin_insert
on public.billing_events
for insert
with check (exists (select 1 from public.admins a where a.user_id = auth.uid())); 