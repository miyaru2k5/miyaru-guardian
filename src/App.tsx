import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import { ThemeCustomizerProvider } from "./contexts/ThemeCustomizerContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Traders from "./pages/admin/Traders";
import Transactions from "./pages/admin/Transactions";
import Banks from "./pages/admin/Banks";
import Insurance from "./pages/admin/Insurance";
import Profile from "./pages/admin/Profile";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeCustomizerProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="traders" element={<Traders />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="banks" element={<Banks />} />
                <Route path="insurance" element={<Insurance />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeCustomizerProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
