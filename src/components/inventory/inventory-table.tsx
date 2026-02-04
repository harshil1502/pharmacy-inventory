'use client';

import { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  MessageSquare,
  ArrowUpDown,
  Star,
} from 'lucide-react';
import { InventoryItem, SortOption, UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  formatCurrency,
  formatNumber,
  getAgingBadgeColor,
  getMarketingStatusLabel,
  getOrderControlLabel,
  cn,
} from '@/lib/utils';

interface InventoryTableProps {
  items: InventoryItem[];
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  showStore?: boolean;
  currentStoreId?: string;
  userRole?: UserRole;
  onRequestClick?: (item: InventoryItem) => void;
  // Favorites props
  favorites?: Set<string>;
  onToggleFavorite?: (din: string) => void;
  showFavoritesFirst?: boolean;
}

export function InventoryTable({
  items,
  sort,
  onSortChange,
  showStore = false,
  currentStoreId,
  userRole = 'regular',
  onRequestClick,
  favorites = new Set(),
  onToggleFavorite,
  showFavoritesFirst = true,
}: InventoryTableProps) {
  // Only admins and associates can see cost information
  const canSeeCost = userRole === 'admin' || userRole === 'associate';

  // Sort items with favorites first if enabled
  const sortedItems = showFavoritesFirst && favorites.size > 0
    ? [...items].sort((a, b) => {
        const aIsFav = favorites.has(a.item_code || '');
        const bIsFav = favorites.has(b.item_code || '');
        if (aIsFav && !bIsFav) return -1;
        if (!aIsFav && bIsFav) return 1;
        return 0;
      })
    : items;

  const handleSort = (field: keyof InventoryItem) => {
    // Don't allow sorting by cost if user can't see it
    if (field === 'cost' && !canSeeCost) return;
    
    if (sort.field === field) {
      onSortChange({ field, direction: sort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      onSortChange({ field, direction: 'asc' });
    }
  };

  const SortIcon = ({ field }: { field: keyof InventoryItem }) => {
    if (sort.field !== field) {
      return <ArrowUpDown className="h-4 w-4 text-gray-400" />;
    }
    return sort.direction === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-blue-600" />
    ) : (
      <ChevronDown className="h-4 w-4 text-blue-600" />
    );
  };

  const getMarketingStatusVariant = (status: string) => {
    switch (status) {
      case 'C': return 'current';
      case 'O': return 'obsolete';
      case 'R': return 'replacement';
      case 'S': return 'special';
      default: return 'secondary';
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {/* Favorites column */}
              {onToggleFavorite && (
                <th className="px-2 py-3 text-center w-10">
                  <Star className="h-4 w-4 text-gray-400 mx-auto" />
                </th>
              )}
              {showStore && (
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('store_id' as keyof InventoryItem)}
                    className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                  >
                    <span>Store</span>
                    <SortIcon field={'store_id' as keyof InventoryItem} />
                  </button>
                </th>
              )}
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => handleSort('description')}
                  className="flex items-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                >
                  <span>Drug</span>
                  <SortIcon field="description" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Code
                </span>
              </th>
              <th className="px-4 py-3 text-center">
                <button
                  onClick={() => handleSort('total_quantity')}
                  className="flex items-center justify-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 w-full"
                >
                  <span>Qty</span>
                  <SortIcon field="total_quantity" />
                </button>
              </th>
              <th className="px-4 py-3 text-center">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size/UOM
                </span>
              </th>
              <th className="px-4 py-3 text-center">
                <button
                  onClick={() => handleSort('days_aging')}
                  className="flex items-center justify-center space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 w-full"
                >
                  <span>Aging</span>
                  <SortIcon field="days_aging" />
                </button>
              </th>
              <th className="px-4 py-3 text-center">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </span>
              </th>
              {/* Only show cost column for admins */}
              {canSeeCost && (
                <th className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleSort('cost')}
                    className="flex items-center justify-end space-x-1 text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700 w-full"
                  >
                    <span>Cost</span>
                    <SortIcon field="cost" />
                  </button>
                </th>
              )}
              <th className="px-4 py-3 text-center">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedItems.map((item) => {
              const isFavorite = favorites.has(item.item_code || '');
              
              return (
                <tr
                  key={item.id}
                  className={cn(
                    "hover:bg-gray-50 transition-colors",
                    isFavorite && "bg-yellow-50/50"
                  )}
                >
                  {/* Favorites star */}
                  {onToggleFavorite && (
                    <td className="px-2 py-3 text-center">
                      <button
                        onClick={() => item.item_code && onToggleFavorite(item.item_code)}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Star
                          className={cn(
                            "h-5 w-5 transition-colors",
                            isFavorite
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300 hover:text-yellow-400"
                          )}
                        />
                      </button>
                    </td>
                  )}
                  {showStore && (
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">
                        {item.store?.name || 'Unknown'}
                      </span>
                      <span className="block text-xs text-gray-500">
                        {item.store?.code}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-900 block">
                      {item.description}
                    </span>
                    <span className="text-xs text-gray-500">
                      MFR: {item.manufacturer_code}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600 font-mono">
                      {item.item_code}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatNumber(item.total_quantity)}
                    </span>
                    {item.on_hand !== item.total_quantity && (
                      <span className="block text-xs text-gray-500">
                        ({formatNumber(item.on_hand)} on hand)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm text-gray-600">
                      {item.size} {item.unit_of_measure}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={getAgingBadgeColor(item.days_aging)}>
                      {item.days_aging !== null ? `${item.days_aging}d` : 'N/A'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Badge variant={getMarketingStatusVariant(item.marketing_status)}>
                        {getMarketingStatusLabel(item.marketing_status)}
                      </Badge>
                      <Badge variant="outline">
                        {getOrderControlLabel(item.order_control)}
                      </Badge>
                    </div>
                  </td>
                  {/* Only show cost for admins */}
                  {canSeeCost && (
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.cost)}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3 text-center">
                    {showStore && item.store_id !== currentStoreId && onRequestClick && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRequestClick(item)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Request
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {items.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-500">No inventory items found</p>
        </div>
      )}
    </>
  );
}
