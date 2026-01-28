'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { UserProfile, Store, Notification } from '@/types';
import { Loader2 } from 'lucide-react';

// Create supabase client once outside component
const supabase = createClient();

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B0F19] via-[#0F1419] to-[#0B0F19] relative overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

        <div className="text-center relative z-10">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-indigo-500 mx-auto drop-shadow-[0_0_25px_rgba(99,102,241,0.6)]" />
            <div className="absolute inset-0 h-16 w-16 mx-auto">
              <div className="w-full h-full rounded-full border-2 border-indigo-500/30 animate-ping" />
            </div>
          </div>
          <p className="mt-6 text-slate-200 font-bold text-lg tracking-wide">Loading PharmSync<span className="animate-pulse">...</span></p>
          <div className="mt-4 flex justify-center gap-1">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce delay-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] relative overflow-hidden">
      {/* Animated gradient orbs in background */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-indigo-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-pink-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-r from-teal-500/10 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}} />

      <div className="relative z-10">
        <Sidebar />
        <div className="lg:pl-72">
          <Header />
          <main className="p-6 lg:p-8 animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
