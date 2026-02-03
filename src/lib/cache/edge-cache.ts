/**
 * Edge Caching Strategy for PharmSync
 * Leverages Vercel's edge network for ultra-low latency
 */

import { unstable_cache } from 'next/cache';
import { revalidateTag } from 'next/cache';

// Cache configuration
const CACHE_DURATIONS = {
  INVENTORY: 300,        // 5 minutes
  DASHBOARD_STATS: 60,   // 1 minute
  STORE_LIST: 3600,      // 1 hour
  USER_PROFILE: 1800,    // 30 minutes
  SEARCH_RESULTS: 180,   // 3 minutes
} as const;

// Type-safe cache tags
export const CACHE_TAGS = {
  inventory: (storeId: string) => `inventory:${storeId}`,
  dashboard: (storeId: string) => `dashboard:${storeId}`,
  stores: 'stores:all',
  user: (userId: string) => `user:${userId}`,
  search: (query: string) => `search:${query}`,
} as const;

/**
 * Get cached inventory with automatic edge distribution
 */
export const getCachedInventory = unstable_cache(
  async (storeId: string, filters?: {
    search?: string;
    category?: string;
    ageRange?: [number, number];
    page?: number;
    limit?: number;
  }) => {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    
    let query = supabase
      .from('inventory_items')
      .select('*, store:stores(*)')
      .eq('store_id', storeId)
      .order('days_aging', { ascending: false });
    
    // Apply filters
    if (filters?.search) {
      query = query.or(`description.ilike.%${filters.search}%,generic_name.ilike.%${filters.search}%`);
    }
    
    if (filters?.ageRange) {
      query = query.gte('days_aging', filters.ageRange[0])
                   .lte('days_aging', filters.ageRange[1]);
    }
    
    if (filters?.page && filters?.limit) {
      const offset = (filters.page - 1) * filters.limit;
      query = query.range(offset, offset + filters.limit - 1);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  },
  ['inventory'],
  {
    revalidate: CACHE_DURATIONS.INVENTORY,
    tags: ['inventory']
  }
);

/**
 * Get cached dashboard statistics
 */
export const getCachedDashboardStats = unstable_cache(
  async (storeId: string) => {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    
    // Use materialized view for performance
    const { data: stats } = await supabase
      .from('inventory_stats')
      .select('*')
      .eq('store_id', storeId)
      .single();
    
    // Get recent alerts
    const { data: alerts } = await supabase
      .from('inventory_alerts')
      .select('*')
      .eq('store_id', storeId)
      .eq('resolved', false)
      .order('created_at', { ascending: false })
      .limit(5);
    
    // Get upcoming expiries
    const { data: expiring } = await supabase
      .from('inventory_items')
      .select('id, description, days_aging, total_quantity')
      .eq('store_id', storeId)
      .gte('days_aging', 150)
      .lte('days_aging', 180)
      .order('days_aging', { ascending: true })
      .limit(10);
    
    return {
      stats: stats || {},
      alerts: alerts || [],
      expiringItems: expiring || []
    };
  },
  ['dashboard-stats'],
  {
    revalidate: CACHE_DURATIONS.DASHBOARD_STATS,
    tags: ['dashboard-stats']
  }
);

/**
 * Smart search with edge caching and vector similarity
 */
export const getCachedSearchResults = unstable_cache(
  async (query: string, options?: {
    storeId?: string;
    limit?: number;
    useVector?: boolean;
  }) => {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    
    const limit = options?.limit || 20;
    
    if (options?.useVector) {
      // Use pg_vector for semantic search
      const { data } = await supabase.rpc('search_inventory_semantic', {
        query_text: query,
        store_id: options.storeId,
        match_threshold: 0.7,
        match_count: limit
      });
      
      return data || [];
    }
    
    // Fallback to traditional search
    let searchQuery = supabase
      .from('inventory_items')
      .select('*, store:stores(name)')
      .or(`description.ilike.%${query}%,generic_name.ilike.%${query}%,brand_name.ilike.%${query}%`)
      .limit(limit);
    
    if (options?.storeId) {
      searchQuery = searchQuery.eq('store_id', options.storeId);
    }
    
    const { data } = await searchQuery;
    return data || [];
  },
  ['search'],
  {
    revalidate: CACHE_DURATIONS.SEARCH_RESULTS,
    tags: ['search']
  }
);

/**
 * Cache invalidation helpers
 */
// Note: revalidateTag API changed in Next.js 16 - update when needed
export async function invalidateInventoryCache(_storeId: string) {
  // Temporarily disabled due to Next.js 16 API changes
  // revalidateTag(`inventory:${storeId}`);
  // revalidateTag(`dashboard:${storeId}`);
}

export async function invalidateAllCaches() {
  // Temporarily disabled due to Next.js 16 API changes
  // Use with caution - this will purge all edge caches
  // const tags = Object.values(CACHE_TAGS);
  // for (const tag of tags) {
  //   if (typeof tag === 'string') {
  //     revalidateTag(tag);
  //   }
  // }
}

/**
 * Predictive cache warming
 * Pre-loads likely next pages based on user behavior
 */
interface CachePrediction {
  type: string;
  path: string;
  storeId?: string;
}

export async function warmCache(_userId: string, currentPath: string) {
  // This runs in the background, non-blocking
  const predictions = await predictNextPages(currentPath);
  
  for (const prediction of predictions) {
    if (prediction.type === 'inventory' && prediction.storeId) {
      // Pre-fetch inventory data
      getCachedInventory(prediction.storeId).catch(() => {});
    }
  }
}

async function predictNextPages(currentPath: string): Promise<CachePrediction[]> {
  // Simple prediction based on common navigation patterns
  const predictions: CachePrediction[] = [];
  
  if (currentPath === '/dashboard') {
    predictions.push({ type: 'inventory', path: '/inventory' });
  }
  
  if (currentPath.startsWith('/inventory')) {
    predictions.push({ type: 'dashboard', path: '/dashboard' });
  }
  
  return predictions;
}

/**
 * Edge-optimized batch operations
 */
export class EdgeBatchProcessor {
  private queue: Map<string, any[]> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  
  constructor(private batchSize: number = 50, private maxWait: number = 100) {}
  
  async add<T>(key: string, item: T, processor: (items: T[]) => Promise<void>) {
    if (!this.queue.has(key)) {
      this.queue.set(key, []);
    }
    
    this.queue.get(key)!.push(item);
    
    // Clear existing timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key)!);
    }
    
    // Process if batch is full
    if (this.queue.get(key)!.length >= this.batchSize) {
      await this.processBatch(key, processor);
      return;
    }
    
    // Otherwise set timer for max wait
    this.timers.set(key, setTimeout(async () => {
      await this.processBatch(key, processor);
    }, this.maxWait));
  }
  
  private async processBatch<T>(key: string, processor: (items: T[]) => Promise<void>) {
    const items = this.queue.get(key) || [];
    if (items.length === 0) return;
    
    this.queue.delete(key);
    this.timers.delete(key);
    
    await processor(items);
  }
}

// Export singleton instance
export const batchProcessor = new EdgeBatchProcessor();