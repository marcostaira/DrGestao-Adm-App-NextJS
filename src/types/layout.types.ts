import { User } from '@/types/auth.types';
export interface SidebarProps {
  isOpen: boolean;
}

export interface MenuItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  permission?: string;
  level?: number;
  children?: MenuItem[];
}

export interface LayoutProps {
  children: React.ReactNode;
}

export interface ToolbarProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export interface UserMenuProps {
  user: User;
}
