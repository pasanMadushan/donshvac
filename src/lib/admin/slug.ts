/**
 * Client-safe mirror of public.slugify() in the CMS migration. Used for the
 * search-result preview (before the first publish fixes the real slug) and
 * for descriptive photo filenames. The database remains the authority for
 * the published slug (it also de-duplicates it).
 */
export function slugify(input: string, max = 80): string {
  const base = (input ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[’']/g, " ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/g, "");
  return base || "project";
}

/** Filename stem for public photo derivatives. */
export function fileStemFor(title: string | null | undefined): string {
  const stem = slugify(title ?? "", 60);
  return stem === "project" ? "project-photo" : stem;
}

/** Slug the first publish will most likely produce (the DB may add "-2"). */
export function predictedSlug(title: string): string {
  let base = slugify(title);
  if (base === "page") base = "page-project";
  if (base.length < 3) base = `${base}-project`;
  return base;
}
