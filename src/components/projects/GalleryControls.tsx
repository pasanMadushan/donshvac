"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { ArrowRightIcon } from "@/components/ui/icons";

const noopSubscribe = () => () => {};

/**
 * Previous/Next buttons for a native horizontal scroll strip. The strip works
 * without JavaScript (touch, trackpad, keyboard arrows once focused); these
 * buttons appear only after hydration and move one photo at a time.
 */
export function GalleryControls({ targetId, label }: { targetId: string; label: string }) {
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const getEl = useCallback(() => document.getElementById(targetId), [targetId]);

  useEffect(() => {
    const el = getEl();
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setAtStart(el.scrollLeft <= 2);
      setAtEnd(el.scrollLeft >= max - 2);
    };
    const frame = requestAnimationFrame(update);
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [getEl]);

  const step = (dir: 1 | -1) => {
    const el = getEl();
    if (!el) return;
    const items = Array.from(el.children) as HTMLElement[];
    const base = el.getBoundingClientRect().left;
    const offsets = items.map((c) => c.getBoundingClientRect().left - base + el.scrollLeft);
    const current = el.scrollLeft;
    const target =
      dir === 1
        ? offsets.find((o) => o > current + 4)
        : [...offsets].reverse().find((o) => o < current - 4);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: target ?? (dir === 1 ? el.scrollWidth : 0), behavior: reduce ? "auto" : "smooth" });
  };

  if (!hydrated) return null;

  const btn =
    "inline-flex size-11 items-center justify-center rounded-sm border border-midnight-900 text-midnight-900 transition-colors hover:bg-midnight-900 hover:text-limestone-50 disabled:cursor-not-allowed disabled:border-midnight-900/30 disabled:text-ink-soft disabled:hover:bg-transparent";

  return (
    <div className="flex gap-2" role="group" aria-label={label}>
      <button type="button" className={btn} onClick={() => step(-1)} disabled={atStart} aria-controls={targetId}>
        <ArrowRightIcon className="rotate-180" />
        <span className="sr-only">Previous photo</span>
      </button>
      <button type="button" className={btn} onClick={() => step(1)} disabled={atEnd} aria-controls={targetId}>
        <ArrowRightIcon />
        <span className="sr-only">Next photo</span>
      </button>
    </div>
  );
}
