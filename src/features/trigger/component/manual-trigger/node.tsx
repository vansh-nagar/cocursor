import { useState } from "react";
import { MousePointer2 } from "lucide-react";
import type { NodeProps } from "@xyflow/react";
import BaseTriggerNode from "../base-trigger-node";
import { ManualTriggerDialog } from "./dilog";

const ManualTriggerNode = (props: NodeProps) => {
  const [IsOpen, setIsOpen] = useState(false);
  const handleOpenDialog = () => {
    setIsOpen(true);
  };
  const nodeStatus = "loading";
  return (
    <>
      <ManualTriggerDialog isOpen={IsOpen} onClose={() => setIsOpen(false)} />
      <BaseTriggerNode
        {...props}
        name="Manual Trigger"
        icon={MousePointer2}
        description={"Trigger workflow manually"}
        onSetting={handleOpenDialog}
        onDoubleClick={handleOpenDialog}
        status={nodeStatus}
      />
    </>
  );
};

export default ManualTriggerNode;
