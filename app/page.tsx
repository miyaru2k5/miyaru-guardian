import MainLayout from "@/layouts/MainLayout";
import HeroSection from "@/components/HeroSection";
import GDVSection from "@/components/GDVSection";
import GDTGSection from "@/components/GDTGSection";
import FacebookAdminSection from "@/components/FacebookAdminSection";
import ProcessSection from "@/components/ProcessSection";
import AdvantagesSection from "@/components/AdvantagesSection";
import SystemTermsSection from "@/components/SystemTermsSection";

export const metadata = {
  title: "Admin Việt Nam",
  description: "Hệ thống bảo vệ giao dịch trung gian và giao dịch viên.",
};

const HomePage = () => {
  return (
    <MainLayout>
      <HeroSection />
      <GDVSection />
      <GDTGSection />
      <FacebookAdminSection />
      <ProcessSection />
      <AdvantagesSection />
      <SystemTermsSection />
    </MainLayout>
  );
};

export default HomePage;
