import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface AgingMatch {
  din_number: string;
  medication_name: string;
  aging_store_id: string;
  aging_store_name: string;
  aging_days: number;
  aging_quantity: number;
  aging_cost: number;
  needed_store_id: string;
  needed_store_name: string;
  needed_quantity: number;
  transferable_quantity: number;
  savings_potential: number;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'associate'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const minAgingDays = parseInt(searchParams.get('minAgingDays') || '180');
    const maxTransferQuantity = parseInt(searchParams.get('maxTransferQuantity') || '100');

    // First, find all aging inventory (>= minAgingDays)
    const { data: agingItems, error: agingError } = await supabase
      .from('inventory_items')
      .select(`
        din_number,
        description,
        store_id,
        total_quantity,
        cost,
        days_aging,
        store:store_id(name)
      `)
      .gte('days_aging', minAgingDays)
      .gt('total_quantity', 0)
      .order('days_aging', { ascending: false });

    if (agingError) {
      console.error('Error fetching aging items:', agingError);
      return NextResponse.json({ error: 'Failed to fetch aging inventory' }, { status: 500 });
    }

    // Find matches - stores that need the same DIN but have low/no stock
    const matches: AgingMatch[] = [];

    for (const agingItem of agingItems || []) {
      if (!agingItem.din_number) continue;

      // Find stores that have low stock of this DIN (<30 days of aging or <10 units)
      const { data: needingStores, error: needError } = await supabase
        .from('inventory_items')
        .select(`
          store_id,
          total_quantity,
          days_aging,
          store:store_id(name)
        `)
        .eq('din_number', agingItem.din_number)
        .neq('store_id', agingItem.store_id)
        .or('days_aging.lt.30,total_quantity.lt.10');

      if (needError) continue;

      // Also check stores that don't have this DIN at all
      const { data: allStores } = await supabase
        .from('stores')
        .select('id, name')
        .neq('id', agingItem.store_id);

      // Check which stores don't have this DIN
      const storesWithDIN = new Set(needingStores?.map(item => item.store_id) || []);
      const storesWithoutDIN = allStores?.filter(store => !storesWithDIN.has(store.id)) || [];

      // Create matches for stores with low stock
      for (const needingStore of needingStores || []) {
        const transferableQty = Math.min(agingItem.total_quantity, maxTransferQuantity);
        const savingsPotential = transferableQty * agingItem.cost;

        matches.push({
          din_number: agingItem.din_number,
          medication_name: agingItem.description,
          aging_store_id: agingItem.store_id,
          aging_store_name: agingItem.store?.name || '',
          aging_days: agingItem.days_aging || 0,
          aging_quantity: agingItem.total_quantity,
          aging_cost: agingItem.cost,
          needed_store_id: needingStore.store_id,
          needed_store_name: needingStore.store?.name || '',
          needed_quantity: needingStore.total_quantity,
          transferable_quantity: transferableQty,
          savings_potential: savingsPotential
        });
      }

      // Create matches for stores without this DIN (higher priority)
      for (const store of storesWithoutDIN) {
        const transferableQty = Math.min(agingItem.total_quantity, maxTransferQuantity);
        const savingsPotential = transferableQty * agingItem.cost;

        matches.push({
          din_number: agingItem.din_number,
          medication_name: agingItem.description,
          aging_store_id: agingItem.store_id,
          aging_store_name: agingItem.store?.name || '',
          aging_days: agingItem.days_aging || 0,
          aging_quantity: agingItem.total_quantity,
          aging_cost: agingItem.cost,
          needed_store_id: store.id,
          needed_store_name: store.name,
          needed_quantity: 0, // Store doesn't have this DIN
          transferable_quantity: transferableQty,
          savings_potential: savingsPotential
        });
      }
    }

    // Sort by savings potential (highest first)
    matches.sort((a, b) => b.savings_potential - a.savings_potential);

    // Calculate summary stats
    const totalAgingValue = matches.reduce((sum, match) => sum + (match.aging_quantity * match.aging_cost), 0);
    const totalSavingsPotential = matches.reduce((sum, match) => sum + match.savings_potential, 0);
    const uniqueAgingDINs = new Set(matches.map(m => m.din_number)).size;

    return NextResponse.json({
      matches: matches.slice(0, 100), // Return top 100 matches
      summary: {
        totalMatches: matches.length,
        uniqueAgingDINs,
        totalAgingValue,
        totalSavingsPotential
      }
    });
  } catch (error) {
    console.error('Error in aging matches:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}