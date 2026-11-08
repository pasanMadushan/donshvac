import { sitePolicy } from "@/config/site";
import { buildRobotsTxt } from "@/lib/discovery/robots";

// No request data or uncached I/O: prerendered at build time. Site mode is
// fixed per build/deployment, so the static output is always correct.
export function GET() {
  return new Response(buildRobotsTxt(sitePolicy), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
