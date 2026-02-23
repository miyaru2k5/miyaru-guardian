import MainLayout from "@/layouts/MainLayout";
import HeroSection from "@/components/HeroSection";
import GDVSection from "@/components/GDVSection";
import GDTGSection from "@/components/GDTGSection";
import FacebookAdminSection from "@/components/FacebookAdminSection";
import ProcessSection from "@/components/ProcessSection";
import AdvantagesSection from "@/components/AdvantagesSection";

const Index = () => {
  return (
    <MainLayout>
      <HeroSection />
      <GDVSection />
      <GDTGSection />
      <FacebookAdminSection />
      <ProcessSection />
      <AdvantagesSection />
    </MainLayout>
  );
};

export default Index;
