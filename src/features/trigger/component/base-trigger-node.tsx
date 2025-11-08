import { NodeProps, Position, useReactFlow } from "@xyflow/react";
import React from "react";
import { Icon, PiIcon } from "lucide-react";
import WorkFlowNode from "@/components/canvas/workflow-node";
import { BaseHandle } from "@/components/canvas/base-handle";
import {
  type NodeStatus,
  NodeStatusIndicator,
} from "@/components/canvas/node-status-indicator";
import { BaseNode, BaseNodeContent } from "@/components/canvas/base-node";

interface BaseExecutionNodeProps extends NodeProps {
  icon: React.ComponentType<any>;
  name: string;
  description?: string;
  children?: React.ReactNode;
  status?: NodeStatus;
  onSetting?: () => void;
  onDoubleClick?: () => void;
}

const BaseTriggerNode = ({
  id,
  icon: Icon,
  name,
  description,
  onSetting,
  status = "initial",
  onDoubleClick,
}: BaseExecutionNodeProps) => {
  const { setNodes, setEdges } = useReactFlow();
  const handleDelete = () => {
    setNodes((currentNodes) => {
      const updatedNodes = currentNodes.filter((node) => node.id !== id);
      return updatedNodes;
    });

    setEdges((currentEdges) => {
      const updatedEdges = currentEdges.filter(
        (edge) => edge.source !== id && edge.target !== id
      );
      return updatedEdges;
    });
  };
  return (
    <WorkFlowNode
      name={name}
      description={description}
      onSetting={onSetting}
      onDoubleClick={onDoubleClick}
      onDelete={handleDelete}
    >
      <NodeStatusIndicator
        className=" rounded-l-2xl"
        status={status}
        variant="border"
      >
        <BaseNode
          status={status}
          className="  cursor-pointer rounded-l-xl"
          onDoubleClick={onDoubleClick}
        >
          <BaseNodeContent>
            <Icon
              size={15}
              strokeWidth={1.4}
              className="text-muted-foreground"
            />
            <BaseHandle
              id={"source1"}
              type="source"
              position={Position.Right}
            />
          </BaseNodeContent>
        </BaseNode>
      </NodeStatusIndicator>
    </WorkFlowNode>
  );
};

export default BaseTriggerNode;
