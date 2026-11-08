import { SiteChrome } from "@/components/layout/SiteChrome";
import { JsonLd, businessJsonLd, websiteJsonLd } from "@/lib/seo/jsonld";

// Every public page must be fully prerendered (static or cached with
// on-demand refresh). Request-time work here is a build error.
export const ensureStatic = "navigation";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteChrome>
      <JsonLd data={[businessJsonLd(), websiteJsonLd()]} />
      {children}
    </SiteChrome>
  );
}
