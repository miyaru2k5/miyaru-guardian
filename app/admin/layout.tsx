import AdminLayout from "@/layouts/AdminLayout";

export const metadata = {
  title: "Admin Việt Nam",
};

const AdminRootLayout = ({ children }: { children: React.ReactNode }) => {
  return <AdminLayout>{children}</AdminLayout>;
};

export default AdminRootLayout;
