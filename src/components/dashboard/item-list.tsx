'use client';

import { AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber, getAgingBadgeColor } from '@/lib/utils';

const iconMap = {
  alert: AlertTriangle,
  trending: TrendingUp,
} as const;

interface Item {
  id: string;
  description: string;
  total_quantity: number;
  cost?: number;
  days_aging?: number | null;
  item_code?: string;
  size?: string;
  unit_of_measure?: string;
}

type ItemListType = 'aging' | 'lowStock';

interface ItemListProps {
  title: string;
  items: Item[];
  icon: keyof typeof iconMap;
  iconColor?: string;
  emptyMessage: string;
  type: ItemListType;
  showCost?: boolean;
}

export function ItemList({
  title,
  items,
  icon,
  iconColor = 'text-orange-400',
  emptyMessage,
  type,
  showCost = false,
}: ItemListProps) {
  const Icon = iconMap[icon];

  const renderSubtitle = (item: Item) => {
    if (type === 'aging') {
      return `${formatNumber(item.total_quantity)} units${showCost && item.cost ? ` • ${formatCurrency(item.cost)}` : ''}`;
    } else {
      return `${item.item_code} • ${item.size} ${item.unit_of_measure}`;
    }
  };

  const renderBadge = (item: Item) => {
    if (type === 'aging') {
      return (
        <Badge className={getAgingBadgeColor(item.days_aging ?? null)}>
          {item.days_aging}d
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="destructive"
          className="bg-red-50 text-red-700 border-red-200 font-medium"
        >
          {formatNumber(item.total_quantity)}
        </Badge>
      );
    }
  };

  const iconBgMap: Record<string, string> = {
    'text-orange-400': 'text-orange-500',
    'text-rose-400': 'text-rose-500',
  };

  return (
    <Card className="border border-gray-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-gray-900">
          <Icon className={cn('h-5 w-5', iconBgMap[iconColor] || 'text-gray-400')} />
          <span className="text-base font-semibold">{title}</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {items && items.length > 0 ? (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate text-sm">
                    {item.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {renderSubtitle(item)}
                  </p>
                </div>
                {renderBadge(item)}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <Icon className={cn('h-10 w-10 mx-auto mb-3 text-gray-300')} />
            <p className="text-gray-500 text-sm">{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
