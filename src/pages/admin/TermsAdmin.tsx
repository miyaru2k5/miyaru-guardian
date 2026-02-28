import React from "react";
import TermsList from "@/components/admin/terms/TermsList";

const AdminTermsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Điều khoản hệ thống</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý nội dung điều khoản, chính sách sử dụng.
        </p>
      </div>
      <TermsList />
    </div>
  );
};

export default AdminTermsPage;

