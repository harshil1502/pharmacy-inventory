'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, User, ChevronDown, Check } from 'lucide-react';
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
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="flex items-center space-x-4">
        <SidebarToggle />
        <div className="hidden sm:block">
          <p className="text-sm text-gray-600">
            Welcome back, <span className="font-semibold text-gray-900">{user?.full_name || user?.email?.split('@')[0] || 'User'}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setNotificationsOpen(true)}
          className="relative text-gray-500 hover:text-gray-700"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>

        {/* Profile dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-2 px-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <User className="h-4 w-4" />
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 text-gray-400 transition-transform",
              profileOpen && "rotate-180"
            )} />
          </Button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileOpen(false)}
              />
              <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                <div className="border-b border-gray-100 px-4 py-3">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center space-x-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <LogOut className="h-4 w-4 text-gray-400" />
                  <span>Sign out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Notifications Dialog */}
      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent className="max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Notifications</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-96">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.slice(0, 20).map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'rounded-lg border p-4 transition-colors',
                      notification.is_read
                        ? 'bg-white border-gray-100'
                        : 'bg-indigo-50 border-indigo-100'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {!notification.is_read && (
                            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                          )}
                          <p className="font-medium text-sm text-gray-900">
                            {notification.title}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDateTime(notification.created_at)}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-gray-400 hover:text-indigo-600"
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
