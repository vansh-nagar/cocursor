import ReactFlowCanvas from "@/components/canvas/reactflow-canvas";

interface PageProps {
  params: {
    workflowId: string;
  };
}

const Page = async ({ params }: PageProps) => {
  const { workflowId } = await params;
  return (
    <div className=" h-full">
      <ReactFlowCanvas workflowId={workflowId} />
    </div>
  );
};

export default Page;
