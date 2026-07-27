import MainLayout from "@/layouts/MainLayout";
import GDVList from "@/components/GDVList";

export const metadata = {
  title: "Admin Việt Nam",
  description: "Danh sách giao dịch viên uy tín và hệ thống bảo vệ giao dịch.",
};

const HomePage = () => {
  return (
    <MainLayout>
      <GDVList />
    </MainLayout>
  );
};

export default HomePage;
