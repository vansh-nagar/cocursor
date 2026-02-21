import Bento from "@/components/landing/bento";
import Footer from "@/components/landing/footer";
import HeroSection from "@/components/landing/herosection";
import Iso from "@/components/landing/iso";
import Navbar from "@/components/landing/navbar";
import PeerCoding from "@/components/landing/peer-coding";
import Pricing from "@/components/landing/pricing";
import FAQs from "@/components/landing/faq";

import SectionSeparator from "@/components/landing/separator";
import TOC from "@/components/landing/toc";

const Page = () => {
  return (
    <div className="relative">
      <Navbar />
      <TOC />
      <div id="hero"><HeroSection /></div>
      <SectionSeparator />
      <div id="features"><Bento /></div>
      <SectionSeparator />
      <div id="workspace"><Iso /></div>
      <SectionSeparator />
      <div id="collab"><PeerCoding /></div>
      <SectionSeparator />
      <div id="pricing"><Pricing /></div>
      <SectionSeparator />
      {/* <AiAgent /> */}
      <div id="faq"><FAQs /></div>
      <SectionSeparator />
      <Footer />
    </div>
  );
};

export default Page;
