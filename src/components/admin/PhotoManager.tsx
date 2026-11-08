"use client";

import { useCallback, useEffect, useId, useRef, useState, type Dispatch, type SetStateAction } from "react";
import {
  createUploadTargetAction,
  discardUploadAction,
  finalizeUploadAction,
} from "@/lib/admin/actions";
import type { EditorPhoto, FieldErrors } from "@/lib/admin/types";
import { MAX_PHOTOS, PHOTO_ACCEPT, PHOTO_LIMITS_TEXT, precheckFile } from "@/lib/media/limits";
import { uploadToSignedUrl } from "@/lib/media/upload-client";
import { errorClass, helpClass, inputClass, labelClass, smallButton } from "./ui";

export type PhotoState = "queued" | "uploading" | "processing" | "ready" | "error" | "rejected";

export interface PhotoItem {
  /** Stable client key (survives the mediaId changing on a retried upload). */
  key: string;
  mediaId: string | null;
  alt: string;
  isCover: boolean;
  thumbUrl: string | null;
  width: number | null;
  height: number | null;
  state: PhotoState;
  progress: number;
  error: string | null;
  retryFrom: "upload" | "finalize" | null;
  fileName: string | null;
  /** Local object URL of the picked file, shown until the server thumbnail exists. */
  localUrl: string | null;
}

export const BUSY_STATES: ReadonlySet<PhotoState> = new Set(["queued", "uploading", "processing"]);

export function photoFromEditor(p: EditorPhoto): PhotoItem {
  return {
    key: p.mediaId,
    mediaId: p.mediaId,
    alt: p.alt,
    isCover: p.isCover,
    thumbUrl: p.thumbUrl,
    width: p.width,
    height: p.height,
    state: "ready",
    progress: 1,
    error: null,
    retryFrom: null,
    fileName: null,
    localUrl: null,
  };
}

/** The photo used as cover: the chosen one, else the first ready photo. */
export function coverKeyOf(photos: PhotoItem[]): string | null {
  const ready = photos.filter((p) => p.state === "ready");
  return (ready.find((p) => p.isCover) ?? ready[0])?.key ?? null;
}

interface Props {
  projectId: string;
  photos: PhotoItem[];
  setPhotos: Dispatch<SetStateAction<PhotoItem[]>>;
  unattached: PhotoItem[];
  setUnattached: Dispatch<SetStateAction<PhotoItem[]>>;
  titleHint: string;
  fieldErrors: FieldErrors;
  announce: (message: string) => void;
}

let keyCounter = 0;
const newKey = () => `local-${Date.now().toString(36)}-${(keyCounter++).toString(36)}`;

export function PhotoManager({
  projectId,
  photos,
  setPhotos,
  unattached,
  setUnattached,
  titleHint,
  fieldErrors,
  announce,
}: Props) {
  const inputId = useId();
  const filesRef = useRef(new Map<string, File>());
  const localUrlsRef = useRef(new Map<string, string>());
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const photosRef = useRef(photos);
  const titleRef = useRef(titleHint);
  const [pickMessage, setPickMessage] = useState<string | null>(null);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);
  useEffect(() => {
    titleRef.current = titleHint;
  }, [titleHint]);

  useEffect(() => {
    const urls = localUrlsRef.current;
    return () => {
      for (const url of urls.values()) URL.revokeObjectURL(url);
    };
  }, []);

  const update = useCallback(
    (key: string, patch: Partial<PhotoItem>) => {
      setPhotos((prev) => prev.map((p) => (p.key === key ? { ...p, ...patch } : p)));
    },
    [setPhotos],
  );

  const runUpload = useCallback(
    async (key: string, from: "upload" | "finalize") => {
      const current = photosRef.current.find((p) => p.key === key);
      if (!current) return; // removed while queued
      let mediaId = current.mediaId;
      try {
        if (from === "upload" || !mediaId) {
          const file = filesRef.current.get(key);
          if (!file) {
            update(key, { state: "error", error: "Choose this photo again to upload it.", retryFrom: null });
            return;
          }
          update(key, { state: "uploading", progress: 0, error: null, retryFrom: null });
          const galleryCount = Math.min(
            MAX_PHOTOS,
            Math.max(1, photosRef.current.filter((p) => p.state !== "rejected").length),
          );
          const target = await createUploadTargetAction(projectId, {
            name: file.name,
            size: file.size,
            type: file.type,
            galleryCount,
            titleHint: titleRef.current.slice(0, 200),
          });
          if (!target.ok) {
            const final = target.code === "rejected" || target.code === "limit";
            update(key, { state: final ? "rejected" : "error", error: target.message, retryFrom: final ? null : "upload" });
            return;
          }
          mediaId = target.data.mediaId;
          update(key, { mediaId });
          try {
            await uploadToSignedUrl({
              signedUrl: target.data.signedUrl,
              apiKey: target.data.apiKey,
              file,
              onProgress: (f) => update(key, { progress: f }),
            });
          } catch (err) {
            void discardUploadAction(mediaId).catch(() => undefined);
            update(key, {
              state: "error",
              mediaId: null,
              error: err instanceof Error ? err.message : "The upload failed.",
              retryFrom: "upload",
            });
            return;
          }
        }

        update(key, { state: "processing", progress: 1, error: null, retryFrom: null });
        const done = await finalizeUploadAction(mediaId);
        if (done.ok) {
          update(key, {
            state: "ready",
            thumbUrl: done.data.thumbUrl,
            width: done.data.width,
            height: done.data.height,
            error: null,
            retryFrom: null,
          });
          announce(`Photo ready${current.fileName ? `: ${current.fileName}` : ""}. Add a description for it.`);
        } else if (done.code === "upload-missing") {
          void discardUploadAction(mediaId).catch(() => undefined);
          update(key, { state: "error", mediaId: null, error: done.message, retryFrom: "upload" });
        } else if (done.code === "rejected") {
          update(key, { state: "rejected", error: done.message, retryFrom: null });
          announce(`Photo not accepted: ${done.message}`);
        } else {
          update(key, { state: "error", error: done.message, retryFrom: "finalize" });
        }
      } catch {
        // Network failure while calling the server.
        update(key, {
          state: "error",
          error: "The connection dropped. Check your internet connection and retry.",
          retryFrom: mediaId ? "finalize" : "upload",
        });
      }
    },
    [announce, projectId, update],
  );

  const enqueue = useCallback(
    (key: string, from: "upload" | "finalize") => {
      queueRef.current = queueRef.current.then(() => runUpload(key, from)).catch(() => undefined);
    },
    [runUpload],
  );

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    const active = photosRef.current.filter((p) => p.state !== "rejected").length;
    const room = Math.max(0, MAX_PHOTOS - active);
    const problems: string[] = [];
    const accepted: Array<{ key: string; file: File }> = [];
    for (const file of files) {
      const problem = precheckFile(file);
      if (problem) {
        problems.push(problem);
        continue;
      }
      if (accepted.length >= room) {
        problems.push(`“${file.name}” was not added: a project can have up to ${MAX_PHOTOS} photos.`);
        continue;
      }
      accepted.push({ key: newKey(), file });
    }
    setPickMessage(problems.length ? problems.join(" ") : null);
    if (!accepted.length) return;

    const items: PhotoItem[] = accepted.map(({ key, file }) => {
      filesRef.current.set(key, file);
      const url = URL.createObjectURL(file);
      localUrlsRef.current.set(key, url);
      return {
        key,
        mediaId: null,
        alt: "",
        isCover: false,
        thumbUrl: null,
        width: null,
        height: null,
        state: "queued",
        progress: 0,
        error: null,
        retryFrom: null,
        fileName: file.name,
        localUrl: url,
      };
    });
    photosRef.current = [...photosRef.current, ...items];
    setPhotos((prev) => [...prev, ...items]);
    announce(`${items.length} ${items.length === 1 ? "photo" : "photos"} added. Uploading…`);
    for (const item of items) enqueue(item.key, "upload");
  }

  function forget(key: string) {
    filesRef.current.delete(key);
    const url = localUrlsRef.current.get(key);
    if (url) URL.revokeObjectURL(url);
    localUrlsRef.current.delete(key);
  }

  function remove(item: PhotoItem, index: number) {
    if (item.state === "ready" && item.mediaId) {
      setUnattached((prev) => [{ ...item, isCover: false }, ...prev.filter((u) => u.key !== item.key)]);
    } else if (item.mediaId) {
      void discardUploadAction(item.mediaId).catch(() => undefined);
    }
    if (item.state !== "ready") forget(item.key);
    setPhotos((prev) => prev.filter((p) => p.key !== item.key));
    announce(
      item.state === "ready"
        ? `Photo ${index + 1} removed from the gallery. You can add it back from “Photos not in the gallery”.`
        : "Photo removed.",
    );
    requestAnimationFrame(() => document.getElementById(`${inputId}-picker`)?.focus());
  }

  function move(key: string, dir: -1 | 1) {
    const i = photos.findIndex((p) => p.key === key);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= photos.length) return;
    const next = [...photos];
    [next[i], next[j]] = [next[j], next[i]];
    photosRef.current = next;
    setPhotos(next);
    announce(`Photo moved to position ${j + 1} of ${next.length}.`);
    requestAnimationFrame(() => {
      const same = document.getElementById(`${inputId}-move-${dir === -1 ? "up" : "down"}-${key}`) as HTMLButtonElement | null;
      const other = document.getElementById(`${inputId}-move-${dir === -1 ? "down" : "up"}-${key}`) as HTMLButtonElement | null;
      (same && !same.disabled ? same : other)?.focus();
    });
  }

  function setCover(key: string) {
    setPhotos((prev) => prev.map((p) => ({ ...p, isCover: p.key === key })));
  }

  function addBack(item: PhotoItem) {
    if (photosRef.current.filter((p) => p.state !== "rejected").length >= MAX_PHOTOS) {
      setPickMessage(`A project can have up to ${MAX_PHOTOS} photos. Remove one first.`);
      return;
    }
    setUnattached((prev) => prev.filter((u) => u.key !== item.key));
    setPhotos((prev) => [...prev, { ...item, isCover: false }]);
    announce("Photo added back to the end of the gallery.");
  }

  const coverKey = coverKeyOf(photos);
  const count = photos.filter((p) => p.state !== "rejected").length;

  return (
    <div>
      <p className={helpClass}>{PHOTO_LIMITS_TEXT} The first photo is the cover unless you choose another.</p>

      <div className="mt-4">
        <label htmlFor={`${inputId}-picker`} className={labelClass}>
          Add photos <span className="font-normal text-ink-muted">({count} of {MAX_PHOTOS})</span>
        </label>
        <input
          id={`${inputId}-picker`}
          type="file"
          multiple
          accept={PHOTO_ACCEPT.join(",")}
          onChange={onPick}
          disabled={count >= MAX_PHOTOS}
          aria-describedby={pickMessage ? `${inputId}-pick-msg` : undefined}
          className="mt-2 block w-full min-h-12 rounded-sm border border-dashed border-ink-soft bg-white p-2 text-base text-ink file:mr-4 file:min-h-11 file:cursor-pointer file:rounded-sm file:border-0 file:bg-midnight-900 file:px-4 file:py-2 file:font-semibold file:text-limestone-50 disabled:opacity-60"
        />
        {pickMessage ? (
          <p id={`${inputId}-pick-msg`} role="alert" className={errorClass}>
            {pickMessage}
          </p>
        ) : null}
      </div>

      {photos.length ? (
        <ol className="mt-6 space-y-4" aria-label="Gallery, in display order">
          {photos.map((p, i) => (
            <PhotoCard
              key={p.key}
              idBase={inputId}
              item={p}
              index={i}
              total={photos.length}
              isCover={coverKey === p.key}
              altError={p.mediaId ? fieldErrors[`gallery.${p.mediaId}.alt`] : undefined}
              itemError={p.mediaId ? fieldErrors[`gallery.${p.mediaId}`] : undefined}
              onAlt={(alt) => update(p.key, { alt })}
              onCover={() => setCover(p.key)}
              onMove={(dir) => move(p.key, dir)}
              onRemove={() => remove(p, i)}
              onRetry={() => p.retryFrom && enqueue(p.key, p.retryFrom)}
            />
          ))}
        </ol>
      ) : (
        <p className="mt-4 text-base text-ink-muted">
          No photos yet. Without photos, the project page shows a line drawing labelled as an illustration.
        </p>
      )}

      {unattached.length ? (
        <details className="mt-6 border-t border-limestone-300 pt-4">
          <summary className="min-h-11 cursor-pointer py-2 text-base font-semibold text-ink">
            Photos not in the gallery ({unattached.length})
          </summary>
          <p className={helpClass}>
            Photos you removed or uploaded earlier. They are not shown on the website unless you add them back.
          </p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {unattached.map((u, i) => (
              <li key={u.key} className="flex items-center gap-3 border border-limestone-300 bg-white p-2">
                <Thumb url={u.thumbUrl} className="h-16 w-20 shrink-0" />
                <button type="button" className={smallButton} onClick={() => addBack(u)}>
                  Add back to gallery<span className="sr-only"> (photo {i + 1} not in the gallery)</span>
                </button>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

function Thumb({ url, className = "" }: { url: string | null; className?: string }) {
  const [broken, setBroken] = useState(false);
  if (!url || broken) {
    return (
      <div className={`flex items-center justify-center bg-limestone-200 text-center text-xs text-ink-muted ${className}`}>
        {url ? "Preview expired. Reload to see it." : "No preview"}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL / local object URL thumbnail
    <img src={url} alt="" onError={() => setBroken(true)} className={`block bg-limestone-200 object-cover ${className}`} />
  );
}

const stateText: Record<PhotoState, string> = {
  queued: "Waiting to upload…",
  uploading: "Uploading…",
  processing: "Preparing the photo…",
  ready: "Ready",
  error: "Upload problem",
  rejected: "Not accepted",
};

function PhotoCard({
  idBase,
  item,
  index,
  total,
  isCover,
  altError,
  itemError,
  onAlt,
  onCover,
  onMove,
  onRemove,
  onRetry,
}: {
  idBase: string;
  item: PhotoItem;
  index: number;
  total: number;
  isCover: boolean;
  altError?: string;
  itemError?: string;
  onAlt: (alt: string) => void;
  onCover: () => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  onRetry: () => void;
}) {
  const id = `${idBase}-${item.key}`;
  const busy = BUSY_STATES.has(item.state);
  const pct = Math.round(item.progress * 100);
  const label = `Photo ${index + 1}${item.fileName ? ` (${item.fileName})` : ""}`;
  return (
    <li
      aria-labelledby={`${id}-label`}
      className={`grid gap-4 border bg-white p-4 sm:grid-cols-[9rem_minmax(0,1fr)] ${
        item.state === "rejected" || item.state === "error" || altError || itemError
          ? "border-danger-700"
          : "border-limestone-300"
      }`}
    >
      <div>
        <Thumb url={item.thumbUrl ?? item.localUrl} className="aspect-[4/3] w-full sm:w-36" />
        <p id={`${id}-label`} className="mt-2 text-sm font-semibold text-ink [overflow-wrap:anywhere]">
          {label}
        </p>
        {isCover ? <p className="text-sm font-semibold text-copper-700">Cover photo</p> : null}
      </div>

      <div className="min-w-0 space-y-4">
        {item.state !== "ready" ? (
          <div>
            <p className="text-sm font-semibold text-ink" aria-live="polite">
              {stateText[item.state]}
            </p>
            {busy ? (
              <progress
                className="mt-2 h-3 w-full accent-copper-700"
                max={100}
                value={item.state === "uploading" ? pct : undefined}
                aria-label={`${label} upload progress`}
              >
                {item.state === "uploading" ? `${pct}%` : null}
              </progress>
            ) : null}
            {item.error ? (
              <p role="alert" className={errorClass}>
                {item.error}
              </p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {item.state === "error" && item.retryFrom ? (
                <button type="button" className={smallButton} onClick={onRetry}>
                  Retry<span className="sr-only"> {label}</span>
                </button>
              ) : null}
              <button type="button" className={smallButton} onClick={onRemove}>
                {busy ? "Cancel" : "Remove"}
                <span className="sr-only"> {label}</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {itemError ? <p className={errorClass}>{itemError}</p> : null}
            <div>
              <label htmlFor={`${id}-alt`} className={labelClass}>
                Describe this photo <span className="font-normal text-ink-muted">(required to publish)</span>
              </label>
              <p id={`${id}-alt-help`} className={helpClass}>
                Say what it shows for someone who cannot see it, e.g. “New furnace installed beside the water heater in a
                basement”. No need to start with “Photo of”.
              </p>
              <input
                id={`${id}-alt`}
                type="text"
                value={item.alt}
                maxLength={250}
                onChange={(e) => onAlt(e.target.value)}
                aria-invalid={altError ? true : undefined}
                aria-describedby={`${id}-alt-help${altError ? ` ${id}-alt-error` : ""}`}
                className={`${inputClass} mt-2`}
              />
              {altError ? (
                <p id={`${id}-alt-error`} className={errorClass}>
                  {altError}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="mr-2 inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-ink">
                <input
                  type="radio"
                  name={`${idBase}-cover`}
                  checked={isCover}
                  onChange={onCover}
                  className="size-5 accent-copper-700"
                />
                Use as cover<span className="sr-only"> ({label})</span>
              </label>
              <button
                id={`${idBase}-move-up-${item.key}`}
                type="button"
                className={smallButton}
                onClick={() => onMove(-1)}
                disabled={index === 0}
              >
                <span aria-hidden>↑</span> Move up<span className="sr-only"> {label}</span>
              </button>
              <button
                id={`${idBase}-move-down-${item.key}`}
                type="button"
                className={smallButton}
                onClick={() => onMove(1)}
                disabled={index === total - 1}
              >
                <span aria-hidden>↓</span> Move down<span className="sr-only"> {label}</span>
              </button>
              <button type="button" className={smallButton} onClick={onRemove}>
                Remove from gallery<span className="sr-only"> {label}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </li>
  );
}
