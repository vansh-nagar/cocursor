import { Inngest } from "inngest";

/**
 * Background job client.
 *
 * Note: the coding agent does NOT run through Inngest. Its tools execute in
 * the browser against the live WebContainer, which has no server-side
 * existence. This client is here for genuinely asynchronous work.
 */
export const inngest = new Inngest({
  id: "cocursor",
  eventKey: process.env.INNGEST_EVENT_KEY,
});
