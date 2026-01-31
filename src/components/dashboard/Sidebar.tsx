import type { TUser } from '@/types/auth';
import {
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  Library,
  Power,
  Settings,
  User,
} from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { signout, verifyUser } from '@/actions';
import { Button } from '@/components/ui/button';

type MenuItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  hasArrow?: boolean;
  subItems?: Array<{
    id: string;
    label: string;
    status: 'active' | 'done' | 'hold';
  }>;
  notification?: number;
  category?: string;
};

const menuItems: MenuItem[] = [
  // Main navigation items
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { id: 'library', label: 'Library', icon: <Library className="h-5 w-5" /> },
  { id: 'vocab-trainer', label: 'Vocab Trainer', icon: <GraduationCap className="h-5 w-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
];

type SidebarProps = {
  isOpen: boolean;
  onClose?: () => void;
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<TUser | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await verifyUser();
      setUser(userData);
    };
    loadUser();
  }, []);

  // Get the current active item from pathname
  const getCurrentActiveItem = () => {
    const currentPath = pathname.split('/')[1];
    return currentPath || 'dashboard'; // Default to dashboard if no path
  };

  const handleButtonClick = (buttonId: string) => {
    router.push(`/${buttonId}`);
    if (onClose && window.innerWidth < 768) {
      onClose();
    }
  };

  const handleSignOut = async () => {
    try {
      await signout();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
    setUser(null);
    router.refresh();
    router.push('/signin');
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-40 flex h-screen w-72 flex-col border-r border-border bg-card shadow-sm transition-all duration-300 ease-in-out md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex-shrink-0 border-b border-border p-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg">
            <span className="text-lg font-bold text-primary-foreground">V</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Vocabulary</h1>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <div className="space-y-2">
          {menuItems.filter(item => !item.category).map((item) => {
            const isActive = getCurrentActiveItem() === item.id;
            return (
              <div key={item.id}>
                <Button
                  variant="ghost"
                  className={`h-11 w-full cursor-pointer justify-between rounded-xl px-4 transition-all duration-300 ease-in-out hover:bg-accent hover:text-primary ${
                    isActive ? 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground' : 'text-muted-foreground'
                  }`}
                  onClick={() => handleButtonClick(item.id)}
                >
                  <div className="flex items-center space-x-3">
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.hasArrow && <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-border p-4">
        <div className="flex items-center justify-between rounded-xl bg-accent p-4">
          <div className="flex items-center space-x-3">
            {user?.avatar
              ? (
                  <Image
                    src={user.avatar}
                    alt={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Avatar'}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                )
              : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                    <User className="h-6 w-6 text-primary-foreground" />
                  </div>
                )}
            <div>
              <p className="font-semibold text-foreground">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : 'User'}
              </p>
              <p className="max-w-36 truncate text-sm text-muted-foreground" title={user?.email || 'user@example.com'}>
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-secondary"
            onClick={handleSignOut}
          >
            <Power className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </aside>
  );
};
