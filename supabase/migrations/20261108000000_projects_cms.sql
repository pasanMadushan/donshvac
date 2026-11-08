-- Don's HVAC Services — project CMS
--
-- Model
--   projects            one row per portfolio entry (stable slug, status)
--   project_revisions   editable draft / immutable published snapshots
--   project_media       uploaded photos (private originals + derivatives)
--   revision_media      ordered gallery per revision (alt text, cover)
--   owners              explicit allow-list of auth user ids
--
-- Access
--   * Tables have RLS; only approved owners can read or write them.
--   * Anonymous visitors read published content ONLY through
--     public.get_published_projects(), which never returns drafts.
--   * Private bucket project-media-private: owners only (originals, previews,
--     prepared derivatives).
--   * Public bucket project-media-public: world-readable by exact URL, owners
--     write. Objects are copied there only for media in a published revision
--     and removed when no published revision references them.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- owners
create table public.owners (
  user_id uuid primary key references auth.users (id) on delete cascade,
  label text not null default 'owner',
  created_at timestamptz not null default now()
);
alter table public.owners enable row level security;
-- No policies: only the service role (scripts) manages owners.

create or replace function public.is_owner(uid uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select uid is not null and exists (select 1 from public.owners o where o.user_id = uid);
$$;
revoke all on function public.is_owner(uuid) from public;
grant execute on function public.is_owner(uuid) to authenticated, service_role;

-- ---------------------------------------------------------------- enums
create type public.project_status as enum ('draft', 'published', 'unpublished', 'deleted');
create type public.media_status as enum ('pending', 'ready', 'failed');

-- ---------------------------------------------------------------- projects
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  seed_key text unique,
  status public.project_status not null default 'draft',
  draft_revision_id uuid,
  published_revision_id uuid,
  sort_order integer not null default 1000,
  first_published_at timestamptz,
  last_published_at timestamptz,
  unpublished_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_slug_format check (
    slug is null or (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and length(slug) between 3 and 90 and slug <> 'page')
  ),
  constraint projects_published_has_revision check (
    (status = 'published') = (published_revision_id is not null)
  )
);

create table public.project_revisions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null default '',
  summary text not null default '',
  city text,
  service text,
  property_type text,
  featured boolean not null default false,
  seo_title text,
  seo_description text,
  share_image_media_id uuid,
  locked boolean not null default false,
  based_on_revision_id uuid references public.project_revisions (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint revisions_title_len check (length(title) <= 120),
  constraint revisions_summary_len check (length(summary) <= 2000),
  constraint revisions_city_len check (city is null or length(city) <= 60),
  constraint revisions_service check (
    service is null or service in ('furnaces','air-conditioning','water-heaters','heat-pumps','ductwork','thermostats','gas-lines')
  ),
  constraint revisions_property_type check (property_type is null or property_type in ('residential','commercial')),
  constraint revisions_seo_title_len check (seo_title is null or length(seo_title) <= 70),
  constraint revisions_seo_desc_len check (seo_description is null or length(seo_description) <= 200)
);
create index project_revisions_project_idx on public.project_revisions (project_id);

alter table public.projects
  add constraint projects_draft_fk foreign key (draft_revision_id)
    references public.project_revisions (id) on delete set null deferrable initially deferred,
  add constraint projects_published_fk foreign key (published_revision_id)
    references public.project_revisions (id) on delete restrict deferrable initially deferred;

create table public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  status public.media_status not null default 'pending',
  original_path text not null unique,
  original_name text,
  declared_type text,
  declared_bytes integer,
  mime text,
  bytes integer,
  width integer,
  height integer,
  -- Descriptive filename stem for public derivatives, e.g. "brampton-heat-pump".
  file_stem text not null default 'project-photo',
  -- Private prepared derivatives: [{ "w": 480, "h": 360, "path": "..." }, ...]
  variants jsonb,
  -- Public copies (present only while referenced by a published revision).
  public_variants jsonb,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index project_media_project_idx on public.project_media (project_id);

create table public.revision_media (
  revision_id uuid not null references public.project_revisions (id) on delete cascade,
  media_id uuid not null references public.project_media (id) on delete restrict,
  position integer not null check (position >= 0 and position < 50),
  alt text not null default '' check (length(alt) <= 250),
  is_cover boolean not null default false,
  primary key (revision_id, media_id),
  unique (revision_id, position) deferrable initially deferred
);
create unique index revision_media_one_cover on public.revision_media (revision_id) where is_cover;

alter table public.project_revisions
  add constraint revisions_share_image_fk foreign key (share_image_media_id)
    references public.project_media (id) on delete set null;

-- ---------------------------------------------------------------- RLS
alter table public.projects enable row level security;
alter table public.project_revisions enable row level security;
alter table public.project_media enable row level security;
alter table public.revision_media enable row level security;

create policy "owners manage projects" on public.projects
  for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "owners manage revisions" on public.project_revisions
  for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "owners manage media" on public.project_media
  for all to authenticated using (public.is_owner()) with check (public.is_owner());
create policy "owners manage revision media" on public.revision_media
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

revoke all on public.projects, public.project_revisions, public.project_media, public.revision_media, public.owners from anon;

-- Locked (published) revisions are immutable, for everyone.
create or replace function public.guard_locked_revision()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' and old.locked then
    -- Allow only the lock transition itself (locked stays true, content unchanged).
    if (new.title, new.summary, new.city, new.service, new.property_type, new.featured,
        new.seo_title, new.seo_description, new.share_image_media_id)
       is distinct from
       (old.title, old.summary, old.city, old.service, old.property_type, old.featured,
        old.seo_title, old.seo_description, old.share_image_media_id) or not new.locked then
      raise exception 'revision % is published and immutable', old.id using errcode = 'P0001';
    end if;
  end if;
  return new;
end $$;
create trigger project_revisions_guard before update on public.project_revisions
  for each row execute function public.guard_locked_revision();

create or replace function public.guard_locked_revision_media()
returns trigger language plpgsql set search_path = '' as $$
declare rid uuid := coalesce(new.revision_id, old.revision_id);
begin
  if exists (select 1 from public.project_revisions r where r.id = rid and r.locked) then
    raise exception 'gallery of published revision % is immutable', rid using errcode = 'P0001';
  end if;
  return coalesce(new, old);
end $$;
create trigger revision_media_guard before insert or update or delete on public.revision_media
  for each row execute function public.guard_locked_revision_media();

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end $$;
create trigger projects_touch before update on public.projects for each row execute function public.touch_updated_at();
create trigger revisions_touch before update on public.project_revisions for each row execute function public.touch_updated_at();
create trigger media_touch before update on public.project_media for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------- helpers
create or replace function public.slugify(input text)
returns text language sql immutable set search_path = '' as $$
  select coalesce(
    nullif(
      left(
        trim(both '-' from regexp_replace(
          regexp_replace(lower(translate(coalesce(input, ''),
            'àáâãäåçèéêëìíîïñòóôõöùúûüýÿ’''', 'aaaaaaceeeeiiiinooooouuuuyy  ')),
          '&', ' and ', 'g'),
        '[^a-z0-9]+', '-', 'g')),
        80),
      ''),
    'project');
$$;

-- ---------------------------------------------------------------- owner RPCs
-- All owner RPCs are SECURITY INVOKER: RLS applies, and each also checks
-- is_owner() explicitly so a misconfigured policy can never widen access.

create or replace function public.assert_owner()
returns void language plpgsql stable set search_path = '' as $$
begin
  if not public.is_owner() then
    raise exception 'not authorised' using errcode = '42501';
  end if;
end $$;

-- Create a new, empty draft project.
create or replace function public.create_project_draft()
returns uuid language plpgsql set search_path = '' as $$
declare pid uuid; rid uuid;
begin
  perform public.assert_owner();
  insert into public.projects (status, created_by) values ('draft', auth.uid()) returning id into pid;
  insert into public.project_revisions (project_id) values (pid) returning id into rid;
  update public.projects set draft_revision_id = rid where id = pid;
  return pid;
end $$;

-- Return the editable draft revision id, cloning the published revision (and
-- its ordered gallery) when no unlocked draft exists. Live content is untouched.
create or replace function public.ensure_draft_revision(p_project_id uuid)
returns uuid language plpgsql set search_path = '' as $$
declare p public.projects; src uuid; rid uuid;
begin
  perform public.assert_owner();
  select * into p from public.projects where id = p_project_id and status <> 'deleted' for update;
  if not found then raise exception 'project not found' using errcode = 'P0002'; end if;

  if p.draft_revision_id is not null
     and not (select locked from public.project_revisions where id = p.draft_revision_id) then
    return p.draft_revision_id;
  end if;

  src := coalesce(p.draft_revision_id, p.published_revision_id);
  if src is null then
    insert into public.project_revisions (project_id) values (p.id) returning id into rid;
  else
    insert into public.project_revisions
      (project_id, title, summary, city, service, property_type, featured,
       seo_title, seo_description, share_image_media_id, based_on_revision_id)
    select project_id, title, summary, city, service, property_type, featured,
           seo_title, seo_description, share_image_media_id, id
      from public.project_revisions where id = src
    returning id into rid;
    insert into public.revision_media (revision_id, media_id, position, alt, is_cover)
      select rid, media_id, position, alt, is_cover from public.revision_media where revision_id = src;
  end if;
  update public.projects set draft_revision_id = rid where id = p.id;
  return rid;
end $$;

-- Save draft fields and the complete ordered gallery in one transaction.
-- p_fields: { title, summary, city, service, property_type, featured,
--             seo_title, seo_description, share_image_media_id }
-- p_gallery: [{ media_id, alt, is_cover }, ...] in display order.
create or replace function public.save_project_draft(
  p_project_id uuid, p_fields jsonb, p_gallery jsonb
) returns uuid language plpgsql set search_path = '' as $$
declare rid uuid; item jsonb; i integer := 0; cover_count integer := 0;
begin
  perform public.assert_owner();
  rid := public.ensure_draft_revision(p_project_id);

  if jsonb_typeof(p_gallery) <> 'array' or jsonb_array_length(p_gallery) > 12 then
    raise exception 'gallery must be an array of at most 12 photos' using errcode = '22023';
  end if;

  update public.project_revisions set
    title = coalesce(p_fields->>'title', ''),
    summary = coalesce(p_fields->>'summary', ''),
    city = nullif(p_fields->>'city', ''),
    service = nullif(p_fields->>'service', ''),
    property_type = nullif(p_fields->>'property_type', ''),
    featured = coalesce((p_fields->>'featured')::boolean, false),
    seo_title = nullif(p_fields->>'seo_title', ''),
    seo_description = nullif(p_fields->>'seo_description', ''),
    share_image_media_id = nullif(p_fields->>'share_image_media_id', '')::uuid
  where id = rid;

  delete from public.revision_media where revision_id = rid;
  for item in select * from jsonb_array_elements(p_gallery) loop
    if not exists (
      select 1 from public.project_media m
      where m.id = (item->>'media_id')::uuid and m.project_id = p_project_id and m.status = 'ready'
    ) then
      raise exception 'photo % is not ready or belongs to another project', item->>'media_id' using errcode = '22023';
    end if;
    insert into public.revision_media (revision_id, media_id, position, alt, is_cover)
    values (rid, (item->>'media_id')::uuid, i, left(coalesce(item->>'alt', ''), 250),
            coalesce((item->>'is_cover')::boolean, false));
    i := i + 1;
  end loop;

  select count(*) into cover_count from public.revision_media where revision_id = rid and is_cover;
  if cover_count = 0 and i > 0 then
    update public.revision_media set is_cover = true where revision_id = rid and position = 0;
  end if;
  return rid;
end $$;

-- Atomically publish a draft revision with its ordered gallery.
-- Idempotent: re-publishing the same revision returns the existing slug.
-- Caller must have copied every gallery photo's public variants first.
create or replace function public.publish_project(p_project_id uuid, p_revision_id uuid)
returns table (slug text, previous_revision_id uuid)
language plpgsql set search_path = '' as $$
declare p public.projects; r public.project_revisions; base text; candidate text; n integer := 1; prev uuid;
begin
  perform public.assert_owner();
  select * into p from public.projects where id = p_project_id and status <> 'deleted' for update;
  if not found then raise exception 'project not found' using errcode = 'P0002'; end if;

  if p.published_revision_id = p_revision_id and p.status = 'published' then
    return query select p.slug, null::uuid; return;
  end if;
  if p.draft_revision_id is distinct from p_revision_id then
    raise exception 'stale revision: the draft changed since this publish started' using errcode = '40001';
  end if;

  select * into r from public.project_revisions where id = p_revision_id and project_id = p.id;
  if length(trim(r.title)) < 3 then
    raise exception 'a title of at least 3 characters is required to publish' using errcode = '22023';
  end if;
  if exists (
    select 1 from public.revision_media rm join public.project_media m on m.id = rm.media_id
    where rm.revision_id = p_revision_id and (m.status <> 'ready' or m.public_variants is null)
  ) then
    raise exception 'one or more photos are not prepared for publishing' using errcode = '22023';
  end if;

  if p.slug is null then
    base := public.slugify(r.title);
    if base = 'page' then base := 'page-project'; end if;
    if length(base) < 3 then base := base || '-project'; end if;
    candidate := base;
    while exists (select 1 from public.projects x where x.slug = candidate) loop
      n := n + 1;
      candidate := left(base, 85) || '-' || n;
    end loop;
    update public.projects set slug = candidate where id = p.id;
    p.slug := candidate;
  end if;

  prev := p.published_revision_id;
  update public.project_revisions set locked = true, published_at = now() where id = p_revision_id;
  update public.projects set
    published_revision_id = p_revision_id,
    draft_revision_id = null,
    status = 'published',
    first_published_at = coalesce(first_published_at, now()),
    last_published_at = now(),
    unpublished_at = null
  where id = p.id;
  return query select p.slug, prev;
end $$;

-- Take a project off the public site. Keeps its slug and content so it can be
-- republished; the last published revision becomes the basis of the draft.
create or replace function public.unpublish_project(p_project_id uuid)
returns text language plpgsql set search_path = '' as $$
declare p public.projects;
begin
  perform public.assert_owner();
  select * into p from public.projects where id = p_project_id for update;
  if not found then raise exception 'project not found' using errcode = 'P0002'; end if;
  if p.status <> 'published' then return p.slug; end if;
  update public.projects set
    draft_revision_id = coalesce(draft_revision_id, published_revision_id),
    published_revision_id = null,
    status = 'unpublished',
    unpublished_at = now()
  where id = p.id;
  return p.slug;
end $$;

-- Soft delete (keeps seeded projects from being re-created by the seed).
create or replace function public.delete_project(p_project_id uuid)
returns text language plpgsql set search_path = '' as $$
declare s text;
begin
  perform public.assert_owner();
  perform public.unpublish_project(p_project_id);
  update public.projects set status = 'deleted', draft_revision_id = null
   where id = p_project_id returning slug into s;
  return s;
end $$;

-- Media ids whose public copies are no longer referenced by any published
-- revision (safe to delete from the public bucket).
create or replace function public.orphaned_public_media(p_project_id uuid)
returns table (media_id uuid, public_variants jsonb)
language sql stable set search_path = '' as $$
  select m.id, m.public_variants from public.project_media m
  where m.project_id = p_project_id and m.public_variants is not null
    and public.is_owner()
    and not exists (
      select 1 from public.revision_media rm
      join public.projects p on p.published_revision_id = rm.revision_id
      where rm.media_id = m.id and p.status = 'published'
    );
$$;

grant execute on function
  public.create_project_draft(), public.ensure_draft_revision(uuid),
  public.save_project_draft(uuid, jsonb, jsonb), public.publish_project(uuid, uuid),
  public.unpublish_project(uuid), public.delete_project(uuid),
  public.orphaned_public_media(uuid), public.assert_owner()
to authenticated;
revoke execute on function
  public.create_project_draft(), public.ensure_draft_revision(uuid),
  public.save_project_draft(uuid, jsonb, jsonb), public.publish_project(uuid, uuid),
  public.unpublish_project(uuid), public.delete_project(uuid),
  public.orphaned_public_media(uuid), public.assert_owner()
from anon, public;

-- ---------------------------------------------------------------- public read
-- The only anonymous entry point. Returns published revisions only, with the
-- ordered gallery's PUBLIC variants. Never exposes drafts or private paths.
create or replace function public.get_published_projects()
returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_agg(row_to_json(t)::jsonb order by t.sort_order, t.first_published_at desc), '[]'::jsonb)
  from (
    select p.id, p.slug, p.sort_order, p.first_published_at, r.published_at as revision_published_at,
           r.title, r.summary, r.city, r.service, r.property_type, r.featured,
           r.seo_title, r.seo_description, r.share_image_media_id,
           coalesce((
             select jsonb_agg(jsonb_build_object(
                      'id', m.id, 'alt', rm.alt, 'is_cover', rm.is_cover,
                      'width', m.width, 'height', m.height, 'variants', m.public_variants)
                    order by rm.position)
             from public.revision_media rm join public.project_media m on m.id = rm.media_id
             where rm.revision_id = r.id and m.public_variants is not null
           ), '[]'::jsonb) as images
    from public.projects p
    join public.project_revisions r on r.id = p.published_revision_id
    where p.status = 'published' and p.slug is not null
  ) t;
$$;
revoke all on function public.get_published_projects() from public;
grant execute on function public.get_published_projects() to anon, authenticated, service_role;

-- ---------------------------------------------------------------- inquiry rate limit
-- Stores only a keyed hash of the client address and a counter; no inquiry content.
create table public.inquiry_rate_limits (
  key_hash text not null,
  window_start timestamptz not null,
  hits integer not null default 0,
  primary key (key_hash, window_start)
);
alter table public.inquiry_rate_limits enable row level security;
revoke all on public.inquiry_rate_limits from anon, authenticated;

create or replace function public.inquiry_rate_hit(p_key_hash text, p_window_seconds integer, p_max integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare ws timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
        c integer;
begin
  delete from public.inquiry_rate_limits where window_start < now() - interval '1 day';
  insert into public.inquiry_rate_limits as l (key_hash, window_start, hits) values (p_key_hash, ws, 1)
  on conflict (key_hash, window_start) do update set hits = l.hits + 1
  returning hits into c;
  return c <= p_max;
end $$;
revoke all on function public.inquiry_rate_hit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.inquiry_rate_hit(text, integer, integer) to service_role;

-- ---------------------------------------------------------------- storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('project-media-private', 'project-media-private', false, 15728640,
   array['image/jpeg','image/png','image/webp']),
  ('project-media-public', 'project-media-public', true, 5242880,
   array['image/webp','image/jpeg'])
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "owners read private media" on storage.objects for select to authenticated
  using (bucket_id = 'project-media-private' and public.is_owner());
create policy "owners write private media" on storage.objects for insert to authenticated
  with check (bucket_id = 'project-media-private' and public.is_owner());
create policy "owners update private media" on storage.objects for update to authenticated
  using (bucket_id = 'project-media-private' and public.is_owner())
  with check (bucket_id = 'project-media-private' and public.is_owner());
create policy "owners delete private media" on storage.objects for delete to authenticated
  using (bucket_id = 'project-media-private' and public.is_owner());

-- Public bucket: objects are downloadable by exact URL (bucket.public = true)
-- but not listable; only owners can write, overwrite or remove them.
create policy "owners read public media" on storage.objects for select to authenticated
  using (bucket_id = 'project-media-public' and public.is_owner());
create policy "owners write public media" on storage.objects for insert to authenticated
  with check (bucket_id = 'project-media-public' and public.is_owner());
create policy "owners update public media" on storage.objects for update to authenticated
  using (bucket_id = 'project-media-public' and public.is_owner())
  with check (bucket_id = 'project-media-public' and public.is_owner());
create policy "owners delete public media" on storage.objects for delete to authenticated
  using (bucket_id = 'project-media-public' and public.is_owner());
