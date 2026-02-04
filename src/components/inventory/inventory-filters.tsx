'use client';

import { Search, X, Filter, Copy, Star } from 'lucide-react';
import { Store, InventoryFilters as FilterType } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

interface InventoryFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: Partial<FilterType>) => void;
  onReset: () => void;
  stores?: Store[];
  showStoreFilter?: boolean;
  duplicateCount?: number;
  showDuplicatesFilter?: boolean;
  // Favorites
  favoritesCount?: number;
  showFavoritesOnly?: boolean;
  onToggleFavoritesOnly?: (show: boolean) => void;
}

export function InventoryFilters({
  filters,
  onFiltersChange,
  onReset,
  stores = [],
  showStoreFilter = false,
  duplicateCount = 0,
  showDuplicatesFilter = true,
  favoritesCount = 0,
  showFavoritesOnly = false,
  onToggleFavoritesOnly,
}: InventoryFiltersProps) {
  const hasActiveFilters =
    filters.search ||
    filters.marketing_status.length > 0 ||
    filters.order_control.length > 0 ||
    filters.min_days_aging !== null ||
    filters.max_days_aging !== null ||
    filters.min_quantity !== null ||
    filters.max_quantity !== null ||
    filters.store_id !== null ||
    filters.show_duplicates_only;

  const activeFilterCount = [
    filters.search,
    filters.marketing_status.length > 0,
    filters.order_control.length > 0,
    filters.min_days_aging !== null || filters.max_days_aging !== null,
    filters.min_quantity !== null || filters.max_quantity !== null,
    filters.store_id !== null,
    filters.show_duplicates_only,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by drug name, item code, or manufacturer code..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="pl-10"
          />
        </div>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={onReset}>
            <X className="h-4 w-4 mr-1" />
            Clear Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-end gap-4">
        {/* Store Filter */}
        {showStoreFilter && stores.length > 0 && (
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">Store</Label>
            <Select
              value={filters.store_id || 'all'}
              onValueChange={(value) =>
                onFiltersChange({ store_id: value === 'all' ? null : value })
              }
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Stores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name} ({store.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Marketing Status */}
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">Marketing Status</Label>
          <Select
            value={filters.marketing_status[0] || 'all'}
            onValueChange={(value) =>
              onFiltersChange({
                marketing_status: value === 'all' ? [] : [value],
              })
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="C">Current</SelectItem>
              <SelectItem value="O">Obsolete</SelectItem>
              <SelectItem value="R">Replacement</SelectItem>
              <SelectItem value="S">Special</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Order Control */}
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">Order Control</Label>
          <Select
            value={filters.order_control[0] || 'all'}
            onValueChange={(value) =>
              onFiltersChange({
                order_control: value === 'all' ? [] : [value],
              })
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="N">Normal</SelectItem>
              <SelectItem value="P">Protected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Aging Range */}
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">Days Aging</Label>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              min="0"
              placeholder="Min"
              value={filters.min_days_aging ?? ''}
              onChange={(e) =>
                onFiltersChange({
                  min_days_aging: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className="w-20"
            />
            <span className="text-gray-400">-</span>
            <Input
              type="number"
              min="0"
              placeholder="Max"
              value={filters.max_days_aging ?? ''}
              onChange={(e) =>
                onFiltersChange({
                  max_days_aging: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className="w-20"
            />
          </div>
        </div>

        {/* Quantity Range */}
        <div className="space-y-1.5">
          <Label className="text-xs text-gray-500">Quantity</Label>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              min="0"
              placeholder="Min"
              value={filters.min_quantity ?? ''}
              onChange={(e) =>
                onFiltersChange({
                  min_quantity: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className="w-20"
            />
            <span className="text-gray-400">-</span>
            <Input
              type="number"
              min="0"
              placeholder="Max"
              value={filters.max_quantity ?? ''}
              onChange={(e) =>
                onFiltersChange({
                  max_quantity: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className="w-20"
            />
          </div>
        </div>

        {/* Duplicates Filter */}
        {showDuplicatesFilter && (
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">Duplicates</Label>
            <div className="flex items-center space-x-2 h-10 px-3 py-2 border rounded-md bg-white">
              <Switch
                id="show-duplicates"
                checked={filters.show_duplicates_only}
                onCheckedChange={(checked) =>
                  onFiltersChange({ show_duplicates_only: checked })
                }
              />
              <Label
                htmlFor="show-duplicates"
                className="text-sm font-normal cursor-pointer flex items-center gap-2"
              >
                <Copy className="h-4 w-4 text-amber-600" />
                Show Only
                {duplicateCount > 0 && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                    {duplicateCount}
                  </Badge>
                )}
              </Label>
            </div>
          </div>
        )}

        {/* Favorites Filter */}
        {onToggleFavoritesOnly && (
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">Favorites</Label>
            <div className="flex items-center space-x-2 h-10 px-3 py-2 border rounded-md bg-white">
              <Switch
                id="show-favorites"
                checked={showFavoritesOnly}
                onCheckedChange={onToggleFavoritesOnly}
              />
              <Label
                htmlFor="show-favorites"
                className="text-sm font-normal cursor-pointer flex items-center gap-2"
              >
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" />
                Show Only
                {favoritesCount > 0 && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    {favoritesCount}
                  </Badge>
                )}
              </Label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
