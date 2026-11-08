import type { ProjectImage } from "@/lib/cms/types";
import { GalleryControls } from "./GalleryControls";
import { ProjectPhoto } from "./ProjectPhoto";

/**
 * Horizontally scrollable photo strip in the owner's order. Native scrolling
 * with scroll-snap works for touch, trackpad and keyboard (the region is
 * focusable); Previous/Next buttons are a progressive enhancement.
 */
export function ProjectGallery({ images, id = "project-photos" }: { images: ProjectImage[]; id?: string }) {
  if (!images.length) return null;
  const single = images.length === 1;
  return (
    <div>
      {!single ? (
        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="text-sm text-ink-muted">
            {images.length} photos. Scroll sideways or use the buttons.
          </p>
          <GalleryControls targetId={id} label="Photo navigation" />
        </div>
      ) : null}
      <div
        id={id}
        role="region"
        aria-label="Project photos, scroll horizontally"
        tabIndex={0}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-3 motion-safe:scroll-smooth"
      >
        {images.map((img, i) => (
          <figure
            key={img.id}
            className={`shrink-0 snap-start ${single ? "w-full" : "w-[85%] sm:w-[70%] lg:w-[60%]"}`}
          >
            <ProjectPhoto
              image={img}
              priority={i === 0}
              sizes={single ? "(min-width: 1216px) 1150px, 100vw" : "(min-width: 1216px) 700px, (min-width: 640px) 70vw, 85vw"}
            />
            <figcaption className="mt-2 text-sm text-ink-muted">
              <span className="sr-only">Photo </span>
              {i + 1} of {images.length}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
