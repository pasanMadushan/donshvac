import { business, mailtoHref } from "@/config/business";
import { inquiryIntentLabels, inquiryServiceLabels } from "./prefill";
import {
  contactChannelLabels,
  propertyKindLabels,
  type InquiryValues,
  type ValidInquiry,
} from "./schema";

/**
 * Message formatting for the email provider and the "Email my request"
 * fallback draft. Pure functions; no secrets.
 */

interface Row {
  label: string;
  value: string;
}

function rows(i: ValidInquiry): Row[] {
  const out: Row[] = [
    { label: "Request", value: inquiryIntentLabels[i.intent] },
    { label: "Name", value: i.name },
    { label: "Preferred contact", value: contactChannelLabels[i.channel] },
    { label: "Phone", value: i.phone || "Not given" },
    { label: "Email", value: i.email || "Not given" },
    { label: "City or postal code area", value: i.location },
    { label: "Equipment or service", value: inquiryServiceLabels[i.service] },
    { label: "Property type", value: propertyKindLabels[i.property] },
  ];
  if (i.project) out.push({ label: "Similar project", value: i.project });
  if (i.commercial) {
    out.push(
      { label: "Building type", value: i.commercial.building || "Not given" },
      { label: "Equipment or system", value: i.commercial.equipment || "Not given" },
      { label: "Access notes", value: i.commercial.access || "Not given" },
      { label: "Timing or scheduling window", value: i.commercial.timing || "Not given" },
    );
  }
  return out;
}

export function inquirySubject(i: ValidInquiry, prefix = ""): string {
  const subject = `Website request: ${inquiryIntentLabels[i.intent]} – ${inquiryServiceLabels[i.service]} – ${i.location}`;
  return `${prefix}${subject}`.replace(/[\r\n]+/g, " ").slice(0, 200);
}

export function inquiryText(i: ValidInquiry, opts: { demo: boolean; submissionId?: string }): string {
  const lines: string[] = [];
  if (opts.demo) {
    lines.push("DEMO / TEST SUBMISSION from the demo website. Not a real customer request.", "");
  }
  for (const r of rows(i)) lines.push(`${r.label}: ${r.value}`);
  lines.push("", "What’s happening:", i.description);
  if (opts.submissionId) lines.push("", `Reference: ${opts.submissionId}`);
  return lines.join("\n");
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function inquiryHtml(i: ValidInquiry, opts: { demo: boolean; submissionId?: string }): string {
  const demo = opts.demo
    ? `<p style="padding:8px 12px;background:#f6e2d1;border:1px solid #8f4318;"><strong>DEMO / TEST SUBMISSION</strong> from the demo website. Not a real customer request.</p>`
    : "";
  const table = rows(i)
    .map(
      (r) =>
        `<tr><th align="left" valign="top" style="padding:4px 12px 4px 0;">${escapeHtml(r.label)}</th><td style="padding:4px 0;">${escapeHtml(r.value)}</td></tr>`,
    )
    .join("");
  const description = escapeHtml(i.description).replace(/\r?\n/g, "<br>");
  const ref = opts.submissionId ? `<p style="color:#4a4f57;">Reference: ${escapeHtml(opts.submissionId)}</p>` : "";
  return `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#1f2328;line-height:1.5;">${demo}<h1 style="font-size:18px;">New website request</h1><table role="presentation" cellspacing="0" cellpadding="0">${table}</table><h2 style="font-size:16px;margin-top:16px;">What’s happening</h2><p>${description}</p>${ref}</body></html>`;
}

/** Plain text draft for the visitor's own mail client (unvalidated values). */
function draftFromValues(v: InquiryValues): string {
  const intent = inquiryIntentLabels[v.intent as keyof typeof inquiryIntentLabels] ?? v.intent;
  const service = inquiryServiceLabels[v.service as keyof typeof inquiryServiceLabels] ?? v.service;
  const channel = contactChannelLabels[v.channel as keyof typeof contactChannelLabels] ?? v.channel;
  const property = propertyKindLabels[v.property as keyof typeof propertyKindLabels] ?? v.property;
  const lines = [
    `Hi ${business.founder.firstName},`,
    "",
    v.description.trim(),
    "",
    `Request: ${intent || "Not given"}`,
    `Equipment or service: ${service || "Not given"}`,
    `Property type: ${property || "Not given"}`,
    `City or postal code area: ${v.location.trim() || "Not given"}`,
    `Preferred contact: ${channel || "Not given"}`,
    `Name: ${v.name.trim()}`,
  ];
  if (v.phone.trim()) lines.push(`Phone: ${v.phone.trim()}`);
  if (v.email.trim()) lines.push(`Email: ${v.email.trim()}`);
  if (v.project.trim()) lines.push(`Similar project: ${v.project.trim()}`);
  if (v.property === "commercial") {
    if (v.commercialBuilding.trim()) lines.push(`Building type: ${v.commercialBuilding.trim()}`);
    if (v.commercialEquipment.trim()) lines.push(`Equipment or system: ${v.commercialEquipment.trim()}`);
    if (v.commercialAccess.trim()) lines.push(`Access notes: ${v.commercialAccess.trim()}`);
    if (v.commercialTiming.trim()) lines.push(`Timing: ${v.commercialTiming.trim()}`);
  }
  return lines.join("\n");
}

/** mailto: draft addressed to the business inbox, for the visitor to send. */
export function fallbackMailto(i: ValidInquiry, values: InquiryValues, demo: boolean): string {
  const subject = inquirySubject(i, demo ? "[DEMO TEST] " : "");
  return mailtoHref(subject, draftFromValues(values), business.email);
}
