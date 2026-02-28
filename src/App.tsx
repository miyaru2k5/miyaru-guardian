import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import { ThemeCustomizerProvider } from "./contexts/ThemeCustomizerContext";
import RequireGuest from "./components/RequireGuest";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AuthConfirm from "./pages/AuthConfirm";
import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Traders from "./pages/admin/Traders";
import Transactions from "./pages/admin/Transactions";
import Banks from "./pages/admin/Banks";
import Insurance from "./pages/admin/Insurance";
import Profile from "./pages/admin/Profile";
import Users from "./pages/admin/Users";
import AdminSettings from "./pages/admin/AdminSettings";
import Categories from "./pages/admin/Categories";
import FacebookContactsPage from "./pages/admin/FacebookContacts";
import AdminTermsPage from "./pages/admin/TermsAdmin";
import ContactFacebookPage from "./pages/ContactFacebookPage";
import UserTermsPage from "./pages/UserTermsPage";
import UserProfile from "./pages/UserProfile";
import { PageViewTracker } from "./components/PageViewTracker";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeCustomizerProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <PageViewTracker />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/lien-he" element={<ContactFacebookPage />} />
              <Route path="/dieu-khoan/:slug" element={<UserTermsPage />} />
              <Route path="/login" element={<RequireGuest><Login /></RequireGuest>} />
              <Route path="/register" element={<RequireGuest><Register /></RequireGuest>} />
              <Route path="/forgot-password" element={<RequireGuest><ForgotPassword /></RequireGuest>} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/auth/confirm" element={<AuthConfirm />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="traders" element={<Traders />} />
                <Route path="categories" element={<Categories />} />
                <Route path="facebook-contacts" element={<FacebookContactsPage />} />
                <Route path="terms" element={<AdminTermsPage />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="banks" element={<Banks />} />
                <Route path="insurance" element={<Insurance />} />
                <Route path="profile" element={<Profile />} />
                <Route path="users" element={<Users />} />
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
