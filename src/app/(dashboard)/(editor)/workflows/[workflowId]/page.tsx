import ReactFlowCanvas from "@/components/canvas/reactflow-canvas";
import { ReactFlowProvider } from "@xyflow/react";

interface PageProps {
  params: {
    workflowId: string;
  };
}

const Page = async ({ params }: PageProps) => {
  const { workflowId } = await params;
  return (
    <div className=" h-full">
      <ReactFlowProvider>
        <ReactFlowCanvas workflowId={workflowId} />
      </ReactFlowProvider>
    </div>
  );
};

export default Page;
