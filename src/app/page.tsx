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
    <div className="pattern-bg flex  flex-col gap-10 sm:pb-3 pb-10">
      <NavBar />
      <HeroSection />

      <ContentSection />
      <IntegrationsSection5 />
      <Pricing />
      <IntegrationsSection1 />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Page;
