"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { inquiryHref } from "@/lib/inquiry/prefill";
import { buttonClasses } from "@/components/ui/ButtonLink";
import { CallLink } from "@/components/ui/CallLink";

/**
 * Fixed call/request bar for small screens. Respects the safe area, reserves
 * its own space (body padding in globals.css), drops the request button on
 * /contact, and hides while a form field has focus so it never sits over the
 * on-screen keyboard or the inquiry form.
 */
export function MobileActionBar() {
  const pathname = usePathname();
  const [fieldFocused, setFieldFocused] = useState(false);
  const onContact = pathname === "/contact";

  useEffect(() => {
    const isField = (t: EventTarget | null) =>
      t instanceof HTMLElement && t.matches("input, select, textarea, [contenteditable='true']");
    const onIn = (e: FocusEvent) => setFieldFocused(isField(e.target));
    const onOut = () => setFieldFocused(false);
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    return () => {
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
    };
  }, []);

  return (
    <div
      data-print-hidden
      data-mobile-action-bar
      inert={fieldFocused}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-midnight-700 bg-midnight-900 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-transform md:hidden ${fieldFocused ? "translate-y-full" : ""}`}
    >
      <div className={`mx-auto grid max-w-md gap-2 ${onContact ? "grid-cols-1" : "grid-cols-2"}`}>
        <CallLink placement="mobile-bar" variant="primary-on-dark" showNumber={onContact} className="min-h-12! px-3!" />
        {onContact ? null : (
          <Link href={inquiryHref({ intent: "service" })} className={buttonClasses("secondary-on-dark", "min-h-12! px-3!")}>
            Request service
          </Link>
        )}
      </div>
    </div>
  );
}
