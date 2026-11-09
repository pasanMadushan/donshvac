import Link from "next/link";
import { serviceList } from "@/config/services";
import { ArrowRightIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { toneClasses, toneFor } from "@/components/ui/tone";
import { ProjectPhoto } from "@/components/projects/ProjectPhoto";
import { serviceImages } from "@/content/static-images";

const paths = [
  { name: "Repair", text: "When equipment stops working, runs poorly or makes new noises.", href: "/services#repair" },
  { name: "Maintenance", text: "Seasonal checks and cleaning so equipment keeps running as it should.", href: "/services#maintenance" },
  { name: "Replacement", text: "When equipment is near the end of its life or no longer suits the building.", href: "/services#replace" },
];

export function ServicesOverview() {
  return (
    <section aria-labelledby="services-title" className="py-16 sm:py-24">
      <div className="container-page">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <SectionHeading id="services-title" number="03" eyebrow="Equipment" title="Equipment Don works on" className="lg:col-span-5" />
          <ul className="grid gap-3 sm:grid-cols-3 lg:col-span-7">
            {paths.map((p) => (
              <li key={p.name}>
                <Link href={p.href} className="glass group block h-full rounded-md p-4 transition-all hover:-translate-y-0.5">
                  <span className="flex items-center justify-between font-display text-xl font-bold uppercase text-midnight-900">
                    {p.name}
                    <ArrowRightIcon className="text-copper-700 transition-transform group-hover:translate-x-1" />
                  </span>
                  <span className="mt-1 block text-sm text-ink-muted">{p.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {serviceList.map((svc, i) => {
            const tone = toneFor(svc.slug);
            const t = toneClasses[tone];
            return (
              <li key={svc.slug} className="glass group relative flex flex-col overflow-hidden rounded-lg p-3">
                <div className="relative overflow-hidden rounded-md">
                  <ProjectPhoto
                    image={serviceImages[svc.slug]}
                    sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw"
                    className="aspect-[4/3] transition-transform duration-500 group-hover:scale-105"
                  />
                  <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-midnight-950/70 via-transparent to-transparent" />
                  <span aria-hidden="true" className={`absolute inset-x-0 bottom-0 h-1 ${t.bar}`} />
                  <span aria-hidden="true" className="absolute bottom-3 left-4 font-display text-3xl font-bold text-white">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex flex-1 flex-col px-2 pt-4 pb-2">
                  <h3 className="text-2xl uppercase text-midnight-900">{svc.name}</h3>
                  <p className="mt-2 text-sm text-ink">{svc.summary}</p>
                  <p className="mt-2 text-xs font-semibold text-ink-muted">{svc.equipmentTypes.join(" · ")}</p>
                  <Link
                    href={`/services/${svc.slug}`}
                    className={`mt-auto inline-flex min-h-11 items-center gap-2 pt-3 text-sm font-bold ${t.text} after:absolute after:inset-0 after:content-['']`}
                  >
                    {svc.name}: repair, maintenance and replacement
                    <ArrowRightIcon width={16} height={16} className="shrink-0 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-8 flex flex-wrap gap-3">
          <Link href="/services" className="inline-flex min-h-11 items-center gap-2 font-bold text-copper-700 underline underline-offset-4 hover:decoration-2">
            All heating, cooling and hot-water services
            <ArrowRightIcon />
          </Link>
        </p>
      </div>
    </section>
  );
}
