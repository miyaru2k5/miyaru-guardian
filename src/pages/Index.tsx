import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import GDVSection from "@/components/GDVSection";
import GDTGSection from "@/components/GDTGSection";
import BankSection from "@/components/BankSection";
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
        <BankSection />
        <ProcessSection />
        <AdvantagesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
