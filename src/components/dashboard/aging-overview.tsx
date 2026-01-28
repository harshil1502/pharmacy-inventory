'use client';

import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AgingData {
  fresh: number;
  moderate: number;
  aging: number;
  old: number;
}

interface AgingOverviewProps {
  data: AgingData;
}

const agingCategories = [
  {
    key: 'fresh' as const,
    label: '0-30 days',
    sublabel: 'Fresh Stock',
    dotColor: 'bg-emerald-500',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    badgeBg: 'bg-emerald-50 text-emerald-700',
  },
  {
    key: 'moderate' as const,
    label: '31-90 days',
    sublabel: 'Moderate',
    dotColor: 'bg-amber-500',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
    badgeBg: 'bg-amber-50 text-amber-700',
  },
  {
    key: 'aging' as const,
    label: '91-180 days',
    sublabel: 'Aging',
    dotColor: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    badgeBg: 'bg-orange-50 text-orange-700',
  },
  {
    key: 'old' as const,
    label: '180+ days',
    sublabel: 'Old Stock',
    dotColor: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-50',
    badgeBg: 'bg-red-50 text-red-700',
  },
];

export function AgingOverview({ data }: AgingOverviewProps) {
  const total = data.fresh + data.moderate + data.aging + data.old;

  return (
    <Card className="border border-gray-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-gray-900">
          <Clock className="h-5 w-5 text-gray-400" />
          <span className="text-base font-semibold">Inventory Aging Overview</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {agingCategories.map((category) => {
            const value = data[category.key];
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

            return (
              <div
                key={category.key}
                className={cn(
                  'text-center p-5 rounded-lg border border-gray-100',
                  category.bgColor,
                )}
              >
                <p className={cn('text-3xl font-semibold', category.textColor)}>
                  {value}
                </p>

                <div className="mt-2 space-y-0.5">
                  <p className={cn('text-sm font-medium', category.textColor)}>
                    {category.label}
                  </p>
                  <p className="text-xs text-gray-500">
                    {category.sublabel}
                  </p>

                  <div className="pt-1.5">
                    <span className={cn(
                      'inline-block text-xs px-2 py-0.5 rounded font-medium',
                      category.badgeBg,
                    )}>
                      {percentage}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
