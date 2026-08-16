-- =============================================================================
-- 004_functions_triggers.sql
-- Profile auto-creation on auth signup + reusable updated_at trigger.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Profile auto-creation
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Reusable updated_at trigger
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists agent_sessions_set_updated_at on public.agent_sessions;
create trigger agent_sessions_set_updated_at
  before update on public.agent_sessions
  for each row execute function public.set_updated_at();

drop trigger if exists cancellation_tasks_set_updated_at on public.cancellation_tasks;
create trigger cancellation_tasks_set_updated_at
  before update on public.cancellation_tasks
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Expire stale pending approvals
-- Invoked manually by the retention job / cleanup script. Also safe to schedule
-- with pg_cron when the extension is available:
--   select cron.schedule('expire-approvals', '*/5 * * * *', $$select public.expire_pending_approvals()$$);
-- -----------------------------------------------------------------------------
create or replace function public.expire_pending_approvals()
returns integer
language plpgsql
security definer set search_path = public
as $$
declare
  n integer;
begin
  update public.agent_approvals
  set status = 'expired', responded_at = now()
  where status = 'pending' and expires_at < now();
  get diagnostics n = row_count;
  return n;
end;
$$;

-- -----------------------------------------------------------------------------
-- Realtime: publish agent events so the frontend streams them without polling.
-- -----------------------------------------------------------------------------
alter publication supabase_realtime add table public.agent_events;
