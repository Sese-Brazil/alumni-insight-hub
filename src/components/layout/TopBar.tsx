import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/StatusBadge';
import { useState } from 'react';
import { notifications } from '@/data/mockData';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifs] = useState(notifications);
  const unread = notifs.filter(n => !n.read).length;

  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2) || 'U';
  const roleLabel = user?.role === 'admin' ? 'Admin' : 'Alumni';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="h-14 border-b bg-card/80 backdrop-blur flex items-center justify-between px-4 gap-4 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      </div>

      <div className="flex items-center gap-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${user?.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-accent text-accent-foreground'}`}>
          {roleLabel} Side
        </span>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unread > 0 && <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">{unread}</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-3 border-b font-semibold text-sm">Notifications</div>
            <div className="max-h-64 overflow-auto">
              {notifs.map(n => (
                <div key={n.id} className={`p-3 border-b last:border-0 ${n.read ? '' : 'bg-primary/5'}`}>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{n.date}</p>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden md:inline">{user?.name}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5 text-xs text-muted-foreground">{user?.email}</div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
