'use client';

import { useEffect, useState, useLayoutEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { ChangePasswordModal } from '@/components/auth/change-password-modal';
import { UserProfile, Store, Notification } from '@/types';
import { Loader2 } from 'lucide-react';

// Use useLayoutEffect on client, useEffect on server
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// Create supabase client once outside component
const supabase = createClient();

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    let mounted = true;

    const loadUserData = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
          if (mounted) {
            window.location.href = '/login';
          }
          return;
        }

        setUserId(authUser.id);

        // Get user profile with store
        const { data: profile } = await supabase
          .from('profiles')
          .select(`
            *,
            store:stores(*)
          `)
          .eq('id', authUser.id)
          .single();

        if (!mounted) return;

        if (profile) {
          useAppStore.getState().setUser(profile as UserProfile);
          if (profile.store) {
            useAppStore.getState().setCurrentStore(profile.store as Store);
          }
          
          // Check if user must change password
          if (profile.must_change_password) {
            setShowPasswordChange(true);
          }
        }

        // Get all stores
        const { data: stores } = await supabase
          .from('stores')
          .select('*')
          .order('name');

        if (!mounted) return;

        if (stores) {
          useAppStore.getState().setStores(stores as Store[]);
        }

        // Get notifications for user's store
        if (profile?.store_id) {
          const { data: notifications } = await supabase
            .from('notifications')
            .select('*')
            .or(`user_id.eq.${authUser.id},store_id.eq.${profile.store_id}`)
            .order('created_at', { ascending: false })
            .limit(50);

          if (!mounted) return;

          if (notifications) {
            useAppStore.getState().setNotifications(notifications as Notification[]);
          }
        }

        if (mounted) {
          setAuthenticated(true);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadUserData();

    return () => {
      mounted = false;
    };
  }, []);

  const handlePasswordChangeComplete = () => {
    setShowPasswordChange(false);
    // Reload user data to get updated profile
    window.location.reload();
  };

  // Initialize sidebar state based on screen size and localStorage
  useIsomorphicLayoutEffect(() => {
    const stored = localStorage.getItem('pharmsync-sidebar');
    if (stored) {
      useAppStore.getState().setSidebarOpen(stored === 'open');
    } else {
      // Default: open on desktop (>= 1024px), closed on mobile
      useAppStore.getState().setSidebarOpen(window.innerWidth >= 1024);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto" />
          <p className="mt-4 text-gray-500 font-medium text-sm">Loading PharmSync...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="transition-all duration-200">
        <Header />
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
      
      {/* Password Change Modal - Required for first login */}
      <ChangePasswordModal
        open={showPasswordChange}
        userId={userId}
        onComplete={handlePasswordChangeComplete}
      />
    </div>
  );
}
