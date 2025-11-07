import { NodeToolbar, Position } from "@xyflow/react";
import React from "react";
import { Button } from "../ui/button";
import { Settings, Trash } from "lucide-react";

const WorkFlowNode = ({
  children,
  name,
  description,
  icon: Icon,
  onSetting,
  onDoubleClick,
}: {
  children: React.ReactNode;
  name?: string;
  description?: string;
  icon?: React.ComponentType<any>;
  onSetting?: () => void;
  onDoubleClick?: () => void;
}) => {
  return (
    <div>
      <NodeToolbar position={Position.Bottom} isVisible>
        <p className="text-center">{name}</p>
        {description && (
          <p className=" text-center text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </NodeToolbar>
      <NodeToolbar position={Position.Top} isVisible>
        <Button size={"sm"} variant={"ghost"}>
          <Trash />
        </Button>
        <Button size={"sm"} variant={"ghost"}>
          <Settings />
        </Button>
      </NodeToolbar>
      {children}
    </div>
  );
};

export default WorkFlowNode;
