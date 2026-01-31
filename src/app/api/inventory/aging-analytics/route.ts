import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

interface AgingBracket {
  range: string;
  minDays: number;
  maxDays: number | null;
  itemCount: number;
  totalQuantity: number;
  totalValue: number;
  percentage: number;
}

interface StoreAgingSummary {
  storeId: string;
  storeName: string;
  totalAgingValue: number;
  totalAgingItems: number;
  criticalItems: number; // >270 days
  highRiskItems: number; // 180-270 days
  mediumRiskItems: number; // 90-180 days
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, store_id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get all inventory with aging data
    let query = supabase
      .from('inventory_items')
      .select(`
        id,
        store_id,
        din_number,
        description,
        total_quantity,
        cost,
        days_aging,
        store:stores(name)
      `)
      .gt('total_quantity', 0);

    // Regular users can only see their store's data
    if (profile.role === 'regular' && profile.store_id) {
      query = query.eq('store_id', profile.store_id);
    }

    const { data: inventoryItems, error: inventoryError } = await query;

    if (inventoryError) {
      console.error('Error fetching inventory:', inventoryError);
      return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
    }

    // Define aging brackets
    const agingBrackets: AgingBracket[] = [
      { range: '0-30 days', minDays: 0, maxDays: 30, itemCount: 0, totalQuantity: 0, totalValue: 0, percentage: 0 },
      { range: '31-90 days', minDays: 31, maxDays: 90, itemCount: 0, totalQuantity: 0, totalValue: 0, percentage: 0 },
      { range: '91-180 days', minDays: 91, maxDays: 180, itemCount: 0, totalQuantity: 0, totalValue: 0, percentage: 0 },
      { range: '181-270 days', minDays: 181, maxDays: 270, itemCount: 0, totalQuantity: 0, totalValue: 0, percentage: 0 },
      { range: '271-365 days', minDays: 271, maxDays: 365, itemCount: 0, totalQuantity: 0, totalValue: 0, percentage: 0 },
      { range: '365+ days', minDays: 365, maxDays: null, itemCount: 0, totalQuantity: 0, totalValue: 0, percentage: 0 }
    ];

    // Store summaries
    const storeSummaryMap = new Map<string, StoreAgingSummary>();

    // Process inventory items
    let totalInventoryValue = 0;
    let totalAgingValue = 0; // Items >= 180 days
    let totalItems = 0;
    let itemsWithAging = 0;

    for (const item of inventoryItems || []) {
      const value = item.total_quantity * item.cost;
      totalInventoryValue += value;
      totalItems++;

      if (item.days_aging !== null && item.days_aging !== undefined) {
        itemsWithAging++;

        // Add to appropriate aging bracket
        for (const bracket of agingBrackets) {
          if (
            item.days_aging >= bracket.minDays &&
            (bracket.maxDays === null || item.days_aging <= bracket.maxDays)
          ) {
            bracket.itemCount++;
            bracket.totalQuantity += item.total_quantity;
            bracket.totalValue += value;
            break;
          }
        }

        // Count as aging if >= 180 days
        if (item.days_aging >= 180) {
          totalAgingValue += value;

          // Update store summary
          if (!storeSummaryMap.has(item.store_id)) {
            storeSummaryMap.set(item.store_id, {
              storeId: item.store_id,
              storeName: item.store?.name || 'Unknown',
              totalAgingValue: 0,
              totalAgingItems: 0,
              criticalItems: 0,
              highRiskItems: 0,
              mediumRiskItems: 0
            });
          }

          const storeSummary = storeSummaryMap.get(item.store_id)!;
          storeSummary.totalAgingValue += value;
          storeSummary.totalAgingItems++;

          if (item.days_aging >= 271) {
            storeSummary.criticalItems++;
          } else if (item.days_aging >= 181) {
            storeSummary.highRiskItems++;
          } else if (item.days_aging >= 91) {
            storeSummary.mediumRiskItems++;
          }
        }
      }
    }

    // Calculate percentages for brackets
    for (const bracket of agingBrackets) {
      bracket.percentage = totalInventoryValue > 0 
        ? (bracket.totalValue / totalInventoryValue) * 100 
        : 0;
    }

    // Convert store summaries to array and sort by aging value
    const storeSummaries = Array.from(storeSummaryMap.values())
      .sort((a, b) => b.totalAgingValue - a.totalAgingValue);

    // Calculate goal progress (goal is $0 aging inventory)
    const goalProgress = totalInventoryValue > 0
      ? ((totalInventoryValue - totalAgingValue) / totalInventoryValue) * 100
      : 100;

    // Get recent transfer activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentTransfers } = await supabase
      .from('medication_requests')
      .select('id, requested_quantity, offered_quantity, status')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .in('status', ['completed']);

    const completedTransfers = recentTransfers?.length || 0;
    const totalUnitsTransferred = recentTransfers?.reduce(
      (sum, transfer) => sum + (transfer.offered_quantity || transfer.requested_quantity),
      0
    ) || 0;

    return NextResponse.json({
      overview: {
        totalInventoryValue,
        totalAgingValue, // >= 180 days
        agingPercentage: totalInventoryValue > 0 ? (totalAgingValue / totalInventoryValue) * 100 : 0,
        goalProgress, // Progress toward $0 aging
        totalItems,
        itemsWithAgingData: itemsWithAging
      },
      agingBrackets,
      storeSummaries: storeSummaries.slice(0, 10), // Top 10 stores by aging value
      transferMetrics: {
        completedTransfers,
        totalUnitsTransferred,
        period: '30 days'
      },
      recommendations: generateRecommendations(totalAgingValue, storeSummaries)
    });
  } catch (error) {
    console.error('Error in aging analytics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function generateRecommendations(totalAgingValue: number, storeSummaries: StoreAgingSummary[]) {
  const recommendations = [];

  if (totalAgingValue > 50000) {
    recommendations.push({
      priority: 'high',
      message: `Critical: $${totalAgingValue.toFixed(2)} in aging inventory (>180 days). Immediate action required.`
    });
  }

  const criticalStores = storeSummaries.filter(s => s.criticalItems > 10);
  if (criticalStores.length > 0) {
    recommendations.push({
      priority: 'high',
      message: `${criticalStores.length} stores have 10+ items aging >270 days. Focus on: ${criticalStores.slice(0, 3).map(s => s.storeName).join(', ')}`
    });
  }

  if (storeSummaries.length > 0 && storeSummaries[0].totalAgingValue > 10000) {
    recommendations.push({
      priority: 'medium',
      message: `${storeSummaries[0].storeName} has the highest aging value: $${storeSummaries[0].totalAgingValue.toFixed(2)}`
    });
  }

  return recommendations;
}