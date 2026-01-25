"use client";

import ContentSection from "@/components/landing-page/content-2";
import Footer from "@/components/landing-page/footer";
import HeroSection from "@/components/landing-page/hero-section";
import IntegrationsSection1 from "@/components/landing-page/integrations-1";
import IntegrationsSection5 from "@/components/landing-page/integrations-5";
import NavBar from "@/components/landing-page/nav-bar";
import Pricing from "@/components/landing-page/pricing";
import Testimonials from "@/components/landing-page/testimonials";

const Page = () => {
  return (
    <div className="pattern-bg flex  flex-col sm:gap-52 gap-10  sm:pb-24 pb-3 relative overflow-hidden">
      <NavBar />
      <HeroSection />

      <ContentSection />
      <IntegrationsSection5 />
      <Pricing />
      <IntegrationsSection1 />
      <Testimonials />
      <Footer />
      <span className=" absolute   -bottom-60 right-1/2  font-extrabold text-[30vw] z-50 translate-x-1/2 text-primary opacity-10  pointer-events-none ">
        ORCHA
      </span>
    </div>
  );
};

export default Page;
