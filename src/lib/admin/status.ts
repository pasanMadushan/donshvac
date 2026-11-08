import type { ProjectStatus, StatusKey } from "./types";

export function statusKeyFor(status: ProjectStatus, draftRevisionId: string | null): StatusKey {
  if (status === "published") return draftRevisionId ? "published-changes" : "published";
  if (status === "unpublished") return "unpublished";
  return "draft";
}
