import Link from "next/link";
import { inquiryHref } from "@/lib/inquiry/prefill";
import { ArrowRightIcon } from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { toneClasses, type Tone } from "@/components/ui/tone";
import { SafetyNote } from "./SafetyNote";

interface Symptom {
  text: string;
  href: string;
  /** Where the link goes, shown with the symptom. */
  destination: string;
  tone: Tone;
}

const symptoms: Symptom[] = [
  { text: "No heat or not enough heat", href: "/services/furnaces#symptoms", destination: "Furnace repair", tone: "heat" },
  {
    text: "Furnace turns on and off often (short cycling)",
    href: "/services/furnaces#symptoms",
    destination: "Furnace repair",
    tone: "heat",
  },
  {
    text: "AC running but rooms stay warm",
    href: "/services/air-conditioning#symptoms",
    destination: "Air conditioning repair",
    tone: "cool",
  },
  { text: "Weak airflow from vents", href: "/services/air-conditioning#symptoms", destination: "Airflow and ducts", tone: "cool" },
  {
    text: "No hot water or it runs out fast",
    href: "/services/water-heaters#symptoms",
    destination: "Water heater repair",
    tone: "water",
  },
  { text: "Water heater leaking", href: "/services/water-heaters#symptoms", destination: "Water heater repair", tone: "water" },
  { text: "Planning a replacement or upgrade", href: "/services#replace", destination: "Replacing equipment", tone: "dual" },
  { text: "Commercial building equipment", href: "/commercial", destination: "Commercial HVAC", tone: "dual" },
  {
    text: "I’m not sure",
    href: inquiryHref({ intent: "service", service: "not-sure" }),
    destination: "Describe it in a request",
    tone: "dual",
  },
];

export function SymptomFinder() {
  return (
    <section aria-labelledby="symptoms-title" className="py-16 sm:py-24">
      <div className="container-page grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeading id="symptoms-title" number="01" eyebrow="Find the right help" title="What’s happening?" />
          <p className="mt-5 text-ink-muted">
            Pick the problem that sounds closest. Each one leads to what usually causes it and what Don can do about
            it.
          </p>
          <SafetyNote className="mt-8" />
        </div>
        <ol className="grid content-start gap-3 sm:grid-cols-2 lg:col-span-8">
          {symptoms.map((sym, i) => {
            const t = toneClasses[sym.tone];
            return (
              <li key={sym.text}>
                <Link
                  href={sym.href}
                  className={`glass group relative flex h-full min-h-20 items-center gap-4 overflow-hidden rounded-md px-4 py-3 ring-0 transition-all hover:-translate-y-0.5 hover:ring-2 ${t.ring}`}
                >
                  <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1 ${t.bar}`} />
                  <span className="font-display text-lg font-bold text-ink-soft" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold leading-snug text-midnight-900">{sym.text}</span>
                    <span className={`mt-0.5 inline-flex items-center gap-1.5 text-sm font-semibold ${t.text}`}>
                      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
                      <span className="sr-only">: </span>
                      {sym.destination}
                    </span>
                  </span>
                  <ArrowRightIcon className={`shrink-0 transition-transform group-hover:translate-x-1 ${t.text}`} />
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
