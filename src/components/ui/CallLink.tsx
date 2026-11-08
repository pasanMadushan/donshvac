"use client";

import type { ReactNode } from "react";
import { business, callLabel } from "@/config/business";
import { trackEvent } from "@/lib/analytics/events";
import { buttonClasses, type ButtonVariant } from "./ButtonLink";
import { PhoneIcon } from "./icons";

interface Props {
  /** Where the link appears, for analytics (e.g. "hero", "mobile-bar"). */
  placement: string;
  variant?: ButtonVariant | "plain";
  className?: string;
  /** Show the number next to the label. */
  showNumber?: boolean;
  children?: ReactNode;
}

/** The one dialler link. Always a real tel: link that works without JS. */
export function CallLink({ placement, variant = "primary", className = "", showNumber = true, children }: Props) {
  const content = children ?? (
    <>
      <PhoneIcon />
      <span>
        {callLabel}
        {showNumber ? (
          <>
            <span aria-hidden="true"> · </span>
            <span className="whitespace-nowrap">{business.phone.display}</span>
          </>
        ) : null}
      </span>
    </>
  );
  return (
    <a
      href={business.phone.href}
      className={variant === "plain" ? className : buttonClasses(variant, className)}
      onClick={() => trackEvent("call_tap", { placement })}
      aria-label={showNumber || children ? undefined : `${callLabel} at ${business.phone.display}`}
    >
      {content}
    </a>
  );
}
