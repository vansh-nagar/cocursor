import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/main(.*)", "/room(.*)"]);

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
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)", // all pages
    "/(api|trpc)(.*)",
    "/__clerk/:path*", // Clerk's auto-proxy path
  ],
};
