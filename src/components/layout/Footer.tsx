import Link from "next/link";
import { business, type BusinessConfig } from "@/config/business";
import { serviceList } from "@/config/services";
import { getPublishedProjects } from "@/lib/cms/public";
import { CallLink } from "@/components/ui/CallLink";
import { Logo } from "./Logo";

export async function Footer() {
  const projects = (await getPublishedProjects()).slice(0, 5);
  const socials = (business as BusinessConfig).socialProfiles;
  return (
    <footer className="on-dark bg-midnight-900 text-limestone-100">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo tone="light" />
          <p className="max-w-xs text-sm text-midnight-100">
            Residential and commercial heating, cooling and hot water, from {business.founder.name}.
          </p>
          <address className="space-y-2 not-italic">
            <CallLink placement="footer" variant="plain" className="inline-flex min-h-11 items-center gap-2 font-semibold text-copper-300 underline-offset-4 hover:underline" />
            <div>
              <a href={`mailto:${business.email}`} className="inline-flex min-h-11 items-center break-all text-limestone-100 underline underline-offset-4">
                {business.email}
              </a>
            </div>
          </address>
        </div>
        <nav aria-labelledby="footer-services">
          <h2 id="footer-services" className="eyebrow text-copper-300">Services</h2>
          <ul className="mt-3 space-y-1">
            {serviceList.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="inline-flex min-h-10 items-center hover:text-copper-300 hover:underline">{s.name}</Link>
              </li>
            ))}
            <li><Link href="/commercial" className="inline-flex min-h-10 items-center hover:text-copper-300 hover:underline">Commercial HVAC</Link></li>
            <li><Link href="/services" className="inline-flex min-h-10 items-center hover:text-copper-300 hover:underline">All services</Link></li>
          </ul>
        </nav>
        <nav aria-labelledby="footer-projects">
          <h2 id="footer-projects" className="eyebrow text-copper-300">Projects</h2>
          <ul className="mt-3 space-y-1">
            {projects.map((p) => (
              <li key={p.slug}>
                <Link href={`/our-work/${p.slug}`} className="inline-flex min-h-10 items-center hover:text-copper-300 hover:underline">{p.title}</Link>
              </li>
            ))}
            <li><Link href="/our-work" className="inline-flex min-h-10 items-center font-semibold hover:text-copper-300 hover:underline">All projects</Link></li>
          </ul>
        </nav>
        <nav aria-labelledby="footer-company">
          <h2 id="footer-company" className="eyebrow text-copper-300">Company</h2>
          <ul className="mt-3 space-y-1">
            <li><Link href="/about" className="inline-flex min-h-10 items-center hover:text-copper-300 hover:underline">About Don</Link></li>
            <li><Link href="/service-area" className="inline-flex min-h-10 items-center hover:text-copper-300 hover:underline">Service area</Link></li>
            <li><Link href="/contact" className="inline-flex min-h-10 items-center hover:text-copper-300 hover:underline">Contact</Link></li>
            <li><Link href="/privacy" className="inline-flex min-h-10 items-center hover:text-copper-300 hover:underline">Privacy</Link></li>
          </ul>
          {socials.length > 0 ? (
            <ul className="mt-4 flex gap-4" aria-label="Business profiles">
              {socials.map((s) => (
                <li key={s.url}><a href={s.url} rel="me noopener" className="underline underline-offset-4">{s.label}</a></li>
              ))}
            </ul>
          ) : null}
        </nav>
      </div>
      <div className="border-t border-midnight-700">
        <p className="container-page py-5 text-sm text-midnight-300">
          © {business.displayName}. Serving homes and businesses in Southern Ontario.
        </p>
      </div>
    </footer>
  );
}
