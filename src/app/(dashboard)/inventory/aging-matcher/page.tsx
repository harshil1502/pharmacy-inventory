'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, AlertTriangle, Package, TrendingDown, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { RequestDrugDialog } from '@/components/inventory/request-drug-dialog';
import { useAppStore } from '@/lib/store';

interface AgingMatch {
  din_number: string;
  medication_name: string;
  aging_store_id: string;
  aging_store_name: string;
  aging_days: number;
  aging_quantity: number;
  aging_cost: number;
  needed_store_id: string;
  needed_store_name: string;
  needed_quantity: number;
  transferable_quantity: number;
  savings_potential: number;
}

interface MatchSummary {
  totalMatches: number;
  uniqueAgingDINs: number;
  totalAgingValue: number;
  totalSavingsPotential: number;
}

export default function AgingMatcherPage() {
  const [matches, setMatches] = useState<AgingMatch[]>([]);
  const [summary, setSummary] = useState<MatchSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<AgingMatch | null>(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const { toast } = useToast();
  const { stores } = useAppStore();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inventory/aging-matches');
      
      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }

      const data = await response.json();
      setMatches(data.matches || []);
      setSummary(data.summary);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: 'Error',
        description: 'Failed to load aging matches',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateTransfer = (match: AgingMatch) => {
    setSelectedMatch(match);
    setShowRequestDialog(true);
  };

  const getAgingBadgeVariant = (days: number) => {
    if (days >= 270) return 'destructive';
    if (days >= 180) return 'warning';
    return 'secondary';
  };

  const getAgingColor = (days: number) => {
    if (days >= 270) return 'text-red-600';
    if (days >= 180) return 'text-orange-600';
    return 'text-yellow-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Aging Inventory Matcher</h1>
        <p className="text-muted-foreground mt-2">
          Find cross-store transfer opportunities to reduce aging inventory
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Matches Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalMatches}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Transfer opportunities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Unique Aging DINs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.uniqueAgingDINs}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Different medications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Aging Value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(summary.totalAgingValue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                At risk inventory
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Potential Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.totalSavingsPotential)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                If transfers completed
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Matches List */}
      <Card>
        <CardHeader>
          <CardTitle>Top Transfer Opportunities</CardTitle>
          <CardDescription>
            Sorted by highest savings potential. Items aging ≥180 days that other stores need.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {matches.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No aging matches found</p>
            </div>
          ) : (
            <div className="divide-y">
              {matches.map((match, index) => (
                <div key={index} className="p-4 hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    {/* Source Store */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className={`w-4 h-4 ${getAgingColor(match.aging_days)}`} />
                        <span className="font-medium text-sm">{match.aging_store_name}</span>
                        <Badge variant={getAgingBadgeVariant(match.aging_days)}>
                          {match.aging_days} days
                        </Badge>
                      </div>
                      <p className="text-sm font-medium truncate">{match.medication_name}</p>
                      <p className="text-xs text-muted-foreground">
                        DIN: {match.din_number} • Qty: {match.aging_quantity} • Cost: {formatCurrency(match.aging_cost)}/unit
                      </p>
                    </div>

                    {/* Arrow */}
                    <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />

                    {/* Destination Store */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm mb-1">{match.needed_store_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Current stock: {match.needed_quantity} units
                      </p>
                      <p className="text-xs text-green-600">
                        Can transfer: {match.transferable_quantity} units
                      </p>
                    </div>

                    {/* Savings & Action */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-semibold text-green-600 mb-1">
                        {formatCurrency(match.savings_potential)}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => handleInitiateTransfer(match)}
                        className="gap-1"
                      >
                        <Send className="w-3 h-3" />
                        Request Transfer
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Dialog */}
      {showRequestDialog && selectedMatch && (
        <RequestDrugDialog
          open={showRequestDialog}
          onOpenChange={setShowRequestDialog}
          stores={stores}
          prefilledDIN={selectedMatch.din_number}
          prefilledName={selectedMatch.medication_name}
          prefilledStoreId={selectedMatch.aging_store_id}
        />
      )}
    </div>
  );
}