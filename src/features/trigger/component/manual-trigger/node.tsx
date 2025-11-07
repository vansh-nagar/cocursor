import React from "react";
import BaseExecutionNode from "../../../execution/base-excecution-node";
import { MousePointer2 } from "lucide-react";
import type { Node, NodeProps, useReactFlow } from "@xyflow/react";
import BaseTriggerNode from "../base-trigger-node";

const ManualTriggerNode = (props: NodeProps) => {
  return (
    <>
      <BaseTriggerNode
        {...props}
        name="Manual Trigger"
        icon={MousePointer2}
        description={"Trigger workflow manually"}
        onSetting={() => {}}
        onDoubleClick={() => {}}
      ></BaseTriggerNode>
    </>
  );
};

export default ManualTriggerNode;
