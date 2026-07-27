"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { ThemeCustomizerProvider } from "@/contexts/ThemeCustomizerContext";
import SwalHost from "@/components/SwalHost";

const queryClient = new QueryClient();

const Providers = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeCustomizerProvider>
        <TooltipProvider>
          {children}
          {/* Global SweetAlert2-style notifications */}
          <SwalHost />
        </TooltipProvider>
      </ThemeCustomizerProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default Providers;
