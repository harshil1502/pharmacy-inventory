'use client';

import { useEffect, useState } from 'react';
import { TrendingDown, AlertTriangle, Target, Activity, Loader2, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface AgingBracket {
  range: string;
  totalValue: number;
  itemCount: number;
  percentage: number;
}

interface StoreAgingSummary {
  storeName: string;
  totalAgingValue: number;
  totalAgingItems: number;
  criticalItems: number;
  highRiskItems: number;
  mediumRiskItems: number;
}

interface AnalyticsData {
  overview: {
    totalInventoryValue: number;
    totalAgingValue: number;
    agingPercentage: number;
    goalProgress: number;
    totalItems: number;
    itemsWithAgingData: number;
  };
  agingBrackets: AgingBracket[];
  storeSummaries: StoreAgingSummary[];
  transferMetrics: {
    completedTransfers: number;
    totalUnitsTransferred: number;
    period: string;
  };
  recommendations: Array<{
    priority: string;
    message: string;
  }>;
}

const COLORS = {
  fresh: '#10B981',      // Green
  warning: '#F59E0B',    // Yellow
  aging: '#EF4444',      // Red
  critical: '#7C3AED',   // Purple
  chart: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#7C3AED', '#EC4899']
};

export default function AgingAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inventory/aging-analytics');
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Failed to load analytics data</p>
      </div>
    );
  }

  const { overview, agingBrackets, storeSummaries, transferMetrics, recommendations } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Aging Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track progress toward $0 aging inventory goal
        </p>
      </div>

      {/* Goal Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Goal Progress</span>
            <Target className="w-5 h-5 text-primary" />
          </CardTitle>
          <CardDescription>
            Progress toward eliminating aging inventory (≥180 days)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Current aging value</span>
                <span className="font-bold text-destructive">
                  {formatCurrency(overview.totalAgingValue)}
                </span>
              </div>
              <Progress 
                value={overview.goalProgress} 
                className="h-3"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{overview.goalProgress.toFixed(1)}% complete</span>
                <span>Goal: $0</span>
              </div>
            </div>
            
            {overview.totalAgingValue > 0 && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground">
                  {overview.agingPercentage.toFixed(1)}% of total inventory value is aging
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Inventory Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(overview.totalInventoryValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatNumber(overview.totalItems)} items tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aging Value (≥180 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(overview.totalAgingValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {overview.agingPercentage.toFixed(1)}% of inventory
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recent Transfers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {transferMetrics.completedTransfers}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatNumber(transferMetrics.totalUnitsTransferred)} units ({transferMetrics.period})
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Data Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((overview.itemsWithAgingData / overview.totalItems) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Items with aging data
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Badge
                    variant={rec.priority === 'high' ? 'destructive' : 'secondary'}
                    className="mt-0.5"
                  >
                    {rec.priority}
                  </Badge>
                  <p className="text-sm">{rec.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aging Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Aging Distribution</CardTitle>
            <CardDescription>
              Inventory value by age bracket
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agingBrackets}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" angle={-45} textAnchor="end" height={80} />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Number(value) || 0)}
                  labelFormatter={(label: any) => `Age: ${label}`}
                />
                <Bar 
                  dataKey="totalValue" 
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                >
                  {agingBrackets.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.range.includes('180') || 
                        entry.range.includes('270') || 
                        entry.range.includes('365+') 
                          ? COLORS.aging 
                          : COLORS.fresh
                      } 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Store Rankings */}
        <Card>
          <CardHeader>
            <CardTitle>Stores by Aging Value</CardTitle>
            <CardDescription>
              Top stores with aging inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {storeSummaries.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No aging data available</p>
                </div>
              ) : (
                storeSummaries.map((store, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{store.storeName}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                        <span>{store.totalAgingItems} items</span>
                        <span className="text-red-600">{store.criticalItems} critical</span>
                        <span className="text-orange-600">{store.highRiskItems} high risk</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-destructive">
                        {formatCurrency(store.totalAgingValue)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}