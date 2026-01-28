'use client';

import { useEffect, useState, useMemo } from 'react';
import { Plus, Filter, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { InventoryItem, SortOption, InventoryFilters as FilterType } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InventoryTable } from '@/components/inventory/inventory-table';
import { InventoryFilters } from '@/components/inventory/inventory-filters';
import { RequestDrugDialog } from '@/components/inventory/request-drug-dialog';
import { formatCurrency, formatNumber } from '@/lib/utils';

export default function InventoryPage() {
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

  // Admins and associates can see cost data
  const isAdmin = user?.role === 'admin' || user?.role === 'associate';

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('inventory_items')
          .select('*, store:stores(*)')
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

    // Subscribe to real-time updates
    const channel = supabase
      .channel('inventory_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory_items',
        },
        () => {
          fetchInventory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

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

    // Apply store filter
    if (filters.store_id) {
      result = result.filter((item) => item.store_id === filters.store_id);
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

  // Calculate stats - cost only for admin's own store
  const stats = useMemo(() => {
    // For admins: show stats for their store only
    const userStoreItems = items.filter(i => i.store_id === user?.store_id);
    
    return {
      totalItems: filteredItems.length,
      totalQuantity: filteredItems.reduce((sum, i) => sum + i.total_quantity, 0),
      // Cost is calculated only for user's own store
      storeValue: userStoreItems.reduce((sum, i) => sum + i.cost, 0),
      storeQuantity: userStoreItems.reduce((sum, i) => sum + i.total_quantity, 0),
    };
  }, [filteredItems, items, user?.store_id]);

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
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600 mt-1">
            Browse all stores&apos; inventory and request medications
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

      {/* Store Quick Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter by Store:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filters.store_id === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilters({ ...filters, store_id: null })}
              >
                All Stores
              </Button>
              {stores.map((store) => (
                <Button
                  key={store.id}
                  variant={filters.store_id === store.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilters({ ...filters, store_id: store.id })}
                >
                  {store.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Visible Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatNumber(stats.totalItems)}</p>
            <p className="text-xs text-gray-500">across all stores</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              My Store Units
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatNumber(stats.storeQuantity)}</p>
            <p className="text-xs text-gray-500">{user?.store?.name}</p>
          </CardContent>
        </Card>
        {/* Cost card - ONLY visible to admins */}
        {isAdmin && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                My Store Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(stats.storeValue)}</p>
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
            showStoreFilter={true}
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
            showStore={true}
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
