import Link from "next/link";
import { business } from "@/config/business";
import { inquiryHref } from "@/lib/inquiry/prefill";
import { buttonClasses } from "@/components/ui/ButtonLink";
import { CallLink } from "@/components/ui/CallLink";
import { PhoneIcon } from "@/components/ui/icons";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { NavLinks } from "./NavLinks";

/** Compact header. Phone and Request service are visible at every width. */
export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-white/80 shadow-[0_10px_30px_-22px_rgba(10,30,53,0.45)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/70">
      <div className="container-page flex min-h-[4.5rem] items-center justify-between gap-3 py-1.5">
        <Logo />
        <NavLinks />
        <div className="flex items-center gap-2">
          <CallLink
            placement="header"
            variant="plain"
            className="hidden items-center gap-1.5 whitespace-nowrap font-semibold text-midnight-900 underline-offset-4 hover:underline sm:inline-flex"
          >
            <PhoneIcon />
            <span className="sr-only">Call Don at </span>
            <span>{business.phone.display}</span>
          </CallLink>
          <Link href={inquiryHref({ intent: "service" })} className={buttonClasses("primary", "max-sm:hidden! min-h-11! whitespace-nowrap px-4!")}>
            Request service
          </Link>
          <MobileMenu />
        </div>
      </div>
      {/* Small screens: number and request action stay above the fold. */}
      <div className="border-t border-limestone-200/80 sm:hidden">
        <div className="container-page flex items-center justify-between gap-3 py-1.5 text-sm">
          <CallLink placement="header-mobile" variant="plain" className="inline-flex min-h-10 items-center gap-1.5 font-semibold text-midnight-900">
            <span className="sr-only">Call Don at </span>
            <PhoneIcon />
            <span>{business.phone.display}</span>
          </CallLink>
          <Link href={inquiryHref({ intent: "service" })} className="inline-flex min-h-10 items-center font-semibold text-copper-700 underline underline-offset-4">
            Request service
          </Link>
        </div>
      </div>
    </header>
  );
}
