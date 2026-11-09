import type { NextConfig } from "next";
import { legacyRedirectRules } from "./src/config/legacy-redirects";

/**
 * STATIC_EXPORT=1 is set only by `npm run build:static` (scripts/build-static.ts),
 * which builds a copy of the project without the admin/CMS server code and
 * emits plain files in dist-static/. A normal `next build` is unaffected.
 */
const isStatic = process.env.STATIC_EXPORT === "1";

/**
 * Supabase Storage host for published project images. Only the public
 * derivative bucket is ever referenced from public pages.
 */
const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
      : null;
  } catch {
    return null;
  }
})();

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  ...(isStatic ? { output: "export" as const } : {}),
  // Cache Components need a server runtime; the static export prerenders everything anyway.
  cacheComponents: !isStatic,
  partialPrefetching: !isStatic,
  poweredByHeader: false,
  // Trailing slashes and alternate hosts are normalised in one hop by
  // src/proxy.ts, so Next's own trailing-slash redirect is disabled.
  skipTrailingSlashRedirect: true,
  distDir: process.env.NEXT_DIST_DIR || ".next",
  turbopack: {
    rules: {
      // Tailwind only processes global stylesheets. CSS Modules
      // (*.module.css) must keep Next's own module handling, otherwise their
      // class names resolve to undefined.
      "*.css": {
        condition: {
          all: [{ not: "foreign" }, { not: { path: /\.module\.css$/ } }],
        },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: isStatic
    ? // Static hosting has no image optimiser; photos are pre-optimised WebP.
      { unoptimized: true }
    : {
    // Project photos are pre-optimised into fixed-width WebP derivatives at
    // publish time and rendered with explicit srcset; next/image is used for
    // local static assets only.
    remotePatterns: supabaseHost
      ? [
          {
            protocol: supabaseHost.protocol.replace(":", "") as "http" | "https",
            hostname: supabaseHost.hostname,
            port: supabaseHost.port,
            pathname: "/storage/v1/object/public/project-media-public/**",
          },
        ]
      : [],
  },
  ...(isStatic
    ? {}
    : {
        experimental: {
          serverActions: {
            // Inquiries and admin form posts are small; images upload directly to
            // storage, never through a server action.
            bodySizeLimit: "256kb",
          },
        },
        async headers() {
          return [
            { source: "/:path*", headers: securityHeaders },
            {
              source: "/admin/:path*",
              headers: [
                { key: "Cache-Control", value: "private, no-store, max-age=0" },
                { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
              ],
            },
            {
              source: "/admin",
              headers: [
                { key: "Cache-Control", value: "private, no-store, max-age=0" },
                { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
              ],
            },
            {
              source: "/api/:path*",
              headers: [
                { key: "Cache-Control", value: "private, no-store, max-age=0" },
                { key: "X-Robots-Tag", value: "noindex, nofollow" },
              ],
            },
          ];
        },
        async redirects() {
          return legacyRedirectRules().map(([source, destination]) => ({
            source,
            destination,
            permanent: true,
          }));
        },
      }),
};

export default nextConfig;
