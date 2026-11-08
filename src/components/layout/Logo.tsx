import Image from "next/image";
import Link from "next/link";
import { business } from "@/config/business";
import logo from "../../../public/brand/dons-hvac-logo-transparent.png";

/**
 * The client's logo (public/brand/dons-hvac-logo.png), shown unaltered apart
 * from its plain background being made transparent
 * (scripts/make-transparent-logo.ts). On dark surfaces it sits on a white
 * badge so the navy artwork keeps its contrast.
 */
export function Logo({
  tone = "dark",
  size = "md",
}: {
  /** "dark" = on light surfaces; "light" = on dark surfaces (white badge). */
  tone?: "dark" | "light";
  size?: "md" | "lg";
}) {
  const px = size === "lg" ? 96 : 60;
  return (
    <Link
      href="/"
      className={`group inline-flex shrink-0 items-center ${tone === "light" ? "rounded-2xl bg-white p-2 shadow-lg ring-1 ring-white/40" : ""}`}
    >
      <Image
        src={logo}
        alt={`${business.displayName} home`}
        width={px}
        height={px}
        priority={size === "md"}
        className="h-auto"
        style={{ width: px, height: "auto" }}
      />
    </Link>
  );
}
