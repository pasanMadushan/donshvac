-- Explicit Data API grants.
--
-- Newer Supabase projects may not auto-grant table privileges to the API
-- roles. Grant exactly what the app needs; RLS (owner-only policies) still
-- decides which rows each role can touch.
--
--   anon           : nothing on tables. Public reads go through
--                    public.get_published_projects() (security definer).
--   authenticated  : CMS tables, filtered by RLS to approved owners only.
--   service_role   : scripts and the inquiry rate limiter.

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on
  public.projects, public.project_revisions, public.project_media, public.revision_media
to authenticated;

grant all on
  public.projects, public.project_revisions, public.project_media, public.revision_media,
  public.owners, public.inquiry_rate_limits
to service_role;

-- Never let anon reach the tables directly, even if defaults change later.
revoke all on
  public.projects, public.project_revisions, public.project_media, public.revision_media,
  public.owners, public.inquiry_rate_limits
from anon;

-- Owners table is managed by scripts only; signed-in users cannot read it
-- directly (they call public.is_owner()).
revoke all on public.owners from authenticated;
revoke all on public.inquiry_rate_limits from authenticated;

grant execute on function public.slugify(text) to authenticated, service_role;
