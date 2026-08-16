-- =============================================================================
-- 003_indexes.sql
-- Indexes covering the hot query patterns. Composite indexes where useful.
-- =============================================================================

-- profiles
create index profiles_id_idx on public.profiles (id);

-- agent_sessions
create index agent_sessions_user_id_idx on public.agent_sessions (user_id);
create index agent_sessions_status_idx on public.agent_sessions (status);
create index agent_sessions_created_at_idx on public.agent_sessions (created_at desc);
create index agent_sessions_user_status_idx on public.agent_sessions (user_id, status);

-- agent_events
create index agent_events_session_id_idx on public.agent_events (session_id);
create index agent_events_user_id_idx on public.agent_events (user_id);
create index agent_events_created_at_idx on public.agent_events (created_at desc);
create index agent_events_session_created_idx on public.agent_events (session_id, created_at desc);

-- dark_pattern_detections
create index detections_session_id_idx on public.dark_pattern_detections (session_id);
create index detections_user_id_idx on public.dark_pattern_detections (user_id);
create index detections_session_type_idx on public.dark_pattern_detections (session_id, pattern_type);

-- cancellation_tasks
create index tasks_user_id_idx on public.cancellation_tasks (user_id);
create index tasks_status_idx on public.cancellation_tasks (status);
create index tasks_created_at_idx on public.cancellation_tasks (created_at desc);
create index tasks_user_status_idx on public.cancellation_tasks (user_id, status);

-- agent_approvals
create index approvals_user_id_idx on public.agent_approvals (user_id);
create index approvals_session_id_idx on public.agent_approvals (session_id);
create index approvals_status_idx on public.agent_approvals (status);
create index approvals_user_status_idx on public.agent_approvals (user_id, status);

-- audit_logs
create index audit_logs_user_id_idx on public.audit_logs (user_id);
create index audit_logs_session_id_idx on public.audit_logs (session_id);
create index audit_logs_created_at_idx on public.audit_logs (created_at desc);

-- idempotency_keys
create index idempotency_keys_user_idx on public.idempotency_keys (user_id);
