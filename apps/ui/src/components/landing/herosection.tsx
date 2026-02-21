import OrangePremButton from "./button/orange-prem-buttion";
import OrangeButton, { BlackButton } from "./button/orange-button";
import Link from "next/link";
import Follower1 from "./cursor-followers/follower1";
import Follower2 from "./cursor-followers/follower2";

const HeroSection = () => {
  return (
    <div className="relative flex flex-col max-sm:overflow-x-hidden justify-center items-center sm:min-h-screen px-4 sm:px-6 md:px-8 lg:px-12 py-20 sm:py-20 md:py-24 lg:py-28 max-sm:mt-10">
      <div className="follower1 absolute left-1/6 bottom-1/3 sm:top-1/4 z-40 pointer-events-none">
        <Follower1 />
      </div>
      <div className="follower2 absolute bottom-1/4 sm:top-1/3 right-1/8 z-40 pointer-events-none">
        <Follower2 />
      </div>

      <OrangePremButton className="rounded-full px-3 py-1 text-[10px] sm:text-xs mb-6 sm:mb-14">
        Code Together Powered by AI
      </OrangePremButton>

      <div className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl flex items-center flex-col text-center leading-7 md:leading-10 lg:leading-14">
        <span className="flex items-center justify-center gap-1 sm:gap-2 md:gap-3 whitespace-nowrap">
          <span>Build software</span>
          <div className="w-10 max-sm:hidden h-5 sm:w-14 sm:h-7 md:w-16 md:h-8 lg:w-20 lg:h-10 xl:w-24 xl:h-10 relative">
            <img
              className="absolute -top-5 sm:-top-7 md:-top-8 lg:-top-9 right-0 inset-0 h-[80px] sm:h-[120px] md:h-[140px] lg:h-[170px] xl:p-0 xl:-top-10 xl:inset-0 xl:h-[200px] scale-x-[2]"
              src="/logo/zap.png"
              alt=""
            />
          </div>
          <span>with AI</span>
        </span>
        <span className="mt-2 sm:mt-3 md:mt-4">Right in your browser</span>
      </div>
      <div className="mt-4 sm:mt-6 md:mt-8 text-center text-base sm:text-lg md:text-xl text-muted-foreground max-w-xs sm:max-w-md md:max-w-lg lg:max-w-none px-4">
        A browser-based IDE where AI helps you write code,{" "}
        <br className=" max-sm:hidden" /> teammates collaborate live, and apps
        run instantly.
      </div>

      <div className="mt-8 sm:mt-12 md:mt-16 flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-0">
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

      <div className="p-1 sm:p-2 md:p-2.5 bg-[#FF6200]/20 relative mt-8 sm:mt-12 md:mt-16 lg:mt-20 rounded-4xl overflow-hidden w-full max-w-[95vw] sm:max-w-[90vw] lg:max-w-[85vw] xl:max-w-[80vw]">
        <img
          src="/image/hero.png"
          className="w-full h-full rounded-3xl z-50 overflow-hidden object-contain"
          alt="Cocursor Dashboard"
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
