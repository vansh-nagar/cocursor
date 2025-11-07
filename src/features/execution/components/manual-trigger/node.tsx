import React from "react";
import BaseExecutionNode from "../../base-excecution-node";
import { MousePointer2 } from "lucide-react";
import type { Node, NodeProps, useReactFlow } from "@xyflow/react";

type ManualTriggerNodeData = {
  description?: string;
};

type ManualTriggerNodeType = Node<ManualTriggerNodeData>;

const ManualTriggerNode = (props: NodeProps<ManualTriggerNodeType>) => {
  const { id } = props;
  const description = props.data.description || "Manual Trigger Node";

  return (
    <>
      <BaseExecutionNode
        {...props}
        id={id}
        name="Manual Trigger"
        icon={MousePointer2}
        description={description}
        onSetting={() => {}}
        onDoubleClick={() => {}}
      ></BaseExecutionNode>
    </>
  );
};

export default ManualTriggerNode;
