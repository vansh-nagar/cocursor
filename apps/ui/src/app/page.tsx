import Bento from "@/components/landing/bento";
import Footer from "@/components/landing/footer";
import HeroSection from "@/components/landing/herosection";
import Iso from "@/components/landing/iso";
import Navbar from "@/components/landing/navbar";
import PeerCoding from "@/components/landing/peer-coding";
import Pricing from "@/components/landing/pricing";
import FAQs from "@/components/landing/faq";

const Page = () => {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <Bento />
      <Iso />
      <PeerCoding />
      <Pricing />
      {/* <AiAgent /> */}
      <FAQs />
      <Footer />
    </div>
  );
};

export default Page;
