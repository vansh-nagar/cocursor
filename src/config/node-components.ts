import InitialNode from "@/components/canvas/initial-node";
import type { NodeTypes } from "@xyflow/react";
import { NodeType } from "@prisma/client";
import { HttpRequestNode } from "@/features/execution/components/http-request/node";
import ManualTriggerNode from "@/features/execution/components/manual-trigger/node";

export const nodeComponents = {
  [NodeType.INITIAL]: InitialNode,
  [NodeType.MANUAL_TRIGGER]: ManualTriggerNode,
  [NodeType.HTTP_REQUEST]: HttpRequestNode,
} as const satisfies NodeTypes;

export type RegisteredNodeTypes = keyof typeof nodeComponents;
