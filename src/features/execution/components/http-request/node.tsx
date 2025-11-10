"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";

import BaseExecutionNode from "@/features/execution/base-excecution-node";
import { HTTPRequestDialog } from "./dilog";
import { useEffect, useState } from "react";
import { useNodeStatus } from "../../hooks/use-node-status";
import { httpRequestChannel } from "@/inngest/chanels/http-request";
import { fetchHttpRequestRealtimeToken } from "./action";

type HttpRequestNodeData = {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  body: string;
  variableName?: string;
};

type HttpRequestNodeType = Node<HttpRequestNodeData>;

export const HttpRequestNode = (props: NodeProps<HttpRequestNodeType>) => {
  const [isOpen, setIsOpen] = useState(false);
  const { setNodes, setEdges } = useReactFlow();

  const nodeData = props.data as HttpRequestNodeData;
  const description = nodeData?.endpoint
    ? ` ${nodeData.method || "GET"} : ${nodeData.endpoint}`
    : "HTTP Request Node";

  const handleOpenSettings = () => {
    setIsOpen(true);
  };

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: httpRequestChannel().name,
    topic: "status",
    refreshToken: fetchHttpRequestRealtimeToken,
  });

  const handleSubmit = (values: any) => {
    setNodes((currentNodes) => {
      currentNodes.map((node) => {
        if (node.id === props.id) {
          node.data = {
            ...node.data,
            ...values,
          };
        }
        console.log("Updated node data:", node.data);
        return node;
      });
      setIsOpen(false);
      return currentNodes;
    });
  };

  return (
    <>
      <HTTPRequestDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={handleSubmit}
        defaultBody={nodeData.body}
        defaultEndpoint={nodeData.endpoint}
        defaultMethod={nodeData.method}
        variableName={nodeData.variableName}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        name="HTTP Request"
        icon={GlobeIcon}
        description={description}
        onSetting={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        status={nodeStatus}
      ></BaseExecutionNode>
    </>
  );
};
