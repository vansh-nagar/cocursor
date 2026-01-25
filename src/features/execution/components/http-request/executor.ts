import type { NodeExecutor } from "@/features/execution/lib/types";
import { NonRetriableError } from "inngest";
import ky, { type Options as KyOptions } from "ky";
import Handlebars from "handlebars";
import { httpRequestChannel } from "@/inngest/chanels/http-request";

Handlebars.registerHelper("json", function (context) {
  return JSON.stringify(context, null, 2);
});

type HttpRequestData = {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  body?: any;
  variableName: string;
};

export const httpRequestExecutor: NodeExecutor<HttpRequestData> = async ({
  data,
  nodeId,
  context,
  step,
  publish,
}) => {
  await publish(httpRequestChannel().status({ nodeId, status: "loading" }));

  // For manual trigger, we can just return the existing context
  if (!data.endpoint) {
    await publish(httpRequestChannel().status({ nodeId, status: "error" }));

    throw new NonRetriableError("Endpoint is required for HTTP Request Node");
  }
  if (!data.method) {
    await publish(httpRequestChannel().status({ nodeId, status: "error" }));

    throw new NonRetriableError("Method is required for HTTP Request Node");
  }
  if (!data.variableName) {
    await publish(httpRequestChannel().status({ nodeId, status: "error" }));

    throw new NonRetriableError(
      "Variable name is required for HTTP Request Node"
    );
  }

  try {
    const result = await step.run("http/request", async () => {
      const method = data.method || "GET";
      const endpoint = Handlebars.compile(data.endpoint)(context);
      const options: KyOptions = { method };

      if (["POST", "PUT"].includes(method) && data.body) {
        const resolve = Handlebars.compile(data.body)(context);
        JSON.parse(resolve); // Validate JSON
        options.body = resolve;

        options.headers = {
          "Content-Type": "application/json",
        };
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

    const reqPayload = {
      httpResponse: {
        status: result.httpResponse.status,
        statusText: result.httpResponse.statusText,
        data: result.httpResponse.data,
      },
    };

    // ✅ Publish success status
    await publish(httpRequestChannel().status({ nodeId, status: "success" }));

    if (!data.variableName) {
      return {
        ...context,
        ...reqPayload,
      };
    }

    return {
      ...context,
      [data.variableName]: reqPayload,
    };
  } catch (error) {
    // ❌ Publish error status
    await publish(httpRequestChannel().status({ nodeId, status: "error" }));
    throw error;
  }
};
