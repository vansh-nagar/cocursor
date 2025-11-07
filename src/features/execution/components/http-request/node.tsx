"use client";

import type { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { Globe, GlobeIcon } from "lucide-react";

import BaseExecutionNode from "@/features/execution/base-excecution-node";

type HttpRequestNodeData = {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  body: string;
  [key: string]: unknown;
};

type HttpRequestNodeType = Node<HttpRequestNodeData>;

export const HttpRequestNode = (props: NodeProps<HttpRequestNodeType>) => {
  const nodeData = props.data as HttpRequestNodeData;
  const description = nodeData?.endpoint
    ? ` ${nodeData.method || "GET"} : ${nodeData.endpoint}`
    : "HTTP Request Node";

  return (
    <>
      <BaseExecutionNode
        {...props}
        id={props.id}
        name="HTTP Request"
        icon={Globe}
        description={description}
        onSetting={() => {}}
        onDoubleClick={() => {}}
      ></BaseExecutionNode>
    </>
  );
};
