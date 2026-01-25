import React from "react";

interface PageProps {
  params: {
    executionId: string;
  };
}

const Page = async ({ params }: PageProps) => {
  const { executionId } = await params;
  return <div>Execution Id: {executionId}</div>;
};

export default Page;
