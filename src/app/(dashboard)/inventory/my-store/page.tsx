'use client';

import { useEffect, useState, useMemo } from 'react';
import { Plus, Store as StoreIcon, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { InventoryItem, SortOption, InventoryFilters as FilterType } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InventoryTable } from '@/components/inventory/inventory-table';
import { InventoryFilters } from '@/components/inventory/inventory-filters';
import { RequestDrugDialog } from '@/components/inventory/request-drug-dialog';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function MyPharmacyPage() {
  const supabase = createClient();
  const { user, stores } = useAppStore();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [prefilledRequest, setPrefilledRequest] = useState<{
    din?: string;
    name?: string;
    storeId?: string;
  }>({});

  const [filters, setFilters] = useState<FilterType>({
    search: '',
    marketing_status: [],
    order_control: [],
    min_days_aging: null,
    max_days_aging: null,
    min_quantity: null,
    max_quantity: null,
    store_id: null,
  });

  const [sort, setSort] = useState<SortOption>({
    field: 'description',
    direction: 'asc',
  });

  // Only admins and associates can see cost data
  const canSeeCost = user?.role === 'admin' || user?.role === 'associate';

  useEffect(() => {
    const fetchInventory = async () => {
      if (!user?.store_id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch only items from user's store
        const { data, error } = await supabase
          .from('inventory_items')
          .select('*, store:stores(*)')
          .eq('store_id', user.store_id)
          .order('description');

        if (error) {
          console.error('Supabase error:', error.message, error.code, error.details);
          throw error;
        }
        setItems(data as InventoryItem[]);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Error fetching inventory:', message);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();

    // Subscribe to real-time updates for user's store only
    if (user?.store_id) {
      const channel = supabase
        .channel('my_store_inventory_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'inventory_items',
            filter: `store_id=eq.${user.store_id}`,
          },
          () => {
            fetchInventory();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [supabase, user?.store_id]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Apply search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (item) =>
          item.description.toLowerCase().includes(search) ||
          item.item_code.toLowerCase().includes(search) ||
          item.manufacturer_code.toLowerCase().includes(search)
      );
    }

    // Apply marketing status filter
    if (filters.marketing_status.length > 0) {
      result = result.filter((item) =>
        filters.marketing_status.includes(item.marketing_status)
      );
    }

    // Apply order control filter
    if (filters.order_control.length > 0) {
      result = result.filter((item) =>
        filters.order_control.includes(item.order_control)
      );
    }

    // Apply aging filters
    if (filters.min_days_aging !== null) {
      result = result.filter(
        (item) => item.days_aging !== null && item.days_aging >= filters.min_days_aging!
      );
    }

    if (filters.max_days_aging !== null) {
      result = result.filter(
        (item) => item.days_aging !== null && item.days_aging <= filters.max_days_aging!
      );
    }

    // Apply quantity filters
    if (filters.min_quantity !== null) {
      result = result.filter((item) => item.total_quantity >= filters.min_quantity!);
    }

    if (filters.max_quantity !== null) {
      result = result.filter((item) => item.total_quantity <= filters.max_quantity!);
    }

    // Apply sort
    result.sort((a, b) => {
      const aVal = a[sort.field];
      const bVal = b[sort.field];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      }

      return sort.direction === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [items, filters, sort]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      totalItems: filteredItems.length,
      totalQuantity: filteredItems.reduce((sum, i) => sum + i.total_quantity, 0),
      totalValue: filteredItems.reduce((sum, i) => sum + i.cost, 0),
    };
  }, [filteredItems]);

  const handleRequestClick = (item: InventoryItem) => {
    setPrefilledRequest({
      din: item.item_code,
      name: item.description,
      storeId: item.store_id,
    });
    setShowRequestDialog(true);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      marketing_status: [],
      order_control: [],
      min_days_aging: null,
      max_days_aging: null,
      min_quantity: null,
      max_quantity: null,
      store_id: null,
    });
  };

  if (!user?.store_id) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600">You are not assigned to a store.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <StoreIcon className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">My Pharmacy Inventory</h1>
          </div>
          <p className="text-gray-600 mt-1">
            {user.store?.name || 'Your Store'}
          </p>
        </div>
        <Button onClick={() => {
          setPrefilledRequest({});
          setShowRequestDialog(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatNumber(stats.totalItems)}</p>
            <p className="text-xs text-gray-500">unique medications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Units
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatNumber(stats.totalQuantity)}</p>
            <p className="text-xs text-gray-500">in stock</p>
          </CardContent>
        </Card>
        {/* Cost card - visible to admins and associates */}
        {canSeeCost && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
              <p className="text-xs text-gray-500">inventory cost</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <InventoryFilters
            filters={filters}
            onFiltersChange={(newFilters) => setFilters({ ...filters, ...newFilters })}
            onReset={resetFilters}
            stores={stores}
            showStoreFilter={false}
          />
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0 overflow-hidden">
          <InventoryTable
            items={filteredItems}
            sort={sort}
            onSortChange={setSort}
            showStore={false}
            currentStoreId={user?.store_id || undefined}
            userRole={user?.role}
            onRequestClick={handleRequestClick}
          />
        </CardContent>
      </Card>

      {/* Results count */}
      <p className="text-sm text-gray-500 text-center">
        Showing {formatNumber(filteredItems.length)} of {formatNumber(items.length)} items
      </p>

      {/* Request Dialog */}
      <RequestDrugDialog
        open={showRequestDialog}
        onOpenChange={setShowRequestDialog}
        stores={stores}
        prefilledDIN={prefilledRequest.din}
        prefilledName={prefilledRequest.name}
        prefilledStoreId={prefilledRequest.storeId}
      />
    </div>
  );
}
