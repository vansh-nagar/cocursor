import OrangePremButton from "./button/orange-prem-buttion";
import OrangeButton, { BlackButton } from "./button/orange-button";
import Link from "next/link";
import Follower1 from "./cursor-followers/follower1";
import Follower2 from "./cursor-followers/follower2";

const HeroSection = () => {
  return (
    <div className="relative flex flex-col max-sm:overflow-x-hidden justify-center items-center sm:min-h-screen px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-32 max-sm:mt-10">
      <div className="follower1 absolute left-1/6 bottom-1/3 sm:top-1/4 z-50 pointer-events-none">
        <Follower1 />
      </div>
      <div className="follower2 absolute bottom-1/4 sm:top-1/3 right-1/8 z-50 pointer-events-none">
        <Follower2 />
      </div>

      <OrangePremButton className="rounded-full px-3 py-1 text-[10px] sm:text-xs mb-4 sm:mb-6">
        Code Together Powered by AI
      </OrangePremButton>
      <div className="text-3xl sm:text-4xl font-medium lg:text-5xl xl:text-6xl 2xl:text-7xl flex items-center flex-col text-center leading-7 md:leading-10 lg:leading-12 xl:leading-16">
        <span className="flex items-center justify-center gap-1 sm:gap-2 md:gap-3 whitespace-nowrap">
          <span>Build software</span>
          <div className="w-10 max-sm:hidden h-5 sm:w-14 sm:h-7 md:w-16 md:h-8 lg:w-20 lg:h-10 xl:w-24 xl:h-10 relative">
            <img
              className="absolute -top-5 sm:-top-7 md:-top-8 lg:-top-9 xl:-top-10 right-0 inset-0 h-[80px] sm:h-[120px] md:h-[140px] lg:h-[170px] xl:h-[200px] scale-x-[2]"
              src="/logo/zap.png"
              alt=""
            />
          </div>
          <span>with AI</span>
        </span>
        <span className="mt-2 sm:mt-3 md:mt-4">Right in your browser</span>
      </div>
      <div className="mt-4 sm:mt-6 md:mt-10 text-center text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-xs sm:max-w-md md:max-w-lg lg:max-w-none px-4">
        A browser-based IDE where AI helps you write code,{" "}
        <br className=" max-sm:hidden" /> teammates collaborate live, and apps
        run instantly.
      </div>

      <div className="mt-8 sm:mt-12 md:mt-16 flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 px-4 sm:px-0">
        <Link href="/main">
          <OrangeButton className="py-2 px-4 cursor-pointer text-sm sm:text-base">
            Launch Cocursor
          </OrangeButton>
        </Link>
        <Link href="/docs">
          <BlackButton className="py-2 px-4 bg-black cursor-pointer text-sm sm:text-base">
            See How It Works
          </BlackButton>
        </Link>
      </div>

      <div className="p-1 max-sm:hidden sm:p-2 md:p-2.5 bg-[#FF6200]/20 relative mt-12 sm:mt-16 md:mt-20 lg:mt-24 rounded-2xl sm:rounded-3xl overflow-hidden w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[75vw] xl:max-w-[70vw]">
        <div className="bg-white blur-xl sm:blur-2xl -z-10 absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-[200px] sm:w-[300px] md:w-[400px] lg:w-[600px] aspect-square rounded-full"></div>
        <div className="bg-white blur-xl sm:blur-2xl -z-10 absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-[150px] sm:w-[200px] md:w-[250px] lg:w-[300px] aspect-square rounded-full"></div>
        <img
          className="w-full rounded-xl sm:rounded-2xl z-50"
          src="/image/hero.png"
          alt="Cocursor IDE Preview"
        />
      </div>
      <svg
        className=" absolute -z-50 inset-0 w-full max-sm:hidden"
        viewBox="0 0 1920 1796"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#filter0_f_3_23)">
          <path
            d="M13.3671 760C433.367 1154 1526.03 617.5 2019.87 300L2203.87 1237.5L313.867 1496C-193.5 1081.5 -406.633 366 13.3671 760Z"
            fill="#FA6000"
          />
        </g>
        <defs>
          <filter
            id="filter0_f_3_23"
            x="-509.978"
            y="0"
            width="3013.85"
            height="1796"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feGaussianBlur
              stdDeviation="150"
              result="effect1_foregroundBlur_3_23"
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

export default HeroSection;
