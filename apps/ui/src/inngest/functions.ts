import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);

export const changeCodeBase = inngest.createFunction(
  { id: "change-code-base" },
  { event: "codebase/change.requested" },
  async ({ event, step }) => {
    const { processJson } = event.data;
    const processData = JSON.parse(processJson);
    console.log("Received code change request:", processData);

    // Test step to show function is running
    await step.run("test-step", async () => {
      console.log("Test step executed!");
      return { test: true };
    });

    await step.sleep("processing-request", "2s");

    console.log("Finished processing code change request:", processData);
    return { status: "done" };
  },
);
