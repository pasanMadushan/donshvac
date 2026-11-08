import { business, mailtoHref } from "@/config/business";
import { inquiryHref } from "@/lib/inquiry/prefill";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { CallLink } from "@/components/ui/CallLink";
import { MailIcon } from "@/components/ui/icons";

export function ClosingContact() {
  return (
    <section aria-labelledby="contact-title" className="on-dark relative overflow-hidden py-16 text-limestone-100 sm:py-24">
      <div className="container-page grid gap-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <p className="eyebrow text-ice-300">Contact</p>
          <h2 id="contact-title" className="mt-2 text-display-lg uppercase text-limestone-50">
            Talk to Don about your <span className="text-gradient-heat">heating</span>, <span className="text-gradient-cool">cooling</span> or <span className="text-ember-300">hot water</span>
          </h2>
          <p className="mt-4 max-w-prose text-midnight-100">
            Call to describe what’s happening, or send a request and Don will follow up to confirm the details.
          </p>
        </div>
        <div className="glass-dark flex flex-col gap-3 rounded-lg p-5 lg:col-span-5">
          <CallLink placement="home-closing" variant="primary-on-dark" />
          <div className="grid gap-3 sm:grid-cols-2">
            <ButtonLink href={inquiryHref({ intent: "service" })} variant="secondary-on-dark">
              Request service
            </ButtonLink>
            <ButtonLink href={inquiryHref({ intent: "estimate" })} variant="secondary-on-dark">
              Request an estimate
            </ButtonLink>
          </div>
          <a
            href={mailtoHref()}
            className="inline-flex min-h-11 items-center gap-2 break-all text-limestone-100 underline underline-offset-4 hover:text-copper-300"
          >
            <MailIcon className="shrink-0" />
            <span>
              <span className="sr-only">Email Don at </span>
              {business.email}
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
