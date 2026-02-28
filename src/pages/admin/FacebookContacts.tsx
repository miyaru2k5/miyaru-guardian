import React from "react";
import FacebookContactList from "@/components/admin/facebook/FacebookContactList";

const FacebookContactsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Liên hệ Facebook Admin</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý danh sách liên hệ các chi nhánh / nền tảng hỗ trợ.
        </p>
      </div>
      <FacebookContactList />
    </div>
  );
};

export default FacebookContactsPage;

