"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { business } from "@/config/business";
import { inquiryHref } from "@/lib/inquiry/prefill";
import { buttonClasses } from "@/components/ui/ButtonLink";
import { CallLink } from "@/components/ui/CallLink";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { primaryNav } from "./nav";

/**
 * Disclosure-pattern mobile menu. Without JavaScript the <noscript> footer
 * navigation and every page's links remain available.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="xl:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-sm border border-midnight-900/30 px-3 text-sm font-semibold text-midnight-900"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
        <span>{open ? "Close" : "Menu"}</span>
      </button>
      <div
        id={panelId}
        ref={panelRef}
        hidden={!open}
        className="absolute inset-x-0 top-full z-40 max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-limestone-300 bg-limestone-50 shadow-lg"
      >
        <nav aria-label="Main" className="container-page py-4">
          <ul className="divide-y divide-limestone-200">
            {primaryNav.map((item) => {
              const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    className={`flex min-h-12 items-center font-display text-2xl uppercase tracking-wide ${current ? "text-copper-700" : "text-midnight-900"}`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 grid gap-3 pb-2">
            <CallLink placement="mobile-menu" />
            <Link href={inquiryHref({ intent: "service" })} className={buttonClasses("secondary")}>
              Request service
            </Link>
            <a href={`mailto:${business.email}`} className="text-center text-sm text-ink-muted underline underline-offset-4">
              {business.email}
            </a>
          </div>
        </nav>
      </div>
    </div>
  );
}
