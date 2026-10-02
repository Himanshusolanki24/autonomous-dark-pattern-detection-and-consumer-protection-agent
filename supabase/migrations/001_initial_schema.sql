-- =============================================================================
-- 001_initial_schema.sql
-- Dark Pattern Trap Killer — core tables, enums and grants.
-- Everything here is reproducible: never create tables by hand in the dashboard.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.agent_status as enum (
  'idle',
  'running',
  'approval_required',
  'completed',
  'failed',
  'cancelled'
);

create type public.agent_stage as enum (
  'perception',
  'detection',
  'planning',
  'action',
  'verification'
);

create type public.pattern_type as enum (
  'confirmshaming',
  'forced_continuity',
  'roach_motel',
  'drip_pricing',
  'basket_sneaking',
  'false_urgency',
  'misdirection',
  'hidden_costs',
  'nagging',
  'forced_action',
  'subscription_trap',
  'urgency',
  'disguised_ads'
);

create type public.severity as enum ('low', 'medium', 'high', 'critical');

create type public.event_type as enum (
  'session_started',
  'page_loaded',
  'page_perceived',
  'pattern_detected',
  'plan_created',
  'action_started',
  'action_completed',
  'approval_required',
  'approval_granted',
  'approval_rejected',
  'verification_started',
  'verification_completed',
  'session_completed',
  'session_failed',
  'stage_started',
  'stage_completed',
  'perception_completed',
  'detection_completed',
  'goal_reached',
  'action_failed',
  'approval_requested',
  'task_completed',
  'task_failed',
  'task_cancelled',
  'session_stopped'
);

create type public.task_status as enum (
  'pending',
  'running',
  'approval_required',
  'cancelled',
  'completed',
  'failed',
  'blocked'
);

create type public.approval_status as enum ('pending', 'approved', 'rejected', 'expired');

create type public.action_type as enum ('final_cancellation');

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- agent_sessions
-- `state` persists the agent graph so a paused (approval-gated) run can resume.
-- -----------------------------------------------------------------------------
create table public.agent_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  goal text not null,
  status public.agent_status not null default 'idle',
  current_stage public.agent_stage,
  target_url text not null,
  state jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- agent_events
-- -----------------------------------------------------------------------------
create table public.agent_events (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.agent_sessions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  agent public.agent_stage,
  event_type public.event_type not null,
  message text,
  status text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- dark_pattern_detections
-- session_id is nullable so the read-only scanner can persist detections too.
-- -----------------------------------------------------------------------------
create table public.dark_pattern_detections (
  id bigint generated always as identity primary key,
  session_id uuid references public.agent_sessions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  pattern_type public.pattern_type not null,
  severity public.severity not null,
  confidence numeric(5, 4) not null check (confidence >= 0 and confidence <= 1),
  element_text text,
  element_role text,
  explanation text,
  screenshot_path text,
  source_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- cancellation_tasks
-- -----------------------------------------------------------------------------
create table public.cancellation_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  agent_session_id uuid references public.agent_sessions (id) on delete set null,
  service_name text not null,
  target_url text not null,
  status public.task_status not null default 'pending',
  requested_at timestamptz not null default now(),
  started_at timestamptz,
  approval_requested_at timestamptz,
  approved_at timestamptz,
  completed_at timestamptz,
  failure_reason text,
  proof_screenshot_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- agent_approvals
-- A pending approval pauses the agent. Only a validated, owned, non-expired
-- pending approval may be approved server-side.
-- -----------------------------------------------------------------------------
create table public.agent_approvals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  session_id uuid not null references public.agent_sessions (id) on delete cascade,
  task_id uuid references public.cancellation_tasks (id) on delete set null,
  action_type public.action_type not null default 'final_cancellation',
  description text,
  risk_level public.severity not null default 'high',
  status public.approval_status not null default 'pending',
  requested_at timestamptz not null default now(),
  responded_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- audit_logs
-- Append-only from the application perspective. Users can read their own.
-- -----------------------------------------------------------------------------
create table public.audit_logs (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  session_id uuid,
  action text not null,
  resource_type text,
  resource_id text,
  ip_hash text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- idempotency_keys
-- Backs the `Idempotency-Key` header on critical mutation endpoints.
-- -----------------------------------------------------------------------------
create table public.idempotency_keys (
  key text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  response jsonb,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Grants
-- anon: reads only where RLS permits. authenticated: full on own rows via RLS.
-- service_role: unrestricted.
-- -----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;

grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

alter default privileges in schema public grant select on tables to anon, authenticated;
alter default privileges in schema public grant insert, update, delete on tables to authenticated;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
