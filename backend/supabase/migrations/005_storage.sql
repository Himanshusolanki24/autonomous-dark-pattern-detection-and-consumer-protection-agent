-- =============================================================================
-- 005_storage.sql
-- Private proof storage + access policies + automatic retention.
-- The bucket is PRIVATE: no anonymous or public read access.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Bucket
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('agent-proofs', 'agent-proofs', false)
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- Policies (objects live under {user_id}/{session_id}/{filename})
-- -----------------------------------------------------------------------------
drop policy if exists "agent_proofs_select_own" on storage.objects;
create policy "agent_proofs_select_own"
  on storage.objects for select
  using (bucket_id = 'agent-proofs' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "agent_proofs_insert_own" on storage.objects;
create policy "agent_proofs_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'agent-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
    and octet_length(coalesce(bulk_extension_name, '')) = 0
  );

drop policy if exists "agent_proofs_delete_own" on storage.objects;
create policy "agent_proofs_delete_own"
  on storage.objects for delete
  using (bucket_id = 'agent-proofs' and (storage.foldername(name))[1] = auth.uid()::text);

-- Signed URLs (created server-side with the service role) are the only way to
-- read proof objects after upload.

-- -----------------------------------------------------------------------------
-- Retention
-- Proof objects are deleted after 7 days. Evidence metadata (success/failure +
-- timestamp) is intentionally kept in dark_pattern_detections / cancellation_tasks.
-- -----------------------------------------------------------------------------
create or replace function public.delete_expired_proofs()
returns integer
language plpgsql
security definer set search_path = public
as $$
declare
  r record;
  n integer := 0;
begin
  for r in
    select
      (storage.foldername(name))[1] as user_id,
      (storage.foldername(name))[2] as session_id,
      name,
      (metadata ->> 'expires_at') as expires_at
    from storage.objects
    where bucket_id = 'agent-proofs'
      and (metadata ->> 'expires_at')::timestamptz < now()
  loop
    delete from storage.objects
    where bucket_id = 'agent-proofs' and name = r.name;
    n := n + 1;
  end loop;
  return n;
end;
$$;

-- Optional scheduled cleanup when pg_cron is enabled:
--   create extension if not exists pg_cron;
--   select cron.schedule('delete-expired-proofs', '0 3 * * *', $$select public.delete_expired_proofs()$$);
