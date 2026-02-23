"use client";
import LandingIso from "./svg/landing-iso";

const Iso = () => {
  return (
    <div className="relative w-full flex flex-col items-center py-12 sm:py-20 px-4">
      <div className="max-w-4xl w-full text-center mb-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-medium tracking-tight mb-6">
          Full In-Browser Development
        </h2>
      </div>

      <div className="w-full max-w-[80vw] lg:max-w-[70vw] flex justify-center items-center">
        <LandingIso />
      </div>
    </div>
  );
};

export default Iso;
