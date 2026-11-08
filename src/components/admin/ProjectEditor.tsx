"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  PROJECT_SERVICE_CATEGORIES,
  PROPERTY_TYPES,
  propertyTypeLabels,
  serviceCategoryLabels,
} from "@/config/services";
import { deleteAction, publishAction, saveDraftAction, unpublishAction } from "@/lib/admin/actions";
import { predictedSlug } from "@/lib/admin/slug";
import type { EditorFields, EditorProject, FieldErrors, SavePayload, StatusKey } from "@/lib/admin/types";
import { BUSY_STATES, coverKeyOf, PhotoManager, photoFromEditor, type PhotoItem } from "./PhotoManager";
import { previewDescription, SearchResultPreview, ShareCardPreview } from "./SearchPreviews";
import { StatusBadge } from "./StatusBadge";
import {
  dangerButton,
  errorClass,
  helpClass,
  inputClass,
  labelClass,
  primaryButton,
  quietButton,
  secondaryButton,
  sectionTitleClass,
  textareaClass,
} from "./ui";

type Busy = null | "save" | "publish" | "unpublish" | "delete" | "preview";
type Notice = { tone: "success" | "error" | "info"; text: string; live?: string | null } | null;

function buildPayload(fields: EditorFields, photos: PhotoItem[]): SavePayload {
  const ready = photos.filter((p) => p.state === "ready" && p.mediaId);
  const coverKey = coverKeyOf(photos);
  const readyIds = new Set(ready.map((p) => p.mediaId));
  return {
    fields: {
      ...fields,
      shareImageMediaId: readyIds.has(fields.shareImageMediaId) ? fields.shareImageMediaId : "",
    },
    gallery: ready.map((p) => ({ mediaId: p.mediaId as string, alt: p.alt, isCover: p.key === coverKey })),
  };
}

function Counter({ value, max }: { value: string; max: number }) {
  const n = value.length;
  return (
    <span className={`text-sm ${n > max ? "font-semibold text-danger-700" : "text-ink-muted"}`}>
      {n} / {max}
    </span>
  );
}

export function ProjectEditor({ project, siteHost }: { project: EditorProject; siteHost: string }) {
  const id = useId();
  const router = useRouter();
  const [fields, setFields] = useState<EditorFields>(project.fields);
  const [photos, setPhotos] = useState<PhotoItem[]>(() => project.gallery.map(photoFromEditor));
  const [unattached, setUnattached] = useState<PhotoItem[]>(() => project.unattached.map(photoFromEditor));
  const [statusKey, setStatusKey] = useState<StatusKey>(project.statusKey);
  const [slug, setSlug] = useState<string | null>(project.slug);
  const [busy, setBusy] = useState<Busy>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [confirming, setConfirming] = useState<null | "unpublish" | "delete">(null);
  const [announcement, setAnnouncement] = useState("");
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    JSON.stringify(buildPayload(project.fields, project.gallery.map(photoFromEditor))),
  );
  const noticeRef = useRef<HTMLDivElement>(null);

  const payload = useMemo(() => buildPayload(fields, photos), [fields, photos]);
  const snapshot = useMemo(() => JSON.stringify(payload), [payload]);
  const uploading = photos.some((p) => BUSY_STATES.has(p.state));
  const dirty = snapshot !== savedSnapshot || uploading;
  const isLive = statusKey === "published" || statusKey === "published-changes";
  const liveHref = isLive && slug ? `/our-work/${slug}` : null;
  const previewHref = `/admin/projects/${project.id}/preview`;

  // Unsaved-changes warning when leaving or reloading the page.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  const announce = useCallback((message: string) => {
    setAnnouncement("");
    requestAnimationFrame(() => setAnnouncement(message));
  }, []);

  const set = <K extends keyof EditorFields>(key: K, value: EditorFields[K]) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  function show(next: Notice) {
    setNotice(next);
    requestAnimationFrame(() => noticeRef.current?.focus());
  }

  function focusFirstError(errors: FieldErrors) {
    const keys = Object.keys(errors);
    if (!keys.length) return;
    requestAnimationFrame(() => {
      const first = document.querySelector<HTMLElement>("[aria-invalid='true']");
      first?.scrollIntoView({ block: "center" });
      first?.focus();
    });
  }

  async function save(): Promise<boolean> {
    const sent = snapshot;
    setBusy("save");
    try {
      const res = await saveDraftAction(project.id, payload);
      if (res.ok) {
        setSavedSnapshot(sent);
        setStatusKey(res.data.statusKey);
        setFieldErrors({});
        show({
          tone: "success",
          text:
            res.data.statusKey === "published-changes"
              ? "Draft saved. The live page is unchanged until you press Publish."
              : "Draft saved. It is not on the website until you press Publish.",
        });
        return true;
      }
      setFieldErrors(res.fieldErrors ?? {});
      show({ tone: "error", text: res.message });
      focusFirstError(res.fieldErrors ?? {});
      return false;
    } catch {
      show({ tone: "error", text: "The connection dropped while saving. Your typing is still here; try again." });
      return false;
    } finally {
      setBusy(null);
    }
  }

  function clientPublishChecks(): FieldErrors {
    const errors: FieldErrors = {};
    if (fields.title.trim().length < 3) errors["fields.title"] = "Add a title of at least 3 characters before publishing.";
    for (const p of photos) {
      if (p.state === "ready" && p.mediaId && !p.alt.trim()) {
        errors[`gallery.${p.mediaId}.alt`] = "Describe this photo before publishing.";
      }
    }
    return errors;
  }

  async function publish() {
    if (uploading) {
      show({ tone: "error", text: "Wait for the photos to finish uploading, then press Publish again." });
      return;
    }
    if (photos.some((p) => p.state === "error" || p.state === "rejected")) {
      show({ tone: "error", text: "Some photos did not upload. Retry or remove them, then press Publish again." });
      return;
    }
    const local = clientPublishChecks();
    if (Object.keys(local).length) {
      setFieldErrors(local);
      show({ tone: "error", text: "A few things need fixing before this can go live. They are marked below." });
      focusFirstError(local);
      return;
    }
    const sent = snapshot;
    setBusy("publish");
    try {
      const res = await publishAction(project.id, payload);
      if (res.ok) {
        setSavedSnapshot(sent);
        setSlug(res.data.slug);
        setStatusKey("published");
        setFieldErrors({});
        show({ tone: "success", text: "Published. The project is now on the website.", live: `/our-work/${res.data.slug}` });
        return;
      }
      if (res.code === "needs-fixes") {
        setSavedSnapshot(sent);
        if (statusKey === "published") setStatusKey("published-changes");
      }
      setFieldErrors(res.fieldErrors ?? {});
      show({ tone: "error", text: res.message });
      focusFirstError(res.fieldErrors ?? {});
    } catch {
      show({ tone: "error", text: "The connection dropped while publishing. Nothing is lost; press Publish again." });
    } finally {
      setBusy(null);
    }
  }

  async function unpublish() {
    setConfirming(null);
    setBusy("unpublish");
    try {
      const res = await unpublishAction(project.id);
      if (res.ok) {
        setStatusKey("unpublished");
        show({ tone: "success", text: "Unpublished. The project is no longer on the website. Your content is kept here." });
      } else {
        show({ tone: "error", text: res.message });
      }
    } catch {
      show({ tone: "error", text: "The connection dropped. Check whether the project is still live, then try again." });
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    setConfirming(null);
    setBusy("delete");
    try {
      const res = await deleteAction(project.id);
      if (res.ok) {
        // Nothing left to lose: leave without the unsaved-changes prompt.
        setSavedSnapshot(snapshot);
        router.replace("/admin?deleted=1");
        return;
      }
      show({ tone: "error", text: res.message });
    } catch {
      show({ tone: "error", text: "The connection dropped. Reload the page to check whether the project was deleted." });
    } finally {
      setBusy(null);
    }
  }

  async function openPreview() {
    if (!dirty) {
      window.open(previewHref, "_blank");
      return;
    }
    if (uploading) {
      show({ tone: "info", text: "Photos are still uploading. The preview shows your last saved draft." });
      window.open(previewHref, "_blank");
      return;
    }
    // Open the tab during the click (so it is not blocked), then save and point it at the preview.
    const tab = window.open("", "_blank");
    const ok = await save();
    if (tab) {
      if (ok) tab.location.href = previewHref;
      else tab.close();
    } else if (ok) {
      router.push(previewHref);
    }
  }

  const err = (key: string) => fieldErrors[key];
  const titleErr = err("fields.title");
  const coverKey = coverKeyOf(photos);
  const readyPhotos = photos.filter((p) => p.state === "ready" && p.mediaId);
  const coverPhoto = readyPhotos.find((p) => p.key === coverKey) ?? null;
  const sharePhoto = readyPhotos.find((p) => p.mediaId === fields.shareImageMediaId) ?? coverPhoto;
  const displayTitle = (fields.seoTitle.trim() || fields.title.trim() || "Untitled project").slice(0, 120);
  const path = `/our-work/${slug ?? predictedSlug(fields.title)}`;
  const description = previewDescription(fields.seoDescription, fields.summary);

  return (
    <div className="mt-6">
      <p className="text-base">
        <Link href="/admin" className="inline-flex min-h-11 items-center text-copper-700 underline underline-offset-4">
          <span aria-hidden className="mr-1">←</span> All projects
        </Link>
      </p>

      <div className="mt-2 flex flex-wrap items-end justify-between gap-4 border-b border-limestone-300 pb-6">
        <div className="min-w-0">
          <p className="eyebrow text-copper-700">Edit project</p>
          <h1 className="mt-2 font-display text-display-lg uppercase text-midnight-900 [overflow-wrap:anywhere]">
            {fields.title.trim() || "Untitled project"}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <StatusBadge status={statusKey} />
            <span className={dirty ? "font-semibold text-copper-800" : "text-ink-muted"} aria-live="polite">
              {dirty ? "Unsaved changes" : "All changes saved"}
            </span>
          </div>
        </div>
        {liveHref ? (
          <a
            href={liveHref}
            target="_blank"
            rel="noopener"
            className="inline-flex min-h-11 items-center font-semibold text-copper-700 underline underline-offset-4"
          >
            View live project<span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : null}
      </div>

      <div
        ref={noticeRef}
        tabIndex={-1}
        role={notice?.tone === "error" ? "alert" : "status"}
        className={notice ? "mt-6" : "sr-only"}
      >
        {notice ? (
          <div
            className={`border-l-4 bg-white p-4 text-base ${
              notice.tone === "error"
                ? "border-danger-700"
                : notice.tone === "success"
                  ? "border-success-700"
                  : "border-midnight-500"
            }`}
          >
            <p>{notice.text}</p>
            {notice.live ? (
              <p className="mt-2">
                <a href={notice.live} target="_blank" rel="noopener" className="font-semibold text-copper-700 underline underline-offset-4">
                  View live project<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      <form
        className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12"
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
        noValidate
      >
        <div className="min-w-0 space-y-12">
          {/* 1. The essentials */}
          <section aria-labelledby={`${id}-basics`} className="space-y-6">
            <h2 id={`${id}-basics`} className={sectionTitleClass}>
              <span className="mr-3 text-copper-700">01</span>The project
            </h2>
            <div>
              <div className="flex items-baseline justify-between gap-3">
                <label htmlFor={`${id}-title`} className={labelClass}>
                  Title <span className="font-normal text-ink-muted">(required to publish)</span>
                </label>
                <Counter value={fields.title} max={120} />
              </div>
              <p id={`${id}-title-help`} className={helpClass}>
                Say what the job was and where, e.g. “Furnace replacement in a Mississauga home”.
              </p>
              <input
                id={`${id}-title`}
                type="text"
                value={fields.title}
                maxLength={120}
                onChange={(e) => set("title", e.target.value)}
                aria-invalid={titleErr ? true : undefined}
                aria-describedby={`${id}-title-help${titleErr ? ` ${id}-title-error` : ""}`}
                className={`${inputClass} mt-2 text-lg`}
                autoComplete="off"
              />
              {titleErr ? (
                <p id={`${id}-title-error`} className={errorClass}>
                  {titleErr}
                </p>
              ) : null}
            </div>

            <div>
              <div className="flex items-baseline justify-between gap-3">
                <label htmlFor={`${id}-summary`} className={labelClass}>
                  Short description
                </label>
                <Counter value={fields.summary} max={2000} />
              </div>
              <p id={`${id}-summary-help`} className={helpClass}>
                A few plain sentences: what the customer needed and what you did. Leave a blank line between paragraphs.
                Do not include customer names or addresses.
              </p>
              <textarea
                id={`${id}-summary`}
                value={fields.summary}
                maxLength={2000}
                onChange={(e) => set("summary", e.target.value)}
                aria-invalid={err("fields.summary") ? true : undefined}
                aria-describedby={`${id}-summary-help`}
                className={`${textareaClass} mt-2`}
              />
              {err("fields.summary") ? <p className={errorClass}>{err("fields.summary")}</p> : null}
            </div>
          </section>

          {/* 2. Photos */}
          <section aria-labelledby={`${id}-photos`}>
            <h2 id={`${id}-photos`} className={sectionTitleClass}>
              <span className="mr-3 text-copper-700">02</span>Photos
            </h2>
            <div className="mt-4">
              <PhotoManager
                projectId={project.id}
                photos={photos}
                setPhotos={setPhotos}
                unattached={unattached}
                setUnattached={setUnattached}
                titleHint={fields.title}
                fieldErrors={fieldErrors}
                announce={announce}
              />
            </div>
          </section>

          {/* 3. Optional details */}
          <section aria-labelledby={`${id}-details`} className="space-y-6">
            <div>
              <h2 id={`${id}-details`} className={sectionTitleClass}>
                <span className="mr-3 text-copper-700">03</span>Optional details
              </h2>
              <p className={helpClass}>These help visitors find similar jobs. Leave any of them blank.</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor={`${id}-city`} className={labelClass}>
                  City or area
                </label>
                <input
                  id={`${id}-city`}
                  type="text"
                  value={fields.city}
                  maxLength={60}
                  onChange={(e) => set("city", e.target.value)}
                  aria-invalid={err("fields.city") ? true : undefined}
                  className={`${inputClass} mt-2`}
                  autoComplete="off"
                />
                <p className={helpClass}>Town only, e.g. “Brampton”. Never a street address.</p>
                {err("fields.city") ? <p className={errorClass}>{err("fields.city")}</p> : null}
              </div>
              <div>
                <label htmlFor={`${id}-service`} className={labelClass}>
                  Service
                </label>
                <select
                  id={`${id}-service`}
                  value={fields.service}
                  onChange={(e) => set("service", e.target.value as EditorFields["service"])}
                  className={`${inputClass} mt-2`}
                >
                  <option value="">Not specified</option>
                  {PROJECT_SERVICE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {serviceCategoryLabels[c]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor={`${id}-property`} className={labelClass}>
                  Property type
                </label>
                <select
                  id={`${id}-property`}
                  value={fields.propertyType}
                  onChange={(e) => set("propertyType", e.target.value as EditorFields["propertyType"])}
                  className={`${inputClass} mt-2`}
                >
                  <option value="">Not specified</option>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {propertyTypeLabels[t]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-start gap-3 sm:pt-8">
                <input
                  id={`${id}-featured`}
                  type="checkbox"
                  checked={fields.featured}
                  onChange={(e) => set("featured", e.target.checked)}
                  className="mt-1 size-6 shrink-0 accent-copper-700"
                  aria-describedby={`${id}-featured-help`}
                />
                <div>
                  <label htmlFor={`${id}-featured`} className={labelClass}>
                    Featured project
                  </label>
                  <p id={`${id}-featured-help`} className={helpClass}>
                    Featured projects are shown first on the home page.
                  </p>
                </div>
              </div>
            </div>

            <details className="border-t border-limestone-300 pt-4">
              <summary className="min-h-11 cursor-pointer py-2 text-base font-semibold text-ink">
                Advanced: search and sharing
              </summary>
              <div className="mt-4 space-y-6">
                <p className={helpClass}>
                  Optional. By default the title and the start of the short description are used.
                </p>
                <div>
                  <div className="flex items-baseline justify-between gap-3">
                    <label htmlFor={`${id}-seo-title`} className={labelClass}>
                      Search title
                    </label>
                    <Counter value={fields.seoTitle} max={70} />
                  </div>
                  <input
                    id={`${id}-seo-title`}
                    type="text"
                    value={fields.seoTitle}
                    maxLength={70}
                    onChange={(e) => set("seoTitle", e.target.value)}
                    aria-invalid={err("fields.seoTitle") ? true : undefined}
                    className={`${inputClass} mt-2`}
                    autoComplete="off"
                  />
                  {err("fields.seoTitle") ? <p className={errorClass}>{err("fields.seoTitle")}</p> : null}
                </div>
                <div>
                  <div className="flex items-baseline justify-between gap-3">
                    <label htmlFor={`${id}-seo-desc`} className={labelClass}>
                      Search description
                    </label>
                    <Counter value={fields.seoDescription} max={200} />
                  </div>
                  <textarea
                    id={`${id}-seo-desc`}
                    value={fields.seoDescription}
                    maxLength={200}
                    onChange={(e) => set("seoDescription", e.target.value)}
                    aria-invalid={err("fields.seoDescription") ? true : undefined}
                    className={`${inputClass} mt-2 min-h-24`}
                  />
                  {err("fields.seoDescription") ? <p className={errorClass}>{err("fields.seoDescription")}</p> : null}
                </div>
                <fieldset>
                  <legend className={labelClass}>Share image</legend>
                  <p className={helpClass}>The picture apps show when someone shares this project’s link.</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <label className="flex min-h-12 cursor-pointer items-center gap-3 border border-limestone-300 bg-white p-2">
                      <input
                        type="radio"
                        name={`${id}-share`}
                        checked={!readyPhotos.some((p) => p.mediaId === fields.shareImageMediaId)}
                        onChange={() => set("shareImageMediaId", "")}
                        className="size-5 shrink-0 accent-copper-700"
                      />
                      <span className="text-sm font-semibold">Use the cover photo</span>
                    </label>
                    {readyPhotos.map((p) => (
                      <label
                        key={p.key}
                        className="flex min-h-12 cursor-pointer items-center gap-3 border border-limestone-300 bg-white p-2"
                      >
                        <input
                          type="radio"
                          name={`${id}-share`}
                          checked={fields.shareImageMediaId === p.mediaId}
                          onChange={() => set("shareImageMediaId", p.mediaId ?? "")}
                          className="size-5 shrink-0 accent-copper-700"
                        />
                        {p.thumbUrl ?? p.localUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element -- signed private thumbnail
                          <img src={(p.thumbUrl ?? p.localUrl) as string} alt="" className="h-10 w-14 object-cover" />
                        ) : null}
                        <span className="text-sm">
                          Photo {photos.indexOf(p) + 1}
                          {p.alt.trim() ? <span className="sr-only">: {p.alt}</span> : null}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </div>
            </details>
          </section>

          {/* 4. Danger zone */}
          <section aria-labelledby={`${id}-manage`} className="space-y-4 border-t border-limestone-300 pt-8">
            <h2 id={`${id}-manage`} className={sectionTitleClass}>
              <span className="mr-3 text-copper-700">04</span>Take down or delete
            </h2>
            <div className="flex flex-wrap gap-3">
              {isLive ? (
                <button
                  type="button"
                  className={quietButton}
                  onClick={() => setConfirming("unpublish")}
                  disabled={busy !== null}
                  aria-expanded={confirming === "unpublish"}
                >
                  Unpublish
                </button>
              ) : null}
              <button
                type="button"
                className={dangerButton}
                onClick={() => setConfirming("delete")}
                disabled={busy !== null}
                aria-expanded={confirming === "delete"}
              >
                Delete project
              </button>
            </div>
            {confirming ? (
              <div role="group" aria-labelledby={`${id}-confirm`} className="border-l-4 border-danger-700 bg-white p-4">
                <p id={`${id}-confirm`} className="text-base">
                  {confirming === "unpublish"
                    ? "Take this project off the website? Its page will stop working. You can publish it again later."
                    : "Delete this project? It is removed from the website and from this list. This cannot be undone here."}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className={dangerButton}
                    onClick={() => void (confirming === "unpublish" ? unpublish() : remove())}
                    autoFocus
                  >
                    {confirming === "unpublish" ? "Yes, unpublish" : "Yes, delete"}
                  </button>
                  <button type="button" className={quietButton} onClick={() => setConfirming(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        </div>

        {/* Previews */}
        <aside aria-label="Previews" className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <SearchResultPreview title={displayTitle} host={siteHost} path={path} description={description} />
          <ShareCardPreview
            title={displayTitle}
            host={siteHost}
            description={description}
            imageUrl={sharePhoto ? (sharePhoto.thumbUrl ?? sharePhoto.localUrl) : null}
          />
          {!slug ? (
            <p className="text-sm text-ink-muted">
              The web address is set from the title the first time you publish, and then stays the same.
            </p>
          ) : null}
        </aside>

        {/* Sticky action bar */}
        <div className="sticky bottom-0 z-30 -mx-4 border-t border-limestone-300 bg-limestone-50/95 px-4 py-3 backdrop-blur lg:col-span-2">
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className={secondaryButton} disabled={busy !== null}>
              {busy === "save" ? "Saving…" : "Save draft"}
            </button>
            <button type="button" className={quietButton} onClick={() => void openPreview()} disabled={busy !== null}>
              Preview<span className="sr-only"> (opens in a new tab)</span>
            </button>
            <button type="button" className={primaryButton} onClick={() => void publish()} disabled={busy !== null}>
              {busy === "publish" ? "Publishing…" : isLive ? "Publish changes" : "Publish"}
            </button>
            <span className="text-sm text-ink-muted" aria-hidden={!dirty}>
              {uploading ? "Photos uploading…" : dirty ? "Unsaved changes" : ""}
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
