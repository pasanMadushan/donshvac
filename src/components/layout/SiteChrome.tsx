import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { MobileActionBar } from "./MobileActionBar";

export function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only z-50 bg-midnight-900 px-4 py-3 font-semibold text-limestone-50 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
    >
      Skip to main content
    </a>
  );
}

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <SkipLink />
      <Header />
      <main id="main" tabIndex={-1} className="focus:outline-none">
        {children}
      </main>
      <Footer />
      <MobileActionBar />
    </>
  );
}
