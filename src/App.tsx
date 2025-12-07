import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ChapterSelect from "./pages/ChapterSelect";
import GameSelect from "./pages/GameSelect";
import Session from "./pages/Session";
import VisualLearning from "./pages/VisualLearning";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import SeedQuestions from "./pages/SeedQuestions";
import { LoadingSpinner } from "./components/LoadingSpinner";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chapters"
              element={
                <ProtectedRoute>
                  <ChapterSelect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/games/:chapter"
              element={
                <ProtectedRoute>
                  <GameSelect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/session/:gameId/:difficulty"
              element={
                <ProtectedRoute>
                  <Session />
                </ProtectedRoute>
              }
            />
            <Route
              path="/learn/:gameId"
              element={
                <ProtectedRoute>
                  <VisualLearning />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/seed-questions"
              element={
                <ProtectedRoute>
                  <SeedQuestions />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
