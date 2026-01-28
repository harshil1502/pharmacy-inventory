'use client';

import { motion } from 'framer-motion';
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
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-300',
    glowColor: 'shadow-emerald-500/20',
  },
  {
    key: 'moderate' as const,
    label: '31-90 days',
    sublabel: 'Moderate',
    color: 'from-yellow-500 to-yellow-600',
    bgColor: 'bg-yellow-500/10',
    textColor: 'text-yellow-300',
    glowColor: 'shadow-yellow-500/20',
  },
  {
    key: 'aging' as const,
    label: '91-180 days',
    sublabel: 'Aging',
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-500/10',
    textColor: 'text-orange-300',
    glowColor: 'shadow-orange-500/20',
  },
  {
    key: 'old' as const,
    label: '180+ days',
    sublabel: 'Old Stock',
    color: 'from-rose-500 to-rose-600',
    bgColor: 'bg-rose-500/10',
    textColor: 'text-rose-300',
    glowColor: 'shadow-rose-500/20',
  },
];

export function AgingOverview({ data }: AgingOverviewProps) {
  const total = data.fresh + data.moderate + data.aging + data.old;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card className="relative overflow-hidden border-white/10 bg-gradient-to-br from-slate-800/40 via-slate-900/40 to-slate-800/40 backdrop-blur-xl hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-pink-500/5 animate-gradient bg-[length:200%_200%]" />

        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center space-x-3">
            <motion.div
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
              className="relative"
            >
              <div className="absolute inset-0 blur-xl bg-indigo-500/30 animate-pulse" />
              <Clock className="h-6 w-6 text-indigo-400 relative z-10 drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
            </motion.div>
            <span className="text-white font-black text-xl tracking-tight">Inventory Aging Overview</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {agingCategories.map((category, index) => {
              const value = data[category.key];
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

              return (
                <motion.div
                  key={category.key}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.5 + index * 0.1,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  whileHover={{
                    scale: 1.05,
                    transition: { duration: 0.2 },
                  }}
                  className={cn(
                    'relative group text-center p-6 rounded-2xl border border-white/10 backdrop-blur-sm overflow-hidden transition-all duration-300',
                    category.bgColor,
                    'hover:border-white/30',
                    `hover:${category.glowColor}`
                  )}
                >
                  {/* Gradient overlay */}
                  <div className={cn(
                    'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                    category.color,
                    'opacity-10'
                  )} />

                  {/* Shimmer effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>

                  <div className="relative z-10">
                    <motion.p
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        delay: 0.6 + index * 0.1,
                      }}
                      className={cn(
                        'text-4xl font-black mb-2 drop-shadow-[0_0_15px_currentColor] group-hover:scale-110 transition-transform duration-300',
                        category.textColor
                      )}
                    >
                      {value}
                    </motion.p>

                    <div className="space-y-1">
                      <p className={cn('text-sm font-bold', category.textColor)}>
                        {category.label}
                      </p>
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                        {category.sublabel}
                      </p>

                      {/* Percentage badge */}
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="pt-2"
                      >
                        <span className={cn(
                          'inline-block text-xs px-2 py-1 rounded-lg font-black',
                          category.bgColor,
                          category.textColor,
                          'border border-current/30'
                        )}>
                          {percentage}%
                        </span>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
