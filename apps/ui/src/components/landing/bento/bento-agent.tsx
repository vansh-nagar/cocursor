"use client";

import { BentoSvg } from "../svg/bento-svg";
import BentoTextSection from "../bento-text-section";

const BentoAgent = () => {
  return (
    <div className="rounded-3xl sm:rounded-[40px] md:rounded-[48px] lg:rounded-[56px] border relative overflow-hidden flex flex-col justify-between">
      <div className=" h-10">
        <BentoSvg />
      </div>
      <div className="px-4 pb-4 sm:px-6 sm:pb-6 md:px-8 md:pb-8">
        <BentoTextSection
          title="Your Agent That Never Sleeps"
          description="Generate features, refactor code, and fix bugs with an AI that understands your project."
        />
      </div>
    </div>
  );
};

export default BentoAgent;
