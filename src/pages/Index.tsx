import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import GDVSection from "@/components/GDVSection";
import GDTGSection from "@/components/GDTGSection";
import FacebookAdminSection from "@/components/FacebookAdminSection";
import ProcessSection from "@/components/ProcessSection";
import AdvantagesSection from "@/components/AdvantagesSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <GDVSection />
        <GDTGSection />
        <FacebookAdminSection />
        <ProcessSection />
        <AdvantagesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
