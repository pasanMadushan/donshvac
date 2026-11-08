import type { ProjectImage } from "@/lib/cms/types";

/**
 * Pre-optimised project photo. Derivatives are generated at publish time
 * (fixed-width WebP set in `srcSet`), so a plain <img> with explicit
 * dimensions is used instead of next/image.
 */
export function ProjectPhoto({
  image,
  sizes,
  priority = false,
  className = "",
}: {
  image: ProjectImage;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- derivatives are pre-optimised at publish time and served with an explicit srcset; next/image would re-encode them.
    <img
      src={image.src}
      srcSet={image.srcSet}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={image.alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      className={`block h-auto w-full bg-limestone-200 object-cover ${className}`}
    />
  );
}
