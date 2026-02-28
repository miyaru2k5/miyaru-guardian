import MainLayout from "@/layouts/MainLayout";
import HeroSection from "@/components/HeroSection";
import GDVSection from "@/components/GDVSection";
import GDTGSection from "@/components/GDTGSection";
import BankAccountsSection from "@/components/BankAccountsSection";
import FacebookAdminSection from "@/components/FacebookAdminSection";
import ProcessSection from "@/components/ProcessSection";
import AdvantagesSection from "@/components/AdvantagesSection";
import SystemTermsSection from "@/components/SystemTermsSection";

const Index = () => {
  return (
    <MainLayout>
      <HeroSection />
      <GDVSection />
      <GDTGSection />
      <BankAccountsSection />
      <FacebookAdminSection />
      <ProcessSection />
      <AdvantagesSection />
      <SystemTermsSection />
    </MainLayout>
  );
};

export default Index;
