"use client";

import { track as vercelTrack } from "@vercel/analytics";

/**
 * Conversion events. Properties are a closed set of non-personal values:
 * NEVER pass inquiry text, names, phone numbers, emails or postal codes.
 *
 *  call_tap          tap on any tel: link
 *  request_start     first interaction with the inquiry form
 *  lead_accepted     provider accepted the inquiry (not a sink/demo send)
 *  fallback_email    visitor opened the "Email my request" draft
 *
 * site_env separates demo/test traffic from live traffic.
 */
export type ConversionEvent = "call_tap" | "request_start" | "lead_accepted" | "fallback_email";

export interface EventProps {
  placement?: string;
  intent?: string;
  service?: string;
  property?: string;
  delivery?: string;
}

const ALLOWED_KEYS = new Set(["placement", "intent", "service", "property", "delivery"]);
const SAFE_VALUE = /^[a-z0-9-]{1,40}$/;

export function analyticsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ANALYTICS === "vercel";
}

export function trackEvent(event: ConversionEvent, props: EventProps = {}): void {
  if (!analyticsEnabled()) return;
  const clean: Record<string, string> = {
    site_env: process.env.NEXT_PUBLIC_SITE_ENV_LABEL === "live" ? "live" : "demo",
  };
  for (const [k, v] of Object.entries(props)) {
    if (ALLOWED_KEYS.has(k) && typeof v === "string" && SAFE_VALUE.test(v)) clean[k] = v;
  }
  try {
    vercelTrack(event, clean);
  } catch {
    /* analytics must never break the page */
  }
}
