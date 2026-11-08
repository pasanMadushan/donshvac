import type { ReactNode } from "react";
import type { Tone } from "./tone";

/**
 * Dark glowing panel for line illustrations. Lines take the tone's light
 * colour (see `.illus-panel` in globals.css).
 */
export function IllustrationPanel({
  tone,
  children,
  className = "",
}: {
  tone: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div data-tone={tone} className={`illus-panel relative overflow-hidden p-4 sm:p-6 ${className}`}>
      {children}
    </div>
  );
}
