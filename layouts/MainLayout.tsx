"use client";

import Header from "@/components/Header";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-slow ease-standard">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default MainLayout;
