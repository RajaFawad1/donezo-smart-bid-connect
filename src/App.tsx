
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Services from "./pages/Services";
import About from "./pages/About";
import HowItWorks from "./components/HowItWorks";
import PrivacyPolicy from "./pages/policies/PrivacyPolicy";
import TermsOfService from "./pages/policies/TermsOfService";
import CookiePolicy from "./pages/policies/CookiePolicy";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import JobDetails from "./pages/JobDetails";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import UserOnboarding from "./pages/UserOnboarding";
import PaymentSuccess from "./pages/PaymentSuccess";

// Create a new QueryClient instance inside the component
const App = () => {
  // Create a client inside the component function
  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="app">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/messages/:userId?" element={<Messages />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/onboarding" element={<UserOnboarding />} />
                <Route path="/jobs/:jobId" element={<JobDetails />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/cookies" element={<CookiePolicy />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
