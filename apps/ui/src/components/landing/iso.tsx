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
    <div className=" h-screen flex justify-center items-center mx-14 ">
      <div className=" grid grid-cols-2 max-lg:grid-cols-1 h-[60vh] w-full max-w-[95vw] sm:max-w-[90vw] lg:max-w-[85vw] xl:max-w-[85vw]">
        <div className="">
          <div className="text-6xl font-medium">
            WebContainers boot instantly inside your browser
          </div>
          <div className="mt-4">
            Using WebContainers technology, your project runs in an isolated
            Linux-like runtime enabling real-time compilation, dependency
            installation, and instant live preview.
          </div>

          <div className="mt-10 flex flex-row  gap-4">
            <Link href="/main" className="w-max">
              <OrangeButton>Launch Environment</OrangeButton>
            </Link>
            <BlackButton className="py-2 px-3">
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
