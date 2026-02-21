import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define which paths should be protected
const isProtectedRoute = createRouteMatcher(["/main(.*)", "/room(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect(); // <-- this checks session properly
  }
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)", // run on all pages
  ],
};
