-- =============================================================================
-- seed.sql — development/demo data only.
-- All demo records are clearly identifiable with the DEMO_ prefix.
-- Never insert fake production users.
-- =============================================================================

insert into public.profiles (id, full_name, avatar_url, email)
values
  ('00000000-0000-0000-0000-00000000d001', 'Demo User', null, 'demo@trapkiller.local')
on conflict (id) do nothing;

insert into public.agent_sessions (
  id, user_id, goal, status, current_stage, target_url,
  started_at, completed_at
)
values (
  '00000000-0000-0000-0000-00000000d002',
  '00000000-0000-0000-0000-00000000d001',
  'cancel_subscription',
  'completed',
  'verification',
  'http://localhost:3000/demo-target/account',
  now() - interval '1 hour',
  now() - interval '55 minutes'
)
on conflict (id) do nothing;

insert into public.cancellation_tasks (
  id, user_id, agent_session_id, service_name, target_url, status,
  requested_at, started_at, approval_requested_at, approved_at, completed_at
)
values (
  '00000000-0000-0000-0000-00000000d003',
  '00000000-0000-0000-0000-00000000d001',
  '00000000-0000-0000-0000-00000000d002',
  'Stream Example (demo)',
  'http://localhost:3000/demo-target/account',
  'completed',
  now() - interval '1 hour',
  now() - interval '59 minutes',
  now() - interval '58 minutes',
  now() - interval '57 minutes',
  now() - interval '56 minutes'
)
on conflict (id) do nothing;

insert into public.dark_pattern_detections (
  session_id, user_id, pattern_type, severity, confidence,
  element_text, element_role, explanation
)
values
  (
    '00000000-0000-0000-0000-00000000d002',
    '00000000-0000-0000-0000-00000000d001',
    'confirmshaming', 'high', 0.9400,
    'No, I want to lose my benefits', 'button',
    'The decline option uses guilt-inducing language to discourage continuation.'
  ),
  (
    '00000000-0000-0000-0000-00000000d002',
    '00000000-0000-0000-0000-00000000d001',
    'roach_motel', 'high', 0.9100,
    'Cancel membership', 'link',
    'The exit path is deliberately difficult to locate.'
  ),
  (
    '00000000-0000-0000-0000-00000000d002',
    '00000000-0000-0000-0000-00000000d001',
    'forced_continuity', 'medium', 0.7800,
    'Renews automatically on 16 Sep', 'text',
    'The trial auto-renews without a clear reminder before billing.'
  )
on conflict do nothing;

insert into public.agent_events (session_id, user_id, agent, event_type, message, status, metadata)
values
  ('00000000-0000-0000-0000-00000000d002', '00000000-0000-0000-0000-00000000d001', 'perception', 'page_perceived', 'Page structure analyzed', 'success', '{}'::jsonb),
  ('00000000-0000-0000-0000-00000000d002', '00000000-0000-0000-0000-00000000d001', 'detection', 'pattern_detected', 'Confirmshaming detected', 'warning', '{"patternType":"confirmshaming","confidence":0.94}'::jsonb),
  ('00000000-0000-0000-0000-00000000d002', '00000000-0000-0000-0000-00000000d001', 'planning', 'plan_created', 'Cancellation path identified', 'success', '{}'::jsonb),
  ('00000000-0000-0000-0000-00000000d002', '00000000-0000-0000-0000-00000000d001', 'action', 'action_completed', 'Navigated to cancellation confirmation', 'success', '{}'::jsonb),
  ('00000000-0000-0000-0000-00000000d002', '00000000-0000-0000-0000-00000000d001', 'action', 'approval_required', 'Final cancellation action', 'warning', '{"approvalRequired":true}'::jsonb),
  ('00000000-0000-0000-0000-00000000d002', '00000000-0000-0000-0000-00000000d001', 'verification', 'verification_completed', 'Cancellation verified', 'verified', '{}'::jsonb),
  ('00000000-0000-0000-0000-00000000d002', '00000000-0000-0000-0000-00000000d001', 'verification', 'session_completed', 'Session completed', 'success', '{}'::jsonb)
on conflict do nothing;