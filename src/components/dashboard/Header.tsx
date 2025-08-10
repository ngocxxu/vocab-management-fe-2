import { Bell, ChevronDown, Flag, Menu, Moon, Search, ShoppingCart, User } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type HeaderProps = {
  onSidebarToggle: () => void;
};

export const Header: React.FC<HeaderProps> = ({ onSidebarToggle }) => {
  return (
    <header className="border-b border-slate-200/60 bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-6">
          {/* Hamburger Menu */}
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl hover:bg-slate-100"
            onClick={onSidebarToggle}
          >
            <Menu className="h-5 w-5 text-slate-600" />
          </Button>

          {/* Search */}
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search..."
              className="h-10 w-64 rounded-xl border-slate-200 bg-slate-50 pl-10 text-sm focus:border-blue-500 focus:bg-white focus:ring-blue-500"
            />
          </div>

          {/* Apps Dropdown */}
          <div className="flex cursor-pointer items-center space-x-2 hover:text-slate-700">
            <span className="text-sm font-medium text-slate-600">Apps</span>
            <ChevronDown className="h-4 w-4 text-slate-600" />
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Button variant="ghost" className="h-auto p-0 text-sm font-medium text-slate-600 hover:text-slate-900">
              Chat
            </Button>
            <Button variant="ghost" className="h-auto p-0 text-sm font-medium text-slate-600 hover:text-slate-900">
              Calendar
            </Button>
            <Button variant="ghost" className="h-auto p-0 text-sm font-medium text-slate-600 hover:text-slate-900">
              Email
            </Button>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* UK Flag */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200">
            <Flag className="h-4 w-4 text-slate-600" />
          </div>

          {/* Shopping Cart */}
          <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-slate-100">
            <ShoppingCart className="h-5 w-5 text-slate-600" />
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-medium text-white">
              0
            </span>
          </Button>

          {/* Dark Mode Toggle */}
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100">
            <Moon className="h-5 w-5 text-slate-600" />
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-slate-100">
            <Bell className="h-5 w-5 text-slate-600" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-blue-500"></span>
          </Button>

          {/* User Profile */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-blue-600 shadow-sm">
            <User className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
};
