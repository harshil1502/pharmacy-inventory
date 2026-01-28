'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, ArrowDownRight, ArrowUpRight, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { MedicationRequest, Store } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RequestCard } from '@/components/requests/request-card';
import { RequestDrugDialog } from '@/components/inventory/request-drug-dialog';
import { cn } from '@/lib/utils';

type TabType = 'incoming' | 'outgoing';
type StatusFilter = 'all' | 'pending' | 'accepted' | 'declined' | 'counter_offer' | 'completed';

export default function RequestsPage() {
  const supabase = createClient();
  const { user, stores } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('incoming');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [requests, setRequests] = useState<MedicationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestDialog, setShowRequestDialog] = useState(false);

  const fetchRequests = useCallback(async () => {
    if (!user?.store_id) return;
    
    setLoading(true);
    
    try {
      let query = supabase
        .from('medication_requests')
        .select(`
          *,
          from_store:stores!medication_requests_from_store_id_fkey(*),
          to_store:stores!medication_requests_to_store_id_fkey(*),
          requested_by_user:profiles!medication_requests_requested_by_fkey(*),
          responded_by_user:profiles!medication_requests_responded_by_fkey(*)
        `);

      // Filter by direction
      if (activeTab === 'incoming') {
        query = query.eq('to_store_id', user.store_id);
      } else {
        query = query.eq('from_store_id', user.store_id);
      }

      // Filter by status
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      // Order by created_at desc
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.store_id, activeTab, statusFilter, supabase]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Real-time subscription for requests
  useEffect(() => {
    if (!user?.store_id) return;

    const channel = supabase
      .channel('requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'medication_requests',
        },
        (payload) => {
          const request = payload.new as MedicationRequest;
          // Only refresh if the request involves our store
          if (request.from_store_id === user.store_id || request.to_store_id === user.store_id) {
            fetchRequests();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.store_id, supabase, fetchRequests]);

  // Count requests by status for badges
  const incomingPending = requests.filter(
    r => r.to_store_id === user?.store_id && r.status === 'pending'
  ).length;
  const outgoingPending = requests.filter(
    r => r.from_store_id === user?.store_id && (r.status === 'pending' || r.status === 'counter_offer')
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medication Requests</h1>
          <p className="text-gray-600 mt-1">
            Manage transfer requests between stores
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={fetchRequests}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowRequestDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 rounded-lg bg-gray-100 p-1">
        <button
          onClick={() => setActiveTab('incoming')}
          className={cn(
            'flex-1 flex items-center justify-center space-x-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors',
            activeTab === 'incoming'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <ArrowDownRight className="h-4 w-4" />
          <span>Incoming</span>
          {incomingPending > 0 && (
            <Badge variant="destructive" className="ml-1">
              {incomingPending}
            </Badge>
          )}
        </button>
        <button
          onClick={() => setActiveTab('outgoing')}
          className={cn(
            'flex-1 flex items-center justify-center space-x-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors',
            activeTab === 'outgoing'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          <ArrowUpRight className="h-4 w-4" />
          <span>Outgoing</span>
          {outgoingPending > 0 && (
            <Badge variant="warning" className="ml-1">
              {outgoingPending}
            </Badge>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
            <SelectItem value="counter_offer">Counter Offer</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-gray-500">
          {requests.length} request{requests.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-500">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">
              {activeTab === 'incoming'
                ? 'No incoming requests'
                : 'No outgoing requests'}
            </p>
            {activeTab === 'outgoing' && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowRequestDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create your first request
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              type={activeTab}
              onUpdate={fetchRequests}
            />
          ))}
        </div>
      )}

      {/* Request Dialog */}
      <RequestDrugDialog
        open={showRequestDialog}
        onOpenChange={setShowRequestDialog}
        stores={stores}
      />
    </div>
  );
}
