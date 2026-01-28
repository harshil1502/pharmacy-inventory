'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  LogOut,
  User,
  ChevronDown,
  Check,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SidebarToggle } from './sidebar';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/utils';

export function Header() {
  const router = useRouter();
  const { user, notifications, unreadCount, markNotificationRead } = useAppStore();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleMarkRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    markNotificationRead(id);
  };

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-[#1E2433]/80 backdrop-blur-2xl px-6 lg:px-8 shadow-2xl relative overflow-hidden">
      {/* Animated gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-pink-500 to-teal-500 animate-gradient bg-[length:200%_auto]" />

      <div className="flex items-center space-x-4">
        <SidebarToggle />
        <div className="hidden sm:block">
          <h1 className="text-xl font-bold text-white tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-indigo-400 via-pink-400 to-teal-400 bg-clip-text text-transparent font-black animate-gradient bg-[length:200%_auto]">{user?.full_name || user?.email?.split('@')[0] || 'User'}</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotificationsOpen(true)}
            className="relative hover:bg-white/10 text-slate-300 hover:text-white transition-all duration-300 hover:scale-110"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 text-xs text-white font-black shadow-xl shadow-rose-500/60 animate-pulse border border-white/20">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </div>

        {/* Profile dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-2 hover:bg-white/10 px-3 rounded-xl transition-all duration-300"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-pink-500 to-teal-500 shadow-lg shadow-indigo-500/40 animate-gradient bg-[length:200%_auto] relative">
              <User className="h-5 w-5 text-white relative z-10" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 blur opacity-50 animate-pulse" />
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 text-slate-400 transition-all duration-300",
              profileOpen && "rotate-180 text-indigo-400"
            )} />
          </Button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-40 backdrop-blur-sm bg-black/20 animate-fade-in"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-3 w-72 rounded-2xl border border-white/10 bg-gradient-to-br from-[#1E2433]/95 to-[#161B26]/95 backdrop-blur-2xl py-2 shadow-2xl animate-scale-in overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-pink-500/5 pointer-events-none" />
                <div className="border-b border-white/10 px-5 py-4 relative z-10">
                  <p className="text-sm font-bold text-white truncate">
                    {user?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-slate-400 truncate mt-1.5">{user?.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center space-x-3 px-5 py-4 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-all group relative z-10"
                >
                  <LogOut className="h-4 w-4 group-hover:text-rose-400 transition-colors" />
                  <span className="font-semibold">Sign out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notifications Dialog */}
      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent className="max-h-[85vh] overflow-hidden bg-gradient-to-br from-[#1E2433]/95 to-[#161B26]/95 backdrop-blur-2xl border border-white/10 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl font-black bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">Notifications</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-96 pr-2">
            {notifications.length === 0 ? (
              <div className="text-center py-16 animate-fade-in">
                <div className="relative inline-block">
                  <Bell className="h-16 w-16 text-slate-600 mx-auto mb-4 animate-bounce-subtle" />
                  <div className="absolute inset-0 blur-xl bg-indigo-500/20 animate-pulse" />
                </div>
                <p className="text-slate-400 font-semibold">No notifications yet</p>
                <p className="text-slate-500 text-sm mt-1">We'll notify you when something arrives</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 20).map((notification, index) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden group animate-slide-in-up',
                      notification.is_read
                        ? 'bg-white/5 border-white/10 hover:bg-white/8'
                        : 'bg-gradient-to-br from-indigo-500/10 via-pink-500/5 to-transparent border-indigo-400/30 shadow-xl shadow-indigo-500/10 hover:shadow-indigo-500/20'
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {!notification.is_read && (
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
                    )}
                    <div className="flex items-start justify-between relative z-10">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {!notification.is_read && (
                            <div className="h-2 w-2 rounded-full bg-indigo-400 shadow-lg shadow-indigo-400/50 animate-pulse" />
                          )}
                          <p className="font-bold text-sm text-white">
                            {notification.title}
                          </p>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-500 mt-3 font-medium">
                          {formatDateTime(notification.created_at)}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 shrink-0 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 transition-all duration-300 hover:scale-110"
                          onClick={() => handleMarkRead(notification.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
