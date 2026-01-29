import { SupabaseClient } from '@supabase/supabase-js';

const PAGE_SIZE = 1000;

/**
 * Fetch all inventory items for a store (or all stores), paginating past Supabase's 1000-row limit.
 */
export async function fetchAllInventoryItems<T = unknown>(
  supabase: SupabaseClient,
  storeId?: string
): Promise<T[]> {
  const all: T[] = [];
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    let query = supabase
      .from('inventory_items')
      .select('*, store:stores(*)')
      .order('description')
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (storeId) {
      query = query.eq('store_id', storeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching inventory page', page, error);
      throw error;
    }

    all.push(...((data || []) as T[]));
    hasMore = (data?.length || 0) === PAGE_SIZE;
    page++;
  }

  return all;
}
