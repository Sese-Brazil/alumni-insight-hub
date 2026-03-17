import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import TopBar from '@/components/layout/TopBar';
import { FirstLoginDialog } from '@/components/layout/FirstLoginDialog';
import { useEffect, useState } from 'react';

export default function AppLayout() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Add state for sidebar

  useEffect(() => {
    if (!isAuthenticated) navigate('/login', { replace: true });
  }, [isAuthenticated, navigate]);

  if (!user) return null;

  // Function to toggle sidebar
  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Pass the required prop */}
          <TopBar onMenuClick={handleMenuClick} />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
          <footer className="border-t px-6 py-3 text-xs text-muted-foreground flex items-center justify-between">
            <span>Alumni Tracer v1.0</span>
            <span>support@university.edu</span>
          </footer>
        </div>
      </div>
      {user.role === 'alumni' && user.firstLogin && <FirstLoginDialog />}
    </SidebarProvider>
  );
}