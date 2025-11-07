"use client";

import { createId } from "@paralleldrive/cuid2";
import { useReactFlow } from "@xyflow/react";
import { GlobeIcon, MousePointer2 } from "lucide-react";

import { useCallback } from "react";
import { toast } from "sonner";

import { NodeType } from "@prisma/client";
import { Separator } from "../ui/separator";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";

export type NodeTypeOptions = {
  type: NodeType;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
};

const triggerNodes: NodeTypeOptions[] = [
  {
    type: NodeType.MANUAL_TRIGGER,
    label: "Manual",
    description: "Trigger workflow manually.",

    icon: MousePointer2,
  },
];

const excecutableNodes: NodeTypeOptions[] = [
  {
    type: NodeType.HTTP_REQUEST,
    label: "Webhook",
    description: "Trigger workflow from external services.",
    icon: GlobeIcon,
  },
];

export const NodeSelector = ({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) => {
  const { setNodes, getNodes, screenToFlowPosition } = useReactFlow();
  const handleSelection = useCallback(
    (selection: NodeTypeOptions) => {
      console.log(
        "selected node type:",
        selection.type,
        NodeType.MANUAL_TRIGGER
      );

      if (selection.type === NodeType.MANUAL_TRIGGER) {
        const nodes = getNodes();

        const hasManualTrigger = nodes.some(
          (node) => node.type === NodeType.MANUAL_TRIGGER
        );

        if (hasManualTrigger) {
          return toast.error(
            "Manual Trigger node already exists in the workflow."
          );
        }

        setNodes((nodes) => {
          const hasInitialNode = nodes.some(
            (node) => node.type === NodeType.INITIAL
          );

          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;

          const flowPosition = screenToFlowPosition({
            x: centerX + (Math.random() - 0.5) * 200,
            y: centerY + (Math.random() - 0.5) * 200,
          });

          const newNode = {
            id: createId(),
            data: {},
            position: flowPosition,
            type: selection.type,
          };

          console.log("hasInitialNode:", hasInitialNode);

          if (hasInitialNode) {
            console.log("replacing initial node");
            return [newNode];
          }

          console.log("adding manual trigger node");

          return [...nodes, newNode];
        });

        onOpenChange(false);
        return;
      }

      setNodes((nodes) => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const flowPosition = screenToFlowPosition({
          x: centerX + (Math.random() - 0.5) * 200,
          y: centerY + (Math.random() - 0.5) * 200,
        });

        const newNode = {
          id: createId(),
          data: {},
          position: flowPosition,
          type: selection.type,
        };
        return [...nodes, newNode];
      });

      onOpenChange(false);
    },
    [setNodes, getNodes, screenToFlowPosition, onOpenChange]
  );
  return (
    <Drawer onOpenChange={onOpenChange} direction="right">
      <DrawerTrigger>{children}</DrawerTrigger>
      <DrawerContent
        className="   w-full "
        onPointerDownOutside={() => onOpenChange(false)} // close on click outside
      >
        <DrawerTitle className=" p-3 pb-0">
          Select Node Type <br />
          <span className=" text-xs line-clamp-2 text-muted-foreground">
            Choose the type of node you want to add to your workflow.
          </span>
        </DrawerTitle>

        <div className=" mt-3">
          {triggerNodes.map((node) => (
            <div
              onClick={() => {
                handleSelection(node);
                onOpenChange(false);
              }}
              key={node.type}
              className="flex gap-3 items-center p-2 hover:bg-accent cursor-pointer hover:border-l-2  hover:border-l-primary transition-all duration-75"
            >
              <node.icon size={25} strokeWidth={1.2} />
              <div>
                <div>{node.label}</div>
                <div className="text-muted-foreground text-xs">
                  {node.description}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Separator />
        <div>
          {excecutableNodes.map((node) => (
            <div
              key={node.type}
              onClick={() => handleSelection(node)}
              className="flex gap-3 items-center p-2 hover:bg-accent cursor-pointer hover:border-l-2  hover:border-l-primary transition-all duration-75"
            >
              <node.icon size={25} strokeWidth={1.2} />
              <div>
                <div>{node.label}</div>
                <div className="text-muted-foreground text-xs">
                  {node.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
export default NodeSelector;
