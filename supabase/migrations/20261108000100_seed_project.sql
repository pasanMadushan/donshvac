-- Don's HVAC Services — idempotent seeding of the documented projects.
--
-- Why a new migration: a seeded project must be inserted together with its
-- locked, published revision in ONE transaction (projects_published_has_revision
-- is an immediate CHECK, and a half-inserted seed would show as a broken
-- project). PostgREST calls are one statement each, so the operator script
-- (scripts/seed.ts) calls this function instead.
--
-- Rules
--   * A seed_key that already exists (any status: published, unpublished,
--     deleted, or owner-edited) is skipped entirely, so owner edits and
--     unpublish/delete decisions are never overwritten.
--   * A slug already used by another project is also skipped.
--   * Only service_role may execute it.

create or replace function public.seed_project(
  p_seed_key text,
  p_slug text,
  p_sort_order integer,
  p_title text,
  p_summary text,
  p_city text,
  p_service text,
  p_property_type text,
  p_featured boolean
) returns text
language plpgsql
security definer
set search_path = ''
as $$
declare pid uuid := gen_random_uuid(); rid uuid := gen_random_uuid(); inserted uuid;
begin
  if p_seed_key is null or length(trim(p_seed_key)) = 0 then
    raise exception 'seed key is required' using errcode = '22023';
  end if;

  -- Serialise concurrent runs for the same key.
  perform pg_advisory_xact_lock(hashtext('seed_project:' || p_seed_key));

  if exists (select 1 from public.projects where seed_key = p_seed_key) then
    return 'skipped';
  end if;
  if exists (select 1 from public.projects where slug = p_slug) then
    return 'skipped';
  end if;

  -- published_revision_id references a revision inserted below; the FK is
  -- DEFERRABLE INITIALLY DEFERRED, so it is checked at commit.
  insert into public.projects
    (id, slug, seed_key, status, published_revision_id, sort_order, first_published_at, last_published_at)
  values
    (pid, p_slug, p_seed_key, 'published', rid, coalesce(p_sort_order, 1000), now(), now())
  on conflict do nothing
  returning id into inserted;
  if inserted is null then
    return 'skipped';
  end if;

  insert into public.project_revisions
    (id, project_id, title, summary, city, service, property_type, featured, locked, published_at)
  values
    (rid, pid, p_title, coalesce(p_summary, ''), nullif(p_city, ''), nullif(p_service, ''),
     nullif(p_property_type, ''), coalesce(p_featured, false), true, now());

  return 'inserted';
end $$;

revoke all on function public.seed_project(text, text, integer, text, text, text, text, text, boolean)
  from public, anon, authenticated;
grant execute on function public.seed_project(text, text, integer, text, text, text, text, text, boolean)
  to service_role;
