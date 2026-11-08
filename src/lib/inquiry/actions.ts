"use server";

import { headers } from "next/headers";
import { business } from "@/config/business";
import { deliverInquiry, isDemo, logInquiryEvent } from "./deliver";
import { fallbackMailto } from "./format";
import { clientIp, onceForSubmission, rateLimitHit } from "./guard";
import {
  FIELD,
  firstName,
  parseInquiry,
  readValues,
  type InquiryState,
  type InquiryValues,
  type ValidInquiry,
} from "./schema";
import { checkToken, issueToken } from "./token";

/**
 * Server Actions for the /contact inquiry form. Works without JavaScript
 * (progressive enhancement through useActionState); the timing token and
 * submission id are only present when JS ran.
 */

/** Signed timing token, fetched by the client on mount. null = check disabled. */
export async function getFormToken(): Promise<string | null> {
  return issueToken();
}

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v : "";
}

async function deliver(inquiry: ValidInquiry, values: InquiryValues, submissionId: string): Promise<InquiryState> {
  const demo = isDemo();
  const outcome = await deliverInquiry(inquiry, submissionId);
  if (outcome.ok) {
    return {
      status: "sent",
      firstName: firstName(inquiry.name),
      channel: inquiry.channel,
      demo,
      delivery: outcome.via,
      providerAccepted: outcome.via === "resend",
      intent: inquiry.intent,
      service: inquiry.service,
      property: inquiry.property,
    };
  }
  return {
    status: "fallback",
    values,
    demo,
    mailto: fallbackMailto(inquiry, values, demo),
    intent: inquiry.intent,
    service: inquiry.service,
  };
}

export async function submitInquiry(_prev: InquiryState, formData: FormData): Promise<InquiryState> {
  const values = readValues(formData);
  const honeypot = str(formData.get(FIELD.honeypot)).trim();
  const token = str(formData.get(FIELD.token)).trim();
  const submissionId = str(formData.get(FIELD.submissionId)).trim();

  const parsed = parseInquiry(values);

  // Honeypot filled: pretend success, drop silently.
  if (honeypot) {
    logInquiryEvent("dropped", "honeypot");
    return {
      status: "sent",
      firstName: parsed.ok ? firstName(parsed.data.name) : "",
      channel: parsed.ok ? parsed.data.channel : "phone",
      demo: isDemo(),
      delivery: "dropped",
      providerAccepted: false,
      intent: parsed.ok ? parsed.data.intent : "question",
      service: parsed.ok ? parsed.data.service : "not-sure",
      property: parsed.ok ? parsed.data.property : "residential",
    };
  }

  if (!parsed.ok) return { status: "invalid", errors: parsed.errors, values };

  const timing = checkToken(token);
  if (timing === "too_fast") {
    logInquiryEvent("rejected", "too_fast");
    return {
      status: "invalid",
      errors: {},
      values,
      message: "That was quicker than we expected. Please check your details and select “Send request” again.",
    };
  }
  if (timing === "expired" || timing === "invalid") {
    logInquiryEvent("rejected", `token_${timing}`);
    return {
      status: "invalid",
      errors: {},
      values,
      message:
        "This form was open for a long time, so we need to refresh it. Your details are still here: please select “Send request” again.",
      freshToken: issueToken() ?? undefined,
    };
  }
  // "missing" (no JavaScript) and "unchecked" (no secret) are accepted:
  // the honeypot and the rate limit still apply.

  return onceForSubmission(
    submissionId,
    async (): Promise<InquiryState> => {
      const { allowed } = await rateLimitHit(clientIp(await headers()));
      if (!allowed) {
        logInquiryEvent("rejected", "rate_limited");
        return {
          status: "rate_limited",
          values,
          message: `We’ve received several requests from your connection in the last few minutes, so this one wasn’t sent. Please try again later, or call ${business.founder.firstName} at ${business.phone.display}.`,
        };
      }
      return deliver(parsed.data, values, submissionId);
    },
    // Only cache accepted results; a retry after a fallback or rate limit runs again.
    (result) => result.status === "sent",
  );
}
