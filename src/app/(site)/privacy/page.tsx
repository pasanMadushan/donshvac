import Link from "next/link";
import type { ReactNode } from "react";
import { ClosingCta } from "@/components/pages/ClosingCta";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { business, mailtoHref } from "@/config/business";
import { inquiryHref } from "@/lib/inquiry/prefill";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Privacy",
  description: `How ${business.displayName} handles the information you send through the request form, by phone or by email, and how to ask for it to be deleted.`,
  path: "/privacy",
});

const LAST_UPDATED_ISO = "2026-11-08";
const LAST_UPDATED = "8 November 2026";

const sections: Array<{ id: string; title: string; body: ReactNode }> = [
  {
    id: "privacy-collect",
    title: "What the request form collects",
    body: (
      <>
        <p>When you send a request through the form on this website, it asks for:</p>
        <ul>
          <li>your name</li>
          <li>your preferred contact method, and the phone number or email address for the method you choose</li>
          <li>your city, or the first three characters of your postal code</li>
          <li>the type of service and the type of property</li>
          <li>a short description of what you need</li>
          <li>for commercial properties, any optional building details you choose to add</li>
        </ul>
        <p>This information is used only to reply to you and arrange service.</p>
      </>
    ),
  },
  {
    id: "privacy-delivery",
    title: "How your request is delivered",
    body: (
      <>
        <p>
          Your request is sent by email to Don’s business inbox through a transactional email provider (Resend).
          The website does not keep a database copy of inquiry messages. The contents of your request are not
          written to application logs or analytics.
        </p>
        <p>
          If sending fails, the form gives you the option to email your request yourself from your own mail app.
          Nothing is sent automatically in that case; you decide whether to send it.
        </p>
      </>
    ),
  },
  {
    id: "privacy-abuse",
    title: "Spam and abuse prevention",
    body: (
      <p>
        The form includes a hidden field that people do not see but automated spam tools often fill in. To limit
        repeated submissions, the site stores a short-lived, keyed hash of your network address (not the address
        itself). These hashes are deleted within about a day.
      </p>
    ),
  },
  {
    id: "privacy-analytics",
    title: "Analytics",
    body: (
      <p>
        Analytics are off unless they are turned on. When they are on, the site uses Vercel Web Analytics, which
        counts page views and a few events (such as a tap on the call button) in aggregate and does not use cookies.
        These events never include message text, names, phone numbers, email addresses or postal codes.
      </p>
    ),
  },
  {
    id: "privacy-services",
    title: "Hosting and other services",
    body: (
      <p>
        The website is hosted by Vercel. Don signs in to a private editor to publish projects; that sign-in uses
        Supabase and is only for Don. Visitors do not create accounts on this site.
      </p>
    ),
  },
  {
    id: "privacy-phone-email",
    title: "Phone calls and email",
    body: (
      <p>
        Phone calls to {business.phone.display} go directly to Don. If you email Don, your message is handled the
        same way as a request sent through the form: as business correspondence in his inbox.
      </p>
    ),
  },
  {
    id: "privacy-retention",
    title: "How long information is kept",
    body: (
      <p>
        Inquiry emails are kept in Don’s inbox as business correspondence. You can ask Don to delete them at any
        time.
      </p>
    ),
  },
  {
    id: "privacy-rights",
    title: "Your choices and Canadian privacy law",
    body: (
      <>
        <p>
          {business.displayName} aims to handle personal information in line with Canadian privacy law, including
          the Personal Information Protection and Electronic Documents Act (PIPEDA). You can ask what information
          Don holds about you, ask for it to be corrected, or ask for it to be deleted.
        </p>
        <p>
          For privacy questions or deletion requests, email{" "}
          <a href={mailtoHref("Privacy request")}>{business.email}</a>.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <>
      <div className="container-page pt-8 pb-16 md:pb-24">
        <Breadcrumbs
          crumbs={[
            { name: "Home", path: "/" },
            { name: "Privacy", path: "/privacy" },
          ]}
        />
        <div className="mt-10 grid gap-10 md:grid-cols-12">
          <header className="md:col-span-4">
            <h1 className="text-display-xl uppercase text-midnight-900">Privacy</h1>
            <p className="mt-4 text-sm text-ink-muted">
              Last updated: <time dateTime={LAST_UPDATED_ISO}>{LAST_UPDATED}</time>
            </p>
            <nav aria-label="On this page" className="mt-8 hidden md:block">
              <ol className="space-y-2 border-l border-midnight-900/20 pl-4 text-sm">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="text-ink-muted underline-offset-4 hover:text-copper-700 hover:underline">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </header>
          <div className="md:col-span-8">
            <p className="max-w-prose text-lg text-ink-muted">
              This page explains, in plain terms, what information this website collects when you contact{" "}
              {business.displayName}, how it is used, and how to ask for it to be deleted.
            </p>
            {sections.map((s) => (
              <section key={s.id} aria-labelledby={s.id} className="mt-12 border-t border-midnight-900/20 pt-6">
                <h2 id={s.id} className="text-display-md uppercase text-midnight-900">
                  {s.title}
                </h2>
                <div className="prose-copy mt-4 text-ink [&_ul]:mt-3 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
                  {s.body}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>

      <ClosingCta
        id="privacy-next"
        heading="Need heating, cooling or hot-water help?"
        requestHref={inquiryHref({ intent: "service" })}
        requestLabel="Request service"
        placement="privacy-closing"
      >
        <p>
          Call Don directly, or send a request. You can also read{" "}
          <Link href="/about" className="text-copper-300 underline underline-offset-4">
            more about Don
          </Link>
          .
        </p>
      </ClosingCta>
    </>
  );
}
