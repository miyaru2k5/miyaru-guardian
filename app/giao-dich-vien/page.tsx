"use client";

import MainLayout from "@/layouts/MainLayout";
import GDVList from "@/components/GDVList";

/** Same GDV list UI as homepage — reusable component */
const GDVPage = () => {
  return (
    <MainLayout>
      <GDVList />
    </MainLayout>
  );
};

export default GDVPage;
