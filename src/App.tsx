
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import ThankYou from "./pages/ThankYou";
import NotFound from "./pages/NotFound";
import { LegalDocument } from "./components/legal/LegalDocument";
import PapTest from "./pages/PapTest";
import PapTestClick from "./pages/PapTestClick";
import { EverflowProvider } from "./contexts/EverflowContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <EverflowProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/legal/:type" element={<LegalDocument />} />
            <Route path="/pap-test" element={<PapTest />} />
            <Route path="/pap-test-click" element={<PapTestClick />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </EverflowProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
