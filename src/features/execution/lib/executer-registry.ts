import { NodeType } from "@prisma/client";
import { NodeExecutor } from "./types";
import { manualTriggerExecutor } from "@/features/trigger/component/manual-trigger/executor";
import { httpRequestExecutor } from "../components/http-request/executor";

export const executerRegistry: Record<NodeType, NodeExecutor<any>> = {
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,
  [NodeType.INITIAL]: manualTriggerExecutor,
};

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executerRegistry[type];
  if (!executor) {
    throw new Error(`No executor found for node type: ${type}`);
  }

  return executor;
};
