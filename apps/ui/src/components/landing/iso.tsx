"use client";

import React from "react";
import LandingIso from "./svg/landing-iso";
import OrangeButton from "./button/orange-button";
import Link from "next/link";
import { ArrowRight, Menu as MenuIcon } from "lucide-react";

const Iso = () => {
  return (
    <div className="relative w-full justify-center items-center min-h-screen  text-white p-4 md:p-6 lg:p-4 flex flex-col md:flex-row gap-6">
      
<div className="w-[80vw]">


        <LandingIso />
</div>
      
    </div>
  );
};

export default Iso;
