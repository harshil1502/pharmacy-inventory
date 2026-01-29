'use client';

import { useEffect, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Filter,
  RefreshCcw,
  Trash2,
  User,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/lib/store';
import { RequestLog } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDateTime, cn } from '@/lib/utils';

export default function RequestLogsPage() {
  const { user } = useAppStore();
  const supabase = createClient();
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'outgoing' | 'incoming'>('all');
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, expired: 0 });

  const isAssociate = user?.role === 'associate';

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('request_logs')
        .select('*')
        .order('action_at', { ascending: false })
        .limit(100);

      // Filter by store for non-associates
      if (!isAssociate && user?.store_id) {
        query = query.eq('store_id', user.store_id);
      }

      // Filter by log type
      if (filter !== 'all') {
        query = query.eq('log_type', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/logs/cleanup');
      const data = await res.json();
      if (res.ok) {
        setStats({ total: data.totalLogs, expired: data.expiredLogs });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleCleanup = async () => {
    setCleanupLoading(true);
    try {
      const res = await fetch('/api/logs/cleanup', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(`Cleaned up ${data.deletedCount} expired logs`);
        fetchLogs();
        fetchStats();
      } else {
        alert(`Cleanup failed: ${data.error}`);
      }
    } catch (err) {
      console.error('Error during cleanup:', err);
      alert('Cleanup failed');
    } finally {
      setCleanupLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [filter, user]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'requested':
        return <Badge className="bg-blue-100 text-blue-700">Requested</Badge>;
      case 'accepted':
        return <Badge className="bg-green-100 text-green-700">Accepted</Badge>;
      case 'declined':
        return <Badge className="bg-red-100 text-red-700">Declined</Badge>;
      case 'counter_offered':
        return <Badge className="bg-yellow-100 text-yellow-700">Counter Offer</Badge>;
      case 'completed':
        return <Badge className="bg-purple-100 text-purple-700">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-700">Cancelled</Badge>;
      default:
        return <Badge>{action}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Request Logs</h1>
          <p className="text-sm text-gray-500 mt-1">
            Activity logs for medication requests (auto-deleted after 4 days)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {isAssociate && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCleanup}
              disabled={cleanupLoading || stats.expired === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Cleanup ({stats.expired} expired)
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={fetchLogs}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Logs</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Outgoing Requests</p>
                <p className="text-2xl font-bold">
                  {logs.filter((l) => l.log_type === 'outgoing').length}
                </p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Incoming Requests</p>
                <p className="text-2xl font-bold">
                  {logs.filter((l) => l.log_type === 'incoming').length}
                </p>
              </div>
              <ArrowDownLeft className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Logs</SelectItem>
                <SelectItem value="outgoing">Outgoing (Requests Made)</SelectItem>
                <SelectItem value="incoming">Incoming (Requests Received)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No logs found. Activity will appear here when requests are made.
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={cn(
                    'flex items-start justify-between p-4 rounded-lg border',
                    log.log_type === 'outgoing' ? 'bg-blue-50/50' : 'bg-green-50/50'
                  )}
                >
                  <div className="flex items-start space-x-4">
                    {/* Direction Icon */}
                    <div
                      className={cn(
                        'rounded-full p-2',
                        log.log_type === 'outgoing'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-green-100 text-green-600'
                      )}
                    >
                      {log.log_type === 'outgoing' ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4" />
                      )}
                    </div>

                    {/* Log Details */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{log.medication_name}</span>
                        {log.din_number && (
                          <span className="text-xs text-gray-500 font-mono">
                            DIN: {log.din_number}
                          </span>
                        )}
                        {getActionBadge(log.action)}
                      </div>

                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{log.quantity}</span> units
                        {log.log_type === 'outgoing' ? (
                          <span>
                            {' '}
                            → requested from{' '}
                            <span className="font-medium">
                              {log.other_store_name} ({log.other_store_code})
                            </span>
                          </span>
                        ) : (
                          <span>
                            {' '}
                            ← requested by{' '}
                            <span className="font-medium">
                              {log.other_store_name} ({log.other_store_code})
                            </span>
                          </span>
                        )}
                      </div>

                      {/* User Info */}
                      {log.user_name && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <User className="h-3 w-3" />
                          <span>
                            {log.user_name} ({log.user_email})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="text-right">
                    <div className="text-sm text-gray-600">{formatDateTime(log.action_at)}</div>
                    <div className="text-xs text-gray-400">
                      Expires: {formatDateTime(log.expires_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
