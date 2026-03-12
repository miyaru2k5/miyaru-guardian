import AdminLayout from "@/layouts/AdminLayout";

export const metadata = {
  title: "Admin • Miyaru Guardian",
};

const AdminRootLayout = ({ children }: { children: React.ReactNode }) => {
  return <AdminLayout>{children}</AdminLayout>;
};

export default AdminRootLayout;
