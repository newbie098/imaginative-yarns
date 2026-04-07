import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import LocaleLayout from "./components/LocaleLayout";
import { FeedbackButton } from "@/components/FeedbackButton";
import Index from "./pages/Index";
import Login from "./pages/Login";
import SavedStories from "./pages/SavedStories";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* English routes (default) */}
            <Route element={<LocaleLayout locale="en" prefix="" />}>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/saved-stories" element={<SavedStories />} />
            </Route>

            {/* Brazilian Portuguese routes */}
            <Route path="/pt-br" element={<LocaleLayout locale="pt-BR" prefix="/pt-br" />}>
              <Route index element={<Index />} />
              <Route path="login" element={<Login />} />
              <Route path="saved-stories" element={<SavedStories />} />
            </Route>

            {/* Swiss German routes */}
            <Route path="/de-ch" element={<LocaleLayout locale="de-CH" prefix="/de-ch" />}>
              <Route index element={<Index />} />
              <Route path="login" element={<Login />} />
              <Route path="saved-stories" element={<SavedStories />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <FeedbackButton />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
