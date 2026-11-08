import { z } from "zod";
import { PROJECT_SERVICE_CATEGORIES, PROPERTY_TYPES } from "@/config/services";
import { MAX_PHOTO_BYTES, MAX_PHOTOS, PHOTO_ACCEPT } from "@/lib/media/limits";
import { PASSWORD_MIN } from "./passwords";

/** Server-side validation for every admin Server Action input (Zod v4). */

const text = (max: number, label: string) =>
  z
    .string()
    .transform((s) => s.replace(/\r\n/g, "\n").trim())
    .pipe(z.string().max(max, `${label} must be ${max} characters or fewer.`));

const singleLine = (max: number, label: string) =>
  z
    .string()
    .transform((s) => s.replace(/\s+/g, " ").trim())
    .pipe(z.string().max(max, `${label} must be ${max} characters or fewer.`));

export const uuidSchema = z.uuid({ message: "Unknown item." });

export const fieldsSchema = z.object({
  title: singleLine(120, "Title"),
  summary: text(2000, "Short description"),
  city: singleLine(60, "City"),
  service: z.enum(PROJECT_SERVICE_CATEGORIES).or(z.literal("")),
  propertyType: z.enum(PROPERTY_TYPES).or(z.literal("")),
  featured: z.boolean(),
  seoTitle: singleLine(70, "Search title"),
  seoDescription: singleLine(200, "Search description"),
  shareImageMediaId: uuidSchema.or(z.literal("")),
});

export const gallerySchema = z
  .array(
    z.object({
      mediaId: uuidSchema,
      alt: singleLine(250, "Photo description"),
      isCover: z.boolean(),
    }),
  )
  .max(MAX_PHOTOS, `A project can have up to ${MAX_PHOTOS} photos.`)
  .refine((g) => new Set(g.map((p) => p.mediaId)).size === g.length, "A photo appears twice in the gallery.")
  .refine((g) => g.filter((p) => p.isCover).length <= 1, "Choose only one cover photo.");

export const savePayloadSchema = z.object({
  fields: fieldsSchema,
  gallery: gallerySchema,
});
export type ParsedSavePayload = z.infer<typeof savePayloadSchema>;

export const uploadDescriptorSchema = z.object({
  name: z.string().max(255).transform((s) => s.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 200)),
  size: z
    .number()
    .int()
    .positive("The photo is empty.")
    .max(MAX_PHOTO_BYTES, "Photos must be 15 MB or smaller."),
  type: z.enum(PHOTO_ACCEPT, { message: "Photos must be JPEG, PNG or WebP." }),
  /** Photos already in (or on their way into) the gallery, including this one. */
  galleryCount: z.number().int().min(1).max(MAX_PHOTOS, `A project can have up to ${MAX_PHOTOS} photos.`),
  /** Current (possibly unsaved) title, only used for a descriptive filename. */
  titleHint: z.string().max(200).optional(),
});

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ message: "Enter your email address." }).max(254));

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password.").max(200),
});

export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters.`)
      .max(128, "Use 128 characters or fewer."),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "The two passwords do not match.", path: ["confirm"] });

/** First message per field path, for form display. */
export function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
