"use client";
import HeroSection from "@/components/landing-page/hero-section";
import NavBar from "@/components/landing-page/nav-bar";
import WorkFlowImage from "@/components/landing-page/work-flow-img";
import { Button } from "@/components/ui/button";

const Page = () => {
  return (
    <div className="pattern-bg">
      <NavBar />
      <HeroSection />
      <WorkFlowImage />
    </div>
  );
};

export default Page;
