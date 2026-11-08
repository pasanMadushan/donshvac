import type { NextConfig } from "next";

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

/**
 * Legacy Wix paths. The old site lived under /don-heating-and-co-1 on
 * donshvac.wixsite.com. These rules only take effect for requests that reach
 * this deployment (for example if the approved domain was previously pointed
 * at Wix). Redirects on the wixsite.com host itself need Wix access — see
 * docs/wix-migration.md.
 *
 * Note: the bare legacy "/services" (air conditioning) is deliberately NOT
 * redirected here, because /services is the new services directory.
 */
const legacyBase = "/don-heating-and-co-1";
const legacyMap: Array<[string, string]> = [
  ["/services", "/services/air-conditioning"],
  ["/copy-of-air-conditioners", "/services/furnaces"],
  ["/copy-of-air-conditioners-1", "/services/water-heaters"],
  ["/projects", "/our-work"],
  ["/about-us", "/contact"],
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
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
  images: {
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
    const rules = [
      { source: legacyBase, destination: "/", permanent: true },
      { source: `${legacyBase}/`, destination: "/", permanent: true },
    ];
    for (const [from, to] of legacyMap) {
      rules.push({ source: `${legacyBase}${from}`, destination: to, permanent: true });
      if (from !== "/services") {
        rules.push({ source: from, destination: to, permanent: true });
      }
    }
    return rules;
  },
};

export default nextConfig;
