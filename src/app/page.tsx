"use client";
import ContentSection from "@/components/content-2";
import FooterSection from "@/components/footer";
import IntegrationsSection from "@/components/integrations-5";
import HeroSection from "@/components/landing-page/hero-section";
import NavBar from "@/components/landing-page/nav-bar";
import WorkflowImage from "@/components/landing-page/work-flow-img";

const Page = () => {
  return (
    <div className="pattern-bg">
      <NavBar />
      <HeroSection />
      <WorkflowImage />
      <ContentSection />
      <IntegrationsSection />
      <FooterSection />
    </div>
  );
};

export default Page;
