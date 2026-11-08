import { buildLlmsTxt } from "@/lib/discovery/llms";

// Prerendered from cached CMS reads (tag "projects"). Served in demo too;
// the proxy adds noindex there.
export async function GET() {
  return new Response(await buildLlmsTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
