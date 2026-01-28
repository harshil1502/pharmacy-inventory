'use client';

import {
  Package,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const iconMap = {
  package: Package,
  dollar: DollarSign,
  'arrow-up': ArrowUpRight,
  'arrow-down': ArrowDownRight,
  alert: AlertTriangle,
  trending: TrendingUp,
} as const;

const iconBgMap: Record<string, string> = {
  'text-indigo-400': 'bg-indigo-50 text-indigo-600',
  'text-emerald-400': 'bg-emerald-50 text-emerald-600',
  'text-blue-400': 'bg-blue-50 text-blue-600',
  'text-pink-400': 'bg-pink-50 text-pink-600',
  'text-orange-400': 'bg-orange-50 text-orange-600',
  'text-rose-400': 'bg-rose-50 text-rose-600',
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof iconMap;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  index?: number;
  gradient?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconColor = 'text-indigo-400',
  trend,
}: StatCardProps) {
  const Icon = iconMap[icon];
  const iconBg = iconBgMap[iconColor] || 'bg-indigo-50 text-indigo-600';

  return (
    <Card className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          {title}
        </CardTitle>
        <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center', iconBg)}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-gray-900 tracking-tight">
          {value}
        </div>
        <div className="flex items-center justify-between mt-1">
          {subtitle && (
            <p className="text-xs text-gray-500">
              {subtitle}
            </p>
          )}
          {trend && (
            <span
              className={cn(
                'text-xs font-medium px-1.5 py-0.5 rounded',
                trend.isPositive
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-red-700 bg-red-50'
              )}
            >
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
