import { MousePointer2, Plus, Slack, Workflow } from "lucide-react";
import WorkFlowNode from "./workflow-node";
import NodeSelector from "./node-selector";
import { useState } from "react";

const InitialNode = ({ id, data }: any) => {
  const [selectorOpen, setSelectorOpen] = useState(false);
  return (
    <NodeSelector open={selectorOpen} onOpenChange={setSelectorOpen}>
      <div className=" p-3 border border-dashed rounded-md  cursor-pointer bg-background hover:scale-105 active:scale-95 tracking-all duration-200">
        <Plus className="  size-4 " />
      </div>
    </NodeSelector>
  );
};

export default InitialNode;
