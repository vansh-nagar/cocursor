"use client";

import { BentoSvg } from "../svg/bento-svg";
import BentoTextSection from "../bento-text-section";

const BentoAgent = () => {
  return (
    <div className="rounded-3xl min-h-[300px] border relative overflow-hidden flex flex-col justify-between">
      <div className=" h-10">
        <BentoSvg />
      </div>
      <div className="p-4 pt-0 sm:p-6 sm:pt-0 md:p-8 md:pt-0">
        <BentoTextSection
          title="Your Agent That Never Sleeps"
          description="Generate features, refactor code, and fix bugs with an AI that understands your project."
        />
      </div>
    </div>
  );
};

export default BentoAgent;
