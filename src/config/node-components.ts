import InitialNode from "@/components/canvas/initial-node";
import type { NodeTypes } from "@xyflow/react";

export enum NodeType {
  DEFAULT = "DEFAULT",
}

export const nodeComponents = {
  [NodeType.DEFAULT]: InitialNode,
} as const satisfies NodeTypes;

export type ResgisteredNodeTypes = keyof typeof nodeComponents;
