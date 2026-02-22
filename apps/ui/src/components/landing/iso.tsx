"use client";

import React from "react";
import LandingIso from "./svg/landing-iso";
import OrangeButton from "./button/orange-button";
import Link from "next/link";
import { ArrowRight, Menu as MenuIcon } from "lucide-react";

const Iso = () => {
  return (
    <div className="relative w-full flex flex-col items-center py-12 sm:py-20 px-4">
      <div className="max-w-4xl w-full text-center mb-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-medium tracking-tight mb-6">
          Full In-Browser Development
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Powered by WebContainers, Cocursor provides a secure, sandboxed Linux-like environment in your browser. Run npm commands, start dev servers, and see live previews instantly.
        </p>
      </div>

      <div className="w-full max-w-[90vw] lg:max-w-[80vw] flex justify-center items-center">
        <LandingIso />
      </div>
    </div>
  );
};

export default Iso;
