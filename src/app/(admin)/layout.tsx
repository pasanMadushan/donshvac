import type { Metadata } from "next";
import { AdminHeader, SkipLink } from "@/components/admin/AdminHeader";

/**
 * Owner-only area. Never indexed, never cached (proxy + next.config send
 * Cache-Control: private, no-store and X-Robots-Tag: noindex for /admin).
 * Session reads happen inside each page's <Suspense> boundary; this layout
 * stays static. Navigations into /admin are allowed to block on the server.
 */
export const instant = false;

export const metadata: Metadata = {
  title: { default: "Project editor", template: "%s | Project editor" },
  description: "Private project editor.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    googleBot: { index: false, follow: false, noarchive: true },
  },
  openGraph: null,
  twitter: null,
  alternates: null,
  referrer: "same-origin",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-limestone-50">
      <SkipLink />
      <AdminHeader />
      <main id="admin-main" tabIndex={-1} className="flex-1 pb-16 pt-6 focus:outline-none sm:pt-10">
        {children}
      </main>
    </div>
  );
}
