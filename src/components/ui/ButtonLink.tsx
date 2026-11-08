import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "primary-on-dark" | "secondary-on-dark";

// Primary = brand flame orange with deep-navy text (5.6:1) and an orange glow.
const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-copper-500 to-copper-400 text-midnight-950 shadow-glow-orange hover:from-copper-400 hover:to-copper-300 border border-copper-500/40",
  secondary:
    "btn-secondary border border-midnight-700/40 bg-white/70 text-midnight-900 backdrop-blur hover:border-midnight-700 hover:bg-white",
  ghost: "text-copper-700 underline underline-offset-4 decoration-1 hover:decoration-2 px-0! shadow-none!",
  "primary-on-dark":
    "bg-gradient-to-r from-copper-500 to-copper-400 text-midnight-950 shadow-glow-orange hover:from-copper-400 hover:to-copper-300 border border-copper-300/40",
  "secondary-on-dark":
    "border border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:border-white/50",
};

export function buttonClasses(variant: ButtonVariant = "primary", extra = ""): string {
  return [
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-2.5",
    "text-base font-bold leading-tight tracking-[0.01em] transition-all duration-200",
    variants[variant],
    extra,
  ].join(" ");
}

type Props = Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
};

export function ButtonLink({ variant = "primary", className = "", children, ...rest }: Props) {
  return (
    <Link {...rest} className={buttonClasses(variant, className)}>
      {children}
    </Link>
  );
}
