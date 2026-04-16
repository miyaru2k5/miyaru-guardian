"use client";

import React from "react";
import FacebookContactList from "@/components/admin/facebook/FacebookContactList";

const FacebookContactsPage: React.FC = () => {
  return (
    <div className="space-y-6 min-w-0 overflow-x-hidden">
      <FacebookContactList />
    </div>
  );
};

export default FacebookContactsPage;

