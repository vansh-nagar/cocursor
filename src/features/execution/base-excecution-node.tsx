import { NodeProps, Position, useReactFlow } from "@xyflow/react";
import React from "react";
import { Icon, PiIcon } from "lucide-react";
import { BaseNode, BaseNodeContent } from "../../components/base-node";
import WorkFlowNode from "../../components/canvas/workflow-node";
import { BaseHandle } from "../../components/base-handle";

interface BaseExecutionNodeProps extends NodeProps {
  icon: React.ComponentType<any>;
  name: string;
  description?: string;
  children?: React.ReactNode;

  onSetting?: () => void;
  onDoubleClick?: () => void;
}

const BaseExecutionNode = ({
  id,
  icon: Icon,
  name,
  description,
  onSetting,
  //   status,
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
      <BaseNode className=" rounded-md" onDoubleClick={onDoubleClick}>
        <BaseNodeContent>
          <Icon size={20} strokeWidth={1.4} className="text-muted-foreground" />
          <BaseHandle id={"target1"} type="target" position={Position.Left} />
          <BaseHandle id={"source1"} type="source" position={Position.Right} />
        </BaseNodeContent>
      </BaseNode>
    </WorkFlowNode>
  );
};

export default BaseExecutionNode;
