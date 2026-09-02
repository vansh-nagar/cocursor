import { inngest } from "./client";

/**
 * Smoke test that the /api/inngest endpoint is registered.
 * Trigger from the Inngest dev UI with event "test/hello.world".
 */
export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data?.email ?? "world"}!` };
  },
);
