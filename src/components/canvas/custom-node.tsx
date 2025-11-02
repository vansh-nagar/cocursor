import { Handle, Position } from "@xyflow/react";
import { SiOpenai } from "react-icons/si";

export default function CustomNode({ id, data }: any) {
  return (
    <div className=" flex items-center justify-center border p-4  rounded-md bg-accent">
      <SiOpenai />
      <Handle type="source" position={Position.Top} />
      <Handle type="target" position={Position.Bottom} />
    </div>
  );
}
