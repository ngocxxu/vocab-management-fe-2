import {
  Calendar,
  ChevronDown,
  CreditCard,
  DollarSign,
  FileText,
  Globe,
  HelpCircle,
  Kanban,
  Layers,
  LayoutDashboard,
  Mail,
  Power,
  User,
} from 'lucide-react';
import React from 'react';
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
  { id: 'calendar', label: 'Calendar', icon: <Calendar className="h-5 w-5" /> },
  { id: 'email', label: 'Email', icon: <Mail className="h-5 w-5" /> },
  { id: 'tickets', label: 'Tickets', icon: <CreditCard className="h-5 w-5" /> },
  { id: 'kanban', label: 'Kanban', icon: <Kanban className="h-5 w-5" />, hasArrow: true },
  { id: 'invoice', label: 'Invoice', icon: <FileText className="h-5 w-5" />, hasArrow: true },

  // Pages section
  { id: 'pricing', label: 'Pricing', icon: <DollarSign className="h-5 w-5" />, category: 'PAGES' },
  { id: 'account-setting', label: 'Account Setting', icon: <User className="h-5 w-5" />, category: 'PAGES' },
  { id: 'faq', label: 'FAQ', icon: <HelpCircle className="h-5 w-5" />, category: 'PAGES' },
  { id: 'landingpage', label: 'Landingpage', icon: <Globe className="h-5 w-5" />, category: 'PAGES' },
  { id: 'widgets', label: 'Widgets', icon: <Layers className="h-5 w-5" />, category: 'PAGES', hasArrow: true },

  // Forms section
  { id: 'form-elements', label: 'Form Elements', icon: <LayoutDashboard className="h-5 w-5" />, category: 'FORMS', hasArrow: true },
  { id: 'form-layout', label: 'Form Layout', icon: <FileText className="h-5 w-5" />, category: 'FORMS' },
  { id: 'form-horizontal', label: 'Form Horizontal', icon: <FileText className="h-5 w-5" />, category: 'FORMS' },
  { id: 'form-vertical', label: 'Form Vertical', icon: <FileText className="h-5 w-5" />, category: 'FORMS' },
  { id: 'form-custom', label: 'Form Custom', icon: <FileText className="h-5 w-5" />, category: 'FORMS' },
];

type SidebarProps = {
  isOpen: boolean;
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  return (
    <aside
      className={`fixed top-0 left-0 z-40 flex h-screen w-72 flex-col border-r border-slate-200/60 bg-white shadow-sm transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Logo Section - Fixed at top */}
      <div className="flex-shrink-0 border-b border-slate-200/60 p-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
            <span className="text-lg font-bold text-white">M</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Modernize</h1>
        </div>
      </div>

      {/* Scrollable Menu Items Section */}
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        {/* Main navigation items */}
        <div className="space-y-2">
          {menuItems.filter(item => !item.category).map(item => (
            <div key={item.id}>
              <Button
                variant="ghost"
                className="h-11 w-full justify-between rounded-xl px-4 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.hasArrow && <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          ))}
        </div>

        {/* Pages section */}
        <div className="space-y-2">
          <h3 className="px-4 text-xs font-bold tracking-wider text-slate-500 uppercase">PAGES</h3>
          {menuItems.filter(item => item.category === 'PAGES').map(item => (
            <div key={item.id}>
              <Button
                variant="ghost"
                className="h-11 w-full justify-between rounded-xl px-4 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.hasArrow && <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          ))}
        </div>

        {/* Forms section */}
        <div className="space-y-2">
          <h3 className="px-4 text-xs font-bold tracking-wider text-slate-500 uppercase">FORMS</h3>
          {menuItems.filter(item => item.category === 'FORMS').map(item => (
            <div key={item.id}>
              <Button
                variant="ghost"
                className="h-11 w-full justify-between rounded-xl px-4 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.hasArrow && <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* User Profile Section - Fixed at bottom */}
      <div className="flex-shrink-0 border-t border-slate-200/60 p-4">
        <div className="flex items-center justify-between rounded-xl bg-blue-50 p-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-blue-600">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Mathew</p>
              <p className="text-sm text-slate-600">Designer</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Power className="h-4 w-4 text-slate-600" />
          </Button>
        </div>
      </div>
    </aside>
  );
};
