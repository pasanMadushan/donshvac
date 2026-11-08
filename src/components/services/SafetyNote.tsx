import { gasAndCoSafety } from "@/content/service-pages";

/**
 * "Before you call" panel: the gas / carbon monoxide instruction first, then
 * the few checks a homeowner can safely make. Never DIY gas, electrical or
 * refrigerant work.
 */
export function SafetyNote({
  id,
  equipment,
  checks,
}: {
  id: string;
  /** Equipment noun, e.g. "furnace". */
  equipment: string;
  checks: string[];
}) {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className="border-y border-midnight-900/20 bg-limestone-50">
      <div className="container-page grid gap-10 py-14 md:grid-cols-12 md:py-16">
        <div className="md:col-span-5">
          <p className="eyebrow text-copper-700">Before you call</p>
          <h2 id={headingId} className="mt-3 font-display text-display-md uppercase text-midnight-900">
            Safety first, then simple checks
          </h2>
          <div className="mt-6 border-l-4 border-danger-700 bg-white px-5 py-4" role="note">
            <h3 className="font-sans text-lg font-semibold text-danger-700">{gasAndCoSafety.heading}</h3>
            <p className="mt-2 text-ink">{gasAndCoSafety.body}</p>
          </div>
        </div>
        <div className="md:col-span-7">
          <h3 className="font-sans text-lg font-semibold text-ink">Checks you can safely make on your {equipment}</h3>
          <ol className="mt-4 divide-y divide-midnight-900/15 border-y border-midnight-900/15">
            {checks.map((c, i) => (
              <li key={c} className="grid grid-cols-[2.5rem_1fr] gap-3 py-4">
                <span className="font-display text-2xl leading-none text-copper-700" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-ink">{c}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-ink-muted">
            Leave anything involving gas, wiring, refrigerant or the inside of the equipment to Don.
          </p>
        </div>
      </div>
    </section>
  );
}
