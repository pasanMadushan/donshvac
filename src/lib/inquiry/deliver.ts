import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Resend } from "resend";
import { sitePolicy } from "@/config/site";
import { inquiryHtml, inquirySubject, inquiryText } from "./format";
import type { ValidInquiry } from "./schema";

/**
 * Inquiry delivery. Never defaults to sending real email:
 *
 *   INQUIRY_DELIVERY=resend    send with Resend (RESEND_API_KEY, INQUIRY_FROM,
 *                              INQUIRY_TO in live mode, INQUIRY_DEMO_TO in demo)
 *   INQUIRY_DELIVERY=sink      local/demo test sink (file in .data/ outside
 *                              production builds; nothing written in production)
 *   INQUIRY_DELIVERY=disabled  nothing is sent; visitor gets the fallback
 *   INQUIRY_DELIVERY=fail      simulates a provider failure (fallback)
 *   unset                      "sink" in demo mode, "disabled" in live mode
 *
 * Logs contain only mode, outcome and an error code — never inquiry content.
 */

export type DeliveryMode = "resend" | "sink" | "disabled" | "fail";

export type DeliveryOutcome =
  | { ok: true; via: "resend"; id: string }
  | { ok: true; via: "sink"; stored: "file" | "none" }
  | { ok: false; code: string };

export function isDemo(): boolean {
  return !sitePolicy.indexable;
}

export function deliveryMode(env: Record<string, string | undefined> = process.env): DeliveryMode {
  const raw = env.INQUIRY_DELIVERY?.trim().toLowerCase();
  if (raw === "resend" || raw === "sink" || raw === "disabled" || raw === "fail") return raw;
  return sitePolicy.indexable ? "disabled" : "sink";
}

function log(mode: DeliveryMode | "none", outcome: string, code?: string): void {
  const entry = { event: "inquiry_delivery", mode, outcome, ...(code ? { code } : {}) };
  if (outcome === "delivered" || outcome === "dropped") console.info(JSON.stringify(entry));
  else console.warn(JSON.stringify(entry));
}

/** Log helper for non-delivery outcomes (rate limit, timing, honeypot). */
export function logInquiryEvent(outcome: string, code?: string): void {
  log("none", outcome, code);
}

async function sendWithResend(inquiry: ValidInquiry, submissionId: string, demo: boolean): Promise<DeliveryOutcome> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.INQUIRY_FROM?.trim();
  // Demo mode ALWAYS uses the demo inbox — never Don's inbox, never the visitor.
  const to = (demo ? process.env.INQUIRY_DEMO_TO : process.env.INQUIRY_TO)?.trim();
  if (!apiKey) return { ok: false, code: "missing_api_key" };
  if (!from) return { ok: false, code: "missing_from" };
  if (!to || !to.includes("@")) return { ok: false, code: demo ? "missing_demo_to" : "missing_to" };

  const resend = new Resend(apiKey);
  const opts = { demo, submissionId: submissionId || undefined };
  try {
    const { data, error } = await resend.emails.send(
      {
        from,
        to,
        subject: inquirySubject(inquiry, demo ? "[DEMO] " : ""),
        text: inquiryText(inquiry, opts),
        html: inquiryHtml(inquiry, opts),
        // Reply goes to the visitor only when they asked for email and it validated.
        ...(inquiry.channel === "email" && inquiry.email ? { replyTo: inquiry.email } : {}),
        tags: [
          { name: "source", value: "website" },
          { name: "env", value: demo ? "demo" : "live" },
        ],
      },
      submissionId ? { idempotencyKey: `inquiry-${submissionId}` } : undefined,
    );
    if (error || !data?.id) return { ok: false, code: error ? `provider_${error.name}` : "provider_no_id" };
    return { ok: true, via: "resend", id: data.id };
  } catch {
    return { ok: false, code: "provider_exception" };
  }
}

async function writeSink(inquiry: ValidInquiry, submissionId: string, demo: boolean): Promise<DeliveryOutcome> {
  // Production builds (e.g. a Vercel demo without Resend) never write files.
  if (process.env.NODE_ENV === "production") return { ok: true, via: "sink", stored: "none" };
  try {
    const dir = path.join(process.cwd(), ".data", "inquiry-sink");
    await mkdir(dir, { recursive: true });
    const id = (submissionId || Math.random().toString(36).slice(2, 12)).replace(/[^A-Za-z0-9-]/g, "");
    const file = path.join(dir, `${new Date().toISOString().replace(/[:.]/g, "-")}-${id}.json`);
    const record = {
      receivedAt: new Date().toISOString(),
      demo,
      submissionId: submissionId || null,
      subject: inquirySubject(inquiry, demo ? "[DEMO] " : ""),
      inquiry,
    };
    await writeFile(file, `${JSON.stringify(record, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
    return { ok: true, via: "sink", stored: "file" };
  } catch {
    return { ok: false, code: "sink_write_failed" };
  }
}

export async function deliverInquiry(inquiry: ValidInquiry, submissionId: string): Promise<DeliveryOutcome> {
  const mode = deliveryMode();
  const demo = isDemo();
  let outcome: DeliveryOutcome;
  switch (mode) {
    case "resend":
      outcome = await sendWithResend(inquiry, submissionId, demo);
      break;
    case "sink":
      // A live site must never silently swallow real customer requests.
      outcome = demo ? await writeSink(inquiry, submissionId, demo) : { ok: false, code: "sink_in_live_mode" };
      break;
    case "fail":
      outcome = { ok: false, code: "simulated_failure" };
      break;
    case "disabled":
    default:
      outcome = { ok: false, code: "delivery_disabled" };
  }
  log(mode, outcome.ok ? "delivered" : "fallback", outcome.ok ? undefined : outcome.code);
  return outcome;
}
