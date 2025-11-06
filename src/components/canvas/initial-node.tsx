import { Handle, Position } from "@xyflow/react";
import { Plus } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import React from "react";

const InitialNode = ({ id, data }: any) => {
  return (
    <Drawer>
      <DrawerTrigger>
        <div className=" flex items-center justify-center border p-4  rounded-md bg-accent">
          <Plus />
          <Handle type="source" position={Position.Top} />
          <Handle type="target" position={Position.Bottom} />
        </div>
      </DrawerTrigger>
      <DrawerContent>hi</DrawerContent>
    </Drawer>
  );
};

export default InitialNode;
