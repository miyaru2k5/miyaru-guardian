import MainLayout from "../../layouts/MainLayout";
import GDVSection from "../../components/GDVSection";

export const metadata = {
  title: "Giao dịch viên",
  description: "Danh sách giao dịch viên và bộ lọc liên quan đến hệ thống.",
};

const GDVPage = () => {
  return (
    <MainLayout>
      <GDVSection />
    </MainLayout>
  );
};

export default GDVPage;