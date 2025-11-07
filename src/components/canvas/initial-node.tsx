import { MousePointer2, Plus, Slack, Workflow } from "lucide-react";
import WorkFlowNode from "./workflow-node";
import NodeSelector from "./node-selector";
import { useState } from "react";

const options = [
  {
    title: "Slack Message",
    description: "Send a message to a Slack channel or user.",
    icon: Slack,
  },
  {
    title: "Click",
    description: "Send a message to a Slack channel or user.",
    icon: MousePointer2,
  },
];

const InitialNode = ({ id, data }: any) => {
  const [selectorOpen, setSelectorOpen] = useState(false);
  return (
    <NodeSelector open={selectorOpen} onOpenChange={() => {}}>
      <WorkFlowNode>
        <div
          onClick={() => {
            setSelectorOpen(true);
          }}
          className=" p-3 border rounded-md  cursor-pointer "
        >
          <Plus className="  size-4 " />
        </div>
      </WorkFlowNode>
    </NodeSelector>
  );
};

export default InitialNode;
