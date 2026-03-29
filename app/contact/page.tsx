import MainLayout from "../../layouts/MainLayout";
import FacebookAdminSection from "@/components/FacebookAdminSection";

export const metadata = {
  title: "Liên hệ",
  description: "Danh sách liên hệ liên quan đến hệ thống.",
};

const GDVPage = () => {
  return (
    <MainLayout>
      <FacebookAdminSection />
    </MainLayout>
  );
};

export default GDVPage;