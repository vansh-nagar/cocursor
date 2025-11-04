import React from "react";
import DemoCanvas from "./demo-canvas";

const WorkflowImage = () => {
  return (
    <div className=" flex justify-center">
      <div className="relative m-3 sm:mt-0 w-7xl">
        <div className=" h-[70vh] relative rounded-2xl bg-background border border-dashed shadow-inner  ">
          <DemoCanvas />
        </div>
      </div>
    </div>
  );
};

export default WorkflowImage;
