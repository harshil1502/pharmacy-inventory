'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';

export function useFavorites() {
  const { user } = useAppStore();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Fetch user's favorites on mount
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchFavorites = async () => {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('din')
        .eq('user_id', user.id);

      if (!error && data) {
        setFavorites(new Set(data.map(f => f.din)));
      }
      setLoading(false);
    };

    fetchFavorites();
  }, [user?.id, supabase]);

  // Toggle favorite status for a DIN
  const toggleFavorite = useCallback(async (din: string) => {
    if (!user?.id) return;

    const isFavorite = favorites.has(din);

    // Optimistic update
    setFavorites(prev => {
      const next = new Set(prev);
      if (isFavorite) {
        next.delete(din);
      } else {
        next.add(din);
      }
      return next;
    });

    if (isFavorite) {
      // Remove from favorites
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('din', din);

      if (error) {
        // Revert on error
        setFavorites(prev => new Set([...prev, din]));
        console.error('Failed to remove favorite:', error);
      }
    } else {
      // Add to favorites
      const { error } = await supabase
        .from('user_favorites')
        .insert({ user_id: user.id, din });

      if (error) {
        // Revert on error
        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(din);
          return next;
        });
        console.error('Failed to add favorite:', error);
      }
    }
  }, [user?.id, favorites, supabase]);

  const isFavorite = useCallback((din: string) => favorites.has(din), [favorites]);

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite,
    favoritesCount: favorites.size,
  };
}
