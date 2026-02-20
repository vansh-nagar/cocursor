"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import LandingIso from "./svg/landing-iso";
import OrangeButton, { BlackButton } from "./button/orange-button";
import { Badge } from "../ui/badge";
import Link from "next/link";

const Iso = () => {
  return (
    <div className="min-h-screen flex justify-center items-center px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 md:py-20 lg:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center w-full max-w-[95vw] sm:max-w-[90vw] lg:max-w-[85vw] xl:max-w-[80vw]">
        <div className="flex flex-col justify-center items-start">
          <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium leading-tight text-left">
            WebContainers boot instantly inside your browser
          </div>
          <div className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl text-left">
            Using WebContainers technology, your project runs in an isolated
            Linux-like runtime enabling real-time compilation, dependency
            installation, and instant live preview.
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/main" className="w-full sm:w-max">
              <OrangeButton className="w-full py-2 px-3 sm:w-auto">
                Launch Environment
              </OrangeButton>
            </Link>
            <BlackButton className="py-2 px-3 w-full sm:w-auto">
              Explore How It Works
            </BlackButton>
          </div>
        </div>
        <LandingIso />
      </div>
    </div>
  );
};

export default Iso;
