import { NodeToolbar, Position } from "@xyflow/react";
import React from "react";
import { Button } from "../ui/button";
import { Settings, Trash } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const WorkFlowNode = ({
  children,
  name,
  description,
  icon: Icon,
  onSetting,
  onDoubleClick,
  onDelete,
}: // status,
{
  children: React.ReactNode;
  name?: string;
  description?: string;
  icon?: React.ComponentType<any>;
  onSetting?: () => void;
  onDoubleClick?: () => void;
  onDelete?: () => void;
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
        <Button onClick={onSetting} size={"sm"} variant={"ghost"}>
          <Settings />
        </Button>
        <Button onClick={onDelete} size={"sm"} variant={"ghost"}>
          <Trash />
        </Button>
      </NodeToolbar>
      {children}
    </div>
  );
};

export default WorkFlowNode;
