import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giao dịch viên",
  description: "Danh sách giao dịch viên và bộ lọc liên quan đến hệ thống.",
};

export default function GDVLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}