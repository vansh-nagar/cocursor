import { useState } from "react";
import { MousePointer2 } from "lucide-react";
import type { NodeProps } from "@xyflow/react";
import BaseTriggerNode from "../base-trigger-node";
import { ManualTriggerDialog } from "./dilog";
import { useNodeStatus } from "@/features/execution/hooks/use-node-status";
import { fetchManualTriggerRealtimeToken } from "./action";

const ManualTriggerNode = (props: NodeProps) => {
  const [IsOpen, setIsOpen] = useState(false);
  const handleOpenDialog = () => {
    setIsOpen(true);
  };
  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: "manual-trigger-execution",
    topic: "status",
    refreshToken: fetchManualTriggerRealtimeToken,
  });
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
