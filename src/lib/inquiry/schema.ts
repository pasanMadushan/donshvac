import { z } from "zod";
import {
  INQUIRY_INTENTS,
  INQUIRY_SERVICES,
  inquiryIntentLabels,
  inquiryServiceLabels,
  type InquiryIntent,
  type InquiryService,
} from "./prefill";

/**
 * Shared inquiry contract: field names, limits, validation and the
 * serialisable action state. Safe to import from client and server code
 * (no secrets, no Node APIs).
 */

export const CONTACT_CHANNELS = ["phone", "text", "email"] as const;
export type ContactChannel = (typeof CONTACT_CHANNELS)[number];

export const contactChannelLabels: Record<ContactChannel, string> = {
  phone: "Phone call",
  text: "Text message",
  email: "Email",
};

/** How the success message refers to each channel ("Don will contact you by …"). */
export const contactChannelPhrases: Record<ContactChannel, string> = {
  phone: "phone",
  text: "text message",
  email: "email",
};

export const PROPERTY_KINDS = ["residential", "commercial"] as const;
export type PropertyKind = (typeof PROPERTY_KINDS)[number];

export const propertyKindLabels: Record<PropertyKind, string> = {
  residential: "Residential",
  commercial: "Commercial",
};

export const LIMITS = {
  name: 80,
  location: 40,
  descriptionMin: 10,
  description: 1500,
  email: 254,
  phone: 25,
  commercial: 300,
} as const;

/** Form field names. The honeypot uses a plausible name on purpose. */
export const FIELD = {
  intent: "intent",
  name: "name",
  channel: "channel",
  phone: "phone",
  email: "email",
  location: "location",
  service: "service",
  property: "property",
  description: "description",
  commercialBuilding: "commercial_building",
  commercialEquipment: "commercial_equipment",
  commercialAccess: "commercial_access",
  commercialTiming: "commercial_timing",
  project: "project",
  honeypot: "company_website",
  token: "form_token",
  submissionId: "submission_id",
} as const;

export type InquiryFieldName =
  | "intent"
  | "name"
  | "channel"
  | "phone"
  | "email"
  | "location"
  | "service"
  | "property"
  | "description"
  | "commercialBuilding"
  | "commercialEquipment"
  | "commercialAccess"
  | "commercialTiming"
  | "project";

/** Order used by the error summary (matches the visual order of the form). */
export const FIELD_ORDER: readonly InquiryFieldName[] = [
  "intent",
  "name",
  "channel",
  "phone",
  "email",
  "location",
  "service",
  "property",
  "description",
  "commercialBuilding",
  "commercialEquipment",
  "commercialAccess",
  "commercialTiming",
  "project",
];

/** DOM id for each field's focus target (used by the error summary links). */
export function fieldId(field: InquiryFieldName): string {
  switch (field) {
    case "intent":
      return "inquiry-intent-service";
    case "channel":
      return "inquiry-channel-phone";
    case "property":
      return "inquiry-property-residential";
    default:
      return `inquiry-${field}`;
  }
}

/** Raw, unvalidated string values exactly as submitted (re-rendered on error). */
export type InquiryValues = Record<InquiryFieldName, string>;

export const EMPTY_VALUES: InquiryValues = {
  intent: "",
  name: "",
  channel: "",
  phone: "",
  email: "",
  location: "",
  service: "",
  property: "",
  description: "",
  commercialBuilding: "",
  commercialEquipment: "",
  commercialAccess: "",
  commercialTiming: "",
  project: "",
};

export type InquiryFieldErrors = Partial<Record<InquiryFieldName, string>>;

/* ------------------------------------------------------------ validators */

const FULL_POSTAL_CODE = /\b[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][\s-]?\d[ABCEGHJ-NPRSTV-Z]\d\b/i;
const PROJECT_SLUG = /^[a-z0-9-]{3,90}$/;

/**
 * North American (NANP) number: 10 digits, optional leading +1 / 1,
 * punctuation allowed. Returns "647-719-7319" style or null.
 */
export function normalisePhone(raw: string): string | null {
  const value = raw.trim();
  if (!value || !/^[+\d\s().\-]+$/.test(value)) return null;
  let digits = value.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  if (digits.length !== 10) return null;
  // Area code and exchange cannot start with 0 or 1.
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(digits)) return null;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function containsFullPostalCode(value: string): boolean {
  return FULL_POSTAL_CODE.test(value);
}

const emailShape = z.email({ error: "Enter an email address like name@example.com." });

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be ${max} characters or fewer.`);

export const inquirySchema = z
  .object({
    intent: z.enum(INQUIRY_INTENTS, { error: "Choose what you need help with." }),
    name: z
      .string()
      .trim()
      .min(1, "Enter your name.")
      .max(LIMITS.name, `Your name must be ${LIMITS.name} characters or fewer.`),
    channel: z.enum(CONTACT_CHANNELS, { error: "Choose how Don should contact you." }),
    phone: z.string().trim().max(LIMITS.phone, "Enter a 10-digit phone number, like 647-555-0123."),
    email: z.string().trim().max(LIMITS.email, "Your email address is too long."),
    location: z
      .string()
      .trim()
      .min(1, "Enter your city, or the first three characters of your postal code.")
      .max(
        LIMITS.location,
        `Your city or postal code area must be ${LIMITS.location} characters or fewer.`,
      )
      .refine((v) => !containsFullPostalCode(v), {
        message:
          "Please enter only the first three characters of your postal code (for example L6P), or just your city.",
      }),
    service: z.enum(INQUIRY_SERVICES, { error: "Choose the equipment or service, or “I’m not sure”." }),
    property: z.enum(PROPERTY_KINDS, { error: "Choose residential or commercial." }),
    description: z
      .string()
      .trim()
      .min(
        LIMITS.descriptionMin,
        `Describe what’s happening in at least ${LIMITS.descriptionMin} characters.`,
      )
      .max(LIMITS.description, `Keep your description to ${LIMITS.description} characters or fewer.`),
    commercialBuilding: optionalText(LIMITS.commercial, "Property or building type"),
    commercialEquipment: optionalText(LIMITS.commercial, "Equipment or system"),
    commercialAccess: optionalText(LIMITS.commercial, "Access notes"),
    commercialTiming: optionalText(LIMITS.commercial, "Timing"),
    project: z
      .string()
      .trim()
      .refine((v) => v === "" || PROJECT_SLUG.test(v), { message: "The project reference is not valid." }),
  })
  .superRefine((data, ctx) => {
    if (data.channel === "phone" || data.channel === "text") {
      if (!data.phone) {
        ctx.addIssue({
          code: "custom",
          path: ["phone"],
          message:
            data.channel === "text"
              ? "Enter a mobile number so Don can text you."
              : "Enter a phone number so Don can call you.",
        });
      } else if (!normalisePhone(data.phone)) {
        ctx.addIssue({
          code: "custom",
          path: ["phone"],
          message: "Enter a 10-digit North American phone number, like 647-555-0123.",
        });
      }
    } else if (data.phone && !normalisePhone(data.phone)) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Enter a 10-digit North American phone number, like 647-555-0123, or leave it blank.",
      });
    }
    if (data.channel === "email") {
      if (!data.email) {
        ctx.addIssue({ code: "custom", path: ["email"], message: "Enter an email address so Don can reply." });
      } else if (!emailShape.safeParse(data.email).success) {
        ctx.addIssue({ code: "custom", path: ["email"], message: "Enter an email address like name@example.com." });
      }
    } else if (data.email && !emailShape.safeParse(data.email).success) {
      ctx.addIssue({
        code: "custom",
        path: ["email"],
        message: "Enter an email address like name@example.com, or leave it blank.",
      });
    }
  });

export interface ValidInquiry {
  intent: InquiryIntent;
  name: string;
  channel: ContactChannel;
  /** Normalised "647-555-0123" or "" when not given. */
  phone: string;
  /** Validated address or "" when not given. */
  email: string;
  location: string;
  service: InquiryService;
  property: PropertyKind;
  description: string;
  commercial: null | { building: string; equipment: string; access: string; timing: string };
  project: string;
}

export type ParseResult =
  | { ok: true; data: ValidInquiry; values: InquiryValues }
  | { ok: false; errors: InquiryFieldErrors; values: InquiryValues };

function str(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v : "";
}

/** Read the raw values from a FormData (never trusts types). */
export function readValues(formData: FormData): InquiryValues {
  const values = { ...EMPTY_VALUES };
  for (const key of Object.keys(EMPTY_VALUES) as InquiryFieldName[]) {
    const name = FIELD[key];
    // Bound what we echo back so an oversized post cannot bloat the response.
    values[key] = str(formData.get(name)).slice(0, 2000);
  }
  return values;
}

export function parseInquiry(values: InquiryValues): ParseResult {
  const result = inquirySchema.safeParse(values);
  if (!result.success) {
    const errors: InquiryFieldErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && key in EMPTY_VALUES && !errors[key as InquiryFieldName]) {
        errors[key as InquiryFieldName] = issue.message;
      }
    }
    return { ok: false, errors, values };
  }
  const d = result.data;
  const commercial =
    d.property === "commercial" &&
    (d.commercialBuilding || d.commercialEquipment || d.commercialAccess || d.commercialTiming)
      ? {
          building: d.commercialBuilding,
          equipment: d.commercialEquipment,
          access: d.commercialAccess,
          timing: d.commercialTiming,
        }
      : null;
  return {
    ok: true,
    values,
    data: {
      intent: d.intent,
      name: d.name,
      channel: d.channel,
      phone: d.phone ? (normalisePhone(d.phone) ?? "") : "",
      email: d.email,
      location: d.location,
      service: d.service,
      property: d.property,
      description: d.description,
      commercial,
      project: d.project,
    },
  };
}

export function firstName(name: string): string {
  const first = name.trim().split(/\s+/)[0] ?? "";
  return first.slice(0, 40);
}

/* ---------------------------------------------------------- action state */

export type InquiryState =
  | { status: "idle" }
  | {
      status: "invalid";
      errors: InquiryFieldErrors;
      values: InquiryValues;
      /** Form-level message (timing token / duplicate protection). */
      message?: string;
      /** A fresh timing token when the old one expired or was invalid. */
      freshToken?: string;
    }
  | { status: "rate_limited"; values: InquiryValues; message: string }
  | {
      status: "sent";
      firstName: string;
      channel: ContactChannel;
      demo: boolean;
      /**
       * "resend" = provider accepted; "email" = static-site PHP handler
       * accepted it; "sink" = demo/test sink; "dropped" = honeypot.
       */
      delivery: "resend" | "email" | "sink" | "dropped";
      /** Only true when the email provider accepted the message. */
      providerAccepted: boolean;
      intent: InquiryIntent;
      service: InquiryService;
      property: PropertyKind;
    }
  | {
      status: "fallback";
      values: InquiryValues;
      demo: boolean;
      mailto: string;
      intent: InquiryIntent;
      service: InquiryService;
    };

export const INITIAL_INQUIRY_STATE: InquiryState = { status: "idle" };

export { inquiryIntentLabels, inquiryServiceLabels };
