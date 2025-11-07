import { NodeProps, Position } from "@xyflow/react";
import React from "react";
import { Icon, PiIcon } from "lucide-react";
import WorkFlowNode from "@/components/canvas/workflow-node";
import { BaseNode, BaseNodeContent } from "@/components/base-node";
import { BaseHandle } from "@/components/base-handle";

interface BaseExecutionNodeProps extends NodeProps {
  icon: React.ComponentType<any>;
  name: string;
  description?: string;
  children?: React.ReactNode;

  onSetting?: () => void;
  onDoubleClick?: () => void;
}

const BaseTriggerNode = ({
  id,
  icon: Icon,
  name,
  description,
  onSetting,
  //   status,
  onDoubleClick,
}: BaseExecutionNodeProps) => {
  const handleDelete = () => {
    console.log("Delete node:", id);
    // Implement deletion logic here
  };
  return (
    <WorkFlowNode
      name={name}
      description={description}
      onSetting={onSetting}
      onDoubleClick={onDoubleClick}
    >
      <BaseNode
        className="  rounded-r-sm cursor-pointer rounded-l-xl"
        onDoubleClick={onDoubleClick}
      >
        <BaseNodeContent>
          <Icon size={20} strokeWidth={1.4} className="text-muted-foreground" />
          <BaseHandle id={"source1"} type="source" position={Position.Right} />
        </BaseNodeContent>
      </BaseNode>
    </WorkFlowNode>
  );
};

export default BaseTriggerNode;
