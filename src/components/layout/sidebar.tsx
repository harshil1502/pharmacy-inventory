'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Send,
  Settings,
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';

import { UserRole } from '@/types';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles?: UserRole[]; // If specified, only these roles can see the item
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'All Inventory',
    href: '/inventory',
    icon: Package,
    roles: ['associate', 'admin', 'regular'], // Not drivers
  },
  // Individual store pages will be inserted dynamically here
  {
    title: 'Requests',
    href: '/requests',
    icon: Send,
    roles: ['associate', 'admin', 'regular'], // Not drivers
  },
  {
    title: 'Tasks',
    href: '/tasks',
    icon: CheckSquare,
    roles: ['associate', 'admin', 'regular'], // Not drivers
  },
  {
    title: 'Messages',
    href: '/messages',
    icon: MessageSquare,
    roles: ['associate', 'admin', 'regular'], // Not drivers
  },
  {
    title: 'Schedule',
    href: '/schedules',
    icon: Calendar,
    // All roles can view their schedule
  },
  {
    title: 'Upload Reports',
    href: '/admin/upload',
    icon: Upload,
    roles: ['associate', 'admin'], // Only admins and associates
  },
  {
    title: 'Manage Stores',
    href: '/admin/stores',
    icon: Store,
    roles: ['associate'], // Only associates
  },
  {
    title: 'Manage Users',
    href: '/admin/users',
    icon: Users,
    roles: ['associate', 'admin'], // Associates and admins
  },
  {
    title: 'Manage Drivers',
    href: '/admin/drivers',
    icon: Truck,
    roles: ['associate', 'admin'], // Associates and admins
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, stores, sidebarOpen, setSidebarOpen } = useAppStore();

  // Generate dynamic store navigation items
  const storeNavItems: NavItem[] = stores.map((store) => ({
    title: store.name,
    href: `/inventory/store/${store.id}`,
    icon: Building2,
    roles: ['associate', 'admin', 'regular'],
  }));

  // Insert store items after "All Inventory"
  const allNavItems = [...navItems];
  const inventoryIndex = allNavItems.findIndex(item => item.href === '/inventory');
  if (inventoryIndex !== -1) {
    allNavItems.splice(inventoryIndex + 1, 0, ...storeNavItems);
  }

  const filteredNavItems = allNavItems.filter((item) => {
    // If no roles specified, everyone can see it
    if (!item.roles) return true;
    // Otherwise, check if user's role is in the allowed list
    return user?.role && item.roles.includes(user.role);
  });

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-72 transform bg-gradient-to-b from-[#161B26]/95 via-[#1E2433]/90 to-[#0F1419]/95 backdrop-blur-2xl border-r border-white/10 shadow-[4px_0_24px_-2px_rgba(0,0,0,0.8)] transition-all duration-500 ease-in-out lg:translate-x-0 lg:static lg:z-auto before:absolute before:inset-0 before:bg-gradient-to-b before:from-indigo-500/5 before:to-transparent before:pointer-events-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="relative flex h-20 items-center justify-between border-b border-white/10 px-6 bg-gradient-to-r from-indigo-600/10 via-pink-600/10 to-teal-600/10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-pink-500/5 animate-gradient" />

          <Link href="/dashboard" className="flex items-center space-x-3 group relative z-10">
            <div className="relative">
              <Pill className="h-10 w-10 text-indigo-400 group-hover:text-indigo-300 transition-all duration-300 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] group-hover:drop-shadow-[0_0_25px_rgba(99,102,241,0.8)]" />
              <div className="absolute inset-0 bg-indigo-500/30 blur-xl group-hover:bg-indigo-400/50 transition-all duration-300 animate-pulse" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-indigo-400 via-pink-400 to-teal-400 bg-clip-text text-transparent group-hover:from-indigo-300 group-hover:via-pink-300 group-hover:to-teal-300 transition-all duration-300 animate-gradient bg-[length:200%_auto]">
              PharmSync
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-slate-400 hover:text-white hover:bg-white/10 relative z-10"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Store info */}
        {user?.store && (
          <div className="mx-4 my-5 p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-pink-500/5 to-transparent border border-white/10 backdrop-blur-sm relative overflow-hidden group hover:border-indigo-400/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-2 font-semibold relative z-10">Current Store</p>
            <p className="font-bold text-white truncate text-base relative z-10 group-hover:text-indigo-100 transition-colors">{user.store.name}</p>
            <div className="flex items-center gap-2 mt-3 relative z-10">
              <span className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500/20 to-pink-500/20 text-indigo-200 border border-indigo-400/30 font-bold tracking-wide shadow-lg shadow-indigo-500/10">
                {user.store.code}
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-3 py-4 overflow-y-auto">
          {filteredNavItems.map((item, index) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const isStoreItem = item.href.startsWith('/inventory/store/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-xl py-3.5 text-sm font-bold transition-all duration-300 group relative overflow-hidden animate-slide-in-right',
                  isStoreItem ? 'pl-11 pr-4' : 'px-4',
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-pink-600 text-white shadow-xl shadow-indigo-500/40 scale-[1.02]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 hover:scale-[1.01] hover:shadow-lg'
                )}
                style={{ animationDelay: `${index * 30}ms` }}
                onClick={() => setSidebarOpen(false)}
              >
                {isActive && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 via-pink-400/20 to-transparent animate-pulse" />
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-white via-pink-200 to-teal-200 rounded-l-full shadow-lg shadow-white/50" />
                  </>
                )}
                <item.icon className={cn(
                  'relative z-10 transition-all duration-300',
                  isStoreItem ? 'h-4 w-4' : 'h-5 w-5',
                  isActive
                    ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                    : 'text-slate-400 group-hover:text-indigo-400 group-hover:drop-shadow-[0_0_6px_rgba(99,102,241,0.6)]'
                )} />
                <span className={cn(
                  'relative z-10 transition-all tracking-wide',
                  isStoreItem && 'text-xs',
                  isActive && 'font-extrabold'
                )}>
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User role badge */}
        <div className="border-t border-white/10 px-4 py-5 bg-gradient-to-t from-[#0F1419]/80 to-transparent">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 backdrop-blur-sm relative overflow-hidden group hover:border-indigo-400/30 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="flex items-center space-x-3 relative z-10">
              <div className={cn(
                'h-3 w-3 rounded-full shadow-lg relative',
                user?.role === 'associate' ? 'bg-purple-500 shadow-purple-500/60 animate-pulse' :
                user?.role === 'admin' ? 'bg-rose-500 shadow-rose-500/60 animate-pulse' :
                user?.role === 'driver' ? 'bg-blue-500 shadow-blue-500/60 animate-pulse' : 'bg-emerald-500 shadow-emerald-500/60 animate-pulse'
              )}>
                <div className="absolute inset-0 rounded-full animate-ping opacity-75" style={{
                  backgroundColor: user?.role === 'associate' ? '#a855f7' :
                                 user?.role === 'admin' ? '#f43f5e' :
                                 user?.role === 'driver' ? '#3b82f6' : '#10b981'
                }} />
              </div>
              <span className="text-sm text-slate-200 capitalize font-bold tracking-wide">{user?.role || 'Regular'}</span>
            </div>
            <div className={cn(
              'text-xs px-3 py-1.5 rounded-lg font-black uppercase tracking-wider shadow-md relative z-10',
              user?.role === 'associate' ? 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-200 border border-purple-400/40 shadow-purple-500/20' :
              user?.role === 'admin' ? 'bg-gradient-to-r from-rose-500/20 to-rose-600/20 text-rose-200 border border-rose-400/40 shadow-rose-500/20' :
              user?.role === 'driver' ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-200 border border-blue-400/40 shadow-blue-500/20' :
              'bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 text-emerald-200 border border-emerald-400/40 shadow-emerald-500/20'
            )}>
              {user?.role || 'User'}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export function SidebarToggle() {
  const { setSidebarOpen } = useAppStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="lg:hidden"
      onClick={() => setSidebarOpen(true)}
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}
