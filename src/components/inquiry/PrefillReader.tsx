"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { parsePrefill, type InquiryPrefill } from "@/lib/inquiry/prefill";

/**
 * Reads ?intent=&service=&property=&project= on the client and hands the
 * parsed prefill to the form once. Render it inside <Suspense>: /contact is
 * prerendered, so the query string is only known in the browser. Renders
 * nothing, so the form itself stays in the static HTML and works without JS.
 */
export function PrefillReader({ onPrefill }: { onPrefill: (prefill: InquiryPrefill) => void }) {
  const params = useSearchParams();
  const query = params.toString();
  useEffect(() => {
    const prefill = parsePrefill(new URLSearchParams(query));
    if (Object.keys(prefill).length > 0) onPrefill(prefill);
    // Only re-apply when the query string itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);
  return null;
}
