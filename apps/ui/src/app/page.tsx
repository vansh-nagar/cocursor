import Bento from "@/components/landing/bento";
import Footer from "@/components/landing/footer";
import HeroSection from "@/components/landing/herosection";
import Iso from "@/components/landing/iso";
import Navbar from "@/components/landing/navbar";

const Page = () => {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <Iso />
      <Bento />
      <Footer />
    </div>
  );
};

export default Page;
