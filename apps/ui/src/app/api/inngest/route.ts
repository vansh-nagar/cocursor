import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { helloWorld } from "@/inngest/functions";

// This handler lived at src/api/inngest/route.ts — a sibling of the app router,
// not a route segment — so /api/inngest returned 404 and no Inngest function
// could ever register or run.
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [helloWorld],
  signingKey: process.env.INNGEST_SIGNING_KEY,
});
