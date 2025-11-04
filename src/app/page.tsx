"use client";
import ContentSection from "@/components/content-2";
import FooterSection from "@/components/footer";
import IntegrationsSection1 from "@/components/integrations-1";
import IntegrationsSection5 from "@/components/integrations-5";
import HeroSection from "@/components/landing-page/hero-section";
import NavBar from "@/components/landing-page/nav-bar";
import Pricing from "@/components/pricing";
import Testimonials from "@/components/testimonials";

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
      <FooterSection />
    </div>
  );
};

export default Page;
