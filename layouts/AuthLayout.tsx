"use client";

import ThemeToggle from "@/components/ThemeToggle";
import { useRouter } from "next/navigation";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-300">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <button onClick={() => router.push("/")} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center btn-glow">
              <span className="text-primary-foreground font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold text-foreground">Admin</span>
          </button>
          <ThemeToggle />
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center pt-16 px-4 py-8">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
