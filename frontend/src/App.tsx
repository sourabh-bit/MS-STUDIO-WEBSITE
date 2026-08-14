import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import LoginModal from "@/components/auth/LoginModal";
import Layout from "./pages/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import Portfolio from "./pages/Portfolio";
import Testimonials from "./pages/Testimonials";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Classes from "./pages/Classes";   // ⭐ ADDED IMPORT
import RefundAndCancellationPolicy from "./pages/RefundAndCancellationPolicy";
import ScrollToTop from "./components/ScrollToTop";
import MasterclassCheckout from "./pages/MasterclassCheckout";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";
import PaymentPending from "./pages/PaymentPending";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
      <AuthProvider>
      <LoginModal />

  <ScrollToTop />

  <Routes>
    <Route element={<Layout />}>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/portfolio" element={<Portfolio />} />
      <Route path="/testimonials" element={<Testimonials />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/refund-and-cancellation-policy" element={<RefundAndCancellationPolicy />} />
      <Route path="/classes" element={<Classes />} />
      <Route path="/classes/undefined" element={<Navigate to="/classes" replace />} />
      <Route path="/classes/checkout" element={<MasterclassCheckout />} />
      <Route path="/success" element={<PaymentSuccess />} />
      <Route path="/failure" element={<PaymentFailure />} />
      <Route path="/payment/pending" element={<PaymentPending />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>

      </AuthProvider>
</BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

