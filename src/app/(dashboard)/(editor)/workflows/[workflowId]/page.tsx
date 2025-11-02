import ReactFlowCanvas from "@/components/canvas/reactflow-canvas";

interface PageProps {
  params: {
    workflowId: string;
  };
}

const Page = async ({ params }: PageProps) => {
  const { workflowId } = await params;
  return (
    <div>
      <p className="  absolute bottom-0 right-0 z-50">
        Execution Id: {workflowId}
      </p>
      <ReactFlowCanvas />
    </div>
  );
};

export default Page;
