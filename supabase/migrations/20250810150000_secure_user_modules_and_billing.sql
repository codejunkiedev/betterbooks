-- Enable RLS (idempotent)
alter table public.user_modules enable row level security;
alter table public.billing_events enable row level security;

-- user_modules policies
drop policy if exists user_modules_select_own on public.user_modules;
create policy user_modules_select_own
on public.user_modules
for select
using (auth.uid() is not null and user_id = auth.uid());

drop policy if exists user_modules_admin_select on public.user_modules;
create policy user_modules_admin_select
on public.user_modules
for select
using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists user_modules_admin_insert on public.user_modules;
create policy user_modules_admin_insert
on public.user_modules
for insert
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists user_modules_admin_update on public.user_modules;
create policy user_modules_admin_update
on public.user_modules
for update
using (exists (select 1 from public.admins a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists user_modules_admin_delete on public.user_modules;
create policy user_modules_admin_delete
on public.user_modules
for delete
using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

-- billing_events policies
drop policy if exists billing_events_select_own on public.billing_events;
create policy billing_events_select_own
on public.billing_events
for select
using (auth.uid() is not null and user_id = auth.uid());

drop policy if exists billing_events_admin_select on public.billing_events;
create policy billing_events_admin_select
on public.billing_events
for select
using (exists (select 1 from public.admins a where a.user_id = auth.uid()));

drop policy if exists billing_events_admin_insert on public.billing_events;
create policy billing_events_admin_insert
on public.billing_events
for insert
with check (exists (select 1 from public.admins a where a.user_id = auth.uid())); 