import React from "react";
import OrangePremButton from "./button/orange-prem-buttion";
import OrangeButton, { BlackButton } from "./button/orange-button";
import Link from "next/link";

const HeroSection = () => {
  return (
    <div className="flex flex-col justify-center items-center h-[165vh] ">
      <OrangePremButton className=" rounded-full px-3 py-1 text-[10px] mb-6">
        Code Together Powered by AI
      </OrangePremButton>
      <div className="text-7xl flex  items-center font-medium flex-col ">
        <span className=" flex  items-center">
          Build software
          <div className="w-24 h-10 relative">
            <img
              className="absolute -top-10 right-0  inset-0 h-[200px] scale-x-[2]"
              src="/logo/zap.png"
              alt=""
            />
          </div>
          with AI
        </span>
        <span>Right in your browser.</span>
      </div>
      <div className="mt-8 text-center text-2xl text-muted-foreground max-w-xl leading-7">
        A browser-based IDE where AI helps you write code <br /> teammates
        collaborate live, and apps run instantly.
      </div>

      <div className="mt-16 flex gap-8">
        <Link href="/main">
          <OrangeButton className="py-2 px-4 cursor-pointer">
            Launch Cocursor
          </OrangeButton>
        </Link>
        <Link href="/docs">
          <BlackButton className="py-2 px-4 bg-black cursor-pointer">
            See How It Works
          </BlackButton>
        </Link>
      </div>

      <div className="  p-2 bg-[#FF6200]/20 relative mt-26 rounded-3xl overflow-hidden ">
        <div className="bg-white blur-2xl -z-10 absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 right-0 w-[600px] aspect-square rounded-full"></div>
        <div className="bg-white blur-2xl -z-10 absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 right-0 w-[300px] aspect-square rounded-full"></div>
        <img
          className="w-[65vw] rounded-2xl z-50"
          src="/image/hero.png"
          alt=""
        />
      </div>
      <svg
        className=" absolute -z-50 inset-0 w-full"
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
            color-interpolation-filters="sRGB"
          >
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
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
