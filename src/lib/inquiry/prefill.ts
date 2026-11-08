import { SERVICE_SLUGS, type ServiceSlug } from "@/config/services";

/**
 * Contract for prefilled inquiry links. Every "Request service",
 * "Request an estimate" and commercial CTA links to /contact with these
 * parameters; the form reads them client-side so /contact stays static and
 * its canonical stays clean (/contact).
 */
export const INQUIRY_INTENTS = ["service", "estimate", "commercial", "question"] as const;
export type InquiryIntent = (typeof INQUIRY_INTENTS)[number];

export const INQUIRY_SERVICES = [...SERVICE_SLUGS, "ductwork", "thermostats", "gas-lines", "not-sure"] as const;
export type InquiryService = (typeof INQUIRY_SERVICES)[number];

export const inquiryServiceLabels: Record<InquiryService, string> = {
  furnaces: "Furnace",
  "air-conditioning": "Air conditioning",
  "water-heaters": "Water heater",
  "heat-pumps": "Heat pump",
  ductwork: "Ductwork or airflow",
  thermostats: "Thermostat",
  "gas-lines": "Gas line",
  "not-sure": "I’m not sure",
};

export const inquiryIntentLabels: Record<InquiryIntent, string> = {
  service: "Repair or service visit",
  estimate: "Estimate for new or replacement equipment",
  commercial: "Commercial property",
  question: "General question",
};

export interface InquiryPrefill {
  intent?: InquiryIntent;
  service?: InquiryService | ServiceSlug;
  property?: "residential" | "commercial";
  /** Project slug for "Ask about a similar project". */
  project?: string;
}

export const INQUIRY_FORM_ANCHOR = "request";

export function inquiryHref(prefill: InquiryPrefill = {}): string {
  const params = new URLSearchParams();
  if (prefill.intent) params.set("intent", prefill.intent);
  if (prefill.service) params.set("service", prefill.service);
  if (prefill.property) params.set("property", prefill.property);
  if (prefill.project) params.set("project", prefill.project);
  const q = params.toString();
  return `/contact${q ? `?${q}` : ""}#${INQUIRY_FORM_ANCHOR}`;
}

export function parsePrefill(params: URLSearchParams): InquiryPrefill {
  const intent = params.get("intent");
  const service = params.get("service");
  const property = params.get("property");
  const project = params.get("project");
  const out: InquiryPrefill = {};
  if ((INQUIRY_INTENTS as readonly string[]).includes(intent ?? "")) out.intent = intent as InquiryIntent;
  if ((INQUIRY_SERVICES as readonly string[]).includes(service ?? "")) out.service = service as InquiryService;
  if (property === "residential" || property === "commercial") out.property = property;
  if (project && /^[a-z0-9-]{3,90}$/.test(project)) out.project = project;
  if (out.intent === "commercial") out.property = "commercial";
  return out;
}
