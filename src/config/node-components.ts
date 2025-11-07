import InitialNode from "@/components/canvas/initial-node";
import { NodeType } from "@prisma/client";

import type { NodeTypes } from "@xyflow/react";

export const nodeComponents = {
  [NodeType.DEFAULT]: InitialNode,
} as const satisfies NodeTypes;

export type ResgisteredNodeTypes = keyof typeof nodeComponents;
