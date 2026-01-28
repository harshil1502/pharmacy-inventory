'use client';

import { motion } from 'framer-motion';
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
          className="bg-rose-500/20 text-rose-300 border-rose-500/50 font-black shadow-lg shadow-rose-500/20"
        >
          {formatNumber(item.total_quantity)}
        </Badge>
      );
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      whileHover={{ y: -4 }}
    >
      <Card className="group relative overflow-hidden border-white/10 bg-gradient-to-br from-slate-800/40 via-slate-900/40 to-slate-800/40 backdrop-blur-xl hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center space-x-3">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div className={cn(
                'absolute inset-0 blur-xl opacity-50',
                iconColor.replace('text-', 'bg-')
              )} />
              <Icon className={cn('h-6 w-6 relative z-10', iconColor, 'drop-shadow-[0_0_8px_currentColor]')} />
            </motion.div>
            <span className="text-white font-black text-xl tracking-tight">{title}</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="relative z-10">
          {items && items.length > 0 ? (
            <div className="space-y-3">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.7 + index * 0.1,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  whileHover={{
                    scale: 1.02,
                    x: 4,
                    transition: { duration: 0.2 },
                  }}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300 group/item relative overflow-hidden"
                >
                  {/* Hover gradient effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />

                  {/* Left gradient accent */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-pink-500 to-teal-500 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 rounded-r" />

                  <div className="min-w-0 flex-1 ml-2 relative z-10">
                    <motion.p
                      className="font-bold text-slate-100 truncate text-sm group-hover/item:text-white transition-colors"
                      whileHover={{ x: 2 }}
                    >
                      {item.description}
                    </motion.p>
                    <p className="text-xs text-slate-400 mt-1 group-hover/item:text-slate-300 transition-colors font-medium">
                      {renderSubtitle(item)}
                    </p>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                    className="relative z-10"
                  >
                    {renderBadge(item)}
                  </motion.div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="text-center py-12 relative"
            >
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative inline-block"
              >
                <div className={cn(
                  'absolute inset-0 blur-2xl opacity-30',
                  iconColor.replace('text-', 'bg-')
                )} />
                <Icon className={cn('h-16 w-16 mx-auto mb-4 relative z-10', iconColor, 'drop-shadow-[0_0_15px_currentColor]')} />
              </motion.div>
              <p className="text-slate-400 font-bold text-sm">{emptyMessage}</p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
