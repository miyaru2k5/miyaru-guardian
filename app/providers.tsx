"use client";

import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";
import { ThemeCustomizerProvider } from "@/contexts/ThemeCustomizerContext";
import PageViewTracker from "@/components/PageViewTracker";

const queryClient = new QueryClient();

const Providers = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeCustomizerProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <PageViewTracker />
          {children}
        </TooltipProvider>
      </ThemeCustomizerProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default Providers;
