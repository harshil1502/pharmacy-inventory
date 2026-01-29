'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Send,
  Store,
  Users,
  Upload,
  Menu,
  X,
  Pill,
  CheckSquare,
  Truck,
  Calendar,
  MessageSquare,
  Building2,
  FileText,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { UserRole } from '@/types';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles?: UserRole[];
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'All Inventory', href: '/inventory', icon: Package, roles: ['associate', 'admin', 'regular'] },
  { title: 'Requests', href: '/requests', icon: Send, roles: ['associate', 'admin', 'regular'] },
  { title: 'Tasks', href: '/tasks', icon: CheckSquare, roles: ['associate', 'admin', 'regular'] },
  { title: 'Messages', href: '/messages', icon: MessageSquare, roles: ['associate', 'admin', 'regular'] },
  { title: 'Schedule', href: '/schedules', icon: Calendar },
  { title: 'Upload Reports', href: '/admin/upload', icon: Upload, roles: ['associate', 'admin'] },
  { title: 'Manage Stores', href: '/admin/stores', icon: Store, roles: ['associate'] },
  { title: 'Manage Users', href: '/admin/users', icon: Users, roles: ['associate', 'admin'] },
  { title: 'Manage Drivers', href: '/admin/drivers', icon: Truck, roles: ['associate', 'admin'] },
  { title: 'Request Logs', href: '/admin/logs', icon: FileText, roles: ['associate', 'admin'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, stores, sidebarOpen, setSidebarOpen } = useAppStore();

  const storeNavItems: NavItem[] = stores.map((store) => ({
    title: store.name,
    href: `/inventory/store/${store.id}`,
    icon: Building2,
    roles: ['associate', 'admin', 'regular'] as UserRole[],
  }));

  const allNavItems = [...navItems];
  const inventoryIndex = allNavItems.findIndex(item => item.href === '/inventory');
  if (inventoryIndex !== -1) {
    allNavItems.splice(inventoryIndex + 1, 0, ...storeNavItems);
  }

  const filteredNavItems = allNavItems.filter((item) => {
    if (!item.roles) return true;
    return user?.role && item.roles.includes(user.role);
  });

  return (
    <>
      {/* Overlay - shown on all screens when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-72 transform bg-white border-r border-gray-200 transition-transform duration-200 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-5">
          <Link href="/dashboard" className="flex items-center space-x-2.5">
            <Pill className="h-7 w-7 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">PharmSync</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Store info */}
        {user?.store && (
          <div className="mx-3 my-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Current Store</p>
            <p className="font-semibold text-gray-900 text-sm truncate">{user.store.name}</p>
            <span className="text-xs text-gray-500 font-mono">{user.store.code}</span>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-3 py-3 overflow-y-auto max-h-[calc(100vh-16rem)]">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const isStoreItem = item.href.startsWith('/inventory/store/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-md py-2 text-sm font-medium transition-colors',
                  isStoreItem ? 'pl-10 pr-3' : 'px-3',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className={cn(
                  isStoreItem ? 'h-4 w-4' : 'h-5 w-5',
                  isActive ? 'text-indigo-600' : 'text-gray-400'
                )} />
                <span className={cn(isStoreItem && 'text-xs')}>
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User role badge */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 px-3 py-3 bg-white">
          <div className="flex items-center justify-between p-3 rounded-md bg-gray-50">
            <div className="flex items-center space-x-2.5">
              <div className={cn(
                'h-2 w-2 rounded-full',
                user?.role === 'associate' ? 'bg-purple-500' :
                user?.role === 'admin' ? 'bg-rose-500' :
                user?.role === 'driver' ? 'bg-blue-500' : 'bg-emerald-500'
              )} />
              <span className="text-sm text-gray-700 capitalize font-medium truncate max-w-[120px]">{user?.full_name || user?.role || 'User'}</span>
            </div>
            <span className={cn(
              'text-xs px-2 py-0.5 rounded font-medium capitalize',
              user?.role === 'associate' ? 'bg-purple-100 text-purple-700' :
              user?.role === 'admin' ? 'bg-rose-100 text-rose-700' :
              user?.role === 'driver' ? 'bg-blue-100 text-blue-700' :
              'bg-emerald-100 text-emerald-700'
            )}>
              {user?.role || 'User'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}

export function SidebarToggle() {
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setSidebarOpen(!sidebarOpen)}
      className="text-gray-500 hover:text-gray-700"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}
