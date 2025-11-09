import type { NodeExecutor } from "@/features/execution/lib/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";

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

  const result = await step.run("http/request", async () => {
    const method = data.method || "GET";
    const endpoint = data.endpoint!;
    const options: KyOptions = { method };

    if (["POST", "PUT"].includes(method) && data.body) {
      options.body = data.body;
    }

    const res = await ky(endpoint, options);
    const contentType = res.headers.get("content-type") || "";
    const resData = contentType.includes("application/json")
      ? await res.json()
      : await res.text();

    return {
      ...context,
      httpResponse: {
        status: res.status,
        statusText: res.statusText,
        data: resData,
      },
    };
  });

  return {
    ...context,
    result,
  };
};
