'use client';

import { motion } from 'framer-motion';
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
  index = 0,
  gradient = 'from-indigo-500/10 via-pink-500/5 to-transparent',
}: StatCardProps) {
  const Icon = iconMap[icon];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2 },
      }}
    >
      <Card className={cn(
        'group relative overflow-hidden border-white/10 bg-gradient-to-br',
        gradient,
        'backdrop-blur-xl hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/20'
      )}>
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Glow effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent" />
        </div>

        <CardHeader className="flex flex-row items-center justify-between pb-3 relative z-10">
          <CardTitle className="text-sm font-bold text-slate-300 group-hover:text-slate-200 transition-colors tracking-wide uppercase">
            {title}
          </CardTitle>
          <motion.div
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="relative"
          >
            <div className={cn(
              "absolute inset-0 blur-xl opacity-50 group-hover:opacity-80 transition-opacity",
              iconColor.replace('text-', 'bg-')
            )} />
            <Icon className={cn('h-5 w-5 relative z-10', iconColor, 'drop-shadow-[0_0_8px_currentColor]')} />
          </motion.div>
        </CardHeader>

        <CardContent className="relative z-10">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            className="text-3xl font-black text-white mb-2 tracking-tight group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-indigo-200 group-hover:to-pink-200 group-hover:bg-clip-text transition-all duration-300"
          >
            {value}
          </motion.div>

          <div className="flex items-center justify-between">
            {subtitle && (
              <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors font-medium">
                {subtitle}
              </p>
            )}

            {trend && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className={cn(
                  'text-xs font-bold px-2 py-1 rounded-lg',
                  trend.isPositive
                    ? 'text-emerald-300 bg-emerald-500/20'
                    : 'text-rose-300 bg-rose-500/20'
                )}
              >
                {trend.isPositive ? '+' : ''}{trend.value}%
              </motion.span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
