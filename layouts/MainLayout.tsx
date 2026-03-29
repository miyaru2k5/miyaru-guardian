"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header />
      <main className="pt-16 pb-24 md:pb-12">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
