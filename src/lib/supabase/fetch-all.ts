import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Fetch all rows from a Supabase table, paginating through the 1,000-row server limit.
 * Returns all matching rows.
 */
export async function fetchAllRows<T = Record<string, unknown>>(
  supabase: SupabaseClient,
  table: string,
  options: {
    select?: string;
    filters?: Array<{ column: string; op: string; value: unknown }>;
    order?: { column: string; ascending?: boolean };
  } = {}
): Promise<{ data: T[]; error: Error | null }> {
  const { select = '*', filters = [], order } = options;
  const PAGE_SIZE = 1000;
  const allRows: T[] = [];
  let page = 0;
  let hasMore = true;

  try {
    while (hasMore) {
      let query = supabase
        .from(table)
        .select(select)
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      // Apply filters
      for (const filter of filters) {
        switch (filter.op) {
          case 'eq':
            query = query.eq(filter.column, filter.value);
            break;
          case 'neq':
            query = query.neq(filter.column, filter.value);
            break;
          case 'lt':
            query = query.lt(filter.column, filter.value);
            break;
          case 'gt':
            query = query.gt(filter.column, filter.value);
            break;
          case 'in':
            query = query.in(filter.column, filter.value as unknown[]);
            break;
          case 'not.is':
            query = query.not(filter.column, 'is', filter.value);
            break;
        }
      }

      // Apply order
      if (order) {
        query = query.order(order.column, { ascending: order.ascending ?? true });
      }

      const { data, error } = await query;

      if (error) {
        return { data: allRows, error: new Error(error.message) };
      }

      allRows.push(...(data as T[]));
      hasMore = (data?.length || 0) === PAGE_SIZE;
      page++;
    }

    return { data: allRows, error: null };
  } catch (err) {
    return {
      data: allRows,
      error: err instanceof Error ? err : new Error('Unknown fetch error'),
    };
  }
}
