import OrangeButton, { WhiteButton } from "./button/orange-button";
import { BentoSvg } from "./svg/bento-svg";
import BentoTextSection from "./bento-text-section";
import BentoGlowSvg1 from "./svg/bento-glow-svg-1";
import BentoLineSvg from "./svg/bento-line-svg";
import BentoGlowSvg2 from "./svg/bento-glow-svg-2";

const Bento = () => {
  return (
    <div className="min-h-screen flex justify-center items-center py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[95vw] sm:max-w-[90vw] lg:max-w-[85vw] xl:max-w-[75vw] grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
        {/* First Card - Write code at the speed of thought */}
        <div
          className="rounded-3xl sm:rounded-[40px] md:rounded-[48px] lg:rounded-[56px] border relative overflow-hidden flex flex-col justify-between min-h-[400px] sm:min-h-[500px] md:min-h-[600px] lg:min-h-0"
          style={{
            boxShadow: "inset 0px 11px 31.8px 1px rgba(250, 96, 0, 0.25)",
          }}
        >
          <div className="px-4 p-4 sm:px-6 sm:p-6 md:px-8 md:p-8">
            <img src="/image/bento-img1.png" className="w-full h-auto" />
          </div>

          <BentoTextSection
            className="px-4 pb-4 sm:px-6 sm:pb-6 md:px-8 md:pb-8"
            title="Write code at the speed of thought"
            description="Inline AI suggestions appear as you type. Accept full lines, functions, or patterns instantly no breaking your flow."
          />
          <BentoGlowSvg1 className="absolute bottom-0 -z-10 w-full h-auto" />
        </div>

        {/* Second Column - Two stacked cards */}
        <div className="grid grid-rows-1 md:grid-rows-2 gap-4 sm:gap-6 md:gap-8">
          {/* Your Agent That Never Sleeps */}
          <div
            style={{
              boxShadow: "inset 0px 11px 31.8px 1px rgba(250, 96, 0, 0.25)",
            }}
            className="rounded-3xl sm:rounded-[40px] md:rounded-[48px] lg:rounded-[56px] border  relative overflow-hidden flex flex-col justify-between "
            >
              <div className=" h-10">

            <BentoSvg/>
              </div>
            {/* <BentoSvg/> */}
            <div className="px-4 pb-4 sm:px-6 sm:pb-6 md:px-8 md:pb-8">
            <BentoTextSection
              title="Your Agent That Never Sleeps"
              description="Generate features, refactor code, and fix bugs with an AI that understands your project."
              />
              </div>
          </div>

          {/* Talk Through Problems */}
          <div
            style={{
              boxShadow: "inset 0px 11px 31.8px 1px rgba(250, 96, 0, 0.25)",
            }}
            className="rounded-3xl sm:rounded-[40px] md:rounded-[48px] lg:rounded-[56px] border relative overflow-hidden p-4 sm:p-6 md:p-8 flex flex-col justify-between "
          >
            <div
              className="-z-20"
              style={{
                position: "absolute",
                width: "173px",
                height: "173px",
                right: "0",
                top: "-15px",
                background: "#E75900",
                filter: "blur(107.3px)",
              }}
            />
            <div className="">
              <div className="flex gap-2 sm:gap-3 z-10 relative">
              <div className=" relative">
                  <img className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0" src="/image/pfp.png" alt="" />
                  <BentoLineSvg className="absolute top-0 right-1/2 translate-x-1/2 -z-10" />
                </div>
                <div className="flex gap-2 flex-col flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex gap-2 sm:gap-3 items-center min-w-0">
                      <span className="text-sm sm:text-base truncate">Vansh Nagar</span>
                    </div>
                    <span className="text-xs flex-shrink-0">4:33</span>
                  </div>
                  <WhiteButton className="text-left px-2 py-2 bg-white text-xs sm:text-xs">
                    Create a responsive pricing card component with 3 plans.
                  </WhiteButton>
                </div>
             
              </div>

              <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4 z-50">
                <img className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0" src="/image/cursor.png" alt="" />{" "}
                <div className="flex gap-2 flex-col flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex gap-2 sm:gap-3 items-center min-w-0">
                      <span className="text-sm sm:text-base truncate">Cocursor</span>
                    </div>
                    <span className="text-xs flex-shrink-0">4:35</span>
                  </div>
                  <OrangeButton className="text-left px-2 py-2 text-xs sm:text-xs">
                    Started working on the pricing card component.
                  </OrangeButton>
                </div>{" "}
              </div>
               

             
            </div>

            <BentoTextSection
              title="Talk Through Problems, Ship Solutions"
              description="Ask questions, debug issues, and build faster all from a simple conversation."
            />
          </div>
        </div>

        {/* Third Card - Code Together */}
        <div
          style={{
            boxShadow: "inset 0px 11px 31.8px 1px rgba(250, 96, 0, 0.25)",
          }}
          className="border flex flex-col justify-between rounded-3xl sm:rounded-[40px] md:rounded-[48px] lg:rounded-[56px] relative pl-4 pt-4 sm:pl-6 sm:pt-6 md:pl-8 md:pt-8 overflow-hidden min-h-[400px] sm:min-h-[500px] md:min-h-[600px] lg:min-h-0"
        >
          <div>
            <img
              src="/image/bento-img2.png"
              alt=""
              className="w-full h-auto"
            />
          </div>

          <BentoTextSection
            className="pr-4 sm:pr-6 md:pr-8 pb-4 sm:pb-6 md:pb-8"
            title="Code Together, In Real Time"
            description="See live cursors, edits, and changes from your team instantly — like multiplayer for coding."
          />

          <BentoGlowSvg2 className="absolute top-0 left-0 -z-10 w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export default Bento;
  