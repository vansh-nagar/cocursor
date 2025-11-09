"use client";

import { Node, NodeProps, useReactFlow } from "@xyflow/react";
import { GlobeIcon } from "lucide-react";

import BaseExecutionNode from "@/features/execution/base-excecution-node";
import { HTTPRequestDialog } from "./dilog";
import { useEffect, useState } from "react";

type HttpRequestNodeData = {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  body: string;
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
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        name="HTTP Request"
        icon={GlobeIcon}
        description={description}
        onSetting={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
        status="initial"
      ></BaseExecutionNode>
    </>
  );
};
