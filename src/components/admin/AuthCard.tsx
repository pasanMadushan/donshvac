import type { ReactNode } from "react";

/** Narrow, centred card for sign-in and password pages (one h1 per page). */
export function AuthCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="container-page">
      <div className="mx-auto max-w-md">
        <p className="eyebrow text-copper-700">Owner access</p>
        <h1 className="mt-2 font-display text-display-lg uppercase text-midnight-900">{title}</h1>
        <div className="mt-6 border-t border-limestone-300 pt-6">{children}</div>
      </div>
    </div>
  );
}
