import type { NodeExecutor } from "@/features/execution/lib/types";
import { NonRetriableError } from "inngest";

type HttpRequestData = {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
};

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  nodeId,
  context,
  step,
}) => {
  // For manual trigger, we can just return the existing context
  if (!data.endpoint) {
    throw new NonRetriableError("Endpoint is required for HTTP Request Node");
  }

  const result = await step.fetch(data.endpoint);

  return {
    ...context,
    result,
  };
};
