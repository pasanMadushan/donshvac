import { NextResponse, type NextRequest } from "next/server";
import { NOINDEX_HEADER_VALUE, resolveSitePolicy, routeRequest } from "@/config/site";
import { refreshAdminSession } from "@/lib/supabase/proxy";

// Resolved per invocation from runtime env so header policy can never drift
// from the deployed configuration.
const policy = resolveSitePolicy();

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const decision = routeRequest(policy, request.headers.get("host"), pathname, search);

  if (decision.kind === "redirect") {
    const location = decision.location.startsWith("http")
      ? decision.location
      : new URL(decision.location, request.url).toString();
    const res = NextResponse.redirect(location, 308);
    if (!decision.location.startsWith(policy.canonicalOrigin ?? "\0")) {
      res.headers.set("X-Robots-Tag", NOINDEX_HEADER_VALUE);
    }
    return res;
  }

  let response: NextResponse;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    response = await refreshAdminSession(request);
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return response;
  }

  response = NextResponse.next();
  if (!decision.indexable) {
    response.headers.set("X-Robots-Tag", NOINDEX_HEADER_VALUE);
  }
  return response;
}

export const config = {
  matcher: [
    // Everything except build assets and the image optimiser.
    "/((?!_next/static|_next/image|fonts/).*)",
  ],
};
