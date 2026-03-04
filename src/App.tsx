import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import ActivationPage from "./pages/ActivationPage";
import AppLayout from "./pages/AppLayout";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminPredictions from "./pages/admin/AdminPredictions";
import AdminReports from "./pages/admin/AdminReports";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSurveyManager from "./pages/admin/AdminSurveyManager";
import AdminContent from "./pages/admin/AdminContent";
import AlumniDashboard from "./pages/alumni/AlumniDashboard";
import AlumniProfile from "./pages/alumni/AlumniProfile";
import AlumniSurvey from "./pages/alumni/AlumniSurvey";
import AlumniSubmissions from "./pages/alumni/AlumniSubmissions";
import AlumniResults from "./pages/alumni/AlumniResults";
import AlumniChangePassword from "./pages/alumni/AlumniChangePassword";
import SystemOverview from "./pages/shared/SystemOverview";
import HelpGuide from "./pages/shared/HelpGuide";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/app/admin/analytics' : '/app/alumni/dashboard'} replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/activate" element={<ActivationPage />} />
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<AppRedirect />} />
              <Route path="admin/analytics" element={<AdminAnalytics />} />
              <Route path="admin/predictions" element={<AdminPredictions />} />
              <Route path="admin/reports" element={<AdminReports />} />
              <Route path="admin/users" element={<AdminUsers />} />
              <Route path="admin/survey-manager" element={<AdminSurveyManager />} />
              <Route path="admin/content" element={<AdminContent />} />
              <Route path="alumni/dashboard" element={<AlumniDashboard />} />
              <Route path="alumni/profile" element={<AlumniProfile />} />
              <Route path="alumni/survey" element={<AlumniSurvey />} />
              <Route path="alumni/submissions" element={<AlumniSubmissions />} />
              <Route path="alumni/results" element={<AlumniResults />} />
              <Route path="alumni/change-password" element={<AlumniChangePassword />} />
              <Route path="overview" element={<SystemOverview />} />
              <Route path="help" element={<HelpGuide />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
