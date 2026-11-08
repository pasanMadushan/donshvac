import "server-only";
import sharp, { type Metadata, type OutputInfo } from "sharp";
import {
  DERIVATIVE_WIDTHS,
  MAX_MEGAPIXELS,
  MAX_PHOTO_BYTES,
  MAX_SIDE,
  MIN_SHORT_SIDE,
  WEBP_QUALITY,
} from "./limits";

/**
 * Validates an uploaded original by its REAL content (not the declared type)
 * and produces metadata-free WebP derivatives. sharp drops EXIF/GPS/XMP by
 * default; withMetadata()/keepMetadata() are deliberately never called.
 */

const ALLOWED_FORMATS = new Map<string, string>([
  ["jpeg", "image/jpeg"],
  ["png", "image/png"],
  ["webp", "image/webp"],
]);

const PIXEL_LIMIT = MAX_MEGAPIXELS * 1_000_000;

export class PhotoRejectedError extends Error {
  constructor(public readonly userMessage: string) {
    super("photo rejected");
  }
}

export interface InspectedPhoto {
  mime: string;
  bytes: number;
  /** Dimensions after EXIF orientation is applied. */
  width: number;
  height: number;
}

export interface Derivative {
  width: number;
  height: number;
  buffer: Buffer;
}

export async function inspectPhoto(input: Buffer): Promise<InspectedPhoto> {
  if (input.byteLength > MAX_PHOTO_BYTES) {
    throw new PhotoRejectedError("This photo is larger than 15 MB. Choose a smaller photo.");
  }
  let meta: Metadata;
  try {
    // Reading metadata only parses headers; no pixels are decoded here.
    meta = await sharp(input, { limitInputPixels: false, failOn: "error" }).metadata();
  } catch {
    throw new PhotoRejectedError("This file could not be read as a photo. Try exporting it again as a JPEG.");
  }
  const mime = ALLOWED_FORMATS.get(meta.format ?? "");
  if (!mime) {
    throw new PhotoRejectedError(
      "This file is not a JPEG, PNG or WebP photo (it may be HEIC or another format). Export it as a JPEG and try again.",
    );
  }
  if ((meta.pages ?? 1) > 1) {
    throw new PhotoRejectedError("Animated images are not supported. Choose a still photo.");
  }
  const width = meta.autoOrient?.width ?? meta.width;
  const height = meta.autoOrient?.height ?? meta.height;
  if (!width || !height) {
    throw new PhotoRejectedError("This photo’s size could not be read. Try exporting it again as a JPEG.");
  }
  if (width > MAX_SIDE || height > MAX_SIDE) {
    throw new PhotoRejectedError(`This photo is ${width} × ${height} px. Photos can be at most ${MAX_SIDE} px on each side.`);
  }
  if (width * height > PIXEL_LIMIT) {
    throw new PhotoRejectedError(`This photo has more than ${MAX_MEGAPIXELS} megapixels. Choose a smaller version.`);
  }
  if (Math.min(width, height) < MIN_SHORT_SIDE) {
    throw new PhotoRejectedError(
      `This photo is ${width} × ${height} px, which is too small. Photos need at least ${MIN_SHORT_SIDE} px on the shortest side.`,
    );
  }
  return { mime, bytes: input.byteLength, width, height };
}

/** Rotated (EXIF orientation), resized WebP derivatives; duplicate widths are skipped. */
export async function makeDerivatives(input: Buffer): Promise<Derivative[]> {
  const out: Derivative[] = [];
  for (const target of DERIVATIVE_WIDTHS) {
    let result: { data: Buffer; info: OutputInfo };
    try {
      result = await sharp(input, { limitInputPixels: PIXEL_LIMIT + 1, failOn: "error" })
        .rotate()
        .resize({ width: target, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer({ resolveWithObject: true });
    } catch {
      throw new PhotoRejectedError("This photo could not be processed. It may be damaged; try exporting it again.");
    }
    const { data, info } = result;
    if (out.some((d) => d.width === info.width)) continue;
    out.push({ width: info.width, height: info.height, buffer: data });
  }
  return out;
}
