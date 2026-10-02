-- =============================================================================
-- 002_rls.sql
-- Row Level Security on every user-owned table.
-- The database — not the frontend — is the authorization boundary.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- agent_sessions
-- -----------------------------------------------------------------------------
alter table public.agent_sessions enable row level security;

create policy "sessions_select_own"
  on public.agent_sessions for select
  using (auth.uid() = user_id);

create policy "sessions_insert_own"
  on public.agent_sessions for insert
  with check (auth.uid() = user_id);

create policy "sessions_update_own"
  on public.agent_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "sessions_delete_own"
  on public.agent_sessions for delete
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- agent_events
-- Users read + write their own events; system events are written by the
-- service role (which bypasses RLS).
-- -----------------------------------------------------------------------------
alter table public.agent_events enable row level security;

create policy "events_select_own"
  on public.agent_events for select
  using (auth.uid() = user_id);

create policy "events_insert_own"
  on public.agent_events for insert
  with check (auth.uid() = user_id);

create policy "events_update_own"
  on public.agent_events for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- dark_pattern_detections
-- -----------------------------------------------------------------------------
alter table public.dark_pattern_detections enable row level security;

create policy "detections_select_own"
  on public.dark_pattern_detections for select
  using (auth.uid() = user_id);

create policy "detections_insert_own"
  on public.dark_pattern_detections for insert
  with check (auth.uid() = user_id);

-- detections are evidence: users may not mutate them after creation.
-- (service role may delete for retention cleanup.)

-- -----------------------------------------------------------------------------
-- cancellation_tasks
-- -----------------------------------------------------------------------------
alter table public.cancellation_tasks enable row level security;

create policy "tasks_select_own"
  on public.cancellation_tasks for select
  using (auth.uid() = user_id);

create policy "tasks_insert_own"
  on public.cancellation_tasks for insert
  with check (auth.uid() = user_id);

create policy "tasks_update_own"
  on public.cancellation_tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "tasks_delete_own"
  on public.cancellation_tasks for delete
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- agent_approvals
-- -----------------------------------------------------------------------------
alter table public.agent_approvals enable row level security;

create policy "approvals_select_own"
  on public.agent_approvals for select
  using (auth.uid() = user_id);

create policy "approvals_insert_own"
  on public.agent_approvals for insert
  with check (auth.uid() = user_id);

-- Approving an approval is a *server-validated* transition performed by the
-- application (service role) AFTER ownership/pending/expiry checks. The user
-- may not flip their own approval to 'approved' directly.
-- create policy ... for update (NOT granted to authenticated)

-- -----------------------------------------------------------------------------
-- audit_logs
-- Read-only for users; appends are service-role only. No update/delete by users.
-- -----------------------------------------------------------------------------
alter table public.audit_logs enable row level security;

create policy "audit_select_own"
  on public.audit_logs for select
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- idempotency_keys
-- Insert is how the idempotency key is reserved; reads allow replays.
-- -----------------------------------------------------------------------------
alter table public.idempotency_keys enable row level security;

create policy "idempotency_select_own"
  on public.idempotency_keys for select
  using (auth.uid() = user_id);

create policy "idempotency_insert_own"
  on public.idempotency_keys for insert
  with check (auth.uid() = user_id);
