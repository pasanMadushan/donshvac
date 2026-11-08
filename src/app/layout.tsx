import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { business } from "@/config/business";
import { sitePolicy } from "@/config/site";
import { robotsMeta } from "@/lib/seo/metadata";
import "./globals.css";

const barlowCondensed = localFont({
  src: [
    { path: "./fonts/barlow-condensed-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/barlow-condensed-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/barlow-condensed-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-barlow-condensed",
  display: "swap",
  fallback: ["Arial Narrow", "Roboto Condensed", "Helvetica Neue", "Arial", "sans-serif"],
  adjustFontFallback: "Arial",
});

const instrumentSans = localFont({
  src: [
    { path: "./fonts/instrument-sans-latin-wght-normal.woff2", weight: "400 700", style: "normal" },
    { path: "./fonts/instrument-sans-latin-wght-italic.woff2", weight: "400 700", style: "italic" },
  ],
  variable: "--font-instrument-sans",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Arial", "sans-serif"],
  adjustFontFallback: "Arial",
});

const verification: Metadata["verification"] = {
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : {}),
  ...(process.env.BING_SITE_VERIFICATION ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } } : {}),
};

export const metadata: Metadata = {
  metadataBase: new URL(sitePolicy.publicOrigin),
  title: { default: business.displayName, template: `%s | ${business.displayName}` },
  description: `Heating, cooling and hot-water installation, repair and maintenance for homes and businesses. Call ${business.founder.name} at ${business.phone.display}.`,
  applicationName: business.displayName,
  robots: robotsMeta(),
  formatDetection: { telephone: false, email: false, address: false },
  ...(sitePolicy.indexable && Object.keys(verification).length ? { verification } : {}),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f1e33",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" className={`${barlowCondensed.variable} ${instrumentSans.variable}`}>
      <body>
        {children}
        {process.env.NEXT_PUBLIC_ANALYTICS === "vercel" ? (
          <Analytics
            beforeSend={(event) => {
              // Strip query strings (prefill parameters) before sending.
              const url = new URL(event.url);
              url.search = "";
              return { ...event, url: url.toString() };
            }}
          />
        ) : null}
      </body>
    </html>
  );
}
