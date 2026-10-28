import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/main(.*)", "/room(.*)"]);
const isRoomRoute = createRouteMatcher(["/room(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return;

  const { userId, redirectToSignIn } = await auth();

  // Redirect explicitly rather than calling auth.protect(). With no sign-in URL
  // configured, protect() answers unauthenticated requests with a 404 so it
  // does not disclose that the route exists -- which, for a route a signed-out
  // user is expected to land on, just looks like the page is missing.
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // Cross-origin isolation for WebContainer, duplicated from next.config.ts:
  // on Cloudflare (OpenNext) the config headers did not reach /room responses,
  // so WebContainer.boot() threw and the IDE crashed on load.
  if (isRoomRoute(req)) {
    const res = NextResponse.next();
    res.headers.set("Cross-Origin-Opener-Policy", "same-origin");
    res.headers.set("Cross-Origin-Embedder-Policy", "credentialless");
    return res;
  }
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)", // all pages
    "/(api|trpc)(.*)",
    "/__clerk/:path*", // Clerk's auto-proxy path
  ],
};
