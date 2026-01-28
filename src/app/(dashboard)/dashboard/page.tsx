import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { StatCard } from '@/components/ui/stat-card';
import { AgingOverview } from '@/components/dashboard/aging-overview';
import { ItemList } from '@/components/dashboard/item-list';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get user profile with store
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, store:stores(*)')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/login');

  const storeId = profile.store_id;
  const isAdmin = profile.role === 'admin' || profile.role === 'associate';

  // ⚡ PERFORMANCE: Parallel queries instead of sequential
  const [
    { data: inventoryStats },
    { count: incomingRequests },
    { count: outgoingRequests },
    { data: topAgingItems },
    { data: lowStockItems },
  ] = await Promise.all([
    supabase
      .from('inventory_items')
      .select('total_quantity, cost, days_aging')
      .eq('store_id', storeId),
    supabase
      .from('medication_requests')
      .select('*', { count: 'exact', head: true })
      .eq('to_store_id', storeId)
      .eq('status', 'pending'),
    supabase
      .from('medication_requests')
      .select('*', { count: 'exact', head: true })
      .eq('from_store_id', storeId)
      .in('status', ['pending', 'counter_offer']),
    supabase
      .from('inventory_items')
      .select('*')
      .eq('store_id', storeId)
      .not('days_aging', 'is', null)
      .order('days_aging', { ascending: false })
      .limit(5),
    supabase
      .from('inventory_items')
      .select('*')
      .eq('store_id', storeId)
      .lt('total_quantity', 50)
      .order('total_quantity', { ascending: true })
      .limit(5),
  ]);

  // Calculate stats
  const totalItems = inventoryStats?.length || 0;
  const totalQuantity = inventoryStats?.reduce((sum, item) => sum + item.total_quantity, 0) || 0;
  const totalValue = inventoryStats?.reduce((sum, item) => sum + item.cost, 0) || 0;

  // Aging analysis
  const agingData = {
    fresh: inventoryStats?.filter(i => i.days_aging !== null && i.days_aging <= 30).length || 0,
    moderate: inventoryStats?.filter(i => i.days_aging !== null && i.days_aging > 30 && i.days_aging <= 90).length || 0,
    aging: inventoryStats?.filter(i => i.days_aging !== null && i.days_aging > 90 && i.days_aging <= 180).length || 0,
    old: inventoryStats?.filter(i => i.days_aging !== null && i.days_aging > 180).length || 0,
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Welcome back to{' '}
          <span className="text-indigo-600 font-medium">
            {profile.store?.name || 'your store'}
          </span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Items"
          value={formatNumber(totalItems)}
          subtitle={`${formatNumber(totalQuantity)} total units`}
          icon="package"
          iconColor="text-indigo-400"
        />

        {isAdmin && (
          <StatCard
            title="Inventory Value"
            value={formatCurrency(totalValue)}
            subtitle="Total cost value"
            icon="dollar"
            iconColor="text-emerald-400"
          />
        )}

        <StatCard
          title="Incoming Requests"
          value={incomingRequests || 0}
          subtitle="Pending review"
          icon="arrow-down"
          iconColor="text-blue-400"
        />

        <StatCard
          title="Outgoing Requests"
          value={outgoingRequests || 0}
          subtitle="Awaiting response"
          icon="arrow-up"
          iconColor="text-pink-400"
        />
      </div>

      {/* Aging Overview */}
      <AgingOverview data={agingData} />

      {/* Two Column Layout for Item Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Oldest Stock */}
        <ItemList
          title="Oldest Stock Items"
          items={topAgingItems || []}
          icon="alert"
          iconColor="text-orange-400"
          emptyMessage="No aging data available"
          showCost={isAdmin}
          type="aging"
        />

        {/* Low Stock Alert */}
        <ItemList
          title="Low Stock Alert"
          items={lowStockItems || []}
          icon="trending"
          iconColor="text-rose-400"
          emptyMessage="All items well stocked"
          type="lowStock"
        />
      </div>
    </div>
  );
}
