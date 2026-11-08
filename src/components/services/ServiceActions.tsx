import { ButtonLink } from "@/components/ui/ButtonLink";
import { CallLink } from "@/components/ui/CallLink";
import type { ServiceSlug } from "@/config/services";
import { inquiryHref } from "@/lib/inquiry/prefill";

/** Primary actions for a service page: call now, request service, request an estimate. */
export function ServiceActions({
  slug,
  placement,
  className = "",
}: {
  slug: ServiceSlug;
  placement: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center ${className}`}>
      <CallLink placement={placement} variant="primary" />
      <ButtonLink href={inquiryHref({ intent: "service", service: slug })} variant="secondary">
        Request service
      </ButtonLink>
      <ButtonLink href={inquiryHref({ intent: "estimate", service: slug })} variant="ghost" className="sm:ml-2">
        Request an estimate
      </ButtonLink>
    </div>
  );
}
