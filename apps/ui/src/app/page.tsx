import AiAgent from "@/components/landing/ai-agent";
import Bento from "@/components/landing/bento";
import Footer from "@/components/landing/footer";
import HeroSection from "@/components/landing/herosection";
import Iso from "@/components/landing/iso";
import Navbar from "@/components/landing/navbar";
import PeerCoding from "@/components/landing/peer-coding";
import FAQs from "@/components/landing/faq";

const Page = () => {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <Bento />
      <Iso />
      <PeerCoding />
      <AiAgent />
      <FAQs />
      <Footer />
    </div>
  );
};

export default Page;
