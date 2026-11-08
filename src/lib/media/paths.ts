/** Storage object paths. Private: originals + derivatives. Public: published copies only. */

export const originalPath = (projectId: string, mediaId: string) => `${projectId}/${mediaId}/original`;

export const variantPath = (projectId: string, mediaId: string, width: number) =>
  `${projectId}/${mediaId}/w${width}.webp`;

/** Descriptive, public filename, e.g. "p/<mediaId>/brampton-heat-pump-960.webp". */
export const publicVariantPath = (mediaId: string, fileStem: string, width: number) =>
  `p/${mediaId}/${fileStem}-${width}.webp`;
