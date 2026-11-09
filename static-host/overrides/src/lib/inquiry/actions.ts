/**
 * STATIC BUILD ONLY. `npm run build:static` overlays this file on
 * src/lib/inquiry/actions.ts in the temporary build copy; the repository's
 * real Server Action (Resend delivery, rate limiting, timing tokens) is
 * untouched and still used by the normal server build.
 *
 * Instead of a Server Action, the form validates in the browser (same schema
 * as the server) and posts JSON to the PHP handler (static-host/contact.php)
 * on the hosting account. The visitor never leaves the page; if the handler
 * cannot be reached the form shows the usual "Email my request" fallback.
 */
import { business } from "@/config/business";
import { fallbackMailto, inquirySubject, inquiryText } from "@/lib/inquiry/format";
import { FIELD, firstName, parseInquiry, readValues, type InquiryState } from "@/lib/inquiry/schema";

const ENDPOINT = process.env.NEXT_PUBLIC_FORM_ENDPOINT || "/contact.php";
const DEMO = process.env.NEXT_PUBLIC_SITE_DEMO !== "0";
const MIN_FILL_MS = 2500;
const TIMEOUT_MS = 15000;

/** Timing "token": when the form opened. The PHP handler rejects instant posts. */
export async function getFormToken(): Promise<string | null> {
  return String(Date.now());
}

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v : "";
}

export async function submitInquiry(_prev: InquiryState, formData: FormData): Promise<InquiryState> {
  const values = readValues(formData);
  const honeypot = str(formData.get(FIELD.honeypot)).trim();
  const token = str(formData.get(FIELD.token)).trim();
  const submissionId = str(formData.get(FIELD.submissionId)).trim();
  const parsed = parseInquiry(values);

  // Honeypot filled: pretend success and drop silently.
  if (honeypot) {
    return {
      status: "sent",
      firstName: parsed.ok ? firstName(parsed.data.name) : "",
      channel: parsed.ok ? parsed.data.channel : "phone",
      demo: DEMO,
      delivery: "dropped",
      providerAccepted: false,
      intent: parsed.ok ? parsed.data.intent : "question",
      service: parsed.ok ? parsed.data.service : "not-sure",
      property: parsed.ok ? parsed.data.property : "residential",
    };
  }

  if (!parsed.ok) return { status: "invalid", errors: parsed.errors, values };

  const started = Number(token);
  if (Number.isFinite(started) && started > 0 && Date.now() - started < MIN_FILL_MS) {
    return {
      status: "invalid",
      errors: {},
      values,
      message: "That was quicker than we expected. Please check your details and select “Send request” again.",
    };
  }

  const inquiry = parsed.data;
  const fallback = (): InquiryState => ({
    status: "fallback",
    values,
    demo: DEMO,
    mailto: fallbackMailto(inquiry, values, DEMO),
    intent: inquiry.intent,
    service: inquiry.service,
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: inquiry.name,
        subject: inquirySubject(inquiry, DEMO ? "[DEMO] " : ""),
        body: inquiryText(inquiry, { demo: DEMO, submissionId: submissionId || undefined }),
        replyTo: inquiry.channel === "email" && inquiry.email ? inquiry.email : "",
        started: Number.isFinite(started) ? started : 0,
        submissionId,
        website: honeypot,
      }),
      signal: controller.signal,
    });
    if (res.status === 429) {
      return {
        status: "rate_limited",
        values,
        message: `We’ve received several requests from your connection in the last few minutes, so this one wasn’t sent. Please try again later, or call ${business.founder.firstName} at ${business.phone.display}.`,
      };
    }
    const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    if (!res.ok || !data?.ok) return fallback();
    return {
      status: "sent",
      firstName: firstName(inquiry.name),
      channel: inquiry.channel,
      demo: DEMO,
      delivery: "email",
      providerAccepted: true,
      intent: inquiry.intent,
      service: inquiry.service,
      property: inquiry.property,
    };
  } catch {
    return fallback();
  } finally {
    clearTimeout(timer);
  }
}
