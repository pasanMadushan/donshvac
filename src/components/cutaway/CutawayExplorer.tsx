"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArrowRightIcon } from "@/components/ui/icons";
import { cutawaySystems, type CutawaySystemId } from "./systems";
import type { SceneHandle } from "./scene3d";
import s from "./cutaway.module.css";

type ThreeState =
  | { kind: "off" }
  | { kind: "confirm" }
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "error"; message: string };

interface NavigatorHints {
  hardwareConcurrency?: number;
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function lowPowerDevice(): boolean {
  const n = navigator as Navigator & NavigatorHints;
  return (
    (typeof n.hardwareConcurrency === "number" && n.hardwareConcurrency <= 2) ||
    (typeof n.deviceMemory === "number" && n.deviceMemory <= 2) ||
    n.connection?.saveData === true
  );
}

function prefersReducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/**
 * Interactive layer for the home-page cutaway. The drawing itself is a Server
 * Component passed in as `drawing`; this adds the system toggles, the key and
 * the optional on-demand 3D view.
 */
const SYSTEM_STYLE: Record<string, { on: string; dot: string; top: string; text: string }> = {
  heating: {
    on: "border-copper-500 bg-copper-500 text-midnight-950 shadow-glow-orange",
    dot: "bg-copper-500 shadow-[0_0_8px_2px_rgb(250_84_33/0.7)]",
    top: "border-t-copper-500!",
    text: "text-copper-300",
  },
  cooling: {
    on: "border-ice-500 bg-ice-500 text-midnight-950 shadow-glow-ice",
    dot: "bg-ice-500 shadow-[0_0_8px_2px_rgb(25_180_242/0.7)]",
    top: "border-t-ice-500!",
    text: "text-ice-300",
  },
  "hot-water": {
    on: "border-ember-500 bg-ember-500 text-midnight-950 shadow-[0_10px_30px_-12px_rgb(255_178_31/0.7)]",
    dot: "bg-ember-500 shadow-[0_0_8px_2px_rgb(255_178_31/0.7)]",
    top: "border-t-ember-500!",
    text: "text-ember-300",
  },
};

export function CutawayExplorer({ drawing, caption }: { drawing: ReactNode; caption: ReactNode }) {
  const [active, setActive] = useState<CutawaySystemId | null>(null);
  const [three, setThree] = useState<ThreeState>({ kind: "off" });
  const groupLabelId = useId();
  const statusId = useId();
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const exploreRef = useRef<HTMLButtonElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<SceneHandle | null>(null);

  const activeSystem = cutawaySystems.find((x) => x.id === active) ?? null;

  function onGroupKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) return;
    const current = buttonRefs.current.findIndex((b) => b === document.activeElement);
    if (current < 0) return;
    e.preventDefault();
    const last = cutawaySystems.length - 1;
    let next = current;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = current === 0 ? last : current - 1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = current === last ? 0 : current + 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = last;
    buttonRefs.current[next]?.focus();
  }

  const closeThree = useCallback(() => {
    handleRef.current?.dispose();
    handleRef.current = null;
    setThree({ kind: "off" });
    // Return focus to the control that opened the 3D view.
    requestAnimationFrame(() => exploreRef.current?.focus());
  }, []);

  const loadThree = useCallback(async () => {
    setThree({ kind: "loading" });
    try {
      const mod = await import("./scene3d");
      const host = hostRef.current;
      if (!host) return;
      handleRef.current?.dispose();
      handleRef.current = mod.mountScene(host, { autoRotate: !prefersReducedMotion() });
      setThree({ kind: "ready" });
      requestAnimationFrame(() => host.focus());
    } catch {
      handleRef.current?.dispose();
      handleRef.current = null;
      setThree({
        kind: "error",
        message: "The 3D view could not load on this device. The drawing shows the same systems.",
      });
    }
  }, []);

  function onExplore() {
    if (!webglAvailable()) {
      setThree({
        kind: "error",
        message: "This browser can’t show 3D graphics, so the drawing stays in place. It shows the same systems.",
      });
      return;
    }
    if (lowPowerDevice()) {
      setThree({ kind: "confirm" });
      return;
    }
    void loadThree();
  }

  // Dispose the scene if the component unmounts with it open.
  useEffect(() => () => handleRef.current?.dispose(), []);

  function onCanvasKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const h = handleRef.current;
    if (e.key === "Escape") {
      e.preventDefault();
      closeThree();
      return;
    }
    if (!h) return;
    const step = 0.12;
    const map: Record<string, () => void> = {
      ArrowLeft: () => h.rotate(-step, 0),
      ArrowRight: () => h.rotate(step, 0),
      ArrowUp: () => h.rotate(0, -step),
      ArrowDown: () => h.rotate(0, step),
      "+": () => h.zoom(0.9),
      "=": () => h.zoom(0.9),
      "-": () => h.zoom(1.1),
      _: () => h.zoom(1.1),
    };
    const fn = map[e.key];
    if (fn) {
      e.preventDefault();
      fn();
    }
  }

  const showLayer = three.kind === "loading" || three.kind === "ready";

  return (
    <div>
      <figure className="m-0">
        <div className={s.frame} data-active={active ?? "none"}>
          {drawing}
          {showLayer ? (
            <div className={`${s.layer} on-dark bg-midnight-950/95`}>
              <div
                ref={hostRef}
                className={s.canvasHost}
                tabIndex={0}
                role="application"
                aria-roledescription="3D model"
                aria-label="3D model of the house and its equipment. Drag or use the arrow keys to rotate, plus and minus to zoom, Escape to close."
                onKeyDown={onCanvasKeyDown}
              />
              {three.kind === "loading" ? (
                <p className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-sm text-limestone-100" role="status">
                  Loading the 3D view…
                </p>
              ) : null}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-2 p-2">
                <p className="pointer-events-auto max-w-xs rounded-sm bg-midnight-900/90 px-2 py-1 text-xs text-limestone-100">
                  Drag to turn. Arrow keys rotate, + and − zoom.
                </p>
                <button
                  type="button"
                  onClick={closeThree}
                  className="pointer-events-auto inline-flex min-h-11 items-center rounded-sm border border-limestone-200 bg-midnight-900 px-4 text-sm font-semibold text-limestone-50 hover:bg-limestone-50 hover:text-midnight-950"
                >
                  Close 3D view
                </button>
              </div>
            </div>
          ) : null}
        </div>
        <figcaption className="mt-3 text-sm text-midnight-300">{caption}</figcaption>
      </figure>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
        <p id={groupLabelId} className="eyebrow text-midnight-300">
          Show a system
        </p>
        <div role="group" aria-labelledby={groupLabelId} className="flex flex-wrap gap-2" onKeyDown={onGroupKeyDown}>
          {cutawaySystems.map((sys, i) => {
            const pressed = active === sys.id;
            return (
              <button
                key={sys.id}
                ref={(el) => {
                  buttonRefs.current[i] = el;
                }}
                type="button"
                aria-pressed={pressed}
                aria-describedby={statusId}
                onClick={() => setActive(pressed ? null : sys.id)}
                className={[
                  "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-bold transition-all",
                  pressed
                    ? SYSTEM_STYLE[sys.id].on
                    : "border-white/25 bg-white/5 text-white hover:border-white/50 hover:bg-white/15",
                ].join(" ")}
              >
                <span className={`h-2 w-2 rounded-full ${SYSTEM_STYLE[sys.id].dot}`} aria-hidden="true" />
                {sys.label}
              </button>
            );
          })}
        </div>
        <button
          ref={exploreRef}
          type="button"
          onClick={onExplore}
          disabled={three.kind === "loading"}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-ice-500/50 bg-ice-500/10 px-4 text-sm font-bold text-ice-300 shadow-glow-ice transition-colors hover:bg-ice-500/20 disabled:opacity-60"
        >
          Explore in 3D
        </button>
      </div>

      <p id={statusId} className="sr-only" aria-live="polite">
        {activeSystem ? `Highlighting the ${activeSystem.label.toLowerCase()} system.` : "Showing all systems."}
      </p>

      {three.kind === "confirm" ? (
        <div className="glass-dark mt-3 rounded-sm p-3 text-sm text-white" role="status">
          <p>The 3D view can be slow on this device or connection. The drawing already shows every system.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void loadThree()}
              className="inline-flex min-h-11 items-center rounded-full border border-white/40 px-4 font-semibold text-white hover:bg-white/15"
            >
              Load 3D anyway
            </button>
            <button
              type="button"
              onClick={() => {
                setThree({ kind: "off" });
                exploreRef.current?.focus();
              }}
              className="inline-flex min-h-11 items-center rounded-full px-4 font-semibold text-copper-300 underline underline-offset-4"
            >
              Keep the drawing
            </button>
          </div>
        </div>
      ) : null}
      {three.kind === "error" ? (
        <p className="glass-dark mt-3 rounded-sm p-3 text-sm text-white" role="status">
          {three.message}
        </p>
      ) : null}

      <ol className="mt-6 grid gap-3 sm:grid-cols-3">
        {cutawaySystems.map((sys) => {
          const on = active === sys.id;
          return (
            <li
              key={sys.id}
              className={[
                "glass-dark rounded-sm border-t-2! p-4 transition-all",
                SYSTEM_STYLE[sys.id].top,
                on ? "ring-1 ring-white/30" : active ? "opacity-70" : "",
              ].join(" ")}
            >
              <p className="font-display text-xl font-bold uppercase text-white">{sys.label}</p>
              <ul className="mt-1 text-sm text-midnight-100">
                {sys.key.map((k) => (
                  <li key={k.n} className="flex gap-2">
                    <span className={`font-bold ${SYSTEM_STYLE[sys.id].text}`} aria-hidden="true">
                      {k.n}
                    </span>
                    <span>
                      <span className="sr-only">Tag {k.n}: </span>
                      {k.label}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-midnight-100">{sys.description}</p>
              <p className="mt-2 text-sm">
                <Link href={sys.href} className="inline-flex min-h-11 items-center gap-1 font-semibold text-copper-300 underline underline-offset-4 hover:decoration-2">
                  {sys.linkText}
                  <ArrowRightIcon width={16} height={16} />
                </Link>
              </p>
              {sys.secondary ? (
                <p className="text-sm">
                  <Link href={sys.secondary.href} className="inline-flex min-h-11 items-center gap-1 font-semibold text-copper-300 underline underline-offset-4 hover:decoration-2">
                    {sys.secondary.linkText}
                    <ArrowRightIcon width={16} height={16} />
                  </Link>
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
